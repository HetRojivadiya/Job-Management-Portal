import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JobRepository } from './repository/job.repository';
import { SkillRepository } from '../skill/repository/skill.repository';
import { CreateJobDto, UpdateJobDto } from './dto/job.dto';
import { JobSkillRepository } from '../skill/repository/job-skill.repository';
import { v4 as uuidv4 } from 'uuid';
import { Job } from './entity/job.entity';
import { Skill } from 'src/skill/entity/skills.entity';
import { ERROR_MESSAGES } from './constants/error-messages.constants';

export interface JobWithSkills extends Job {
  skills: Skill[];
}

@Injectable()
export class JobService {
  constructor(
    private readonly jobRepository: JobRepository,
    private readonly skillRepository: SkillRepository,
    private readonly jobSkillRepository: JobSkillRepository,
  ) {}

  async createJob(createJobDto: CreateJobDto, id: string) {
    try {
      const createJob = {
        id: uuidv4(),
        ...createJobDto,
        postedBy: id,
      };
      const job = await this.jobRepository.createJob(createJob);

      for (const skillName of createJobDto.skills) {
        let skill = await this.skillRepository.findByName(skillName);
        if (!skill) {
          skill = await this.skillRepository.createSkill(skillName);
        }
        await this.jobSkillRepository.createJobSkill(job.id, skill.id);
      }
      return job;
    } catch {
      throw new UnauthorizedException(ERROR_MESSAGES.JOB_CREATION_ERROR);
    }
  }

  async updateJob(jobId: string, updateJobDto: UpdateJobDto, userId: string) {
    try {
      const existingJob = await this.jobRepository.findById(jobId);

      if (!existingJob) {
        throw new UnauthorizedException(ERROR_MESSAGES.JOB_NOT_FOUND);
      }
      if (existingJob.postedBy !== userId) {
        throw new UnauthorizedException(ERROR_MESSAGES.UNAUTHORIZED_UPDATE);
      }
      const updatedJob = await this.jobRepository.updateJob(
        jobId,
        updateJobDto,
      );
      if (updateJobDto.skills) {
        await this.jobSkillRepository.deleteJobSkills(jobId);
        for (const skillName of updateJobDto.skills) {
          let skill = await this.skillRepository.findByName(skillName);
          if (!skill) {
            skill = await this.skillRepository.createSkill(skillName);
          }
          await this.jobSkillRepository.createJobSkill(jobId, skill.id);
        }
      }
      return updatedJob;
    } catch {
      throw new UnauthorizedException(ERROR_MESSAGES.JOB_UPDATE_ERROR);
    }
  }

  async deleteJob(jobId: string, userId: string): Promise<void> {
    try {
      const job = await this.jobRepository.findById(jobId);
      if (!job) {
        throw new UnauthorizedException(ERROR_MESSAGES.JOB_NOT_FOUND);
      }
      if (job.postedBy !== userId) {
        throw new UnauthorizedException(ERROR_MESSAGES.UNAUTHORIZED_DELETE);
      }
      await this.jobSkillRepository.deleteJobSkills(jobId);
      await this.jobRepository.deleteJob(jobId);
    } catch {
      throw new UnauthorizedException(ERROR_MESSAGES.JOB_DELETION_ERROR);
    }
  }

  async findAll(): Promise<JobWithSkills[]> {
    try {
      const jobs = await this.jobRepository.findAll();
      const jobResults = await Promise.all(
        jobs.map(async (job) => {
          const jobSkills = await this.jobSkillRepository.findByJobId(job.id);
          const skillIds = jobSkills.map((js) => js.skills_id);
          const skills = skillIds.length
            ? await this.skillRepository.findByIds(skillIds)
            : [];
          return {
            ...job.toJSON(),
            skills,
          } as JobWithSkills;
        }),
      );
      return jobResults;
    } catch {
      throw new UnauthorizedException(ERROR_MESSAGES.JOB_FETCH_ERROR);
    }
  }

  async findById(jobId: string): Promise<JobWithSkills | null> {
    try {
      const job = await this.jobRepository.findById(jobId);
      if (!job) {
        throw new NotFoundException(ERROR_MESSAGES.JOB_NOT_FOUND);
      }
      const jobSkills = await this.jobSkillRepository.findByJobId(job.id);
      const skillIds = jobSkills.map((js) => js.skills_id);
      const skills = skillIds.length
        ? await this.skillRepository.findByIds(skillIds)
        : [];
      return {
        ...job.toJSON(),
        skills,
      } as JobWithSkills;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new UnauthorizedException(ERROR_MESSAGES.JOB_FETCH_ERROR);
    }
  }
}
