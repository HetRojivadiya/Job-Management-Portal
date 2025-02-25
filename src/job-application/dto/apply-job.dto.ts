import { IsUUID } from 'class-validator';

export class ApplyJobDto {
  @IsUUID()
  jobId: string;
}
