import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
  UnauthorizedException,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { SignupValidationGuard } from './guards/signup-validation.guard';
import { LoginDto } from './dto/login.dto';
import { LoginValidationGuard } from './guards/login-validation.guard';
import { ApiResponse } from './response-interfaces/response.interface';
import { User } from './response-interfaces/user.interface';
import { AuthMessages } from './constants/auth.massages';
import { AuthErrors } from './constants/auth.errors';
import { AuthRoutes } from './constants/auth.routes';

@Controller(AuthRoutes.BASE)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Signup endpoint
  @UseGuards(SignupValidationGuard)
  @Post(AuthRoutes.SIGNUP)
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() signupDto: SignupDto): Promise<ApiResponse<User>> {
    const result = await this.authService.signup(signupDto);

    return {
      statusCode: HttpStatus.CREATED,
      message: AuthMessages.SIGNUP_SUCCESS,
      data: result.data,
      token: result.token,
    };
  }

  // Verify endpoint
  @Get(AuthRoutes.VERIFY)
  async verify(@Param('token') token: string): Promise<{ message: string }> {
    try {
      const result = await this.authService.verifyUser(token);
      return result;
    } catch (error) {
      return {
        message:
          AuthErrors.USER_VERIFICATION_FAILED + ': ' + (error as Error).message,
      };
    }
  }

  // Login endpoint
  @UseGuards(LoginValidationGuard)
  @Post(AuthRoutes.LOGIN)
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<ApiResponse<User>> {
    try {
      const user = await this.authService.login(
        loginDto.username,
        loginDto.password,
      );

      if (!user) {
        throw new UnauthorizedException(AuthMessages.INVALID_CREDENTIALS);
      }

      const token = this.authService.generateToken(user);

      if (!token) {
        throw new UnauthorizedException(AuthMessages.TOKEN_NOT_GENERATED);
      }

      return {
        statusCode: HttpStatus.OK,
        message: AuthMessages.LOGIN_SUCCESS,
        data: user,
        token: token.access_token,
      };
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }
}
