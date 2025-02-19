import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Users } from '../entity/users.entity';
import { Roles } from '../entity/roles.entity';

@Injectable()
export class UserRepository {
  constructor(@InjectModel(Users) private usersModel: typeof Users) {}

  async findUserByEmail(email: string): Promise<Users | null> {
    return this.usersModel.findOne({ where: { email } });
  }

  async createUser(userData: Partial<Users>): Promise<Users> {
    return this.usersModel.create(userData);
  }

  async findUserById(id: string): Promise<Users | null> {
    return this.usersModel.findOne({ where: { id } });
  }

  async updateUserStatus(id: string, status: string): Promise<Users | null> {
    const user = await this.findUserById(id);
    if (user) {
      user.status = status;
      await user.save();
      return user;
    }
    return null;
  }
  async updatePopupStatus(id: string): Promise<Users | null> {
    const user = await this.findUserById(id);
    if (user) {
      user.isPopup = false;
      user.twoFactorSecret = '';
      user.twoFactorEnabled = false;
      await user.save();
      return user;
    }
    return null;
  }

  async deleteUser(id: string): Promise<boolean> {
    const deletedCount = await this.usersModel.destroy({
      where: { id },
    });
    return deletedCount > 0;
  }

  async updateUserTwoFactorSecret(
    userId: string,
    secret: string,
  ): Promise<Users | null> {
    const user = await this.findUserById(userId);

    if (user) {
      user.twoFactorSecret = secret;
      user.twoFactorEnabled = true;
      await user.save();
      return user;
    }

    return null;
  }

  findUserWithRole(userId: string): Promise<Users | null> {
    return this.usersModel.findOne({
      where: { id: userId },
      include: [
        {
          model: Roles,
        },
      ],
    });
  }

  findAllUsersWithRoles(): Promise<Users[]> {
    return this.usersModel.findAll({
      include: [
        {
          model: Roles,
        },
      ],
    });
  }
}
