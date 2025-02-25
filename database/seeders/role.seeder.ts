import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Roles } from '../../src/user/entity/roles.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RoleSeeder implements OnModuleInit {
  constructor(@InjectModel(Roles) private readonly rolesModel: typeof Roles) {}

  async onModuleInit() {
    await this.seedRoles();
  }

  private async seedRoles() {
    const roles = [
      { id: uuidv4(), role: 'Candidate' },
      { id: uuidv4(), role: 'Admin' },
    ];

    for (const roleData of roles) {
      const existingRole = await this.rolesModel.findOne({
        where: { role: roleData.role },
      });

      if (!existingRole) {
        await this.rolesModel.create(roleData);
        console.log(`Role '${roleData.role}' has been added.`);
      } else {
        console.log(`Role '${roleData.role}' already exists.`);
      }
    }
  }
}
