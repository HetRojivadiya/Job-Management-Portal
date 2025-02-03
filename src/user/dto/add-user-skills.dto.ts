import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, Min, Max } from 'class-validator';

export class AddUserSkillsDto {
  @IsString()
  @ApiProperty({
    description: 'The name of the skill',
    type: String,
    example: 'java',
  })
  skillName: string;

  @ApiProperty({
    description: 'The proficiency level of the skill',
    type: Number,
    example: 10,
  })
  @IsInt()
  @Min(1)
  @Max(10)
  proficiencyLevel: number;
}
