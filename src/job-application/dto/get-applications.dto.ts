// dto/get-applications.dto.ts
import { IsString } from 'class-validator';

export class GetApplicationsDto {
  @IsString()
  jobId: string;
}
