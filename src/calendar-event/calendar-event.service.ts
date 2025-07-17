import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto';
import { UpdateCalendarEventDto } from './dto/update-calendar-event.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { REQUEST } from '@nestjs/core';

@Injectable()
export class CalendarEventService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REQUEST) private readonly request: any,
  ) {}

  async create(createCalendarEventDto: CreateCalendarEventDto) {
    const user = this.request.user;
    const { all_day, date, time } = createCalendarEventDto;
    let fullDateTime: Date;

    if (all_day) {
      const baseDate = new Date(date);
      baseDate.setHours(9, 0, 0, 0);
      fullDateTime = baseDate;
    } else {
      fullDateTime = new Date(time);
    }

    await this.prisma.calendar_event.create({
      data : {
        all_day : all_day ? 1 : 0,
        date: fullDateTime.toISOString(),
        description: createCalendarEventDto.description,
        duration: createCalendarEventDto.duration,
        public: createCalendarEventDto.public ? 1 : 0,
        title: createCalendarEventDto.title,
        type: createCalendarEventDto.type,
        site_id: 1,
        entered_by: user.user_id,
        date_created: new Date(),
        date_modified: new Date()
      }
    })

    return {
      message: 'Create calendar successfully'
    }
  }

  async findAll() {
    return {
      data: await this.prisma.calendar_event.findMany({
        select : {
          calendar_event_id: true,
          title: true,
          date: true,
          duration: true,
          description: true,
          all_day: true,
          entered_user : {
            select : {
              first_name: true,
              last_name: true
            }
          },
          type_info : true
        }
      })
    }
  }

  async findOne(id: number) {
    return {
      data: await this.prisma.calendar_event.findFirst({
        where : {
          calendar_event_id : id
        }
      }),
      types : await this.prisma.calendar_event_type.findMany(),
    };
  }

  async update(id: number, updateCalendarEventDto: UpdateCalendarEventDto) {
     const calendaEvent = await this.prisma.calendar_event.findFirst({
      where: {
        calendar_event_id: id
      },
    })
    
    if (!calendaEvent) {
      throw new NotFoundException('This calendar event not existed');
    }

    const { all_day, date, time } = updateCalendarEventDto;
    let fullDateTime: Date;

    if (all_day) {
      const baseDate = new Date(date ?? '');
      baseDate.setHours(9, 0, 0, 0);
      fullDateTime = baseDate;
    } else {
      fullDateTime = new Date(time ?? '');
    }

    await this.prisma.calendar_event.update({
      where : {
        calendar_event_id: id
      },
      data : {
        all_day : all_day ? 1 : 0,
        date: fullDateTime.toISOString(),
        description: updateCalendarEventDto.description,
        duration: updateCalendarEventDto.duration,
        public: updateCalendarEventDto.public ? 1 : 0,
        title: updateCalendarEventDto.title,
        type: updateCalendarEventDto.type,
      }
    });

    return {
      message: 'Update calendar event successfully'
    }
  }

  async remove(id: number) {
    const calendaEvent = await this.prisma.calendar_event.findFirst({
      where: {
        calendar_event_id: id
      },
    })
    
    if (!calendaEvent) {
      throw new NotFoundException('This calendar event not existed');
    }

    await this.prisma.calendar_event.delete({
      where : {
        calendar_event_id: id
      }
    });

    return {
      message: 'Remove calendar event successfully'
    }
  }
}
