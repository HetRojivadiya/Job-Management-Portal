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

@Injectable()
export class LoginValidationGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const body = request.body as unknown as LoginDto;

    if (!body.email || body.email.trim().length === 0) {
      throw new BadRequestException(ERROR_MESSAGES.EMAIL_REQUIRED);
    }

    if (!body.password || body.password.trim().length === 0) {
      throw new BadRequestException(ERROR_MESSAGES.PASSWORD_REQUIRED);
    }

    const user = await this.authService.login(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    return true;
  }
}
