import { IsString } from 'class-validator';

export class GetApplicationsDto {
  @IsString()
  jobId: string;
}
