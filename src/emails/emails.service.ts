import { Inject, Injectable } from '@nestjs/common';
import { CreateEmailDto } from './dto/create-email.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { Prisma } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';
import { REQUEST } from '@nestjs/core';

@Injectable()
export class EmailsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REQUEST) private readonly request: any,
  ) {}


  create(createEmailDto: CreateEmailDto) {
    return 'This action adds a new email';
  }

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

    const allowedSortFields = ['title', 'last_name', 'tag'];
    const allowedSortOrders = ['asc', 'desc'];

    const safeSortField = allowedSortFields.includes(sortField) ? sortField : 'email_template_id';
    const safeSortOrder = allowedSortOrders.includes(sortOrder.toLowerCase()) ? sortOrder.toLowerCase() : 'asc';

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

  findOne(id: number) {
    return `This action returns a #${id} email`;
  }

  update(id: number, updateEmailDto: UpdateEmailDto) {
    return `This action updates a #${id} email`;
  }

  remove(id: number) {
    return `This action removes a #${id} email`;
  }
}
