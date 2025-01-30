import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Users } from '../user/entity/users.entity';
import { Roles } from '../user/entity/roles.entity';
import { ConfigService } from '@nestjs/config';
import { Dialect } from 'sequelize';
import { Resume } from 'src/resume/entity/resume.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([Users, Roles, Resume]),
    SequelizeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dialect: configService.get<string>('DB_DIALECT') as Dialect,
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        autoLoadModels: true,
        synchronize: true,
      }),
    }),
  ],
  exports: [SequelizeModule],
})
export class DatabaseModule {}
