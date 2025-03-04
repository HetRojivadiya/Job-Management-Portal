import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { JobApplication } from '../entity/job-applications.entity';
import { ChangeApplicationStatus } from '../dto/changeApplicationStatus.dto';
import { Sequelize } from 'sequelize-typescript';
import { QueryTypes } from 'sequelize';


interface JobApplicationCreationAttributes {
  id: string;
  JobId: string;
  UserId: string;
}

interface MonthlyCountResult {
  monthNumber: string;
  count: string;
}

@Injectable()
export class JobApplicationRepository {
  constructor(
    @InjectModel(JobApplication)
    private readonly jobApplicationModel: typeof JobApplication,
    private readonly sequelize: Sequelize,
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

  async updateJobApplication(recruiterId: string, changeApplicationStatus: ChangeApplicationStatus): Promise<void> {
    const { applicationId, status, rejectionMessage } = changeApplicationStatus;

    await this.jobApplicationModel.update(
    { status: status as 'Pending' | 'Approved' | 'Rejected',rejectionMessage, recruiterId },
    {
      where: { id: applicationId}, 
    }
    );
  }

 
  async countApplicationsByStatus(userId: string): Promise<{ status: string; count: number }[]> {
    const sequelizeInstance: Sequelize = this.jobApplicationModel.sequelize as Sequelize;
    return this.jobApplicationModel.findAll({
      attributes: ['status', [sequelizeInstance.fn('COUNT', '*'), 'count']],
      where: { UserId: userId },
      group: ['status'],
      raw: true,
    }) as unknown as { status: string; count: number }[];
  }

    async getJobCountByMonths(year: string): Promise<number[]> {
      const monthCounts = new Array(12).fill(0);
      const query = `
        SELECT 
          EXTRACT(MONTH FROM "createdAt") AS "monthNumber", 
          COUNT(*) AS count 
        FROM "${this.jobApplicationModel.tableName}" 
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
