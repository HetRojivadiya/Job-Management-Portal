import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JobSkillRepository } from '../skill/repository/job-skill.repository';
import { UserSkillRepository } from '../skill/repository/user-skill.repository';
import { JobApplicationRepository } from './repository/job-application.repository';
import { v4 as uuidv4 } from 'uuid';
import { ERROR_MESSAGES } from './constants/error.constants';
import { JobService } from 'src/job/job.service';
import { UserService } from 'src/user/user.service';
import { ResumeService } from 'src/resume/resume.service';
import { UserResponse } from './api-response/job-applicant.interface';
import { AppliedJob } from './api-response/applied-job-response.interface';
import { ChangeApplicationStatus } from './dto/changeApplicationStatus.dto';
import { ApplicationStatusResponse } from './api-response/application-status.interface';

@Injectable()
export class JobApplicationService {
  constructor(
    private readonly jobApplicationRepository: JobApplicationRepository,
    private readonly jobSkillRepository: JobSkillRepository,
    private readonly userSkillRepository: UserSkillRepository,
    private readonly jobService: JobService,
    private readonly userService: UserService,
    private readonly resumeService: ResumeService,
  ) {}

  async applyForJob(
    userId: string,
    jobId: string,
    file: Express.Multer.File,
  ): Promise<void> {
    try {
      if (file) {
        await this.resumeService.updateResume(userId, file);
      }
      const jobSkills = await this.jobSkillRepository.findByJobId(jobId);
      if (jobSkills.length === 0) {
        throw new NotFoundException(ERROR_MESSAGES.JOB_NOT_FOUND);
      }
      const existingApplication =
        await this.jobApplicationRepository.findByUserAndJob(userId, jobId);
      if (existingApplication) {
        throw new ConflictException(ERROR_MESSAGES.JOB_ALREADY_APPLIED);
      }
      const userSkills = await this.userSkillRepository.findByUserId(userId);
      const userSkillIds = userSkills.map((skill) => skill.skills_id);
      const hasAllSkills = jobSkills.every((jobSkill) =>
        userSkillIds.includes(jobSkill.skills_id),
      );
      if (!hasAllSkills) {
        throw new BadRequestException(ERROR_MESSAGES.JOB_SKILL_MISMATCH);
      }
      await this.jobApplicationRepository.create({
        id: uuidv4(),
        JobId: jobId,
        UserId: userId,
      });
    } catch (error :  unknown) {
      throw error;
    }
  }

  async getAppliedJobs(userId: string): Promise<AppliedJob[]> {
    try {
      const applications =
        await this.jobApplicationRepository.findByUserId(userId);

      if (!applications.length) {
        return [];
      }
      const appliedJobs = await Promise.all(
        applications.map(async (application) => {
          const job = await this.jobService.findById(application.JobId);
          return {
            applicationId: application.id,
            appliedAt: application.createdAt,
            status : application.status,
            rejectionMassage : application.rejectionMessage,
            ...job,
          };
        }),
      );
      return appliedJobs.filter((job) => job !== null);
    } catch (error :  unknown) {
      throw error;
    }
  }

  async deleteAppliedJob(userId: string, applicationId: string): Promise<void> {
    try {
      const existingApplication =
        await this.jobApplicationRepository.findByUserAndApplication(
          userId,
          applicationId,
        );

      if (!existingApplication) {
        throw new NotFoundException(ERROR_MESSAGES.APPLICATIONS_NOT_FOUND);
      }

      await this.jobApplicationRepository.delete({
        id: existingApplication.id,
      });
    } catch (error :  unknown) {
      throw error;
    }
  }

  async getJobApplicantsIds(jobId: string): Promise<UserResponse[]> {
    try {
      const applications = await this.jobApplicationRepository.findByJobId(jobId);
      const applicantDetailsPromises = applications.map(async (application) => {
        const userProfile = await this.userService.getUserProfile(
          application.UserId,
        );
        return {
          userId: application.UserId,
          userProfile,
        };
      });
      const applicantsWithProfiles = await Promise.all(applicantDetailsPromises);
      return applicantsWithProfiles;
    } catch (error :  unknown) {
      throw error;
    }
  }


  async changeApplicationStatus(userId: string, changeApplicationStatus: ChangeApplicationStatus): Promise<void> {
    try {
      if(changeApplicationStatus.status==='Rejected' && changeApplicationStatus.rejectionMessage==='')
      {
          throw new BadRequestException("Rejection Massage Should be There");
      }
        await this.jobApplicationRepository.updateJobApplication(
          userId,
          changeApplicationStatus,
        );
    } catch (error :  unknown) {
      throw error;
    }
  }

  async getUserApplicationStatusData(userId: string): Promise<ApplicationStatusResponse> {
    try {
      const result = await this.jobApplicationRepository.countApplicationsByStatus(userId);
  
      const statusCount: ApplicationStatusResponse = {
        pending: 0,
        approved: 0,
        rejected: 0,
      };
  
      result.forEach((row: any) => {
        if (row.status === 'Pending') {
          statusCount.pending = Number(row.count);
        } else if (row.status === 'Approved') {
          statusCount.approved = Number(row.count);
        } else if (row.status === 'Rejected') {
          statusCount.rejected = Number(row.count);
        }
      });
  
      return statusCount;
    } catch (error) {
      throw error;
    }
  }

  async getApplicationCount(year: string): Promise<number[]> {
    try{
      return this.jobApplicationRepository.getJobCountByMonths(year);
    }catch(error : unknown)
    {
      throw error;
    }
  }
  
}
