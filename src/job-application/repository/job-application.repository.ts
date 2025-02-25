import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { JobApplication } from '../entity/job-applications.entity';

interface JobApplicationCreationAttributes {
  id: string;
  JobId: string;
  UserId: string;
}

@Injectable()
export class JobApplicationRepository {
  constructor(
    @InjectModel(JobApplication)
    private readonly jobApplicationModel: typeof JobApplication,
  ) {}

  async create(data: JobApplicationCreationAttributes): Promise<void> {
    await this.jobApplicationModel.create(data);
  }

  async findByUserAndJob(
    userId: string,
    jobId: string,
  ): Promise<JobApplication | null> {
    return this.jobApplicationModel.findOne({
      where: {
        UserId: userId,
        JobId: jobId,
      },
    });
  }
  async findByUserAndApplication(
    userId: string,
    apllicationId: string,
  ): Promise<JobApplication | null> {
    return this.jobApplicationModel.findOne({
      where: {
        UserId: userId,
        id: apllicationId,
      },
    });
  }

  async findByUserId(userId: string): Promise<JobApplication[]> {
    return this.jobApplicationModel.findAll({
      where: {
        UserId: userId,
      },
    });
  }

  async findByJobId(jobId: string) {
    return this.jobApplicationModel.findAll({
      where: {
        JobId: jobId,
      },
    });
  }

  async delete(where: { id: string }): Promise<void> {
    await this.jobApplicationModel.destroy({
      where,
    });
  }
}
