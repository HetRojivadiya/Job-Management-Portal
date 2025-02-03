import {
  Body,
  Controller,
  Post,
  Put,
  Param,
  Req,
  SetMetadata,
  UseGuards,
  Delete,
  Get,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JobService, JobWithSkills } from './job.service';
import { CreateJobDto, UpdateJobDto } from './dto/job.dto';
import { Job } from './entity/job.entity';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { UserRoleGuard } from 'guards/user-type.guard';
import { RequestWithUser } from 'src/auth/request-with-user.interface';
import { AuthConfig } from './constants/auth.config';
import { ERROR_MESSAGES } from './constants/error-messages.constants';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse as SwaggerApiResponse,
} from '@nestjs/swagger';
import { SwaggerConstants } from './constants/swagger.constants';

@Controller('jobs')
@UseGuards(JwtAuthGuard, UserRoleGuard)
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @ApiOperation({ summary: SwaggerConstants.CreateJob.summary })
  @ApiBody({ type: CreateJobDto })
  @SwaggerApiResponse(SwaggerConstants.CreateJob.response.success)
  @SwaggerApiResponse(SwaggerConstants.CreateJob.response.failure)
  @SetMetadata(AuthConfig.REQUIRED_ROLE, AuthConfig.ADMIN)
  @Post()
  async createJob(
    @Body() createJobDto: CreateJobDto,
    @Req() req: RequestWithUser,
  ): Promise<Job> {
    try {
      return await this.jobService.createJob(createJobDto, req.user.id);
    } catch {
      throw new UnauthorizedException(ERROR_MESSAGES.JOB_CREATION_ERROR);
    }
  }

  @ApiOperation({ summary: SwaggerConstants.UpdateJob.summary })
  @ApiParam({ name: 'id', type: 'string', description: 'Job ID' })
  @ApiBody({ type: UpdateJobDto })
  @SwaggerApiResponse(SwaggerConstants.UpdateJob.response.success)
  @SwaggerApiResponse(SwaggerConstants.UpdateJob.response.failure)
  @SetMetadata(AuthConfig.REQUIRED_ROLE, AuthConfig.ADMIN)
  @Put(':id')
  async updateJob(
    @Param('id') jobId: string,
    @Body() updateJobDto: UpdateJobDto,
    @Req() req: RequestWithUser,
  ): Promise<Job | null> {
    try {
      return await this.jobService.updateJob(jobId, updateJobDto, req.user.id);
    } catch {
      throw new UnauthorizedException(ERROR_MESSAGES.JOB_UPDATE_ERROR);
    }
  }

  @ApiOperation({ summary: SwaggerConstants.DeleteJob.summary })
  @ApiParam({ name: 'id', type: 'string', description: 'Job ID' })
  @SwaggerApiResponse(SwaggerConstants.DeleteJob.response.success)
  @SwaggerApiResponse(SwaggerConstants.DeleteJob.response.failure)
  @SetMetadata(AuthConfig.REQUIRED_ROLE, AuthConfig.ADMIN)
  @Delete(':id')
  async deleteJob(
    @Param('id') jobId: string,
    @Req() req: RequestWithUser,
  ): Promise<{ message: string }> {
    try {
      await this.jobService.deleteJob(jobId, req.user.id);
      return { message: 'Job deleted successfully' };
    } catch {
      throw new UnauthorizedException(ERROR_MESSAGES.JOB_DELETION_ERROR);
    }
  }

  @ApiOperation({ summary: SwaggerConstants.GetAllJobs.summary })
  @SwaggerApiResponse(SwaggerConstants.GetAllJobs.response.success)
  @SwaggerApiResponse(SwaggerConstants.GetAllJobs.response.failure)
  @Get()
  async getAllJobs(): Promise<JobWithSkills[]> {
    try {
      return await this.jobService.findAll();
    } catch {
      throw new UnauthorizedException(ERROR_MESSAGES.JOB_FETCH_ERROR);
    }
  }

  @ApiOperation({ summary: SwaggerConstants.GetJobById.summary })
  @ApiParam({ name: 'id', type: 'string', description: 'Job ID' })
  @SwaggerApiResponse(SwaggerConstants.GetJobById.response.success)
  @SwaggerApiResponse(SwaggerConstants.GetJobById.response.failure)
  @Get(':id')
  async getJobById(@Param('id') jobId: string): Promise<JobWithSkills> {
    try {
      const job = await this.jobService.findById(jobId);
      if (!job) {
        throw new NotFoundException(ERROR_MESSAGES.JOB_NOT_FOUND);
      }
      return job;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new UnauthorizedException(ERROR_MESSAGES.JOB_FETCH_ERROR);
    }
  }
}
