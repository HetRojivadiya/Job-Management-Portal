import {
  Controller,
  Post,
  Delete,
  Put,
  UseGuards,
  Req,
  UploadedFile,
  UseInterceptors,
  Get,
  SetMetadata,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResumeService } from './resume.service';
import { RequestWithUser } from '../auth/request-with-user.interface';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ROUTES } from './constants/routes';
import { multerConfig } from './constants/multer.config';
import { UserRoleGuard } from 'guards/user-type.guard';
import { AuthConfig } from 'src/auth/constants/auth.config';
import {
  ApiOperation,
  ApiResponse as SwaggerApiResponse,
} from '@nestjs/swagger';
import { SwaggerConstants } from './constants/swagger.constants';
import { MESSAGES } from './constants/messages';
import { ErrorMessages } from './constants/error-messages.constants';

@UseGuards(JwtAuthGuard, UserRoleGuard)
@Controller(ROUTES.RESUME)
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  @ApiOperation({ summary: SwaggerConstants.GetResume.summary })
  @SwaggerApiResponse(SwaggerConstants.GetResume.response.success)
  @SwaggerApiResponse(SwaggerConstants.GetResume.response.failure)
  @SetMetadata(AuthConfig.REQUIRED_ROLE, AuthConfig.CANDIDATE)
  @Get()
  async getResume(@Req() req: RequestWithUser) {
    try {
      return await this.resumeService.getResume(req.user.id);
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        ErrorMessages.FAILED_TO_RETRIEVE,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: SwaggerConstants.UploadResume.summary })
  @SwaggerApiResponse(SwaggerConstants.UploadResume.response.success)
  @SwaggerApiResponse(SwaggerConstants.UploadResume.response.failure)
  @SetMetadata(AuthConfig.REQUIRED_ROLE, AuthConfig.CANDIDATE)
  @Post(ROUTES.UPLOAD)
  @UseInterceptors(FileInterceptor(MESSAGES.RESUME, multerConfig))
  async uploadResume(
    @Req() req: RequestWithUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      if (!file) {
        throw new HttpException(
          ErrorMessages.NO_FILE_UPLOADED,
          HttpStatus.BAD_REQUEST,
        );
      }
      return await this.resumeService.uploadResume(req.user.id, file);
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        ErrorMessages.FAILED_TO_UPLOAD,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: SwaggerConstants.DeleteResume.summary })
  @SwaggerApiResponse(SwaggerConstants.DeleteResume.response.success)
  @SwaggerApiResponse(SwaggerConstants.DeleteResume.response.failure)
  @SetMetadata(AuthConfig.REQUIRED_ROLE, AuthConfig.CANDIDATE)
  @Delete(ROUTES.DELETE)
  async deleteResume(@Req() req: RequestWithUser) {
    try {
      return await this.resumeService.deleteResume(req.user.id);
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        ErrorMessages.FAILED_TO_DELETE,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: SwaggerConstants.UpdateResume.summary })
  @SwaggerApiResponse(SwaggerConstants.UpdateResume.response.success)
  @SwaggerApiResponse(SwaggerConstants.UpdateResume.response.failure)
  @SetMetadata(AuthConfig.REQUIRED_ROLE, AuthConfig.CANDIDATE)
  @Put(ROUTES.UPDATE)
  @UseInterceptors(FileInterceptor(MESSAGES.RESUME, multerConfig))
  async updateResume(
    @Req() req: RequestWithUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      if (!file) {
        throw new HttpException(
          ErrorMessages.NO_FILE_UPLOADED,
          HttpStatus.BAD_REQUEST,
        );
      }
      return await this.resumeService.updateResume(req.user.id, file);
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
    }
  }
}
