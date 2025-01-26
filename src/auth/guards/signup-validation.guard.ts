import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { SignupDto } from '../dto/signup.dto';

import { UserRepository } from '../repository/user.repository';
import { RoleRepository } from '../repository/role.repository';

@Injectable()
export class SignupValidationGuard implements CanActivate {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const signupDto = request.body as unknown as SignupDto;

    if (!signupDto.username || signupDto.username.length < 3) {
      throw new BadRequestException(
        'Username must be at least 3 characters long',
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!signupDto.email || !emailRegex.test(signupDto.email)) {
      throw new BadRequestException('Invalid email format');
    }

    const mobileRegex = /^\d{10}$/;
    if (!signupDto.mobile || !mobileRegex.test(signupDto.mobile)) {
      throw new BadRequestException('Mobile number must be 10 digits');
    }

    const existingUser = await this.userRepository.findUserByEmail(
      signupDto.email,
    );
    if (existingUser) {
      throw new BadRequestException('User already exists with this email.');
    }

    if (!signupDto.password || signupDto.password.length < 8) {
      throw new BadRequestException(
        'Password must be at least 8 characters long',
      );
    }

    return true;
  }
}
