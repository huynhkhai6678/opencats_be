import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { REQUEST } from '@nestjs/core';
import { Prisma } from 'generated/prisma';

@Injectable()
export class ListEntriesService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REQUEST) private readonly request: any,
  ) {}

  async findCandidateList(id : number, query : any) {
    const {
      sortField = 'saved_list_id',
      sortOrder = 'asc',
      filter,
    } = query;
  
    const page = Number(query.page) || 0;
    const size = Number(query.size) || 10;

    const offset = page * size;
    const limit = size;

    const allowedSortFields = ['full_name', 'description', 'type', 'is_dynamic'];
    const allowedSortOrders = ['asc', 'desc'];

    // Default to 'company_id' and 'asc' if invalid input
    const safeSortField = allowedSortFields.includes(sortField) ? sortField : 'candidate_id';
    const safeSortOrder = allowedSortOrders.includes(sortOrder.toLowerCase()) ? sortOrder.toLowerCase() : 'asc';

    const whereClause = filter
    ? Prisma.sql` AND (candidate.full_name LIKE ${'%' + filter + '%'})`
    : Prisma.empty;

    const data = await this.prisma.$queryRaw<
      Array<any>
    >(Prisma.sql`
      SELECT
        saved_list_entry.date_created,
        saved_list_entry.data_item_id,
        candidate.full_name,
        candidate.job_title,
        candidate.city,
        candidate.state,
        candidate.key_skills,
        candidate.date_modified,
        candidate.desired_pay,
        CONCAT(owner_user.first_name, ' ', owner_user.last_name) AS owner
      FROM saved_list
      LEFT JOIN saved_list_entry ON saved_list.saved_list_id = saved_list_entry.saved_list_id
      LEFT JOIN candidate ON candidate.candidate_id = saved_list_entry.data_item_id
      LEFT JOIN user AS owner_user ON saved_list.created_by = owner_user.user_id
      WHERE saved_list.saved_list_id = ${id}
      ${whereClause}
      ORDER BY ${Prisma.raw(safeSortField)} ${Prisma.raw(safeSortOrder)}
      LIMIT ${limit} OFFSET ${offset};
    `);

    const [{ total }] = await this.prisma.$queryRaw<{ total: number }[]>(Prisma.sql`
      SELECT COUNT(*) AS total
      FROM saved_list
      LEFT JOIN saved_list_entry ON saved_list.saved_list_id = saved_list_entry.saved_list_id
      LEFT JOIN candidate ON candidate.candidate_id = saved_list_entry.data_item_id
      LEFT JOIN user AS owner_user ON saved_list.created_by = owner_user.user_id
      WHERE saved_list.saved_list_id = ${id}
      ${whereClause}
    `);
    
    return { data, total: Number(total) };
  }

  async findContactList(id : number, query : any) {
    const {
      sortField = 'saved_list_id',
      sortOrder = 'asc',
      filter,
    } = query;
  
    const page = Number(query.page) || 0;
    const size = Number(query.size) || 10;

    const offset = page * size;
    const limit = size;

    const allowedSortFields = ['first_name', 'last_name', 'company_name', 'title'];
    const allowedSortOrders = ['asc', 'desc'];

    // Default to 'company_id' and 'asc' if invalid input
    const safeSortField = allowedSortFields.includes(sortField) ? sortField : 'contact.date_modified';
    const safeSortOrder = allowedSortOrders.includes(sortOrder.toLowerCase()) ? sortOrder.toLowerCase() : 'asc';

    const whereClause = filter
    ? Prisma.sql` AND (
        contact.first_name LIKE ${'%' + filter + '%'}
        OR contact.last_name LIKE ${'%' + filter + '%'}
        OR company.name LIKE ${'%' + filter + '%'}
      )`
    : Prisma.empty;

    const data = await this.prisma.$queryRaw<
      Array<any>
    >(Prisma.sql`
      SELECT
        saved_list_entry.data_item_id,
        contact.first_name,
        contact.last_name,
        contact.phone_work,
        contact.date_created,
        contact.date_modified,
        contact.title,
        company.name AS company_name,
        company.company_id,
        CONCAT(owner_user.first_name, ' ', owner_user.last_name) AS owner
      FROM saved_list
      LEFT JOIN saved_list_entry ON saved_list.saved_list_id = saved_list_entry.saved_list_id
      LEFT JOIN contact ON contact.contact_id = saved_list_entry.data_item_id
      LEFT JOIN company ON contact.company_id = company.company_id
      LEFT JOIN user AS owner_user ON saved_list.created_by = owner_user.user_id
      WHERE saved_list.saved_list_id = ${id}
      ${whereClause}
      ORDER BY ${Prisma.raw(safeSortField)} ${Prisma.raw(safeSortOrder)}
      LIMIT ${limit} OFFSET ${offset};
    `);

    const [{ total }] = await this.prisma.$queryRaw<{ total: number }[]>(Prisma.sql`
      SELECT COUNT(*) AS total
      FROM saved_list
      LEFT JOIN saved_list_entry ON saved_list.saved_list_id = saved_list_entry.saved_list_id
      LEFT JOIN contact ON contact.contact_id = saved_list_entry.data_item_id
      LEFT JOIN company ON contact.company_id = company.company_id
      WHERE saved_list.saved_list_id = ${id}
      ${whereClause}
    `);
    
    return { data, total: Number(total) };
  }

  async findCompanyList(id : number, query : any) {
    const {
      sortField = 'saved_list_id',
      sortOrder = 'asc',
      filter,
    } = query;
  
    const page = Number(query.page) || 0;
    const size = Number(query.size) || 10;

    const offset = page * size;
    const limit = size;

    const allowedSortFields = ['title', 'city', 'state', 'total_jobs', 'phone1', 'owner', 'date_created', 'date_modified'];
    const allowedSortOrders = ['asc', 'desc'];

    // Default to 'company_id' and 'asc' if invalid input
    const safeSortField = allowedSortFields.includes(sortField) ? sortField : 'company.date_modified';
    const safeSortOrder = allowedSortOrders.includes(sortOrder.toLowerCase()) ? sortOrder.toLowerCase() : 'asc';

    const whereClause = filter
    ? Prisma.sql` AND (company.name LIKE ${'%' + filter + '%'})`
    : Prisma.empty;

    const data = await this.prisma.$queryRaw<
      Array<any>
    >(Prisma.sql`
      SELECT
        saved_list_entry.date_created,
        saved_list_entry.data_item_id,
        company.name,
        company.city,
        company.state,
        company.date_created,
        company.date_modified,
        company.phone1,
        (
          SELECT COUNT(*)
          FROM joborder
          WHERE joborder.company_id = company.company_id
        ) AS total_jobs,
        CONCAT(owner_user.first_name, ' ', owner_user.last_name) AS owner
      FROM saved_list
      LEFT JOIN saved_list_entry ON saved_list.saved_list_id = saved_list_entry.saved_list_id
      LEFT JOIN company ON company.company_id = saved_list_entry.data_item_id
      LEFT JOIN user AS owner_user ON saved_list.created_by = owner_user.user_id
      WHERE saved_list.saved_list_id = ${id}
      ${whereClause}
      ORDER BY ${Prisma.raw(safeSortField)} ${Prisma.raw(safeSortOrder)}
      LIMIT ${limit} OFFSET ${offset};
    `);

    const [{ total }] = await this.prisma.$queryRaw<{ total: number }[]>(Prisma.sql`
      SELECT COUNT(*) AS total
      FROM saved_list
      LEFT JOIN saved_list_entry ON saved_list.saved_list_id = saved_list_entry.saved_list_id
      LEFT JOIN company ON company.company_id = saved_list_entry.data_item_id
      LEFT JOIN user AS owner_user ON saved_list.created_by = owner_user.user_id
      WHERE saved_list.saved_list_id = ${id}
      ${whereClause}
    `);

    data.forEach(item => {
      item.total_jobs = Number(item.total_jobs);
    });
    
    return { data, total: Number(total) };
  }

  async findJobOrderList(id : number, query : any) {
    const {
      sortField = 'saved_list_id',
      sortOrder = 'asc',
      filter,
    } = query;
  
    const page = Number(query.page) || 0;
    const size = Number(query.size) || 10;

    const offset = page * size;
    const limit = size;

    const allowedSortFields = ['title', 'company_name', 'type', 'is_dynamic'];
    const allowedSortOrders = ['asc', 'desc'];

    // Default to 'company_id' and 'asc' if invalid input
    const safeSortField = allowedSortFields.includes(sortField) ? sortField : 'joborder.date_modified';
    const safeSortOrder = allowedSortOrders.includes(sortOrder.toLowerCase()) ? sortOrder.toLowerCase() : 'asc';

    const whereClause = filter
    ? Prisma.sql` AND (joborder.title LIKE ${'%' + filter + '%'} OR company.name LIKE ${'%' + filter + '%'})`
    : Prisma.empty;

    const data = await this.prisma.$queryRaw<
      Array<any>
    >(Prisma.sql`
      SELECT
        saved_list_entry.date_created,
        saved_list_entry.data_item_id,
        joborder.title,
        joborder.joborder_id,
        joborder.type,
        joborder.status,
        company.name AS company_name,
        company.company_id,
        MAX(attachment.attachment_id IS NOT NULL) AS attachment_present,
        DATEDIFF(
            NOW(), joborder.date_created
        ) AS day_old,
        COUNT(
          candidate_joborder.joborder_id
        ) AS pipeline,
        (
          SELECT
              COUNT(*)
          FROM
              candidate_joborder_status_history
          WHERE
              joborder_id = joborder.joborder_id
          AND
            status_to = 400
        ) AS submitted,
        CONCAT(owner_user.first_name, ' ', owner_user.last_name) AS owner,
        CONCAT(recruiter_user.first_name, ' ', recruiter_user.last_name) AS recruiter
      FROM saved_list
      LEFT JOIN saved_list_entry ON saved_list.saved_list_id = saved_list_entry.saved_list_id
      LEFT JOIN joborder ON joborder.joborder_id = saved_list_entry.data_item_id
      LEFT JOIN company ON joborder.company_id = company.company_id
      LEFT JOIN user AS owner_user ON joborder.owner = owner_user.user_id
      LEFT JOIN user AS recruiter_user ON joborder.entered_by = recruiter_user.user_id
      LEFT JOIN candidate_joborder ON joborder.joborder_id = candidate_joborder.joborder_id
      LEFT JOIN attachment ON
      (
        joborder.joborder_id = attachment.data_item_id
        AND attachment.data_item_type = 400
      )
      WHERE saved_list.saved_list_id = ${id}
      ${whereClause}
      GROUP BY
        saved_list_entry.date_created,
        saved_list_entry.data_item_id,
        joborder.joborder_id,
        company.company_id
      ORDER BY ${Prisma.raw(safeSortField)} ${Prisma.raw(safeSortOrder)}
      LIMIT ${limit} OFFSET ${offset};
    `);

    const [{ total }] = await this.prisma.$queryRaw<{ total: number }[]>(Prisma.sql`
      SELECT COUNT(*) AS total
      FROM saved_list
      LEFT JOIN saved_list_entry ON saved_list.saved_list_id = saved_list_entry.saved_list_id
      LEFT JOIN joborder ON joborder.joborder_id = saved_list_entry.data_item_id
      LEFT JOIN company ON joborder.company_id = company.company_id
      WHERE saved_list.saved_list_id = ${id}
      ${whereClause}
    `);

    data.forEach(item => {
      item.pipeline = Number(item.pipeline);
      item.submitted = Number(item.submitted);
      item.attachment_present = Number(item.attachment_present);
      item.day_old = Number(item.day_old);
    });
    
    return { data, total: Number(total) };
  }
}
