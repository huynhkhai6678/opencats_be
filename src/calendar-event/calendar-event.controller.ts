import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ValidationPipe } from '@nestjs/common';
import { CalendarEventService } from './calendar-event.service';
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto';
import { UpdateCalendarEventDto } from './dto/update-calendar-event.dto';
import { AuthGuard } from '../guards/auth.guard';

@UseGuards(AuthGuard)
@Controller('calendar')
export class CalendarEventController {
  constructor(private readonly calendarEventService: CalendarEventService) {}

  @Post()
  create(@Body(ValidationPipe) createCalendarEventDto: CreateCalendarEventDto) {
    return this.calendarEventService.create(createCalendarEventDto);
  }

  @Get()
  findAll() {
    return this.calendarEventService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.calendarEventService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCalendarEventDto: UpdateCalendarEventDto) {
    return this.calendarEventService.update(+id, updateCalendarEventDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.calendarEventService.remove(+id);
  }
}
