import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Roles } from '../entity/roles.entity';

@Injectable()
export class RoleRepository {
  constructor(@InjectModel(Roles) private rolesModel: typeof Roles) {}

  async findRoleByName(roleName: string): Promise<Roles | null> {
    return this.rolesModel.findOne({ where: { role: roleName } });
  }
}
