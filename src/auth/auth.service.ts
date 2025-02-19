import { BadRequestException, Injectable } from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { MailtrapTransport } from 'mailtrap';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from '../user/repository/user.repository';
import { RoleRepository } from '../user/repository/role.repository';
import { Users } from '../user/entity/users.entity';
import { Signup } from './response-interfaces/sigup.interface';
import { User } from './response-interfaces/user.interface';
import { AuthMessages } from './constants/auth.massages';
import { AuthErrors } from './constants/auth.errors';
import { AuthConfig } from './constants/auth.config';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { MailConfig } from './constants/mail.config';
import { CustomUnauthorizedException } from './exeption-filter/custom-unauthorized-exception';

interface JwtPayload {
  id: string;
}

@Injectable()
export class AuthService {
  jwtServ: any;
  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // Signup Service
  async signup(signupDto: SignupDto): Promise<Signup<User>> {
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new CustomUnauthorizedException(AuthErrors.JWT_SECRET_UNDEFINED);
    }

    const hashedPassword = await bcrypt.hash(signupDto.password, 10);
    const role = await this.roleRepository.findRoleByName(AuthConfig.ROLE_NAME);
    if (!role) {
      throw new CustomUnauthorizedException(AuthErrors.INVALID_ROLE);
    }
    const newUser = await this.userRepository.createUser({
      id: uuidv4(),
      username: signupDto.username,
      password: hashedPassword,
      email: signupDto.email,
      mobile: signupDto.mobile,
      roleId: role.id,
    });

    if (!newUser) {
      throw new CustomUnauthorizedException(AuthErrors.USER_CREATION_FAILED);
    }

    const token = this.jwtService.sign(
      { id: newUser.id },
      {
        expiresIn: AuthConfig.TOKEN_EXPIRATION,
        secret: secret,
      },
    );

    const url = this.configService.get<string>('VERIFY_USER_URL') + token;

