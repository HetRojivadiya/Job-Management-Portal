import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ description: 'add new password' })
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}
