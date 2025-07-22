import { Module } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { AuthModule } from '../auth/auth.module';
import { HistoriesModule } from '../histories/histories.module';
import { ExcelService } from '../services/excel.service';

@Module({
  imports: [
    AuthModule,
    HistoriesModule
  ],
  controllers: [CompaniesController],
  providers: [CompaniesService, ExcelService],
})
export class CompaniesModule {}
