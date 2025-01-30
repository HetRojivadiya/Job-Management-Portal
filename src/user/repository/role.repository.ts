import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Roles } from '../entity/roles.entity';

@Injectable()
export class RoleRepository {
  constructor(@InjectModel(Roles) private rolesModel: typeof Roles) {}

  // Get role by name
  async findRoleByName(roleName: string): Promise<Roles | null> {
    return this.rolesModel.findOne({ where: { role: roleName } });
  }

  // Get role by ID
  async findRoleById(roleId: string): Promise<Roles | null> {
    return this.rolesModel.findOne({ where: { id: roleId } });
  }
}
