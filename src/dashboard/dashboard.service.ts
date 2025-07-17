import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { calendar_event, Prisma } from 'generated/prisma';
import { CONSTANTS } from 'src/constants';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(
      private readonly prisma: PrismaService,
      @Inject(REQUEST) private readonly request: any,
  ) {}

  async findRecentCall() {
    const user = this.request.user;
    let data : calendar_event[] = [];
    if (user.type === CONSTANTS.ACCESS_LEVEL_HR) {
      data = await this.prisma.calendar_event.findMany({
        where: {
          entered_by : user.user_id,
          type: 100
        },
        orderBy: {
          date: 'desc'
        },
        take: 5
      })
    } else {
      data = await this.prisma.calendar_event.findMany({
        where : {
          type: 100
        },
        orderBy: {
          date: 'desc'
        },
        take: 5
      })
    }

    return {
      data
    }
  }

  async findUpcommingCall() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const user = this.request.user;
    let data : calendar_event[] = [];
    if (user.type === CONSTANTS.ACCESS_LEVEL_HR) {
      data = await this.prisma.calendar_event.findMany({
        where: {
          entered_by : user.user_id,
          type: 100,
          date: {
            gte: today
          },
        },
        orderBy: {
          date: 'desc'
        },
        take: 5
      })
    } else {
      data = await this.prisma.calendar_event.findMany({
        where: {
          type: 100,
          date: {
            gte: today
          },
        },
        orderBy: {
          date: 'desc'
        },
        take: 5
      })
    }

    return {
      data
    }
  }

  async findRecentHire() {
    const user = this.request.user;
    
    const whereClause = Prisma.empty;
  

    const data = await this.prisma.$queryRaw<Array<any>
      >(Prisma.sql`
        SELECT
          candidate.full_name AS full_name,
          candidate.candidate_id,
          company.name AS company_name,
          company.company_id,
          CONCAT(user.first_name, ' ', user.last_name) AS recruiter,
          IF (company.is_hot = 1, 'job_link_hot', 'job_link_cold') as company_class_name,
          IF (candidate.is_hot = 1, 'job_link_hot', 'job_link_cold') as candidate_class_name,
          candidate_joborder_status_history.date as date
        FROM candidate_joborder_status_history
        LEFT JOIN candidate ON
          candidate.candidate_id = candidate_joborder_status_history.candidate_id
        LEFT JOIN joborder ON
          joborder.joborder_id = candidate_joborder_status_history.joborder_id
        LEFT JOIN company ON
          joborder.company_id = company.company_id
        LEFT JOIN user ON
          joborder.recruiter = user.user_id
        WHERE status_to = 800
        ${whereClause}
        ORDER BY date DESC
        LIMIT 10;
    `);

    return {
      data
    }
  }

  async findUpcommingEvent() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const user = this.request.user;
    let data : calendar_event[] = [];
    if (user.type === CONSTANTS.ACCESS_LEVEL_HR) {
      data = await this.prisma.calendar_event.findMany({
        where: {
          entered_by : user.user_id,
          date: {
            gte: today
          },
        }
      })
    } else {
      data = await this.prisma.calendar_event.findMany({
        where: {
          date: {
            gte: today
          },
        }
      })
    }

    return {
      data
    }
  }
}
