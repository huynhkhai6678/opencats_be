import { Module } from '@nestjs/common';
import { CalendarEventService } from './calendar-event.service';
import { CalendarEventController } from './calendar-event.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports : [
    AuthModule
  ],
  controllers: [CalendarEventController],
  providers: [CalendarEventService],
})
export class CalendarEventModule {}
