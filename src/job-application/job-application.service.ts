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

@Injectable()
export class JobApplicationService {
  constructor(
    private readonly jobApplicationRepository: JobApplicationRepository,
    private readonly jobSkillRepository: JobSkillRepository,
    private readonly userSkillRepository: UserSkillRepository,
    private readonly jobService: JobService,
    private readonly userService: UserService,
  ) {}

  async applyForJob(userId: string, jobId: string): Promise<void> {
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
  }

  async getAppliedJobs(userId: string) {
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
            ...job,
          };
        }),
      );

      return appliedJobs.filter((job) => job !== null); // Filter out any null results
    } catch {
      throw new NotFoundException(ERROR_MESSAGES.APPLICATIONS_NOT_FOUND);
    }
  }

  async deleteAppliedJob(userId: string, applicationId: string): Promise<void> {
    const existingApplication =
      await this.jobApplicationRepository.findByUserAndJob(
        userId,
        applicationId,
      );

    if (!existingApplication) {
      throw new NotFoundException(ERROR_MESSAGES.APPLICATIONS_NOT_FOUND);
    }

    await this.jobApplicationRepository.delete({ id: existingApplication.id });
  }

  async getJobApplicantsIds(jobId: string) {
    try {
      const applications =
        await this.jobApplicationRepository.findByJobId(jobId);

      const applicantDetailsPromises = applications.map(async (application) => {
        const userProfile = await this.userService.getUserProfile(
          application.UserId,
        );
        return {
          userId: application.UserId,
          userProfile,
        };
      });

      const applicantsWithProfiles = await Promise.all(
        applicantDetailsPromises,
      );

      return applicantsWithProfiles;
    } catch {
      throw new BadRequestException('An unexpected error occurred');
    }
  }
}
