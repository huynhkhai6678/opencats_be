import { Module } from '@nestjs/common';
import { EmailsService } from './emails.service';
import { EmailsController } from './emails.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports : [
    AuthModule
  ],
  controllers: [EmailsController],
  providers: [EmailsService],
})
export class EmailsModule {}
