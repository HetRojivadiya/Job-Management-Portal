import { Module } from '@nestjs/common';

import { ResumeController } from './resume.controller';
import { ResumeService } from './resume.service';
import { ResumeRepository } from './repository/resume.repository';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ResumeController],
  providers: [ResumeService, ResumeRepository],
  exports: [ResumeRepository, ResumeService],
})
export class ResumeModule {}
