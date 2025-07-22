import { Module } from '@nestjs/common';
import { JobOrdersService } from './job-orders.service';
import { JobOrdersController } from './job-orders.controller';
import { AuthModule } from '../auth/auth.module';
import { CompanyDepartmentService } from '../services/company-department.service';
import { ExcelService } from '../services/excel.service';

@Module({
  controllers: [JobOrdersController],
  providers: [JobOrdersService, CompanyDepartmentService, ExcelService],
  imports: [AuthModule]
})
export class JobOrdersModule {}
