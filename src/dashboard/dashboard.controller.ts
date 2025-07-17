import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from '../guards/auth.guard';

@UseGuards(AuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('recent-calls')
  findRecentCall() {
    return this.dashboardService.findRecentCall();
  }

  @Get('upcomming-calls')
  findUpcommingCall() {
    return this.dashboardService.findUpcommingCall();
  }

  @Get('recent-hires')
  findRecentHire() {
    return this.dashboardService.findRecentHire();
  }

  @Get('upcomming-events')
  findUpcommingEvent() {
    return this.dashboardService.findUpcommingEvent();
  }
}
