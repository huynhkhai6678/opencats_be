import { Module } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { ContactsController } from './contacts.controller';
import { AuthModule } from '../auth/auth.module';
import { HistoriesModule } from '../histories/histories.module';
import { CompanyDepartmentService } from 'src/services/company-department.service';

@Module({
  imports: [
    AuthModule,
    HistoriesModule
  ],
  controllers: [ContactsController],
  providers: [ContactsService, CompanyDepartmentService],
})
export class ContactsModule {}
