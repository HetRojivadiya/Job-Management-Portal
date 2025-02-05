import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Users } from '../../../user/entity/users.entity';
import { Op } from 'sequelize'; // For date comparison

@Injectable()
export class UserService {
  constructor(@InjectModel(Users) private usersModel: typeof Users) {}

  async deleteUnauthorizedUsers(): Promise<number> {
    const currentTime = new Date();
    const fiveMinutesAgo = new Date(currentTime.getTime() - 5 * 60000);

    const deletedCount = await this.usersModel.destroy({
      where: {
        status: 'Unauthorized',
        createdAt: {
          [Op.lt]: fiveMinutesAgo,
        },
      },
    });
    return deletedCount;
  }
}
