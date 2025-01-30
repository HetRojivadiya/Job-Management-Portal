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

@UseGuards(JwtAuthGuard, UserRoleGuard)
@Controller(ROUTES.RESUME)
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  @SetMetadata(AuthConfig.REQUIRED_ROLE, AuthConfig.CANDIDATE)
  @Get()
  async getResume(@Req() req: RequestWithUser) {
    return await this.resumeService.getResume(req.user.id);
  }

  @SetMetadata(AuthConfig.REQUIRED_ROLE, AuthConfig.CANDIDATE)
  @Post(ROUTES.UPLOAD)
  @UseInterceptors(FileInterceptor('resume', multerConfig))
  async uploadResume(
    @Req() req: RequestWithUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.resumeService.uploadResume(req.user.id, file);
  }

  @SetMetadata(AuthConfig.REQUIRED_ROLE, AuthConfig.CANDIDATE)
  @Delete(ROUTES.DELETE)
  async deleteResume(@Req() req: RequestWithUser) {
    return await this.resumeService.deleteResume(req.user.id);
  }

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
