import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { LoginActivitiesService } from './login-activities.service';
import { AuthGuard } from '../guards/auth.guard';
import { AdminGuard } from '../guards/admin.guard';

@UseGuards(AuthGuard, AdminGuard)
@Controller('login-activities')
export class LoginActivitiesController {
  constructor(private readonly loginActivitiesService: LoginActivitiesService) {}

  @Get()
  findAll(@Query() query : any) {
    return this.loginActivitiesService.findAll(query);
  }
}
