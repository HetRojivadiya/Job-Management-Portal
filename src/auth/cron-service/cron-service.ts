import { Injectable } from '@nestjs/common';
import { UserService } from './service/user.service';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class CronService {
  constructor(private readonly userService: UserService) {}

  @Cron('* * * * *') // Runs once in every day minnight
  async handleCron() {
    try {
      await this.userService.deleteUnauthorizedUsers();
    } catch (error) {
      console.error('Error in cron job:', error);
    }
  }
}
