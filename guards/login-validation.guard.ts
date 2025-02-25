import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../src/auth/auth.service';
import { LoginDto } from '../src/auth/dto/login.dto';
import { ERROR_MESSAGES } from './constants';
import { AuthConfig } from 'src/auth/constants/auth.config';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class LoginValidationGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const body = request.body as unknown as LoginDto;

    if (!body.email || body.email.trim().length === 0) {
      throw new BadRequestException(ERROR_MESSAGES.EMAIL_REQUIRED);
    }

    if (!body.password || body.password.trim().length === 0) {
      throw new BadRequestException(ERROR_MESSAGES.PASSWORD_REQUIRED);
    }

    return true;
  }
}
