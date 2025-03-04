import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
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
import { AuthMessages } from './constants/auth.massages';
import { AuthErrors } from './constants/auth.errors';
import { AuthConfig } from './constants/auth.config';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { MailConfig } from './constants/mail.config';
import { SignupResponse } from './response/signup-response.interface';
import { LoginDto } from './dto/login.dto';
import { SigninResponse } from './response/signin-response.interface';

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
  async signup(signupDto: SignupDto): Promise<SignupResponse> {
    try {
      const secret = this.configService.get<string>('JWT_SECRET');
      if (!secret) {
        throw new NotFoundException(AuthErrors.JWT_SECRET_UNDEFINED);
      }
      const hashedPassword = await bcrypt.hash(signupDto.password, 10);
      const role = await this.roleRepository.findRoleByName(
        AuthConfig.ROLE_NAME,
      );
      if (!role) {
        throw new NotFoundException(AuthErrors.INVALID_ROLE);
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
        throw new NotFoundException(AuthErrors.USER_CREATION_FAILED);
      }
      const token = this.generateToken(newUser);
      if (!token) {
        throw new NotFoundException(AuthErrors.TOKEN_NOT_GENERATED_FOR_MAIL);
      }
      const url =
        (this.configService.get<string>('VERIFY_USER_URL') ?? '') +
        (await token).access_token;
      const mailSent = await this.sendVerificationEmail(url);
      if (!mailSent) {
        await this.userRepository.deleteUser(newUser.id);
        throw new ServiceUnavailableException(
          AuthMessages.EMAIL_VERIFICATION_FAILED,
        );
      }
      return { user: newUser };
    } catch (error :  unknown) {
      throw error;
    }
  }

  // Send Verification Email
  async sendVerificationEmail(url: string): Promise<boolean> {
    try {
      const mailTrapToken = this.configService.get<string>('MAIL_TRAP_TOKEN');
      if (!mailTrapToken) {
        throw new NotFoundException(AuthErrors.ENV_VARIABLE_UNDEFINED);
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
        throw new NotFoundException(AuthErrors.ENV_VARIABLE_UNDEFINED);
      }
      const recipients = recipientsEnv.split(',').map((email) => email.trim());
      await transport.sendMail({
        from: sender,
        to: recipients,
        subject: MailConfig.SUBJECTS.VERIFY_EMAIL,
        text: MailConfig.SUBJECTS.TEXT + url,
      });
      return true;
    } catch (error :  unknown) {
      throw error;
    }
  }

  // Verify User
  async verifyUser(id: string): Promise<{ message: string }> {
    try {
      const updatedUser = await this.userRepository.updateUserStatus(
        id,
        'Authorized',
      );
      if (!updatedUser) {
        throw new NotFoundException(AuthErrors.USER_NOT_FOUND);
      }
      return { message: AuthMessages.USER_AUTHORIZED };
    } catch (error :  unknown) {
      throw error;
    }
  }

  // Login Service
  async login(loginDto: LoginDto): Promise<SigninResponse> {
    try {
      const user = await this.userRepository.findUserByEmail(loginDto.email);
      if (!user) {
        throw new UnauthorizedException(AuthErrors.USER_NOT_FOUND);
      }
      const isPasswordValid = await bcrypt.compare(
        loginDto.password,
        user.password,
      );
      if (!isPasswordValid) {
        return { invalidPassword: true };
      }

      const token = await this.generateToken(user);
      if (!token || !token.access_token) {
        throw new BadRequestException(AuthMessages.TOKEN_NOT_GENERATED);
      }

      if (user.status === 'Unauthorized') {
        const url =
          (this.configService.get<string>('VERIFY_USER_URL') ?? '') +
          token.access_token;
        await this.sendVerificationEmail(url);
        throw new UnauthorizedException(
          AuthErrors.USER_ALREADY_EXISTS_BUT_UNAUTHORIZED,
        );
      }

      const responseData = {
        token: token.access_token,
        role: token.role,
        twoFactorEnabled: user.twoFactorEnabled,
        isPopup: user.isPopup,
      };
      return responseData;
    } catch (error :  unknown) {
      throw error;
    }
  }

  // verify otp service
  async verifyOpt(id: string, otp: string): Promise<boolean> {
    try {
      const isTokenValid = await this.verifyTwoFactorToken(id, otp);
      if (!isTokenValid) {
        throw new BadRequestException(AuthErrors.INVALID_2FA_TOKEN);
      }
      return true;
    } catch (error :  unknown) {
      throw error;
    }
  }

  // generate secret code
  async generateTwoFactorSecret(
    userId: string,
  ): Promise<{ secret: string; qrCode: string }> {
    try {
      const user = await this.userRepository.findUserById(userId);
      if (!user) {
        throw new BadRequestException(AuthErrors.USER_NOT_FOUND);
      }
      const secret = speakeasy.generateSecret({
        name: AuthConfig.APP_NAME + user.email,
      });
      if (!secret.otpauth_url) {
        throw new BadRequestException(AuthErrors.FAILED_GENERATE_URL);
      }
      const qrCode = await QRCode.toDataURL(secret.otpauth_url);
      await this.userRepository.updateUserTwoFactorSecret(
        userId,
        secret.base32,
      );
      return {
        secret: secret.base32,
        qrCode,
      };
    } catch (error :  unknown) {
      throw error;
    }
  }

  async disableTwoFactorAuthentication(userId: string): Promise<void> {
    try {
      const result = await this.userRepository.updatePopupStatus(userId);
      if (!result) {
        throw new BadRequestException(AuthErrors.DISABLE_FAILED);
      }
    } catch (error :  unknown) {
      throw error;
    }
  }

  // verify input secret with exiting secret
  async verifyTwoFactorToken(userId: string, token: string): Promise<boolean> {
    try {
      const user = await this.userRepository.findUserById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      if (!user.twoFactorSecret) {
        throw new BadRequestException(AuthErrors.INVALID_2FA_SETUP);
      }
      return speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token,
      });
    } catch (error :  unknown) {
      throw error;
    }
  }

  //decode the token and get userId
  async decodeTokenAndExtractUserId(token: string): Promise<string> {
    try {
      const decoded = await this.jwtService.verify<{id : string}>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      if (!decoded || !decoded.id) {
        throw new BadRequestException(AuthErrors.INVALID_TOKEN);
      }
      return decoded.id;
    } catch (error :  unknown) {
      throw error;
    }
  }

  // Generate JWT Token
  async generateToken(
    user: Users,
  ): Promise<{ access_token: string; role: string }> {
    try {
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
        throw new NotFoundException(AuthErrors.JWT_SECRET_UNDEFINED);
      }
      const token = this.jwtService.sign(payload, {
        secret,
        expiresIn: AuthConfig.JWT_EXPIRATION,
      });
      return { access_token: token, role: role.role };
    } catch (error :  unknown) {
      throw error;
    }
  }

  // Forgot Password - Send reset link via email
  async sendPasswordResetLink(email: string): Promise<void> {
    try {
      const user = await this.userRepository.findUserByEmail(email);
      if (!user) {
        throw new BadRequestException(AuthErrors.USER_NOT_FOUND);
      }
      const token = this.generateToken(user);
      const url = (this.configService.get<string>('FRONTEND_SERVER_URL') ?? '' )+ (await token).access_token;
      if (!url) {
        throw new NotFoundException(
          AuthErrors.FRONTEND_FORGOT_PASSWORD_LINK_NOT_FOUND,
        );
      }
      await this.sendVerificationEmail(email);
    } catch (error :  unknown) {
      throw error;
    }
  }

  // Reset Password - Update password in the database
  async resetPassword(email: string, newPassword: string): Promise<void> {
    try {
      const user = await this.userRepository.findUserByEmail(email);
      if (!user) {
        throw new BadRequestException(AuthErrors.USER_NOT_FOUND);
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();
    } catch (error :  unknown) {
      throw error;
    }
  }
}
