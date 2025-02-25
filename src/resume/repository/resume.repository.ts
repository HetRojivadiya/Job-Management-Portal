import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Resume } from '../entity/resume.entity';
import { CreateResumeDto } from '../dto/resume.dto';

@Injectable()
export class ResumeRepository {
  constructor(
    @InjectModel(Resume)
    private resumeModel: typeof Resume,
  ) {}

  async create(resumeData: CreateResumeDto): Promise<Resume> {
    return await this.resumeModel.create({
      ...resumeData,
    } as Resume);
  }

  async findByUserId(userId: string): Promise<Resume | null> {
    return await this.resumeModel.findOne({
      where: {
        user_id: userId,
      },
    });
  }

  async delete(userId: string): Promise<number> {
    return await this.resumeModel.destroy({
      where: {
        user_id: userId,
      },
    });
  }

  async update(
    userId: string,
    resumeData: Partial<CreateResumeDto>,
  ): Promise<[number, Resume[]]> {
    return await this.resumeModel.update(resumeData, {
      where: {
        user_id: userId,
      },
      returning: true,
    });
  }
}
