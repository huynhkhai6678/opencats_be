import { Module } from '@nestjs/common';
import { LoginActivitiesService } from './login-activities.service';
import { LoginActivitiesController } from './login-activities.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    AuthModule
  ],
  controllers: [LoginActivitiesController],
  providers: [LoginActivitiesService],
  exports: [LoginActivitiesService]
})
export class LoginActivitiesModule {}
