import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  Get,
  Delete,
  UnauthorizedException,
  BadRequestException,
  UploadedFile,
  UseInterceptors,
  SetMetadata,
  HttpException,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { JobApplicationService } from './job-application.service';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { RequestWithUser } from 'src/auth/request-with-user.interface';
import { ApplyJobDto } from './dto/apply-job.dto';
import {
  ApiOperation,
  ApiResponse as SwaggerApiResponse,
} from '@nestjs/swagger';
import { SwaggerConstants } from './constants/swagger.constants';
import { JobApplicationRoutes } from './constants/route.constants';
import { multerConfig } from 'src/resume/constants/multer.config';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthConfig } from 'src/auth/constants/auth.config';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from './constants/error.constants';

@Controller(JobApplicationRoutes.BASE)
@UseGuards(JwtAuthGuard)
export class JobApplicationController {
  constructor(private readonly jobApplicationService: JobApplicationService) {}

  @ApiOperation({ summary: SwaggerConstants.ApplyJob.summary })
  @SwaggerApiResponse(SwaggerConstants.ApplyJob.response.success)
  @SwaggerApiResponse(SwaggerConstants.ApplyJob.response.conflict)
  @SwaggerApiResponse(SwaggerConstants.ApplyJob.response.failure)
  @UseInterceptors(FileInterceptor('resume', multerConfig))
  @Post(JobApplicationRoutes.APPLY)
  async applyForJob(
    @Body() applyJobDto: ApplyJobDto,
    @Req() req: RequestWithUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      if (!file) {
        throw new BadRequestException(ERROR_MESSAGES.NO_RESUME_UPLOADED);
      }

      await this.jobApplicationService.applyForJob(
        req.user.id,
        applyJobDto.jobId,
        file,
      );

      return {
        statusCode: HttpStatus.CREATED,
        message: SUCCESS_MESSAGES.APPLICATION_SUBMITTED,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        ERROR_MESSAGES.FAILED_TO_APPLY,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: SwaggerConstants.GetAppliedJobs.summary })
  @SwaggerApiResponse(SwaggerConstants.GetAppliedJobs.response.success)
  @SwaggerApiResponse(SwaggerConstants.GetAppliedJobs.response.failure)
  @Get(JobApplicationRoutes.APPLIED)
  async getAppliedJobs(@Param('userId') userId: string) {
    try {
      const appliedJobs =
        await this.jobApplicationService.getAppliedJobs(userId);

      return {
        statusCode: HttpStatus.OK,
        message: SUCCESS_MESSAGES.JOBS_RETRIEVED,
        data: appliedJobs,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        ERROR_MESSAGES.FAILED_TO_GET_JOBS,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: SwaggerConstants.DeleteAppliedJob.summary })
  @SwaggerApiResponse(SwaggerConstants.DeleteAppliedJob.response.success)
  @SwaggerApiResponse(SwaggerConstants.DeleteAppliedJob.response.failure)
  @Delete(':applicationId')
  async deleteAppliedJob(
    @Param('applicationId') applicationId: string,
    @Req() req: RequestWithUser,
  ) {
    try {
      await this.jobApplicationService.deleteAppliedJob(
        req.user.id,
        applicationId,
      );

      return {
        statusCode: HttpStatus.OK,
        message: SUCCESS_MESSAGES.APPLICATION_DELETED,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        ERROR_MESSAGES.FAILED_TO_DELETE,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: SwaggerConstants.DeleteAppliedJob.summary })
  @SwaggerApiResponse(SwaggerConstants.DeleteAppliedJob.response.success)
  @SwaggerApiResponse(SwaggerConstants.DeleteAppliedJob.response.failure)
  @SetMetadata(AuthConfig.REQUIRED_ROLE, AuthConfig.ADMIN)
  @Get(JobApplicationRoutes.GET_APPLICANTS)
  async applicants(@Body() body: { jobId: string }) {
    try {
      const data = await this.jobApplicationService.getJobApplicantsIds(
        body.jobId,
      );

      if (!data) {
        throw new UnauthorizedException(ERROR_MESSAGES.NO_APPLICANTS);
      }

      return {
        statusCode: HttpStatus.OK,
        message: SUCCESS_MESSAGES.APPLICANTS_RETRIEVED,
        data: data,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException(ERROR_MESSAGES.UNEXPECTED_ERROR);
    }
  }
}
