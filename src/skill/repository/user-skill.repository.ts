import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UserSkill } from '../entity/user-skills.entity';
import { Op } from 'sequelize';

@Injectable()
export class UserSkillRepository {
  constructor(
    @InjectModel(UserSkill)
    private readonly userSkillModel: typeof UserSkill,
  ) {}

  async createUserSkill(
    userId: string,
    skillId: string,
    proficiencyLevel: number,
  ): Promise<UserSkill> {
    const userSkill = new this.userSkillModel({
      user_id: userId,
      skills_id: skillId,
      proficiency_level: proficiencyLevel,
    });
    await userSkill.save();
    return userSkill;
  }

  async findByUserIdAndSkillId(
    userId: string,
    skillId: string,
  ): Promise<UserSkill | null> {
    return this.userSkillModel.findOne({
      where: { user_id: userId, skills_id: skillId },
    });
  }

  async findByUserId(userId: string): Promise<UserSkill[]> {
    return this.userSkillModel.findAll({
      where: { user_id: userId },
      attributes: ['id', 'skills_id', 'proficiency_level'],
    });
  }

  async deleteUserSkills(userSkillIds: string[]): Promise<number> {
    return await this.userSkillModel.destroy({
      where: {
        id: {
          [Op.in]: userSkillIds, // Use the `Op.in` operator for an array of IDs
        },
      },
    });
  }
}
