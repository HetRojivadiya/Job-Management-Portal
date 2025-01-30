import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './repository/user.repository';
import { RoleRepository } from './repository/role.repository';
import { SequelizeModule } from '@nestjs/sequelize';
import { Users } from './entity/users.entity';
import { Roles } from './entity/roles.entity';

//import { AdminUserSeeder } from 'database/seeders/admin-user.seeder';
//import { RoleSeeder } from 'database/seeders/role.seeder';

@Module({
  imports: [SequelizeModule.forFeature([Users, Roles])],
  providers: [
    UserRepository,
    RoleRepository,
    UserService,

    //AdminUserSeeder,
    //RoleSeeder,
  ],
  controllers: [UserController],
  exports: [UserRepository, RoleRepository],
})
export class UserModule {}
