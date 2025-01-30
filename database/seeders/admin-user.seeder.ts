import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Users } from '../../src/user/entity/users.entity';
import { Roles } from '../../src/user/entity/roles.entity';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AdminUserSeeder implements OnModuleInit {
  constructor(
    @InjectModel(Users) private readonly usersModel: typeof Users,
    @InjectModel(Roles) private readonly rolesModel: typeof Roles,
  ) {}

  async onModuleInit() {
    await this.seedAdminUser();
  }

  private async seedAdminUser() {
    const adminRole = await this.rolesModel.findOne({
      where: { role: 'Admin' },
    });

    if (!adminRole) {
      console.log('Admin role not found, skipping admin user creation.');
      return;
    }

    // Check if an admin user already exists
    const existingAdmin = await this.usersModel.findOne({
      where: { email: 'admin@example.com' },
    });

    if (existingAdmin) {
      console.log('Admin user already exists.');
      return;
    }

    // Create the admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const adminUser = await this.usersModel.create({
      id: uuidv4(),
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      mobile: '1234567890',
      status: 'Authorized',
      roleId: adminRole.id,
    });

    console.log('Admin user created:', adminUser);
  }
}
