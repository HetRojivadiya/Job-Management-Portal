import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsMobilePhone } from 'class-validator';

export class SignupDto {
  @ApiProperty({
    description: 'The username of the user',
    example: 'het123',
  })
  @IsString()
  username: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'Password@1234',
  })
  @IsString()
  password: string;

  @ApiProperty({
    description: 'The email of the user',
    example: 'het@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The mobile number of the user',
    example: '1234567890',
  })
  @IsMobilePhone()
  mobile: string;
}
