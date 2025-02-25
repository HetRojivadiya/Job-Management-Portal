import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ResumeRepository } from './repository/resume.repository';
import { CreateResumeDto } from './dto/resume.dto';
import * as fs from 'fs';
import { promisify } from 'util';
import { ErrorMessages } from './constants/error-messages.constants';
import { Resume } from './entity/resume.entity';
const unlinkAsync = promisify(fs.unlink);

@Injectable()
export class ResumeService {
  constructor(private readonly resumeRepository: ResumeRepository) {}

  //Get Resume
  async getResume(userId: string) : Promise<Resume>{
    const resume = await this.resumeRepository.findByUserId(userId);
    if (!resume) {
      throw new NotFoundException(ErrorMessages.RESUME_NOT_FOUND);
    }
    return resume;
  }

  // Upload a resume
  async uploadResume(userId: string, file: Express.Multer.File) : Promise<Resume> {
    const existingResume = await this.resumeRepository.findByUserId(userId);
    if (existingResume) {
      throw new BadRequestException(ErrorMessages.RESUME_ALREADY_EXISTS);
    }
    const resumeData: CreateResumeDto = {
      user_id: userId,
      name: file.originalname,
      system_path: file.path,
    };
    return await this.resumeRepository.create(resumeData);
  }

  // Delete a resume
  async deleteResume(userId: string) :Promise<{message:string}>{
    const resume = await this.resumeRepository.findByUserId(userId);
    if (!resume) {
      throw new NotFoundException(ErrorMessages.RESUME_NOT_FOUND);
    }
    try {
      await unlinkAsync(resume.system_path);
    } catch {
      throw new BadRequestException(ErrorMessages.ERROR_DELETING_FILE);
    }
    await this.resumeRepository.delete(userId);
    return { message: ErrorMessages.RESUME_DELETED };
  }

  // Update resume or upload if none exists
  async updateResume(userId: string, file: Express.Multer.File) :Promise<boolean> {
    const existingResume = await this.resumeRepository.findByUserId(userId);
    if (existingResume) {
      try {
        await unlinkAsync(existingResume.system_path);
      } catch (err) {
        throw new BadRequestException(err);
      }
      const resumeData: Partial<CreateResumeDto> = {
        name: file.originalname,
        system_path: file.path,
      };
      const res = await this.resumeRepository.update(userId, resumeData);
      if(res){
        return true;
      }
      return false;
    }
    const res = await this.uploadResume(userId, file);
    if(res){
      return true;
    }return false;
  }
}
