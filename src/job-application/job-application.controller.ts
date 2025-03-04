import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  Get,
  Delete,
  BadRequestException,
  UploadedFile,
  UseInterceptors,
  SetMetadata,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import { JobApplicationService } from './job-application.service';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { RequestWithUser } from 'src/common/request-with-user.interface';
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
import { ApiResponse } from 'src/common/api.response';
import { UserResponse } from './api-response/job-applicant.interface';
import { AppliedJob } from './api-response/applied-job-response.interface';
import { ChangeApplicationStatus } from './dto/changeApplicationStatus.dto';
import { ApplicationStatusResponse } from './api-response/application-status.interface';

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
  ): Promise<ApiResponse<void>> {
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
    } catch (error :  unknown) {
      throw error;
    }
  }

  @ApiOperation({ summary: SwaggerConstants.GetAppliedJobs.summary })
  @SwaggerApiResponse(SwaggerConstants.GetAppliedJobs.response.success)
  @SwaggerApiResponse(SwaggerConstants.GetAppliedJobs.response.failure)
  @Get(JobApplicationRoutes.APPLIED)
  async getAppliedJobs(
    @Param('userId') userId: string,
  ): Promise<ApiResponse<AppliedJob[]>> {
    try {
      const appliedJobs =
        await this.jobApplicationService.getAppliedJobs(userId);
      return {
        statusCode: HttpStatus.OK,
        message: SUCCESS_MESSAGES.JOBS_RETRIEVED,
        data: appliedJobs,
      };
    } catch (error :  unknown) {
      throw error;
    }
  }

  @ApiOperation({ summary: SwaggerConstants.DeleteAppliedJob.summary })
  @SwaggerApiResponse(SwaggerConstants.DeleteAppliedJob.response.success)
  @SwaggerApiResponse(SwaggerConstants.DeleteAppliedJob.response.failure)
  @Delete(JobApplicationRoutes.DELETE_APPLICATION)
  async deleteAppliedJob(
    @Param('applicationId') applicationId: string,
    @Req() req: RequestWithUser,
  ): Promise<ApiResponse<void>> {
    try {
      await this.jobApplicationService.deleteAppliedJob(
        req.user.id,
        applicationId,
      );
      return {
        statusCode: HttpStatus.OK,
        message: SUCCESS_MESSAGES.APPLICATION_DELETED,
      };
    } catch (error :  unknown) {
      throw error;
    }
  }

  @ApiOperation({ summary: SwaggerConstants.DeleteAppliedJob.summary })
  @SwaggerApiResponse(SwaggerConstants.DeleteAppliedJob.response.success)
  @SwaggerApiResponse(SwaggerConstants.DeleteAppliedJob.response.failure)
  @SetMetadata(AuthConfig.REQUIRED_ROLE, AuthConfig.ADMIN)
  @Get(JobApplicationRoutes.GET_APPLICANTS)
  async applicants(
    @Param('jobId') jobId: string,
  ): Promise<ApiResponse<UserResponse[]>> {
    try {
      const data = await this.jobApplicationService.getJobApplicantsIds(
        jobId,
      );
      if (!data) {
        throw new BadRequestException(ERROR_MESSAGES.NO_APPLICANTS);
      }
      return {
        statusCode: HttpStatus.OK,
        message: SUCCESS_MESSAGES.APPLICANTS_RETRIEVED,
        data: data,
      };
    } catch (error :  unknown) {
      throw error;
    }
  }


  @Post(JobApplicationRoutes.APPLICATION_STATUS)
  async changeApplicationStatus(
    @Body() changeApplicationStatus: ChangeApplicationStatus,
    @Req() req: RequestWithUser,
  ): Promise<ApiResponse<void>> {
    try {
      await this.jobApplicationService.changeApplicationStatus(
        req.user.id,
        changeApplicationStatus,
      );
      return {
        statusCode: HttpStatus.OK,
        message: SUCCESS_MESSAGES.STATUS_CHANGE_SUCCESSFULL,
      };
    } catch (error :  unknown) {
      throw error;
    }
  }

  @Get(JobApplicationRoutes.APPLICATION_STATUS_DATA)
  async getUserApplicationStatusData(
    @Req() req: RequestWithUser,
  ): Promise<ApiResponse<ApplicationStatusResponse>> {
    try {
      const data = await this.jobApplicationService.getUserApplicationStatusData(req.user.id);
      return {
        statusCode: HttpStatus.OK,
        message: SUCCESS_MESSAGES.APPLICATION_STATUS_DATA_FETCH_SUCCESSFULL,
        data: data,
      };
    } catch (error :  unknown){
      throw error;
    }
  }

   @Get(JobApplicationRoutes.APPLICATION_DATA_COUNT)
    async getJobCount( @Query('year') year: string): Promise<ApiResponse<number[]>> {
      try{
        const count = await this.jobApplicationService.getApplicationCount(year);
        return {
          statusCode: 200,
          message: SUCCESS_MESSAGES.FETCH_APPLICATION_COUNT_SUCCESSFULL,
          data: count ,
        };
      }catch(error : unknown)
      {
        throw error;
      }
    }
}
