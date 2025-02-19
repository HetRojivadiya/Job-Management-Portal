import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

interface JwtPayload {
  id: string;
  role: string;
  email: string;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    const token = request.headers.authorization?.split(' ')[1];

    console.log(token);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const decoded = this.jwtService.verify<JwtPayload>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      if (decoded) {
        request['user'] = {
          id: decoded.id,
          role: decoded.role,
          email: decoded.email,
        };

        return true;
      } else {
        return false;
      }
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }
}
