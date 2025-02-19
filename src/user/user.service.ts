import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SkillRepository } from '../skill/repository/skill.repository';
import { UserSkillRepository } from '../skill/repository/user-skill.repository';
import { ERROR_MESSAGES } from './constants/errors.constatns';
import { UserRepository } from './repository/user.repository';
import {
  UserProfileResponse,
  UserSkillResponse,
} from './api-response/user-profile.interface';
import { ResumeRepository } from 'src/resume/repository/resume.repository';

interface SkillInput {
  skillName: string;
  proficiencyLevel: number;
}

@Injectable()
export class UserService {
  constructor(
    private readonly skillRepository: SkillRepository,
    private readonly userSkillRepository: UserSkillRepository,
    private readonly userRepository: UserRepository,
    private readonly resumeRepository: ResumeRepository,
  ) {}

  async addUserSkills(userId: string, skills: SkillInput[]): Promise<void> {
    try {
      for (const { skillName, proficiencyLevel } of skills) {
        let skill = await this.skillRepository.findByName(skillName);
        if (!skill) {
          skill = await this.skillRepository.createSkill(skillName);
        }
        const existingUserSkill =
          await this.userSkillRepository.findByUserIdAndSkillId(
            userId,
            skill.id,
          );
        if (!existingUserSkill) {
          await this.userSkillRepository.createUserSkill(
            userId,
            skill.id,
            proficiencyLevel,
          );
        }
      }
    } catch {
      throw new UnauthorizedException(ERROR_MESSAGES.SKILL_ADD_ERROR);
    }
  }

  async getUserSkills(userId: string): Promise<UserSkillResponse[]> {
    try {
      const userSkills = await this.userSkillRepository.findByUserId(userId);
      const skillIds = userSkills.map((userSkill) => userSkill.skills_id);
      const skills = await this.skillRepository.findByIds(skillIds);

      return skills.map((skill) => {
        const userSkill = userSkills.find((us) => us.skills_id === skill.id);
        return {
          userSkillId: userSkill?.id ?? '',
          skillName: skill.skillName,
          proficiencyLevel: userSkill?.proficiency_level ?? 0,
        };
      });
    } catch {
      throw new UnauthorizedException(ERROR_MESSAGES.SKILL_RETRIEVAL_ERROR);
    }
  }

  async deleteUserSkills(userSkillIds: string[]): Promise<void> {
    try {
      const deletedSkills =
        await this.userSkillRepository.deleteUserSkills(userSkillIds);

      if (deletedSkills === 0) {
        throw new NotFoundException(ERROR_MESSAGES.SKILL_DELETE_ERROR);
      }
    } catch {
      throw new UnauthorizedException(ERROR_MESSAGES.SKILL_DELETE_ERROR);
    }
  }

  async getUserProfile(userId: string): Promise<UserProfileResponse> {
    try {
      const user = await this.userRepository.findUserWithRole(userId);
      if (!user) {
        throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
      }

      const userSkills: UserSkillResponse[] = await this.getUserSkills(userId);
      const resume = await this.resumeRepository.findByUserId(userId);

      let formattedCreatedAt: string;
      if (user.createdAt instanceof Date) {
        formattedCreatedAt = user.createdAt.toISOString();
      } else if (typeof user.createdAt === 'string') {
        formattedCreatedAt = user.createdAt;
      } else {
        formattedCreatedAt = new Date().toISOString(); // Fallback if somehow undefined
      }

      return {
        userId: user.id,
        username: user.username,
        email: user.email,
        mobile: user.mobile,
        status: user.status,
        role: user.role.role,
        skills: userSkills,
        createdAt: formattedCreatedAt,
        resume: resume
          ? {
              id: resume.id,
              name: resume.name,
              system_path: resume.system_path,
              createdAt: resume.createdAt,
              updatedAt: resume.updatedAt,
            }
          : undefined,
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw new UnauthorizedException(
        ERROR_MESSAGES.USER_PROFILE_RETRIEVAL_ERROR,
      );
    }
  }

  async getAllUserProfiles(): Promise<UserProfileResponse[]> {
    try {
      const users = await this.userRepository.findAllUsersWithRoles();

      return await Promise.all(
        users.map(async (user) => {
          const userSkills: UserSkillResponse[] = await this.getUserSkills(
            user.id,
          );
          const resume = await this.resumeRepository.findByUserId(user.id);

          return {
            userId: user.id,
            username: user.username,
            email: user.email,
            mobile: user.mobile,
            status: user.status,
            role: user.role.role,
            skills: userSkills,
            resume: resume
              ? {
                  id: resume.id,
                  name: resume.name,
                  system_path: resume.system_path,
                  createdAt: resume.createdAt,
                  updatedAt: resume.updatedAt,
                }
              : undefined,
          };
        }),
      );
    } catch (error) {
      console.error('Error fetching all user profiles:', error);
      throw new UnauthorizedException(
        ERROR_MESSAGES.ALL_USER_PROFILES_RETRIEVAL_ERROR,
      );
    }
  }
}
