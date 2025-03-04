import { IsString } from 'class-validator';

export class  ChangeApplicationStatus{
  @IsString()
  status: string;

  @IsString()
  rejectionMessage : string;

  @IsString()
  applicationId : string;
}
