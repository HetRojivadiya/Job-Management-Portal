import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { Request } from 'express';

interface TwoFactorRequestBody {
  user: {
    id: string;
    twoFactorEnabled: boolean;
  };
  twoFactorToken: string;
}

@Injectable()
export class TwoFactorGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const { user, twoFactorToken } = request.body as TwoFactorRequestBody;

    if (user?.twoFactorEnabled) {
      const isValid = await this.authService.verifyTwoFactorToken(
        user.id,
        twoFactorToken,
      );
      return isValid;
    }

    return true;
  }
}
