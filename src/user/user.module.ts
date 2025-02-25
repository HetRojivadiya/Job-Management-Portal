import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './repository/user.repository';
import { RoleRepository } from './repository/role.repository';
import { DatabaseModule } from 'src/database/database.module';
import { SkillModule } from 'src/skill/skill.module';
import { ResumeModule } from 'src/resume/resume.module';
//mport { AdminUserSeeder } from 'database/seeders/admin-user.seeder';
// import { RoleSeeder } from 'database/seeders/role.seeder';

@Module({
  imports: [DatabaseModule, SkillModule, ResumeModule],
  providers: [
    UserRepository,
    RoleRepository,
    UserService,

    //AdminUserSeeder,
    // RoleSeeder,
  ],
  controllers: [UserController],
  exports: [UserRepository, RoleRepository, UserService],
})
export class UserModule {}
