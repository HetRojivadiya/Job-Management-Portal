import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Users } from './entity/users.entity';
import { Roles } from './entity/roles.entity';
import { UserRepository } from './repository/user.repository';
import { RoleRepository } from './repository/role.repository';
import { ConfigService } from '@nestjs/config';
//import { AdminUserSeeder } from 'database/seeders/admin-user.seeder';
//import { RoleSeeder } from 'database/seeders/role.seeder';

@Module({
  imports: [
    SequelizeModule.forFeature([Users, Roles]),
    JwtModule.register({
      secret: 'yourSecretKey',
      signOptions: { expiresIn: '5m' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserRepository,
    RoleRepository,
    ConfigService,

    //AdminUserSeeder,
    //RoleSeeder,
  ],
  exports: [AuthService],
})
export class AuthModule {}
