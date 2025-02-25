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
import { RequestWithUser } from '../common/request-with-user.interface';
import { SwaggerConstants } from './constants/auth.swagger';
import { SignupResponse } from './response/signup-response.interface';
import { SigninResponse } from './response/signin-response.interface';
import { ApiResponse } from 'src/common/api.response';
import { ROUTES } from '@nestjs/core/router/router-module';

@ApiTags(AuthRoutes.BASE)
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
  async signup(
    @Body() signupDto: SignupDto,
  ): Promise<ApiResponse<SignupResponse>> {
    try {
      //throw new Error("Testing global exception handler");

      const result = await this.authService.signup(signupDto);
      if (!result) {
        throw new BadRequestException(AuthErrors.SIGNUP_FAILED);
      }
      return {
        statusCode: HttpStatus.CREATED,
        message: AuthMessages.SIGNUP_SUCCESS,
        data: result,
      };
    } catch (error) {
      throw error;
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
  ): Promise<ApiResponse<void>> {
    try {
      await this.authService.verifyUser(req.user.id);
      return {
        statusCode: HttpStatus.OK,
        message: AuthMessages.USER_VERIFICATION_SUCCESS,
      };
    } catch (error) {
      throw error;
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
  async login(
    @Body() loginDto: LoginDto,
  ): Promise<ApiResponse<SigninResponse>> {
    try {
      const result = await this.authService.login(loginDto);
      if (result.invalidPassword) {
        throw new UnauthorizedException(AuthErrors.INVALID_PASSWORD);
      }
      return {
        statusCode: HttpStatus.OK,
        message: AuthMessages.LOGIN_SUCCESS,
        data: result,
      };
    } catch (error) {
      throw error;
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
    } catch (error) {
      throw error;
    }
  }

  //Enable 2FA route
  @ApiOperation({ summary: SwaggerConstants.EnableTwoFactor.summary })
  @SwaggerApiResponse(SwaggerConstants.EnableTwoFactor.response.success)
  @SwaggerApiResponse(SwaggerConstants.EnableTwoFactor.response.failure)
  @UseGuards(JwtAuthGuard)
  @Post(AuthRoutes.ENABLE_2FA)
  async enableTwoFactor(
    @Request() req: RequestWithUser,
  ): Promise<{ qrCode: string; message: string }> {
    try {
      const { qrCode } = await this.authService.generateTwoFactorSecret(
        req.user.id,
      );
      return {
        qrCode,
        message: AuthMessages.TWO_FACTOR_SETUP_SUCCESS,
      };
    } catch (error) {
      throw error;
    }
  }

  //Disable 2FA
  @ApiOperation({ summary: SwaggerConstants.DisableTwoFactor.summary })
  @SwaggerApiResponse(SwaggerConstants.DisableTwoFactor.response.success)
  @SwaggerApiResponse(SwaggerConstants.DisableTwoFactor.response.failure)
  @UseGuards(JwtAuthGuard)
  @Post(AuthRoutes.DISABLE_2FA)
  async disableTwoFactor(
    @Request() req: RequestWithUser,
  ): Promise<ApiResponse<void>> {
    try {
      await this.authService.disableTwoFactorAuthentication(req.user.id);
      return {
        statusCode: HttpStatus.OK,
        message: AuthMessages.TWO_FACTOR_SETUP_DISABLE,
      };
    } catch (error) {
      throw error;
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
  ): Promise<ApiResponse<void>> {
    try {
      await this.authService.sendPasswordResetLink(forgotPasswordDto.email);
      return {
        statusCode: HttpStatus.OK,
        message: AuthMessages.PASSWORD_RESET_LINK_SENT,
      };
    } catch (error) {
      throw error;
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
  ): Promise<ApiResponse<void>> {
    try {
      await this.authService.resetPassword(
        req.user.email,
        resetPasswordDto.newPassword,
      );
      return {
        statusCode: HttpStatus.OK,
        message: AuthMessages.PASSWORD_UPDATED_SUCCESSFULLY,
      };
    } catch (error) {
      throw error;
    }
  }

  @ApiOperation({ summary: SwaggerConstants.ResetPassword.summary })
  @ApiBody({
    description: SwaggerConstants.ResetPassword.bodyDescription,
    type: ForgotPasswordDto,
  })
  @SwaggerApiResponse(SwaggerConstants.ResetPassword.response.success)
  @SwaggerApiResponse(SwaggerConstants.ResetPassword.response.failure)
  @Get(AuthRoutes.CHECK_ROLE)
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  checkRole(@Request() req: RequestWithUser): ApiResponse<string> {
    try {
      if (req.user) {
        return {
          statusCode: HttpStatus.OK,
          message: AuthMessages.ROLE_CHECK_SUCCESSFULLY,
          data: req.user.role,
        };
      }
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: AuthMessages.ROLE_CHECK_UNSUCCESSFULLY,
      };
    } catch (error) {
      throw error;
    }
  }
}
