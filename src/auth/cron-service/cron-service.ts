import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from './service/cron.service';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class CronService {
  constructor(private readonly userService: UserService) {}

  @Cron('0 0 * * *') // Runs once in every day minnight
  async handleCron() {
    try {
      await this.userService.deleteUnauthorizedUsers();
    } catch (error :  unknown) {
      throw new BadRequestException(error);
    }
  }
}
