import { Module } from '@nestjs/common';
import { JobOrdersService } from './job-orders.service';
import { JobOrdersController } from './job-orders.controller';
import { AuthModule } from '../auth/auth.module';
import { CompanyDepartmentService } from '../services/company-department.service';

@Module({
  controllers: [JobOrdersController],
  providers: [JobOrdersService, CompanyDepartmentService],
  imports: [AuthModule]
})
export class JobOrdersModule {}
