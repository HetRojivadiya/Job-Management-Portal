import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';

interface CustomRequest extends Request {
  role?: string;
}

@Injectable()
export class UserRoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<CustomRequest>();
    const userRole = request.role;
    const requiredRole = this.getRequiredRole(context);

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