    const mailSent = await this.sendVerificationEmail(
      newUser.email,
      token,
      url,
    );
    if (!mailSent) {
      await this.userRepository.deleteUser(newUser.id);
      throw new CustomUnauthorizedException(
        AuthMessages.EMAIL_VERIFICATION_FAILED,
      );
    }
    return {
      data: newUser,
      token,
    };
  }

  // Send Verification Email
  async sendVerificationEmail(
    email: string,
    token: string,
    url: string,
  ): Promise<boolean> {
    const mailTrapToken = this.configService.get<string>('MAIL_TRAP_TOKEN');
    if (!mailTrapToken) {
      throw new CustomUnauthorizedException(AuthErrors.ENV_VARIABLE_UNDEFINED);
    }
    const transport = nodemailer.createTransport(
      MailtrapTransport({
        token: mailTrapToken,
      }),
    );
    const sender = {
      address: MailConfig.SENDER.ADDRESS,
      name: MailConfig.SENDER.NAME,
    };
    const recipientsEnv = this.configService.get<string>('MAIL_RECIPIENTS');
    if (!recipientsEnv) {
      throw new CustomUnauthorizedException(AuthErrors.ENV_VARIABLE_UNDEFINED);
    }
    const recipients = recipientsEnv.split(',').map((email) => email.trim());
    await transport.sendMail({
      from: sender,
      to: recipients,
      subject: MailConfig.SUBJECTS.VERIFY_EMAIL,
      text: MailConfig.SUBJECTS.TEXT + url,
    });
    return true;
  }

  // Verify User
  async verifyUser(id: string) {
    try {
      const updatedUser = await this.userRepository.updateUserStatus(
        id,
        'Authorized',
      );
      if (!updatedUser) {
        throw new Error(AuthErrors.USER_NOT_FOUND);
      }
      return { message: AuthMessages.USER_AUTHORIZED };
    } catch (error) {
      throw new CustomUnauthorizedException(
        `${AuthErrors.VERIFICATION_FAILED}: ${error}`,
      );
    }
  }

  // Login Service
  async login(email: string, password: string): Promise<Users | null> {
    const user = await this.userRepository.findUserByEmail(email);
    if (!user) {
      throw new CustomUnauthorizedException(AuthErrors.USER_NOT_FOUND);
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  // verify otp service
  async verifyOpt(id: string, otp: string): Promise<boolean> {
    const isTokenValid = await this.verifyTwoFactorToken(id, otp);
    if (!isTokenValid) {
      throw new CustomUnauthorizedException(AuthErrors.INVALID_2FA_TOKEN);
    }
    return true;
  }

  // generate secret code
  async generateTwoFactorSecret(
    userId: string,
  ): Promise<{ secret: string; qrCode: string }> {
    const user = await this.userRepository.findUserById(userId);
    if (!user) {
      throw new CustomUnauthorizedException(AuthErrors.USER_NOT_FOUND);
    }
    const secret = speakeasy.generateSecret({
      name: AuthConfig.APP_NAME + user.email,
    });
    if (!secret.otpauth_url) {
      throw new CustomUnauthorizedException(AuthErrors.FAILED_GENERATE_URL);
    }
    const qrCode = await QRCode.toDataURL(secret.otpauth_url);
    await this.userRepository.updateUserTwoFactorSecret(userId, secret.base32);
    return {
      secret: secret.base32,
      qrCode,
    };
  }

  async disableTwoFactorAuthentication(userId: string): Promise<Users | null> {
    const user = await this.userRepository.updatePopupStatus(userId);
    return user;
  }

  // verify input secret with exiting secret
  async verifyTwoFactorToken(userId: string, token: string): Promise<boolean> {
    const user = await this.userRepository.findUserById(userId);
    if (!user || !user.twoFactorSecret) {
      throw new CustomUnauthorizedException(AuthErrors.INVALID_2FA_SETUP);
    }
    return speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
    });
  }

  //decode the token and get userId
  decodeTokenAndExtractUserId(token: string): string {
    try {
      const decoded = this.jwtService.verify<JwtPayload>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      if (!decoded || !decoded.id) {
        throw new CustomUnauthorizedException(AuthErrors.INVALID_TOKEN);
      }
      return decoded.id;
    } catch {
      throw new CustomUnauthorizedException(AuthErrors.JWT_TOKEN_EXPIRED);
    }
  }

  // Generate JWT Token
  async generateToken(
    user: Users,
  ): Promise<{ access_token: string; role: string }> {
    const role = await this.roleRepository.findRoleById(user.roleId);
    if (!role) {
      throw new BadRequestException();
    }

    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: role.role,
    };

    const secret = this.configService.get<string>('JWT_SECRET');

    if (!secret) {
      throw new BadRequestException();
    }

    const token = this.jwtService.sign(payload, {
      secret,
      expiresIn: AuthConfig.JWT_EXPIRATION,
    });

    return { access_token: token, role: role.role };
  }

  // Forgot Password - Send reset link via email
  async sendPasswordResetLink(email: string): Promise<void> {
    const user = await this.userRepository.findUserByEmail(email);
    if (!user) {
      throw new CustomUnauthorizedException(AuthErrors.USER_NOT_FOUND);
    }

    const token = this.jwtService.sign(
      { id: user.id, email: user.email },
      {
        expiresIn: AuthConfig.TOKEN_EXPIRATION,
        secret: this.configService.get<string>('JWT_SECRET'),
      },
    );

    const url = this.configService.get<string>('FRONTEND_SERVER_URL') + token;

    if (!url) {
      throw new CustomUnauthorizedException(
        AuthErrors.FRONTEND_FORGOT_PASSWORD_LINK_NOT_FOUND,
      );
    }
    await this.sendVerificationEmail(email, token, url);
  }

  // Reset Password - Update password in the database
  async resetPassword(email: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findUserByEmail(email);
    if (!user) {
      throw new CustomUnauthorizedException(AuthErrors.USER_NOT_FOUND);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
  }
}
