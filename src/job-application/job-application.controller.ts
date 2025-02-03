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

@Controller(JobApplicationRoutes.BASE)
@UseGuards(JwtAuthGuard)
export class JobApplicationController {
  constructor(private readonly jobApplicationService: JobApplicationService) {}

  @ApiOperation({ summary: SwaggerConstants.ApplyJob.summary })
  @SwaggerApiResponse(SwaggerConstants.ApplyJob.response.success)
  @SwaggerApiResponse(SwaggerConstants.ApplyJob.response.conflict)
  @SwaggerApiResponse(SwaggerConstants.ApplyJob.response.failure)
  @Post(JobApplicationRoutes.APPLY)
  async applyForJob(
    @Body() applyJobDto: ApplyJobDto,
    @Req() req: RequestWithUser,
  ) {
    await this.jobApplicationService.applyForJob(
      req.user.id,
      applyJobDto.jobId,
    );
    return {
      statusCode: 201,
      message: 'Job application submitted successfully',
    };
  }

  @ApiOperation({ summary: SwaggerConstants.GetAppliedJobs.summary })
  @SwaggerApiResponse(SwaggerConstants.GetAppliedJobs.response.success)
  @SwaggerApiResponse(SwaggerConstants.GetAppliedJobs.response.failure)
  @Get(JobApplicationRoutes.APPLIED)
  async getAppliedJobs(@Req() req: RequestWithUser) {
    const appliedJobs = await this.jobApplicationService.getAppliedJobs(
      req.user.id,
    );
    return {
      statusCode: 200,
      message: 'Applied jobs retrieved successfully',
      data: appliedJobs,
    };
  }

  @ApiOperation({ summary: SwaggerConstants.DeleteAppliedJob.summary })
  @SwaggerApiResponse(SwaggerConstants.DeleteAppliedJob.response.success)
  @SwaggerApiResponse(SwaggerConstants.DeleteAppliedJob.response.failure)
  @Delete()
  async deleteAppliedJob(
    @Body() body: { applicationId: string },
    @Req() req: RequestWithUser,
  ) {
    await this.jobApplicationService.deleteAppliedJob(
      req.user.id,
      body.applicationId,
    );
    return {
      statusCode: 200,
      message: 'Job application deleted successfully',
    };
  }

  @ApiOperation({ summary: SwaggerConstants.DeleteAppliedJob.summary })
  @SwaggerApiResponse(SwaggerConstants.DeleteAppliedJob.response.success)
  @SwaggerApiResponse(SwaggerConstants.DeleteAppliedJob.response.failure)
  @Get(JobApplicationRoutes.GET_APPLICANTS)
  async applicants(@Body() body: { jobId: string }) {
    try {
      const id = body.jobId;

      const data = await this.jobApplicationService.getJobApplicantsIds(id);

      if (!data) {
        throw new UnauthorizedException(
          'No applicants found for the provided job ID',
        );
      }

      return {
        statusCode: 200,
        message: 'Job applicants retrieved successfully',
        data: data,
      };
    } catch {
      throw new BadRequestException('An unexpected error occurred');
    }
  }
}
