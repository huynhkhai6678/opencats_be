import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateHeadhuntDto } from './dto/create-headhunt.dto';
import { UpdateHeadhuntDto } from './dto/update-headhunt.dto';
import { PrismaService } from '../prisma/prisma.service';
import { REQUEST } from '@nestjs/core';
import { external_users, Prisma } from 'generated/prisma';
import * as md5 from 'md5';

@Injectable()
export class HeadhuntsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REQUEST) private readonly request: any,
  ) {}

  create(createHeadhuntDto: CreateHeadhuntDto) {
    return 'This action adds a new headhunt';
  }

  async findAll(query : any) {
    const {
      sortField = 'company_id',
      sortOrder = 'asc',
      filter,
    } = query;
    
    const page = Number(query.page) || 0;
    const size = Number(query.size) || 10;

    const offset = page * size;
    const limit = size;

    const allowedSortFields = ['id', 'name', 'email', 'phone', 'dateCreated', 'register_date'];
    const allowedSortOrders = ['asc', 'desc'];

    const safeSortField = allowedSortFields.includes(sortField) ? sortField : 'id';
    const safeSortOrder = allowedSortOrders.includes(sortOrder.toLowerCase()) ? sortOrder.toLowerCase() : 'asc';

    const whereClause = filter
    ? Prisma.sql` AND (email LIKE ${'%' + filter + '%'} 
        OR phone LIKE ${'%' + filter + '%'}
        OR email LIKE ${'%' + filter + '%'})`
    : Prisma.empty;

    const data = await this.prisma.$queryRaw<
      Array<external_users>
    >(Prisma.sql`
      SELECT
        external_users.*
      FROM
        external_users
      WHERE type = 1
      ${whereClause}
      ORDER BY ${Prisma.raw(safeSortField)} ${Prisma.raw(safeSortOrder)}
      LIMIT ${limit} OFFSET ${offset};
    `);

    const [{ total }] = await this.prisma.$queryRaw<{ total: number }[]>(Prisma.sql`
      SELECT COUNT(*) AS total
      FROM external_users
      WHERE type = 1
      ${whereClause}
    `);

    return { data, total: Number(total) };
  }

  async findOne(id: number) {
    return {
      data : await this.prisma.external_users.findFirst({
        where : {
          id
        },
        include : {
          profile: true
        }
      })
    };
  }

  async findCandidates(id : number) {
    const data = await this.prisma.$queryRaw<Array<external_users>
    >(Prisma.sql`
      SELECT
        candidate.candidate_id,
        candidate.full_name,
        candidate.phone_home,
        candidate.phone_cell,
        candidate.email1,
        candidate.key_skills,
        candidate.is_hot,
        candidate.desired_work_location,
        candidate.date_created,
        candidate.date_modified
      FROM
        candidate
      WHERE 
        candidate.entered_by = ${id}
      AND
        candidate.source_type = 1
      AND
        candidate.owner_delete = 0
      ORDER BY
        candidate.last_name ASC,
        candidate.first_name ASC
    `);
    return {
      data
    }
  }

  async changeEmployee(id: number, isEmployee: number) {
    const externalUser = await this.prisma.external_users.findFirst({
      where : {
        id
      }
    });

    if (!externalUser) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.external_users.update({
      where : {
        id
      },
      data : {
        is_employee : isEmployee
      }
    })

    if (isEmployee) {
      const internalUser = await this.prisma.user.findFirst({
        where : {
          email : externalUser.email
        }
      });

      if (internalUser) {
        // If have inter account => update permission
        await this.prisma.user.update({
          where : {
            user_id : internalUser.user_id
          },
          data : {
            access_level : 100
          }
        });
      } else {
        // If dont have account ==> Create new one
        await this.prisma.user.create({
          data : {
            user_name: externalUser.email,
            email: externalUser.email,
            access_level: 100,
            first_name: externalUser.name,
            password: md5('123456')
          }
        });
      }
    } else {
      await this.prisma.user.updateMany({
          where : {
            email : externalUser.email
          },
          data : {
            access_level : 0
          }
      });
    }

    return {
      message: 'Change employee successfully'
    };
  }

  async changeVerified(id: number, isVerified: number) {
    const externalUser = await this.prisma.external_users.findFirst({
      where : {
        id
      }
    });

    if (!externalUser) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.external_users.update({
      where : {
        id
      },
      data : {
        verified : isVerified ? true : false
      }
    });

    return {
      message: 'Change verified successfully'
    };
  }

  async findKpi(month : number) {
    const users = await this.prisma.external_users.findMany({
      where: {
        is_employee: 1
      },
      select: {
        name: true,
        id: true,
      }
    });

    const data : any[] = [];
    for (let user of users) {
      const kpi = await this.getKpis(user, month);
      const totalScore = kpi.offered * 50 + kpi.submitted * 0.5 + kpi.interviewing * 0.5 + kpi.client_declined * 4 + kpi.contract * 10;
      data.push({
        ...user,
        ...kpi,
        total_score: totalScore,
        target: 100
      });
    }

    return {
      data
    };
  }

  async getKpiQuery(month : number) {
    const user = this.request.user;
    const kpi = await this.getKpis(user, month);
    const totalScore = kpi.offered * 50 + kpi.submitted * 0.5 + kpi.interviewing * 0.5 + kpi.client_declined * 4 + kpi.contract * 10;
    return {
      data : {
        ...kpi,
        total_score: totalScore,
        target: 100
      },
      code: 0,
      message: 'Request Success'
    }
  }

  update(id: number, updateHeadhuntDto: UpdateHeadhuntDto) {
    return `This action updates a #${id} headhunt`;
  }

  remove(id: number) {
    return `This action removes a #${id} headhunt`;
  }

  async getKpis(user: any, month: number) {
    const owner = await this.prisma.user.findFirst({
      where : {
        email : user.email
      }
    });

    const result = await this.prisma.$queryRaw<any>`
      SELECT 
        COUNT(DISTINCT cj.candidate_id) AS new_cv,
        COUNT(c.company_id) AS contract,
        COUNT(CASE WHEN cj.status = 600 THEN 1 END) AS offered,
        COUNT(CASE WHEN cj.status = 500 THEN 1 END) AS submitted,
        COUNT(CASE WHEN cj.status = 400 THEN 1 END) AS interviewing,
        COUNT(CASE WHEN cj.status = 700 THEN 1 END) AS client_declined
      FROM candidate_joborder cj
      LEFT JOIN company c ON c.owner = ${owner?.user_id}
      WHERE cj.headhunt_id = ${user.id}
      AND (
        (MONTH(cj.date_created) = MONTH(DATE_SUB(NOW(), INTERVAL ${month} MONTH)) AND YEAR(cj.date_created) = YEAR(DATE_SUB(NOW(), INTERVAL ${month} MONTH))) OR
        (MONTH(cj.offered_date) = MONTH(DATE_SUB(NOW(), INTERVAL ${month} MONTH)) AND YEAR(cj.offered_date) = YEAR(DATE_SUB(NOW(), INTERVAL ${month} MONTH))) OR
        (MONTH(cj.submitted_date) = MONTH(DATE_SUB(NOW(), INTERVAL ${month} MONTH)) AND YEAR(cj.submitted_date) = YEAR(DATE_SUB(NOW(), INTERVAL ${month} MONTH))) OR
        (MONTH(cj.interviewing_date) = MONTH(DATE_SUB(NOW(), INTERVAL ${month} MONTH)) AND YEAR(cj.interviewing_date) = YEAR(DATE_SUB(NOW(), INTERVAL ${month} MONTH))) OR
        (MONTH(cj.client_declined_date) = MONTH(DATE_SUB(NOW(), INTERVAL ${month} MONTH)) AND YEAR(cj.client_declined_date) = YEAR(DATE_SUB(NOW(), INTERVAL ${month} MONTH)))
      );
    `;

    return {
      new_cv: result[0]?.new_cv || 0,
      contract: result[0]?.contract || 0,
      offered: result[0]?.offered || 0,
      submitted: result[0]?.submitted || 0,
      interviewing: result[0]?.interviewing || 0,
      client_declined: result[0]?.client_declined || 0,
    };
  }
}
