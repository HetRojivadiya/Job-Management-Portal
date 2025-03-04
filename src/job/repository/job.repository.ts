import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Job } from '../entity/job.entity';
import { Sequelize } from 'sequelize-typescript';
import { QueryTypes } from 'sequelize';

interface MonthlyCountResult {
  monthNumber: string;
  count: string;
}

@Injectable()
export class JobRepository {
  constructor(
    @InjectModel(Job)
    private readonly jobModel: typeof Job,
    private readonly sequelize: Sequelize,
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

  async getJobCountByMonths(year: string): Promise<number[]> {
    const monthCounts = new Array(12).fill(0);
    const query = `
      SELECT 
        EXTRACT(MONTH FROM "createdAt") AS "monthNumber", 
        COUNT(*) AS count 
      FROM "${this.jobModel.tableName}" 
      WHERE EXTRACT(YEAR FROM "createdAt") = :year 
      GROUP BY "monthNumber" 
      ORDER BY "monthNumber"
    `;
    const monthlyResults = await this.sequelize.query(query, {
      replacements: { year },
      type: QueryTypes.SELECT, 
    }) as MonthlyCountResult[]; 
  
    monthlyResults.forEach(result => {
      const monthIndex = parseInt(result.monthNumber) - 1;
      monthCounts[monthIndex] = parseInt(result.count);
    });
    return monthCounts;
  }
}
