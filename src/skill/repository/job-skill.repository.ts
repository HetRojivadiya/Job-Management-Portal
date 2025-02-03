import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { JobSkill } from '../entity/job-skills.entity';

@Injectable()
export class JobSkillRepository {
  constructor(
    @InjectModel(JobSkill)
    private readonly jobSkillModel: typeof JobSkill,
  ) {}

  async createJobSkill(jobId: string, skillId: string): Promise<JobSkill> {
    const jobSkill = new this.jobSkillModel({
      Job_id: jobId,
      skills_id: skillId,
    });
    await jobSkill.save();
    return jobSkill;
  }

  async deleteJobSkills(jobId: string): Promise<void> {
    await this.jobSkillModel.destroy({ where: { Job_id: jobId } });
  }

  async findByJobId(jobId: string): Promise<JobSkill[]> {
    return this.jobSkillModel.findAll({ where: { Job_id: jobId } });
  }
}
