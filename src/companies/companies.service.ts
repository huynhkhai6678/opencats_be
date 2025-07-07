import { BadGatewayException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from 'generated/prisma';
import { REQUEST } from '@nestjs/core';
import { HistoriesService } from '../histories/histories.service';

@Injectable()
export class CompaniesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly history: HistoriesService,
    @Inject(REQUEST) private readonly request: any,
  ) {}

  async create(createCompanyDto: CreateCompanyDto) {
    const user = this.request.user;

    // To do in future with this 
    const { departments, ...companyDto } = createCompanyDto;

    companyDto['owner'] = user.user_id;
    companyDto['entered_by'] = user.user_id;
    companyDto['site_id'] = 1;
    companyDto['date_created']  = new Date();
    companyDto['date_modified'] = new Date();

    await this.prisma.company.create({
      data: companyDto
    });

    return {
      message: 'Company created succesfully'
    };
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

    const allowedSortFields = ['name', 'jobs', 'city', 'state', 'date_created', 'phone1', 'ownerFirstName', 'date_modified', 'contactFirstName'];
    const allowedSortOrders = ['asc', 'desc'];

    // Default to 'company_id' and 'asc' if invalid input
    const safeSortField = allowedSortFields.includes(sortField) ? sortField : 'company_id';
    const safeSortOrder = allowedSortOrders.includes(sortOrder.toLowerCase()) ? sortOrder.toLowerCase() : 'asc';

    const whereClause = filter
    ? Prisma.sql`WHERE (company.name LIKE ${'%' + filter + '%'} OR company.key_technologies LIKE ${'%' + filter + '%'})`
    : Prisma.empty;

    const data = await this.prisma.$queryRaw<
      Array<{
        company_id: number;
        name: string;
        city: string;
        state: string;
        phone1: string | null;
        ownerFirstName: string | null;
        ownerLastName: string | null;
        contactFirstName: string | null;
        contactLastName: string | null;
        attachmentPresent: number;
        jobs: number;
        date_created: string;
        date_modified: string;
      }>
    >(Prisma.sql`
      SELECT
        company.company_id,
        company.name,
        company.city,
        company.state,
        company.phone1,
        owner_user.first_name AS ownerFirstName,
        owner_user.last_name AS ownerLastName,
        contact.first_name AS contactFirstName,
        contact.last_name AS contactLastName,
        CAST(IF(attachment.attachment_id IS NOT NULL, 1, 0) AS UNSIGNED) AS attachmentPresent,
        CAST((
          SELECT COUNT(*)
          FROM joborder
          WHERE joborder.company_id = company.company_id AND joborder.site_id = 1
        ) AS UNSIGNED) AS jobs,
        DATE_FORMAT(company.date_created, '%m-%d-%y') AS date_created,
        DATE_FORMAT(company.date_modified, '%m-%d-%y') AS date_modified
      FROM company
      LEFT JOIN user AS owner_user ON company.owner = owner_user.user_id
      LEFT JOIN contact ON company.billing_contact = contact.contact_id
      LEFT JOIN attachment ON attachment.data_item_type = 200 AND attachment.data_item_id = company.company_id
      ${whereClause}
      ORDER BY ${Prisma.raw(safeSortField)} ${Prisma.raw(safeSortOrder)}
      LIMIT ${limit} OFFSET ${offset};
    `);

    const [{ total }] = await this.prisma.$queryRaw<{ total: number }[]>(Prisma.sql`
      SELECT COUNT(*) AS total
      FROM company
    `);

    data.forEach(item => {
      item.jobs = Number(item.jobs);
      item.attachmentPresent = Number(item.attachmentPresent);
    });

    return { data, total: Number(total) };
  }

  async findOne(id: number) {
    return {
      data : await this.prisma.company.findFirst({
        where: {
          company_id: id,
        },
      }),
      owner_list : await this.prisma.user.findMany({
        where: {
          access_level: {
            not: 0
          },
        },
      }),
      contact_list : await this.prisma.contact.findMany({
        where: {
          company_id: id,
        },
      })
    }
  }

  async update(id: number, updateCompanyDto: UpdateCompanyDto) {
    // To do in future with this 
    const { departments, ...companyDto } = updateCompanyDto;

    await this.prisma.company.update({
      where: {
        company_id: id
      },
      data: companyDto
    });

    return {
      message : `Update company successfully`
    };
  }

  async remove(id: number) {
    const company = await this.prisma.company.findFirst({
      where: {
        company_id: id,
      },
    })

    if (!company) {
      throw new NotFoundException('This company not existed');
    }

    if (company.default_company) {
      throw new BadGatewayException('This company can\'t be deleted');
    }

    await this.prisma.company.delete({
      where: {
        company_id: id
      },
    });

    return {
      message : `Delete company successfully`
    };
  }

  formatDate(date: Date): string {
    if (!date) return '';
    const d = new Date(date);
    return `${this.pad(d.getMonth() + 1)}-${this.pad(d.getDate())}-${String(d.getFullYear()).slice(2)}`;
  }

  pad(n: number) {
    return n < 10 ? `0${n}` : `${n}`;
  }
}
