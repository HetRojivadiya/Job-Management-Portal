import { Injectable } from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { MailtrapTransport } from 'mailtrap';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from './repository/user.repository';
import { RoleRepository } from './repository/role.repository';
import { Users } from './entity/users.entity';
import * as jwt from 'jsonwebtoken';
import { Signup } from './response-interfaces/sigup.interface';
import { User } from './response-interfaces/user.interface';
import { AuthMessages } from './constants/auth.massages';
import { AuthErrors } from './constants/auth.errors';
import { AuthConfig } from './constants/auth.config';

interface JwtPayload {
  id: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // Signup Service
  async signup(signupDto: SignupDto): Promise<Signup<User>> {
    try {
      const hashedPassword = await bcrypt.hash(signupDto.password, 10);

      const role = await this.roleRepository.findRoleByName(
        AuthConfig.ROLE_NAME,
      );
      if (!role) {
        throw new Error(AuthErrors.INVALID_ROLE);
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
        throw new Error(AuthErrors.USER_CREATION_FAILED);
      }

      const token = this.jwtService.sign(
        { id: newUser.id },
        {
          expiresIn: AuthConfig.TOKEN_EXPIRATION,
          secret:
            this.configService.get<string>('JWT_SECRET') || 'yourSecretKey',
        },
      );

      const mailSent = await this.sendVerificationEmail(newUser.email, token);

      if (!mailSent) {
        await this.userRepository.deleteUser(newUser.id);
        throw new Error(AuthMessages.EMAIL_VERIFICATION_FAILED);
      }

      return {
        data: newUser,
        token,
      };
    } catch (error) {
      throw new Error(
        `Signup failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  // Send Verification Email
  private async sendVerificationEmail(
    email: string,
    token: string,
  ): Promise<boolean> {
    const mailTrapToken = this.configService.get<string>('MAIL_TRAP_TOKEN');

    if (!mailTrapToken) {
      throw new Error(`MAIL_TRAP_TOKEN ${AuthErrors.ENV_VARIABLE_UNDEFINED}`);
    }

    const transport = nodemailer.createTransport(
      MailtrapTransport({
        token: mailTrapToken,
      }),
    );

    const sender = {
      address: 'hello@demomailtrap.com',
      name: 'Mailtrap Test',
    };

    const recipientsEnv = this.configService.get<string>('MAIL_RECIPIENTS');
    if (!recipientsEnv) {
      throw new Error(`MAIL_RECIPIENTS ${AuthErrors.ENV_VARIABLE_UNDEFINED}`);
    }

    const recipients = recipientsEnv.split(',').map((email) => email.trim());

    await transport.sendMail({
      from: sender,
      to: recipients,
      subject: 'Verify Your Email',
      text: `Please click the following link to verify your email: http://localhost:3000/auth/verify/${token}`,
    });

    return true;
  }

  // Verify User
  async verifyUser(token: string) {
    try {
      const decoded = this.jwtService.verify<JwtPayload>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      const userId = decoded.id;

      const updatedUser = await this.userRepository.updateUserStatus(
        userId,
        'Authorized',
      );
      if (!updatedUser) {
        throw new Error(AuthErrors.USER_NOT_FOUND);
      }

      return { message: AuthMessages.USER_AUTHORIZED };
    } catch (error) {
      throw new Error(`${AuthErrors.VERIFICATION_FAILED}: ${error}`);
    }
  }

  // Login Service
  async login(username: string, password: string): Promise<Users | null> {
    const user = await Users.findOne({
      where: { username },
      include: [{ all: true }],
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  // Generate JWT Token
  generateToken(user: Users): { access_token: string } {
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role.role,
    };

    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error(AuthErrors.JWT_SECRET_UNDEFINED);
    }

    const token = jwt.sign(payload, secret, {
      expiresIn: AuthConfig.JWT_EXPIRATION,
    });

    return { access_token: token };
  }
}
