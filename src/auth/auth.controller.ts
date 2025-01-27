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
  SetMetadata,
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
import { UserRepository } from './repository/user.repository';
import { UserRoleGuard } from './guards/user-type.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthConfig } from './constants/auth.config';

@Controller(AuthRoutes.BASE)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userRepository: UserRepository,
  ) {}

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
  async verify(
    @Param(AuthConfig.TOKEN) token: string,
  ): Promise<{ message: string }> {
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
  async login(
    @Body() loginDto: LoginDto,
  ): Promise<ApiResponse<User | { token: string }>> {
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
      if (user.twoFactorEnabled) {
        return {
          statusCode: HttpStatus.OK,
          message: AuthMessages.REDIRECT_OTP,
          data: { token: token.access_token },
        };
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

  // verify otp
  @Post(AuthRoutes.VERIFY_OPT)
  async verifyOptController(
    @Body(AuthConfig.TOKEN) token: string,
    @Body(AuthConfig.OTP) otp: string,
  ) {
    const isValid = await this.authService.verifyOpt(token, otp);
    if (!isValid) {
      throw new UnauthorizedException(AuthErrors.INVALID_2FA_TOKEN);
    }
    return { token };
  }

  // enable two factor auth via id
  @Post(AuthRoutes.ENABLE_2FA)
  async enableTwoFactor(@Body(AuthConfig.TOKEN) token: string) {
    const userId = this.authService.decodeTokenAndExtractUserId(token);
    const { qrCode } = await this.authService.generateTwoFactorSecret(userId);
    return { qrCode, message: AuthMessages.TWO_FACTOR_SETUP_SUCCESS };
  }

  // Admin only route
  @UseGuards(JwtAuthGuard, UserRoleGuard)
  @SetMetadata('requiredRole', 'Admin')
  @Get(AuthRoutes.ADMIN)
  adminRoute() {
    return {
      message: AuthMessages.ADMIN_ACCESS,
    };
  }

  // Candidate only route
  @UseGuards(JwtAuthGuard, UserRoleGuard)
  @SetMetadata('requiredRole', 'Candidate')
  @Get(AuthRoutes.CANDIDATE)
  candidateRoute() {
    return {
      message: AuthMessages.CANDIDATE_ACCESS,
    };
  }
}
