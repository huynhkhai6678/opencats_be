import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LoginActivitiesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findAll(query : any) {
    const {
      sortField = 'saved_list_id',
      sortOrder = 'asc',
      filter,
      successful
    } = query;
      
    const page = Number(query.page) || 0;
    const size = Number(query.size) || 10;

    const offset = page * size;
    const limit = size;

    const allowedSortFields = ['ip', 'date', 'host', 'user_agent'];
    const allowedSortOrders = ['asc', 'desc'];

    // Default to 'company_id' and 'asc' if invalid input
    const safeSortField = allowedSortFields.includes(sortField) ? sortField : 'user_login.date';
    const safeSortOrder = allowedSortOrders.includes(sortOrder.toLowerCase()) ? sortOrder.toLowerCase() : 'asc';

    let whereClause = Prisma.empty;
    let conditions : any[] = [];
    if (filter) {
      conditions.push(Prisma.sql`WHERE (user_login.ip LIKE ${'%' + filter + '%'}`);
    }

    if (successful !== undefined) {
      conditions.push(Prisma.sql`user_login.successful = ${successful}`);
    }

    // Combine all conditions using AND
    if (conditions.length > 0) {
      whereClause = Prisma.sql`WHERE ${Prisma.join(conditions, ` AND `)}`;
    }

    const data = await this.prisma.$queryRaw<
      Array<any>
    >(Prisma.sql`
      SELECT
        user_login.*,
        CONCAT(owner_user.first_name, ' ', owner_user.last_name) AS owner
      FROM user_login
      LEFT JOIN user AS owner_user ON owner_user.user_id = user_login.user_id
      ${whereClause}
      ORDER BY ${Prisma.raw(safeSortField)} ${Prisma.raw(safeSortOrder)}
      LIMIT ${limit} OFFSET ${offset};
    `);

    const [{ total }] = await this.prisma.$queryRaw<{ total: number }[]>(Prisma.sql`
      SELECT COUNT(*) AS total
      FROM user_login
      LEFT JOIN user AS owner_user ON owner_user.user_id = user_login.user_id
      ${whereClause}
    `);
    
    return { data, total: Number(total) };
  }
}
