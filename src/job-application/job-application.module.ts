import { Module } from '@nestjs/common';
import { JobApplicationService } from './job-application.service';
import { JobApplicationController } from './job-application.controller';
import { DatabaseModule } from 'src/database/database.module';
import { JobModule } from 'src/job/job.module';
import { UserModule } from 'src/user/user.module';
import { JobApplicationRepository } from './repository/job-application.repository';
import { SkillModule } from 'src/skill/skill.module';
import { ResumeModule } from 'src/resume/resume.module';

@Module({
  imports: [DatabaseModule, JobModule, UserModule, SkillModule, ResumeModule],
  providers: [JobApplicationService, JobApplicationRepository],
  controllers: [JobApplicationController],
  exports: [JobApplicationService, JobApplicationRepository],
})
export class JobApplicationModule {}
