import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { UserModule } from './auth/cron-service/service/user.module';
import { CronService } from './auth/cron-service/cron-service';
// import { Users } from './auth/entity/users.entity';
// import { Roles } from './auth/entity/roles.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'het123',
      database: 'Job Management Portal',
      autoLoadModels: true,
      synchronize: true,
      //models: [Users, Roles],
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UserModule,
  ],
  providers: [CronService],
})
export class AppModule {}
