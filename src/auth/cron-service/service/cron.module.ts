import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserService } from './cron.service';
import { Users } from '../../../user/entity/users.entity';

@Module({
  imports: [SequelizeModule.forFeature([Users])],
  providers: [UserService],
  exports: [UserService],
})
export class CronModule {}
