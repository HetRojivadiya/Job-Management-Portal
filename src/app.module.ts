import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { UserModule } from './auth/cron-service/service/user.module';
import { CronService } from './auth/cron-service/cron-service';
import { DatabaseConfig } from './auth/constants/database.config';

// import { Users } from './auth/entity/users.entity';
// import { Roles } from './auth/entity/roles.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SequelizeModule.forRoot({
      dialect: DatabaseConfig.DIALECT,
      host: DatabaseConfig.HOST,
      port: DatabaseConfig.PORT,
      username: DatabaseConfig.USERNAME,
      password: DatabaseConfig.PASSWORD,
      database: DatabaseConfig.DATABASE,
      autoLoadModels: DatabaseConfig.AUTO_LOAD_MODELS,
      synchronize: DatabaseConfig.SYNCHRONIZE,
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UserModule,
  ],
  providers: [CronService],
})
export class AppModule {}
