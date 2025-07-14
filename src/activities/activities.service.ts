import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { REQUEST } from '@nestjs/core';
import { Prisma } from 'generated/prisma';

@Injectable()
export class ActivitiesService {

  constructor(
    private readonly prisma: PrismaService,
    @Inject(REQUEST) private readonly request: any,
  ) {}

  create(createActivityDto: CreateActivityDto) {
    return 'This action adds a new activity';
  }

  async findAll(query: any) {
    const {
      sortField = 'company_id',
      sortOrder = 'asc',
      filter,
      startDate,
      endDate
    } = query;
      
    const page = Number(query.page) || 0;
    const size = Number(query.size) || 10;

    const offset = page * size;
    const limit = size;

    const allowedSortFields = ['createdDate', 'candidateName', 'joborderName', 'enterBy', 'notes'];
    const allowedSortOrders = ['asc', 'desc'];

    // Default to 'company_id' and 'asc' if invalid input
    const safeSortField = allowedSortFields.includes(sortField) ? sortField : 'candidate_id';
    const safeSortOrder = allowedSortOrders.includes(sortOrder.toLowerCase()) ? sortOrder.toLowerCase() : 'asc';

    const conditions : any[] = [];
    if (filter) {
      conditions.push(Prisma.sql`
        (candidate.full_name LIKE ${'%' + filter + '%'}
        OR joborder.title LIKE ${'%' + filter + '%'}
        OR company.name LIKE ${'%' + filter + '%'})
      `);
    }

    if (startDate || endDate) {
      conditions.push(Prisma.sql`
        ${startDate ? Prisma.sql`activity.date_created >= ${startDate}` : Prisma.empty}
        ${startDate && endDate ? Prisma.sql`AND` : Prisma.empty}
        ${endDate ? Prisma.sql`activity.date_created <= ${endDate}` : Prisma.empty}
      `);
    }

    // Only add the WHERE clause if conditions are present
    const whereClause = conditions.length > 0 
      ? Prisma.sql`WHERE ${Prisma.join(conditions, ` AND `)}`
      : Prisma.empty;
  
    const data = await this.prisma.$queryRaw<
      Array<{
        createdDate: string;
        notes: string;
        enterBy: string;
        activityType: string;
        candidateName: string;
        candidateId: number;
        companyName: string;
        companyId: number;
        joborderName: string;
        joborderId: number;
      }>
    >(Prisma.sql`
      SELECT
        activity.date_created AS createdDate,
        activity.notes AS notes,
        activity_type.short_description AS activityType,
        candidate.full_name AS candidateName,
        activity.data_item_id AS candidateId,
        company.name AS companyName,
        company.company_id AS companyId,
        joborder.title AS joborderName,
        joborder.joborder_id AS joborderId,
        CONCAT(user.first_name, ' ', user.last_name) AS enterBy
      FROM activity
      LEFT JOIN activity_type
        ON activity_type.activity_type_id = activity.type
      LEFT JOIN joborder
        ON activity.joborder_id = joborder.joborder_id
      LEFT JOIN company
        ON company.company_id = joborder.company_id
      LEFT JOIN user
        ON activity.entered_by = user.user_id
      LEFT JOIN candidate
        ON
        (
          candidate.candidate_id = activity.data_item_id
          AND activity.data_item_type = 100
        )
      ${whereClause}
      ORDER BY ${Prisma.raw(safeSortField)} ${Prisma.raw(safeSortOrder)}
      LIMIT ${limit} OFFSET ${offset};
    `);

    const [{ total }] = await this.prisma.$queryRaw<{ total: number }[]>(Prisma.sql`
      SELECT COUNT(*) AS total
      FROM activity
    `);
        
    return { data, total: Number(total) };
  }

  async findOne(id: number) {
    const data = await this.prisma.activity.findFirst({ where : { activity_id : id }});
    const options = await this.prisma.activity_type.findMany();

    return {
      data,
      options
    };
  }

  async update(id: number, updateActivityDto: UpdateActivityDto) {
    const activity = await this.prisma.activity.findFirst({
      where: {
        activity_id: id,
      },
    })

    if (!activity) {
      throw new NotFoundException('This contact not existed');
    }

    await this.prisma.activity.update({
      where: {
        activity_id: id
      },
      data: {
        ...updateActivityDto,
        date_modified: new Date()
      }
    });

    return {
      message : `Update Activity successfully`
    };
  }

  async remove(id: number) {
    const candidate = await this.prisma.activity.findFirst({
      where: {
        activity_id: id
      },
    })

    if (!candidate) {
      throw new NotFoundException('This contact not existed');
    }

    await this.prisma.activity.delete({
      where : {
        activity_id: id
      }
    });

    return {
      message: 'Remove activity successfully'
    }
  }
}
