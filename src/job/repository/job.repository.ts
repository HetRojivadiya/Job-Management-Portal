import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Job } from '../entity/job.entity';

@Injectable()
export class JobRepository {
  sequelize: any;
  constructor(
    @InjectModel(Job)
    private readonly jobModel: typeof Job,
  ) {}

  async createJob(createJobDto: Partial<Job>): Promise<Job> {
    const job = await this.jobModel.create(createJobDto);
    return job;
  }

  async findById(jobId: string): Promise<Job | null> {
    return this.jobModel.findByPk(jobId);
  }

  async updateJob(
    jobId: string,
    updateJobDto: Partial<Job>,
  ): Promise<Job | null> {
    await this.jobModel.update(updateJobDto, { where: { id: jobId } });
    return this.findById(jobId);
  }

  async deleteJob(jobId: string): Promise<void> {
    await this.jobModel.destroy({ where: { id: jobId } });
  }

  async findAll(): Promise<Job[]> {
    return this.jobModel.findAll();
  }
}
