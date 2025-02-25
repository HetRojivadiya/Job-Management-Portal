import { Module } from '@nestjs/common';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { DatabaseModule } from 'src/database/database.module';
import { JobRepository } from './repository/job.repository';
import { SkillModule } from 'src/skill/skill.module';

@Module({
  imports: [DatabaseModule, SkillModule],
  providers: [JobService, JobRepository],
  controllers: [JobController],
  exports: [JobService, JobRepository],
})
export class JobModule {}
