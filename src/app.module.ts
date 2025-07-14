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
import { CandidatesModule } from './candidates/candidates.module';
import { AttachmentsModule } from './attachments/attachments.module';
import { ActivitiesModule } from './activities/activities.module';
import { ListsModule } from './lists/lists.module';
import { ListEntriesModule } from './list-entries/list-entries.module';
import { LoginActivitiesModule } from './login-activities/login-activities.module';
import { UsersModule } from './users/users.module';
import { EmailsModule } from './emails/emails.module';
import { CandidateJoborderModule } from './candidate-joborder/candidate-joborder.module';

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
    AttachmentsModule,
    ActivitiesModule,
    ListsModule,
    ListEntriesModule,
    LoginActivitiesModule,
    UsersModule,
    EmailsModule,
    CandidateJoborderModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
