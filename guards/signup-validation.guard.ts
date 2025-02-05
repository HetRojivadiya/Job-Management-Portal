import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { SignupDto } from '../src/auth/dto/signup.dto';

import { UserRepository } from '../src/user/repository/user.repository';
import { RoleRepository } from '../src/user/repository/role.repository';
import { ERROR_MESSAGES } from './constants';

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

    const existingUser = await this.userRepository.findUserByEmail(
      signupDto.email,
    );
    if (existingUser) {
      throw new BadRequestException(ERROR_MESSAGES.USER_ALREADY_EXISTS);
    }

    if (!signupDto.password || signupDto.password.length < 8) {
      throw new BadRequestException(ERROR_MESSAGES.PASSWORD_LENGTH);
    }

    return true;
  }
}
