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
import { ConfigModule } from '@nestjs/config';
import { CandidatesController } from './candidates/candidates.controller';
import { CandidatesModule } from './candidates/candidates.module';
import { AttachmentsModule } from './attachments/attachments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PdfModule,
    PrismaModule,
    AuthModule,
    CompaniesModule,
    HistoriesModule,
    ContactsModule,
    JobOrdersModule,
    CandidatesModule,
    AttachmentsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
