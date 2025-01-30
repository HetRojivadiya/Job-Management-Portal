import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
  Headers,
  UnauthorizedException,
  Get,
  SetMetadata,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { SignupValidationGuard } from '../../guards/signup-validation.guard';
import { LoginDto } from './dto/login.dto';
import { LoginValidationGuard } from '../../guards/login-validation.guard';
import { ApiResponse } from './response-interfaces/response.interface';
import { User } from './response-interfaces/user.interface';
import { AuthMessages } from './constants/auth.massages';
import { AuthErrors } from './constants/auth.errors';
import { AuthRoutes } from './constants/auth.routes';
import { UserRepository } from '../user/repository/user.repository';
import { UserRoleGuard } from '../../guards/user-type.guard';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { AuthConfig } from './constants/auth.config';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiResponse as SwaggerApiResponse,
} from '@nestjs/swagger';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RequestWithUser } from './request-with-user.interface';

@ApiTags('auth')
@Controller(AuthRoutes.BASE)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userRepository: UserRepository,
  ) {}

  // Signup endpoint
  @ApiOperation({ summary: 'Sign up a new user' })
  @ApiBody({ type: SignupDto })
  @SwaggerApiResponse({
    status: 201,
    description: 'Signup successful, please check your email for verification.',
    schema: {
      example: {
        statusCode: 201,
        message: 'Signup successful, please check your email for verification.',
        data: {
          data: {
            status: 'Unauthorized',
            twoFactorEnabled: false,
            id: '795d97c7-8da4-4c0e-bb2c-8e54a5689a10',
            username: 'het123',
            password:
              '$2b$10$JNyk8MuAWMfVDmxHlCrjCO2dwYw9lW/76WA7SflfgOSxNd8krj4ZS',
            email: 'het3@gmail.com',
            mobile: '1234567890',
            roleId: '06cf5958-6fb1-451b-9e9a-1d7cb1e007f5',
            updatedAt: '2025-01-30T08:36:14.904Z',
            createdAt: '2025-01-30T08:36:14.904Z',
            twoFactorSecret: null,
          },
          token:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijc5NWQ5N2M3LThkYTQtNGMwZS1iYjJjLThlNTRhNTY4OWExMCIsImlhdCI6MTczODIyNjE3NCwiZXhwIjoxNzM4MjI2NDc0fQ.Btho2ltjAmdlJSDgVq6DJRO-kHN1raWlwQfVq5pSOvs',
        },
      },
    },
  })
  @UseGuards(SignupValidationGuard)
  @Post(AuthRoutes.SIGNUP)
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() signupDto: SignupDto): Promise<ApiResponse<User>> {
    const result = await this.authService.signup(signupDto);

    const responseData = { data: result.data, token: result.token };
    return {
      statusCode: HttpStatus.CREATED,
      message: AuthMessages.SIGNUP_SUCCESS,
      data: responseData,
    };
  }

  // Verify endpoint
  @ApiOperation({ summary: 'Verify the user with a token' })
  @ApiParam({
    name: AuthConfig.TOKEN,
    required: true,
    description: 'The token to verify the user',
    type: String,
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'User verification successful',
    schema: {
      example: {
        message: AuthMessages.OTP_VERIFIED_SUCCESSFULLY,
      },
    },
  })
  @SwaggerApiResponse({
    status: 400,
    description: 'Invalid token or verification failed',
    schema: {
      example: {
        message: `${AuthErrors.USER_VERIFICATION_FAILED}: <error-message>`,
      },
    },
  })
  @Get(AuthRoutes.VERIFY)
  @HttpCode(HttpStatus.OK)
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
  @ApiOperation({ summary: 'Login a user' })
  @ApiBody({ type: LoginDto })
  @SwaggerApiResponse({
    status: 200,
    description: 'Login successful, returns access token',
    schema: {
      example: {
        statusCode: 200,
        message: AuthMessages.LOGIN_SUCCESS,
        data: {
          token: 'your-jwt-token-here',
        },
      },
    },
  })
  @SwaggerApiResponse({
    status: 401,
    description: 'Invalid credentials or token generation failed',
    schema: {
      example: {
        message: AuthMessages.INVALID_CREDENTIALS,
        error: 'Unauthorized',
        statusCode: 401,
      },
    },
  })
  @UseGuards(LoginValidationGuard)
  @Post(AuthRoutes.LOGIN)
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<ApiResponse<User>> {
    try {
      const user = await this.authService.login(
        loginDto.email,
        loginDto.password,
      );
      if (!user) {
        throw new UnauthorizedException(AuthMessages.INVALID_CREDENTIALS);
      }
      const token = await this.authService.generateToken(user); // Ensure the method is awaited since it's asynchronous
      if (!token || !token.access_token) {
        throw new UnauthorizedException(AuthMessages.TOKEN_NOT_GENERATED);
      }

      const responseData = {
        token: token.access_token,
      };

      if (user.twoFactorEnabled) {
        return {
          statusCode: HttpStatus.OK,
          message: AuthMessages.REDIRECT_OTP,
          data: responseData,
        };
      }
      return {
        statusCode: HttpStatus.OK,
        message: AuthMessages.LOGIN_SUCCESS,
        data: responseData,
      };
    } catch (error) {
      console.error('Login Error:', error);
      throw new UnauthorizedException(error);
    }
  }

  // verify otp
  @ApiOperation({ summary: 'Verify OTP for user authentication' })
  @ApiBody({
    description: 'Body to verify OTP with a token',
    type: Object,
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'OTP verified successfully.',
    schema: {
      example: {
        statusCode: 200,
        message: 'Otp Verified Successfully',
        data: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjRiYmU1ZjA2LWYyMzQtNGJlZi04YzAxLTExZTc2MDIwMzEwZSIsInVzZXJuYW1lIjoiSGV0IFJvaml2YWRpeWEiLCJlbWFpbCI6ImhldHJvaml2YWRpeWE5OTlAZ21haWwuY29tIiwiaWF0IjoxNzM4MjMwNzQxLCJleHAiOjE3MzgyMzQzNDF9.Xuyz2f2jMaq8Ra7gNTD7eq5yka-er6fMRF9ta6flblg',
      },
    },
  })
  @SwaggerApiResponse({
    status: 401,
    description: 'Invalid two-factor authentication token.',
    schema: {
      example: {
        statusCode: 401,
        message: 'Invalid two-factor authentication token',
        error: 'Unauthorized',
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @Post(AuthRoutes.VERIFY_OPT)
  async verifyOptController(
    @Headers('authorization') authHeader: string,
    @Body(AuthConfig.OTP) otp: string,
    @Request() req: RequestWithUser,
  ): Promise<ApiResponse<string>> {
    const isValid = await this.authService.verifyOpt(req.user.id, otp);
    const token = authHeader?.split(' ')[1];
    if (!isValid) {
      throw new UnauthorizedException(AuthErrors.INVALID_2FA_TOKEN);
    }
    return {
      statusCode: HttpStatus.OK,
      message: AuthMessages.OTP_VERIFIED_SUCCESSFULLY,
      data: token,
    };
  }

  @ApiOperation({ summary: 'Enable two-factor authentication for a user' })
  @SwaggerApiResponse({
    status: 200,
    description: 'Two-factor authentication setup successful',
    schema: {
      example: {
        message: AuthMessages.TWO_FACTOR_SETUP_SUCCESS,
        qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANS...==', // Example QR Code image data (Base64 encoded)
      },
    },
  })
  @SwaggerApiResponse({
    status: 401,
    description: 'Unauthorized or Invalid token',
    schema: {
      example: {
        message: 'Unauthorized',
        error: 'Unauthorized',
        statusCode: 401,
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @Post(AuthRoutes.ENABLE_2FA)
  async enableTwoFactor(@Request() req: RequestWithUser) {
    const { qrCode } = await this.authService.generateTwoFactorSecret(
      req.user.id,
    );
    return {
      qrCode,
      message: AuthMessages.TWO_FACTOR_SETUP_SUCCESS,
    };
  }
  // Forgot Password - send email with reset link
  @ApiOperation({ summary: "Send password reset link to the user's email" })
  @ApiBody({
    description: 'The email of the user who requested the password reset link',
    type: ForgotPasswordDto,
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'Password reset link sent successfully',
    schema: {
      example: {
        statusCode: 200,
        message: AuthMessages.PASSWORD_RESET_LINK_SENT,
      },
    },
  })
  @SwaggerApiResponse({
    status: 400,
    description: 'Invalid email or user not found',
    schema: {
      example: {
        statusCode: 400,
        message: 'Invalid email or user not found',
        error: 'Bad Request',
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  @Post(AuthRoutes.FORGOT_PASSWORD)
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<ApiResponse<string>> {
    await this.authService.sendPasswordResetLink(forgotPasswordDto.email);
    return {
      statusCode: HttpStatus.OK,
      message: AuthMessages.PASSWORD_RESET_LINK_SENT,
    };
  }

  // Reset Password - update password in the database
  @ApiOperation({ summary: 'Reset user password' })
  @ApiBody({
    description: 'The new password to update for the user',
    type: ResetPasswordDto,
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'Password updated successfully',
    schema: {
      example: {
        statusCode: 200,
        message: AuthMessages.PASSWORD_UPDATED_SUCCESSFULLY,
      },
    },
  })
  @SwaggerApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid token or user not authorized',
    schema: {
      example: {
        statusCode: 401,
        message: AuthErrors.USER_UNAUTHORIZED,
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @Post(AuthRoutes.RESET_PASSWORD)
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @Request() req: RequestWithUser,
  ): Promise<ApiResponse<string>> {
    await this.authService.resetPassword(
      req.user.email,
      resetPasswordDto.newPassword,
    );
    return {
      statusCode: HttpStatus.OK,
      message: AuthMessages.PASSWORD_UPDATED_SUCCESSFULLY,
    };
  }

  // Admin only route
  @UseGuards(JwtAuthGuard, UserRoleGuard)
  @SetMetadata(AuthConfig.REQUIRED_ROLE, AuthConfig.ADMIN)
  @Get(AuthRoutes.ADMIN)
  @HttpCode(HttpStatus.OK)
  adminRoute(): Promise<ApiResponse<string>> {
    return Promise.resolve({
      statusCode: HttpStatus.OK,
      message: AuthMessages.ADMIN_ACCESS,
    });
  }

  // Candidate only route
  @UseGuards(JwtAuthGuard, UserRoleGuard)
  @SetMetadata(AuthConfig.REQUIRED_ROLE, AuthConfig.CANDIDATE)
  @Get(AuthRoutes.CANDIDATE)
  @HttpCode(HttpStatus.OK)
  candidateRoute(): Promise<ApiResponse<string>> {
    return Promise.resolve({
      statusCode: HttpStatus.OK,
      message: AuthMessages.CANDIDATE_ACCESS,
    });
  }
}
