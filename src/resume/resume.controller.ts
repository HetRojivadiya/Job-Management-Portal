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
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResumeService } from './resume.service';
import { RequestWithUser } from '../common/request-with-user.interface';
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
import { Resume } from './entity/resume.entity';
import { ApiResponse } from 'src/common/api.response';

@UseGuards(JwtAuthGuard, UserRoleGuard)
@Controller(ROUTES.RESUME)
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  @ApiOperation({ summary: SwaggerConstants.GetResume.summary })
  @SwaggerApiResponse(SwaggerConstants.GetResume.response.success)
  @SwaggerApiResponse(SwaggerConstants.GetResume.response.failure)
  @SetMetadata(AuthConfig.REQUIRED_ROLE, AuthConfig.CANDIDATE)
  @Get()
  async getResume(@Req() req: RequestWithUser) : Promise<ApiResponse<Resume>> {
    try {
      const resume = await this.resumeService.getResume(req.user.id);
      if(resume){
        return{
          statusCode : HttpStatus.OK,
          message : MESSAGES.RESUME_RETRIVED_SUCCESS,
          data : resume
        }
      }
      return{
        statusCode :HttpStatus.BAD_REQUEST,
        message : ErrorMessages.RESUME_NOT_FOUND,
      }
    } catch (error: unknown) {
      throw error;
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
  ) :Promise<ApiResponse<Resume>> {
    try {
      if (!file) {
        throw new NotFoundException(ErrorMessages.NO_FILE_UPLOADED);
      }
      const resume = await this.resumeService.uploadResume(req.user.id, file);
      return {
        statusCode : HttpStatus.OK,
        message : MESSAGES.FILE_UPLOAD_SUCCESS,
        data : resume,
      }
    } catch (error: unknown) {
      throw error;
    }
  }

  @ApiOperation({ summary: SwaggerConstants.DeleteResume.summary })
  @SwaggerApiResponse(SwaggerConstants.DeleteResume.response.success)
  @SwaggerApiResponse(SwaggerConstants.DeleteResume.response.failure)
  @SetMetadata(AuthConfig.REQUIRED_ROLE, AuthConfig.CANDIDATE)
  @Delete(ROUTES.DELETE)
  async deleteResume(@Req() req: RequestWithUser) : Promise<ApiResponse<void>>{
    try {
      const result = await this.resumeService.deleteResume(req.user.id);
      return {
        statusCode : HttpStatus.OK,
        message : result.message,
      }
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
  ) :Promise<ApiResponse<void>> {
    try {
      if (!file) {
        throw new NotFoundException(ErrorMessages.NO_FILE_UPLOADED);
      }
      const result =  await this.resumeService.updateResume(req.user.id, file);
      if(result){
        return {
          statusCode : HttpStatus.OK,
          message : MESSAGES.FILE_UPDATE_SUCCESS,
        }
      }
      return {
        statusCode : HttpStatus.OK,
        message : ErrorMessages.FAILED_TO_UPDATE,
      }
    } catch (error: unknown) {
      throw error;
    }
  }
}
