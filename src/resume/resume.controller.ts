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
    return await this.resumeService.getResume(req.user.id);
  }

  @ApiOperation({ summary: SwaggerConstants.UploadResume.summary })
  @SwaggerApiResponse(SwaggerConstants.UploadResume.response.success)
  @SwaggerApiResponse(SwaggerConstants.UploadResume.response.failure)
  @SetMetadata(AuthConfig.REQUIRED_ROLE, AuthConfig.CANDIDATE)
  @Post(ROUTES.UPLOAD)
  @UseInterceptors(FileInterceptor('resume', multerConfig))
  async uploadResume(
    @Req() req: RequestWithUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.resumeService.uploadResume(req.user.id, file);
  }

  @ApiOperation({ summary: SwaggerConstants.DeleteResume.summary })
  @SwaggerApiResponse(SwaggerConstants.DeleteResume.response.success)
  @SwaggerApiResponse(SwaggerConstants.DeleteResume.response.failure)
  @SetMetadata(AuthConfig.REQUIRED_ROLE, AuthConfig.CANDIDATE)
  @Delete(ROUTES.DELETE)
  async deleteResume(@Req() req: RequestWithUser) {
    return await this.resumeService.deleteResume(req.user.id);
  }

  @ApiOperation({ summary: SwaggerConstants.UpdateResume.summary })
  @SwaggerApiResponse(SwaggerConstants.UpdateResume.response.success)
  @SwaggerApiResponse(SwaggerConstants.UpdateResume.response.failure)
  @SetMetadata(AuthConfig.REQUIRED_ROLE, AuthConfig.CANDIDATE)
  @Put(ROUTES.UPDATE)
  @UseInterceptors(FileInterceptor('resume', multerConfig))
  async updateResume(
    @Req() req: RequestWithUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.resumeService.updateResume(req.user.id, file);
  }
}
