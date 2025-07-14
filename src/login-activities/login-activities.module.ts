import { Module } from '@nestjs/common';
import { LoginActivitiesService } from './login-activities.service';
import { LoginActivitiesController } from './login-activities.controller';

@Module({
  controllers: [LoginActivitiesController],
  providers: [LoginActivitiesService],
  exports: [LoginActivitiesService]
})
export class LoginActivitiesModule {}
