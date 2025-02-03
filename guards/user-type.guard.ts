import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';

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

    if (!requiredRole) {
      return true;
    }

    if (userRole !== requiredRole) {
      throw new ForbiddenException(
        'You do not have permission to access this resource.',
      );
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
