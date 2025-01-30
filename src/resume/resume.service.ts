import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ResumeRepository } from './repository/resume.repository';
import { CreateResumeDto } from './dto/resume.types';
import * as fs from 'fs';
import { promisify } from 'util';
import { ErrorMessages } from './constants/error-messages.constants';

const unlinkAsync = promisify(fs.unlink);

@Injectable()
export class ResumeService {
  constructor(private readonly resumeRepository: ResumeRepository) {}

  // Get resume by userId
  async getResume(userId: string) {
    const resume = await this.resumeRepository.findByUserId(userId);
    if (!resume) {
      throw new NotFoundException(ErrorMessages.RESUME_NOT_FOUND);
    }
    return resume;
  }

  // Upload a resume
  async uploadResume(userId: string, file: Express.Multer.File) {
    const existingResume = await this.resumeRepository.findByUserId(userId);
    if (existingResume) {
      throw new UnauthorizedException(ErrorMessages.RESUME_ALREADY_EXISTS);
    }

    const resumeData: CreateResumeDto = {
      user_id: userId,
      name: file.originalname,
      system_path: file.path,
    };

    return await this.resumeRepository.create(resumeData);
  }

  // Delete a resume
  async deleteResume(userId: string) {
    const resume = await this.resumeRepository.findByUserId(userId);
    if (!resume) {
      throw new NotFoundException(ErrorMessages.RESUME_NOT_FOUND);
    }

    try {
      await unlinkAsync(resume.system_path);
    } catch {
      throw new Error(ErrorMessages.ERROR_DELETING_FILE);
    }

    await this.resumeRepository.delete(userId);
    return { message: ErrorMessages.RESUME_DELETED };
  }

  // Update resume or upload if none exists
  async updateResume(userId: string, file: Express.Multer.File) {
    const existingResume = await this.resumeRepository.findByUserId(userId);

    if (existingResume) {
      try {
        await unlinkAsync(existingResume.system_path);
      } catch (error) {
        console.error('Error deleting old resume file:', error);
      }

      const resumeData: Partial<CreateResumeDto> = {
        name: file.originalname,
        system_path: file.path,
      };

      return await this.resumeRepository.update(userId, resumeData);
    }

    return await this.uploadResume(userId, file);
  }
}
