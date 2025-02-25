import { IsString, IsNumber, IsArray, IsDateString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateJobDto {

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsNumber()
  @Type(() => Number)
  experience_level: number;

  @IsNumber()
  @Type(() => Number)
  salary_range: number;

  @IsString()
  location: string;
  
  @IsDateString()
  deadline: Date;

  @IsArray()
  @IsString({ each: true })
  skills: string[];
}


export class UpdateJobDto {
  title?: string;
  description?: string;
  experience_level?: number;
  salary_range?: number;
  location?: string;
  postedBy?: string;
  deadline?: Date;
  skills?: string[];
}

export class recommandedJob {
  userId: string;
}
