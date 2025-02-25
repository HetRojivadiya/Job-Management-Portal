import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { CronModule } from './auth/cron-service/service/cron.module';
import { CronService } from './auth/cron-service/cron-service';
// import { Users } from './auth/entity/users.entity';
// import { Roles } from './auth/entity/roles.entity';

import { UserModule } from './user/user.module';
import { JobModule } from './job/job.module';
import { SkillModule } from './skill/skill.module';
import { ResumeService } from './resume/resume.service';
import { ResumeModule } from './resume/resume.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthConfig } from './auth/constants/auth.config';

import { DatabaseModule } from './database/database.module';
import { JobApplicationModule } from './job-application/job-application.module';
import { AppService } from './app.service';
import { APP_FILTER } from '@nestjs/core';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: AuthConfig.TOKEN_KEY,
      signOptions: {
        expiresIn: AuthConfig.JWT_EXPIRATION,
      },
    }),
    ConfigModule.forRoot({ isGlobal: true }),

    ScheduleModule.forRoot(),
    AuthModule,
    CronModule,
    UserModule,
    JobModule,
    SkillModule,
    ResumeModule,
    DatabaseModule,
    JobApplicationModule,
  ],
  providers: [
    CronService,
    ResumeService,
    AppService,
  ],
})
export class AppModule {}
