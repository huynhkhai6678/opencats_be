import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CompaniesModule } from './companies/companies.module';
import { HistoriesModule } from './histories/histories.module';
import { ContactsModule } from './contacts/contacts.module';
import { JobOrdersModule } from './job-orders/job-orders.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CandidatesModule } from './candidates/candidates.module';
import { AttachmentsModule } from './attachments/attachments.module';
import { ActivitiesModule } from './activities/activities.module';
import { ListsModule } from './lists/lists.module';
import { ListEntriesModule } from './list-entries/list-entries.module';
import { LoginActivitiesModule } from './login-activities/login-activities.module';
import { UsersModule } from './users/users.module';
import { EmailsModule } from './emails/emails.module';
import { CandidateJoborderModule } from './candidate-joborder/candidate-joborder.module';
import { CalendarEventModule } from './calendar-event/calendar-event.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { KafkaProducerService } from './services/kafka-producer.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { join } from 'path';
import { ScheduleModule } from '@nestjs/schedule';
import { KafkaDelayService } from './services/kafka-delay.service';
import { HeadhuntsModule } from './headhunts/headhunts.module';
import { ReportsModule } from './reports/reports.module';
import { ExternalApiModule } from './external-api/external-api.module';
import { PdfRedactionService } from './services/pdf-redaction.service';
import { Logger } from './services/logger.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => {
        const templatePath = join(process.cwd(), 'templates', 'email')
        return {
          transport: {
            host: config.get('MAIL_HOST'),
            port: config.get('MAIL_PORT'),
            auth: {
              user: config.get('MAIL_USER'),
              pass: config.get('MAIL_PASS'),
            },
          },
          defaults: {
            from: config.get('APP_NAME'),
          },
          template: {
            dir: templatePath,
            adapter: new EjsAdapter(),
            options: {
              strict: false,
            },
          },
        };
      },
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
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
    CandidateJoborderModule,
    CalendarEventModule,
    DashboardModule,
    HeadhuntsModule,
    ReportsModule,
    ExternalApiModule
  ],
  controllers: [AppController],
  providers: [AppService, KafkaProducerService, KafkaDelayService, PdfRedactionService, Logger],
})
export class AppModule {}
