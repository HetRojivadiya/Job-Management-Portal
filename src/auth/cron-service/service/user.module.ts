import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserService } from './user.service';
import { Users } from '../../entity/users.entity';

@Module({
  imports: [SequelizeModule.forFeature([Users])],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
