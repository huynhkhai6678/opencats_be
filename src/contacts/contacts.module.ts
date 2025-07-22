import { Module } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { ContactsController } from './contacts.controller';
import { AuthModule } from '../auth/auth.module';
import { HistoriesModule } from '../histories/histories.module';
import { CompanyDepartmentService } from '../services/company-department.service';
import { ExcelService } from '../services/excel.service';

@Module({
  imports: [
    AuthModule,
    HistoriesModule
  ],
  controllers: [ContactsController],
  providers: [ContactsService, CompanyDepartmentService, ExcelService],
})
export class ContactsModule {}
