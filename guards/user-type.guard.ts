import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { ERROR_MESSAGES } from './constants';

interface CustomRequest extends Request {
  user?: {
    id: string;
    username: string;
    role: string;
  };
}

@Injectable()
export class UserRoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<CustomRequest>();
    const userRole = request.user?.role;
    const requiredRole = this.getRequiredRole(context);

    console.log(userRole, requiredRole);

    if (!requiredRole) {
      return true;
    }

    if (userRole !== requiredRole) {
      throw new ForbiddenException(ERROR_MESSAGES.PERMISSIONS);
    }

    return true;
  }

  private getRequiredRole(context: ExecutionContext): string {
    const requiredRole = Reflect.getMetadata(
      'requiredRole',
      context.getHandler(),
    ) as string;
    return requiredRole;
  }
}
