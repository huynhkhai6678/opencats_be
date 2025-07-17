import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';
import { REQUEST } from '@nestjs/core';
import { UpdateEmailDto } from './dto/update-email.dto';

@Injectable()
export class EmailsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REQUEST) private readonly request: any,
  ) {}

  async findAll(query: any) {
    const {
      sortField = 'user_id',
      sortOrder = 'asc',
      filter,
    } = query;
      
    const page = Number(query.page) || 0;
    const size = Number(query.size) || 10;

    const offset = page * size;
    const limit = size;

    const allowedSortFields = ['title', 'text', 'disabled'];
    const allowedSortOrders = ['asc', 'desc'];

    const safeSortField = allowedSortFields.includes(sortField) ? sortField : 'disabled';
    const safeSortOrder = allowedSortOrders.includes(sortOrder.toLowerCase()) ? sortOrder.toLowerCase() : 'desc';

    const whereClause = filter
    ? Prisma.sql` WHERE (
        title LIKE ${'%' + filter + '%'}
        OR text LIKE ${'%' + filter + '%'}
      )`
    : Prisma.empty;

    const data = await this.prisma.$queryRaw<Array<any>>(Prisma.sql`
      SELECT
        email_template.*
      FROM email_template
      ${whereClause}
      ORDER BY ${Prisma.raw(safeSortField)} ${Prisma.raw(safeSortOrder)}
      LIMIT ${limit} OFFSET ${offset};
    `);

    const [{ total }] = await this.prisma.$queryRaw<{ total: number }[]>(Prisma.sql`
      SELECT COUNT(*) AS total
      FROM email_template
    `);
        
    return { data, total: Number(total) };
  }

  async findOne(id: number) {
    return {
      data : await this.prisma.email_template.findFirst({
        where : {
          email_template_id : id
        }
      })
    };
  }

  async update(id: number, updateEmailDto: UpdateEmailDto) {
    const emailTemplate = await this.prisma.email_template.findFirst({
      where: {
        email_template_id: id,
      },
    })

    if (!emailTemplate) {
      throw new NotFoundException('This Email template not existed');
    }

    await this.prisma.email_template.update({
      where : {
        email_template_id: id
      },
      data : updateEmailDto
    });

    return {
      message : 'Update email template Successfully'
    }
  }

  async remove(id: number) {
    const emailTemplate = await this.prisma.email_template.findFirst({
      where: {
        email_template_id: id,
      },
    })

    if (!emailTemplate) {
      throw new NotFoundException('This joborder not existed');
    }

    await this.prisma.email_template.delete({
      where : {
        email_template_id: id
      }
    });

    return {
      message : 'Delete email template Successfully'
    }
  }
}
