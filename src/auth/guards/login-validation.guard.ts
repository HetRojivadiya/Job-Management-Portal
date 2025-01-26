import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { LoginDto } from '../dto/login.dto';

@Injectable()
export class LoginValidationGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const body = request.body as unknown as LoginDto;

    if (!body.username || body.username.trim().length === 0) {
      throw new BadRequestException('Username is required.');
    }

    if (!body.password || body.password.trim().length === 0) {
      throw new BadRequestException('Password is required.');
    }

    const user = await this.authService.login(body.username, body.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    return true;
  }
}
