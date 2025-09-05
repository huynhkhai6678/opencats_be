import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateJobOrderDto } from './dto/create-job-order.dto';
import { UpdateJobOrderDto } from './dto/update-job-order.dto';
import { PrismaService } from '../prisma/prisma.service';
import { REQUEST } from '@nestjs/core';
import { company, contact, Prisma, user } from 'generated/prisma';
import { CONSTANTS, JOBORDER_DETAIL_QUERY_BODY } from '../constants';
import { CompanyDepartmentService } from '../services/company-department.service';
import * as md5 from 'md5';

@Injectable()
export class JobOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly departmentService: CompanyDepartmentService,
    @Inject(REQUEST) private readonly request: any,
  ) {}

  async create(createJobOrderDto: CreateJobOrderDto) {
    const user = this.request.user;

    // Create new company department
    if (typeof createJobOrderDto.company_department_id === 'string') {
      const department = await this.departmentService.createDepartment(createJobOrderDto.company_id, createJobOrderDto.company_department_id);
      createJobOrderDto['company_department_id'] = department.company_department_id;
    }

    createJobOrderDto['site_id'] = 1;
    createJobOrderDto['date_created']  = new Date();
    createJobOrderDto['date_modified'] = new Date();

    await this.prisma.joborder.create({
      data: createJobOrderDto
    });

    return {
      message: 'Job order created succesfully'
    };
  }

  async findAll(query : any) {
    const {
      sortField = 'joborder_id',
      sortOrder = 'asc',
      filter,
      isMyJobOrder = query.is_my_company,
      isHotJobOrder = query.is_hot_company
    } = query;

    const user = this.request.user;
    const page = Number(query.page) || 0;
    const size = Number(query.size) || 15;

    const offset = page * size;
    const limit = size;

    const allowedSortFields = ['joborder_id', 'title', 'type', 'status', 'dateCreated', 'recruiterFirstName', 'ownerFirstName', 'submitted', 'pipeline'];
    const allowedSortOrders = ['asc', 'desc'];

    // Default to 'company_id' and 'asc' if invalid input
    const safeSortField = allowedSortFields.includes(sortField) ? sortField : 'joborder.joborder_id';
    const safeSortOrder = allowedSortOrders.includes(sortOrder.toLowerCase()) ? sortOrder.toLowerCase() : 'asc';

    let whereClause = Prisma.empty;
    let conditions : any[] = [];
    if (filter) {
      conditions.push(Prisma.sql`WHERE (joborder.title LIKE ${'%' + filter + '%'} 
      OR company.name LIKE ${'%' + filter + '%'})`);
    }

    if (isMyJobOrder !== undefined && isMyJobOrder !== 'false') {
      conditions.push(Prisma.sql`joborder.owner = ${user.user_id}`);
    }

    if (isHotJobOrder !== undefined && isHotJobOrder !== 'false') {
      conditions.push(Prisma.sql`joborder.is_hot = 1`);
    }

    // Combine all conditions using AND
    if (conditions.length > 0) {
      whereClause = Prisma.sql`WHERE ${Prisma.join(conditions, ` AND `)}`;
    }

    const data = await this.prisma.$queryRaw<
      Array<any>
    >(Prisma.sql`
      SELECT
        joborder.joborder_id AS jobOrderID,
        joborder.client_job_id AS jobID,
        IF(MAX(attachment.attachment_id), 1, 0) AS attachmentPresent,
        joborder.title AS title,
        joborder.description AS jobDescription,
        joborder.notes AS notes,
        joborder.type AS type,
        joborder.is_hot AS isHot,
        joborder.openings AS openings,
        joborder.openings_available AS openingsAvailable,
        joborder.duration AS duration,
        joborder.city AS city,
        joborder.state AS state,
        joborder.status AS status,
        joborder.company_department_id AS departmentID,
        joborder.questionnaire_id as questionnaireID,
        company.company_id AS companyID,
        company.name AS companyName,
        company_department.name AS departmentName,
        contact.contact_id AS contactID,
        recruiter_user.first_name AS recruiterFirstName,
        recruiter_user.last_name AS recruiterLastName,
        owner_user.first_name AS ownerFirstName,
        owner_user.last_name AS ownerLastName,
        joborder.start_date AS startDate,
        joborder.date_created AS dateCreated,
        joborder.date_modified AS dateModified,
        DATEDIFF(
            NOW(), joborder.date_created
        ) AS daysOld,
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
        joborder.is_admin_hidden AS isAdminHidden
      FROM
          joborder
      LEFT JOIN company
          ON joborder.company_id = company.company_id
      LEFT JOIN contact
          ON joborder.contact_id = contact.contact_id
      LEFT JOIN company_department
          ON joborder.company_department_id = company_department.company_department_id
      LEFT JOIN candidate_joborder
          ON joborder.joborder_id = candidate_joborder.joborder_id
      LEFT JOIN user AS recruiter_user
          ON joborder.recruiter = recruiter_user.user_id
      LEFT JOIN user AS owner_user
          ON joborder.owner = owner_user.user_id
      LEFT JOIN attachment
          ON
          (
              joborder.joborder_id = attachment.data_item_id
              AND attachment.data_item_type = 400
          )
      ${whereClause}
      GROUP BY joborder.joborder_id
      ORDER BY ${Prisma.raw(safeSortField)} ${Prisma.raw(safeSortOrder)}
      LIMIT ${limit} OFFSET ${offset};
    `);

    const [{ total }] = await this.prisma.$queryRaw<{ total: number }[]>(Prisma.sql`
      SELECT COUNT(*) AS total
      FROM joborder
      LEFT JOIN company ON joborder.company_id = company.company_id
      ${whereClause}
    `);

    data.forEach(item => {
      item.pipeline = Number(item.pipeline);
      item.submitted = Number(item.submitted);
      item.attachmentPresent = Number(item.attachmentPresent);
      item.daysOld = Number(item.daysOld);
    });

    return { data, total: Number(total) };
  }

  async findOne(id: number) {
    const user = this.request.user;
    const data = await this.prisma.joborder.findFirst({
      where: {
        joborder_id: id
      },
    })
    
    const departments = await this.prisma.company_department.findMany();
    const categories = await this.prisma.job_categories.findMany();

    let companies : company[] = [];
    let contacts : contact[] = [];
    let users : user[] = [];

    if (user.access_level === CONSTANTS.ACCESS_LEVEL_ROOT) {
      companies = await this.prisma.company.findMany();
      contacts = await this.prisma.contact.findMany({
        where: {
          company_id: data?.company_id ?? 1,
        },
      });
      users = await this.prisma.user.findMany();
    } else {
      companies = await this.prisma.company.findMany({
        where : {
          owner : user.user_id
        }
      });
      contacts = await this.prisma.contact.findMany({
        where: {
          company_id: data?.company_id ?? 1,
          owner : user.user_id
        },
      });
      users = await this.prisma.user.findMany({
        where: {
          user_id : user.user_id
        }
      });
    }

    return {
      data,
      companies,
      departments,
      contacts,
      users,
      categories
    }
  }

  async findDetail(id: number) {

    const groupBy = Prisma.sql`GROUP BY joborder.joborder_id`;
    const whereClause = Prisma.sql`WHERE joborder.joborder_id = ${id}`;
    const fullQuery = Prisma.sql`${Prisma.raw(JOBORDER_DETAIL_QUERY_BODY)} ${whereClause} ${groupBy}`;
    const queryResul = await this.prisma.$queryRaw<Array<any>>(fullQuery);

    const data = queryResul[0];
    if (!data) {
      throw new NotFoundException('This job oder not existed');
    }
 
    return {
      data : {
        ...data,
        pipeline : Number(data.pipeline),
        submitted : Number(data.submitted),
        daysOld : Number(data.daysOld),
      }
    }
  }

  async update(id: number, updateJobOrderDto: UpdateJobOrderDto) {
    const user = this.request.user;
    const contact = await this.prisma.joborder.findFirst({
      where: {
        joborder_id: id,
      },
    })

    if (!contact) {
      throw new NotFoundException('This joborder not existed');
    }

    // Create new company department
    if (typeof updateJobOrderDto.company_department_id === 'string') {
      const department = await this.departmentService.createDepartment(updateJobOrderDto.company_id ?? 1, updateJobOrderDto.company_department_id);
      updateJobOrderDto['company_department_id'] = department.company_department_id;
    }

    await this.prisma.joborder.update({
      where: {
        joborder_id: id
      },
      data: updateJobOrderDto
    });

    return {
      message : `Update Job order successfully`
    };
  }

  async remove(id: number) {
    const jobOrder = await this.prisma.joborder.findFirst({
      where: {
        joborder_id: id,
      },
    })
    
    if (!jobOrder) {
      throw new NotFoundException('This job oder not existed');
    }

    await this.prisma.joborder.delete({
      where: {
        joborder_id: id
      },
    });

    return {
      message : `Delete job order successfully`
    };
  }

  async findCompanyJobOrder(id: number) {
    return {
      data : await this.prisma.contact.findMany({
        where : {
          company_id : id
        }
      })
    }
  }

  async findJobOrderAttachment(id: number) {
    const data = await this.prisma.attachment.findMany({
      where : {
        data_item_id: id,
        data_item_type: CONSTANTS.DATA_ITEM_JOBORDER
      }
    });

    data.forEach(item => {
      item['hash'] = md5(item.directory_name);
    });

    return {
      data,
    }
  }

  async findJobOrderPipeline(id: number) {
    const data = await this.prisma.$queryRaw<
      Array<any>
    >(Prisma.sql`
      SELECT
        candidate.candidate_id,
        candidate.first_name,
        candidate.last_name,
        candidate.full_name,
        candidate.state,
        candidate.email1,
        candidate_joborder.status AS status,
        candidate_joborder.candidate_confirm_status,
        candidate_joborder.date_created,
        candidate_joborder_status.short_description AS status_description,
        candidate_joborder.candidate_joborder_id AS candidate_joborder_id,
        candidate_joborder.rating_value AS rating_value,
        owner_user.first_name AS owner_first_name,
        owner_user.last_name AS owner_last_name,
        external_users.name as headhunt_name,
        external_users.id as headhunt_id,
        candidate.source_type as source_type,
        (
          SELECT
            CONCAT(
              '<strong>',
              DATE_FORMAT(activity.date_created, '%d/%m/%Y'),
              ' (',
              entered_by_user.first_name,
              ' ',
              entered_by_user.last_name,
              '):</strong> ',
              IF(
                ISNULL(activity.notes) OR activity.notes = '',
                '(No Notes)',
                activity.notes
              )
            )
          FROM
            activity
          LEFT JOIN activity_type
            ON activity.type = activity_type.activity_type_id
          LEFT JOIN user AS entered_by_user
            ON activity.entered_by = entered_by_user.user_id
          WHERE
            activity.data_item_id = candidate.candidate_id
          AND activity.data_item_type = 100
          AND activity.joborder_id = ${id}
          ORDER BY activity.date_created DESC
          LIMIT 1
        ) AS last_activity
      FROM
        candidate_joborder
      LEFT JOIN candidate
        ON candidate_joborder.candidate_id = candidate.candidate_id
      LEFT JOIN external_users
        ON candidate.entered_by = external_users.id
      LEFT JOIN user AS owner_user
        ON candidate.owner = owner_user.user_id
      LEFT JOIN user AS added_user
        ON candidate_joborder.added_by = added_user.user_id
      LEFT JOIN attachment
        ON candidate.candidate_id = attachment.data_item_id
      LEFT JOIN candidate_joborder_status
        ON candidate_joborder.status = candidate_joborder_status.candidate_joborder_status_id
      WHERE
        candidate_joborder.joborder_id = ${id}
    `);

    return {
      data
    }
  }

  async findJoborderListSelection() {
    const data = await this.prisma.joborder.findMany({
      select : {
        joborder_id: true,
        title: true,
        company : {
          select : {
            name: true
          }
        }
      }
    });

    return {
      data,
    }
  }

  async findJobordeToExport() {
   const data = await this.prisma.$queryRaw<
      Array<any>
    >(Prisma.sql`
      SELECT
        joborder.joborder_id AS joborder_id,
        joborder.title AS title,
        joborder.type AS type,
        joborder.openings AS openings,
        joborder.duration AS duration,
        joborder.city AS city,
        joborder.state AS state,
        joborder.status AS status,
        joborder.company_department_id AS department_id,
        joborder.rate_max AS rate_max,
        joborder.salary AS salary,
        joborder.salary AS notes,
        company.company_id AS company_id,
        company.name AS company_name,
        company_department.name AS department_name,
        contact.contact_id AS contact_id,
        CONCAT(contact.first_name, ' ', contact.last_name) AS contact_name,
        contact.phone_work AS contact_phone,
        CONCAT(recruiter_user.first_name, ' ', recruiter_user.last_name) AS recruiter,
        CONCAT(owner_user.first_name, ' ', owner_user.last_name) AS owner,
        joborder.date_created AS date_created,
        joborder.date_modified AS date_modified,
        DATEDIFF(
            NOW(), joborder.date_created
        ) AS daysOld,
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
        ) AS submitted
      FROM
          joborder
      LEFT JOIN company
          ON joborder.company_id = company.company_id
      LEFT JOIN contact
          ON joborder.contact_id = contact.contact_id
      LEFT JOIN company_department
          ON joborder.company_department_id = company_department.company_department_id
      LEFT JOIN candidate_joborder
          ON joborder.joborder_id = candidate_joborder.joborder_id
      LEFT JOIN user AS recruiter_user
          ON joborder.recruiter = recruiter_user.user_id
      LEFT JOIN user AS owner_user
          ON joborder.owner = owner_user.user_id
      GROUP BY joborder.joborder_id;
    `);

    data.forEach(item => {
      item.pipeline = Number(item.pipeline);
      item.submitted = Number(item.submitted);
      item.daysOld = Number(item.daysOld);
    });

    return data;
  }
}
