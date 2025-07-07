import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PdfModule } from './pdf/pdf.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CompaniesModule } from './companies/companies.module';
import { HistoriesModule } from './histories/histories.module';
import { ContactsModule } from './contacts/contacts.module';
import { JobOrdersModule } from './job-orders/job-orders.module';

@Module({
  imports: [
    PdfModule,
    PrismaModule,
    AuthModule,
    CompaniesModule,
    HistoriesModule,
    ContactsModule,
    JobOrdersModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
