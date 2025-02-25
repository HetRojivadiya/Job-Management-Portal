import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { SignupDto } from '../src/auth/dto/signup.dto';

import { UserRepository } from '../src/user/repository/user.repository';
import { ERROR_MESSAGES } from './constants';
import { AuthService } from 'src/auth/auth.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthConfig } from 'src/auth/constants/auth.config';

@Injectable()
export class SignupValidationGuard implements CanActivate {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const signupDto = request.body as unknown as SignupDto;

    if (!signupDto.username || signupDto.username.length < 3) {
      throw new BadRequestException(ERROR_MESSAGES.USERNAME_LENGTH);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!signupDto.email || !emailRegex.test(signupDto.email)) {
      throw new BadRequestException(ERROR_MESSAGES.INVALID_EMAIL_FORMAT);
    }

    const mobileRegex = /^\d{10}$/;
    if (!signupDto.mobile || !mobileRegex.test(signupDto.mobile)) {
      throw new BadRequestException(ERROR_MESSAGES.INVALID_MOBILE);
    }

    if (!signupDto.password || signupDto.password.length < 8) {
      throw new BadRequestException(ERROR_MESSAGES.PASSWORD_LENGTH);
    }

    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new BadRequestException(ERROR_MESSAGES.JWT_SECRET_UNDEFINED);
    }

    const existingUser = await this.userRepository.findUserByEmail(
      signupDto.email,
    );
    if (existingUser) {
      if (existingUser.status === 'Authorized') {
        throw new BadRequestException(
          ERROR_MESSAGES.USER_ALREADY_EXISTS_AND_AUTHORIZED,
        );
      }

      const token = this.jwtService.sign(
        { id: existingUser.id },
        {
          expiresIn: AuthConfig.TOKEN_EXPIRATION,
          secret: secret,
        },
      );

      const url = this.configService.get<string>('VERIFY_USER_URL') + token;

      await this.authService.sendVerificationEmail(url);
      throw new BadRequestException(
        ERROR_MESSAGES.USER_ALREADY_EXISTS_BUT_UNAUTHORIZED,
      );
    }
    return true;
  }
}
