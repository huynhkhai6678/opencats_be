import { Controller, Get, Param, Query } from '@nestjs/common';
import { LoginActivitiesService } from './login-activities.service';

@Controller('login-activities')
export class LoginActivitiesController {
  constructor(private readonly loginActivitiesService: LoginActivitiesService) {}

  @Get()
  findAll(@Query() query : any) {
    return this.loginActivitiesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.loginActivitiesService.findOne(+id);
  }
}
