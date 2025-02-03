import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Skill } from '../entity/skills.entity';

@Injectable()
export class SkillRepository {
  constructor(
    @InjectModel(Skill)
    private readonly skillModel: typeof Skill,
  ) {}

  async findByName(skillName: string): Promise<Skill | null> {
    return this.skillModel.findOne({ where: { skillName } });
  }

  async createSkill(skillName: string): Promise<Skill> {
    const skill = new this.skillModel({ skillName });
    await skill.save();
    return skill;
  }

  async findByIds(skillIds: string[]): Promise<Skill[]> {
    return this.skillModel.findAll({
      where: {
        id: skillIds,
      },
      attributes: ['id', 'skillName'],
    });
  }
}
