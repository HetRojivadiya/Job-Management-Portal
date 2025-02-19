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
  Request,
  BadRequestException,
  Req,
  Get,
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
import { SwaggerConstants } from './constants/auth.swagger';
import { Users } from 'src/user/entity/users.entity';

@ApiTags('auth')
@Controller(AuthRoutes.BASE)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userRepository: UserRepository,
  ) {}

  // Signup endpoint
  @ApiOperation({ summary: SwaggerConstants.Signup.summary })
  @ApiBody({ type: SignupDto })
  @SwaggerApiResponse(SwaggerConstants.Signup.response)
  @UseGuards(SignupValidationGuard)
  @Post(AuthRoutes.SIGNUP)
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() signupDto: SignupDto): Promise<ApiResponse<User>> {
    try {
      const result = await this.authService.signup(signupDto);

      const responseData = { data: result.data, token: result.token };
      return {
        statusCode: HttpStatus.CREATED,
        message: AuthMessages.SIGNUP_SUCCESS,
        data: responseData,
      };
    } catch {
      throw new BadRequestException(AuthErrors.SIGNUP_FAILED);
    }
  }

  // Verify endpoint
  @ApiOperation({ summary: SwaggerConstants.Verify.summary })
  @ApiParam(SwaggerConstants.Verify.param)
  @SwaggerApiResponse(SwaggerConstants.Verify.response.success)
  @SwaggerApiResponse(SwaggerConstants.Verify.response.failure)
  @Post(AuthRoutes.VERIFY)
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async verify(
    @Param(AuthConfig.TOKEN) token: string,
    @Req() req: RequestWithUser,
  ) {
    try {
      await this.authService.verifyUser(req.user.id);

      return { status: true };
    } catch (error) {
      throw new BadRequestException(
        AuthErrors.USER_VERIFICATION_FAILED + ': ' + (error as Error).message,
      );
    }
  }

  // Login endpoint
  @ApiOperation({ summary: SwaggerConstants.Login.summary })
  @ApiBody({ type: LoginDto })
  @SwaggerApiResponse(SwaggerConstants.Login.response.success)
  @SwaggerApiResponse(SwaggerConstants.Login.response.failure)
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
        throw new BadRequestException(AuthMessages.INVALID_CREDENTIALS);
      }
      const token = await this.authService.generateToken(user);
      if (!token || !token.access_token) {
        throw new BadRequestException(AuthMessages.TOKEN_NOT_GENERATED);
      }
      const responseData = {
        token: token.access_token,
        role: token.role,
        twoFactorEnabled: user.twoFactorEnabled,
        isPopup: user.isPopup,
      };
      if (user.twoFactorEnabled) {
        return {
          statusCode: HttpStatus.OK,
          message: AuthMessages.REDIRECT_OTP,
          data: responseData,
        };
      } else if (!user.twoFactorEnabled && user.isPopup) {
        return {
          statusCode: HttpStatus.OK,
          message: 'PopUp',
          data: responseData,
        };
      }
      return {
        statusCode: HttpStatus.OK,
        message: AuthMessages.LOGIN_SUCCESS,
        data: responseData,
      };
    } catch {
      throw new UnauthorizedException(AuthErrors.USER_CREATION_FAILED);
    }
  }

  // Verify Otp
  @ApiOperation({ summary: SwaggerConstants.VerifyOtp.summary })
  @ApiBody({
    description: SwaggerConstants.VerifyOtp.bodyDescription,
    type: Object,
  })
  @SwaggerApiResponse(SwaggerConstants.VerifyOtp.response.success)
  @SwaggerApiResponse(SwaggerConstants.VerifyOtp.response.failure)
  @UseGuards(JwtAuthGuard)
  @Post(AuthRoutes.VERIFY_OPT)
  async verifyOptController(
    @Headers('authorization') authHeader: string,
    @Body(AuthConfig.OTP) otp: string,
    @Request() req: RequestWithUser,
  ): Promise<ApiResponse<string>> {
    try {
      const isValid = await this.authService.verifyOpt(req.user.id, otp);
      const token = authHeader?.split(' ')[1];
      if (!isValid) {
        throw new BadRequestException(AuthErrors.INVALID_2FA_TOKEN);
      }
      return {
        statusCode: HttpStatus.OK,
        message: AuthMessages.OTP_VERIFIED_SUCCESSFULLY,
        data: token,
      };
    } catch {
      throw new BadRequestException(AuthErrors.INVALID_2FA_TOKEN);
    }
  }

  //Enable 2FA route
  @ApiOperation({ summary: SwaggerConstants.EnableTwoFactor.summary })
  @SwaggerApiResponse(SwaggerConstants.EnableTwoFactor.response.success)
  @SwaggerApiResponse(SwaggerConstants.EnableTwoFactor.response.failure)
  @UseGuards(JwtAuthGuard)
  @Post(AuthRoutes.ENABLE_2FA)
  async enableTwoFactor(@Request() req: RequestWithUser) {
    try {
      const { qrCode } = await this.authService.generateTwoFactorSecret(
        req.user.id,
      );
      return {
        qrCode,
        message: AuthMessages.TWO_FACTOR_SETUP_SUCCESS,
      };
    } catch {
      throw new BadRequestException(AuthErrors.VERIFICATION_FAILED);
    }
  }

  //Disable 2FA
  // @ApiOperation({ summary: SwaggerConstants.EnableTwoFactor.summary })
  // @SwaggerApiResponse(SwaggerConstants.EnableTwoFactor.response.success)
  // @SwaggerApiResponse(SwaggerConstants.EnableTwoFactor.response.failure)
  @UseGuards(JwtAuthGuard)
  @Post(AuthRoutes.DISABLE_2FA)
  async disableTwoFactor(
    @Request() req: RequestWithUser,
  ): Promise<ApiResponse<Users | null>> {
    try {
      const user = await this.authService.disableTwoFactorAuthentication(
        req.user.id,
      );

      if (!user) {
        throw new BadRequestException(AuthErrors.DISABLE_FAILED);
      }
      return {
        statusCode: 200,
        message: AuthMessages.TWO_FACTOR_SETUP_DISABLE,
        data: user,
      };
    } catch {
      throw new BadRequestException(AuthErrors.DISABLE_FAILED);
    }
  }

  // Forgot Password - send email with reset link
  @ApiOperation({ summary: SwaggerConstants.ForgotPassword.summary })
  @ApiBody({
    description: SwaggerConstants.ForgotPassword.bodyDescription,
    type: ForgotPasswordDto,
  })
  @SwaggerApiResponse(SwaggerConstants.ForgotPassword.response.success)
  @SwaggerApiResponse(SwaggerConstants.ForgotPassword.response.failure)
  @Post(AuthRoutes.FORGOT_PASSWORD)
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<ApiResponse<string>> {
    try {
      await this.authService.sendPasswordResetLink(forgotPasswordDto.email);
      return {
        statusCode: HttpStatus.OK,
        message: AuthMessages.PASSWORD_RESET_LINK_SENT,
      };
    } catch {
      throw new BadRequestException(AuthMessages.PASSWORD_RESET_FAILED);
    }
  }

  // Reset Password - update password in the database
  @ApiOperation({ summary: SwaggerConstants.ResetPassword.summary })
  @ApiBody({
    description: SwaggerConstants.ResetPassword.bodyDescription,
    type: ForgotPasswordDto,
  })
  @SwaggerApiResponse(SwaggerConstants.ResetPassword.response.success)
  @SwaggerApiResponse(SwaggerConstants.ResetPassword.response.failure)
  @Post(AuthRoutes.RESET_PASSWORD)
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @Request() req: RequestWithUser,
  ): Promise<ApiResponse<string>> {
    try {
      await this.authService.resetPassword(
        req.user.email,
        resetPasswordDto.newPassword,
      );
      return {
        statusCode: HttpStatus.OK,
        message: AuthMessages.PASSWORD_UPDATED_SUCCESSFULLY,
      };
    } catch {
      throw new BadRequestException(AuthMessages.PASSWORD_UPDATE_FAILED);
    }
  }

  @Get('check-role')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  checkRole(@Request() req: RequestWithUser): ApiResponse<string> {
    {
      if (req.user) {
        return {
          statusCode: HttpStatus.OK,
          message: AuthMessages.ROLE_CHECK_SUCCESSFULLY,
          data: req.user.role,
        };
      }
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: AuthMessages.ROLE_CHECK_SUCCESSFULLY,
        data: '',
      };
    }
  }
}
