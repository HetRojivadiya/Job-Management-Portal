import { Module } from '@nestjs/common';
import { SkillService } from './skill.service';
import { SkillController } from './skill.controller';
import { JobSkillRepository } from 'src/skill/repository/job-skill.repository';
import { SkillRepository } from 'src/skill/repository/skill.repository';
import { UserSkillRepository } from './repository/user-skill.repository';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [
    SkillService,
    JobSkillRepository,
    SkillRepository,
    UserSkillRepository,
  ],
  controllers: [SkillController],
  exports: [
    SkillService,
    JobSkillRepository,
    SkillRepository,
    UserSkillRepository,
  ],
})
export class SkillModule {}
