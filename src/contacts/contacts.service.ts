import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { PrismaService } from '../prisma/prisma.service';
import { REQUEST } from '@nestjs/core';
import { company, contact, Prisma } from 'generated/prisma';
import { CONSTANTS } from '../constants';
import { CompanyDepartmentService } from '../services/company-department.service';


@Injectable()
export class ContactsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly departmentService: CompanyDepartmentService,
    @Inject(REQUEST) private readonly request: any,
  ) {}

  async create(createContactDto: CreateContactDto) {    
    const user = this.request.user;

    // Create new company department
    if (typeof createContactDto.company_department_id === 'string') {
      const department = await this.departmentService.createDepartment(createContactDto.company_id, createContactDto.company_department_id);
      createContactDto['company_department_id'] = department.company_department_id;
    }

    createContactDto['owner'] = user.user_id;
    createContactDto['entered_by'] = user.user_id;
    createContactDto['site_id'] = 1;
    createContactDto['date_created']  = new Date();
    createContactDto['date_modified'] = new Date();

    await this.prisma.contact.create({
      data: createContactDto
    });

    return {
      message: 'Contact created succesfully'
    };
  }

  async findAll(query : any) {
    const {
      sortField = 'contact_id',
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
    const safeSortField = allowedSortFields.includes(sortField) ? sortField : 'contact_id';
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
        contact.is_hot AS isHot,
        contact.contact_id AS contactID,
        contact.contact_id AS exportID,
        contact.date_modified AS dateModifiedSort,
        contact.date_created AS dateCreatedSort,
        contact.title AS title,
        contact.phone_work AS workPhone,
        contact.first_name AS firstName,
        contact.last_name AS lastName,
        company.name AS companyName,
        contact.company_id AS companyId,
        owner_user.first_name AS ownerFirstName,
        owner_user.last_name AS ownerLastName,
        CONCAT(owner_user.last_name, owner_user.first_name) AS ownerSort
      FROM contact
      LEFT JOIN company
        ON contact.company_id = company.company_id
      LEFT JOIN user AS owner_user
        ON contact.owner = owner_user.user_id
      ${whereClause}
      ORDER BY ${Prisma.raw(safeSortField)} ${Prisma.raw(safeSortOrder)}
      LIMIT ${limit} OFFSET ${offset};
    `);

    const [{ total }] = await this.prisma.$queryRaw<{ total: number }[]>(Prisma.sql`
      SELECT COUNT(*) AS total
      FROM contact
    `);

    data.forEach(item => {
      item.jobs = Number(item.jobs);
      item.attachmentPresent = Number(item.attachmentPresent);
    });

    return { data, total: Number(total) };
  }

  async findOne(id: number) {
    const user = this.request.user;
    
    const data = await this.prisma.contact.findFirst({
      where: {
        contact_id: id,
      },
    })

    const departments = await this.prisma.company_department.findMany();

    let companies : company[] = [];
    let reports : contact[] = [];

    if (user.access_level === CONSTANTS.ACCESS_LEVEL_ROOT) {
      companies = await this.prisma.company.findMany();
      reports = await this.prisma.contact.findMany({
        where: {
          company_id: data ? data.company_id : 1,
        },
      });
    } else {
      companies = await this.prisma.company.findMany({
        where : {
          owner : user.user_id
        }
      });
      reports = await this.prisma.contact.findMany({
        where: {
          company_id: data ? data.company_id : 1,
          owner : user.user_id,
          contact_id: {
            not : {
              equals : data?.contact_id
            }
          }
        },
      });
    }

    return {
      data,
      companies,
      departments,
      reports
    }
  }

  async findDetail(id: number) {
    return {
      data : await this.prisma.contact.findFirst({
        where: {
          contact_id : id,
        },
        include: {
          company: {
            select: {
              name: true,
              company_id: true
            },
          },
          department: {
            select: {
              name: true
            },
          },
          owner_user: {
            select: {
              first_name: true,
              last_name: true
            },
          },
          report_to: {
            select: {
              first_name: true,
              last_name: true
            },
          },
        },
      })
    }
  }

  async update(id: number, updateContactDto: UpdateContactDto) {
    const user = this.request.user;
    const contact = await this.prisma.contact.findFirst({
      where: {
        contact_id: id,
      },
    })

    if (!contact) {
      throw new NotFoundException('This contact not existed');
    }

    // Create new company department
    if (typeof updateContactDto.company_department_id === 'string') {
      const department = await this.departmentService.createDepartment(updateContactDto.company_id ?? 1, updateContactDto.company_department_id);
      updateContactDto['company_department_id'] = department.company_department_id;
    }

    await this.prisma.contact.update({
      where: {
        contact_id: id
      },
      data: updateContactDto
    });

    return {
      message : `Update contact successfully`
    };
  }

  async remove(id: number) {
    const contact = await this.prisma.contact.findFirst({
      where: {
        contact_id: id,
      },
    })

    if (!contact) {
      throw new NotFoundException('This company not existed');
    }

    await this.prisma.contact.delete({
      where: {
        contact_id: id
      },
    });

    return {
      message : `Delete company successfully`
    };
  }

  async findCompanyContact(id: number) {
    const user = this.request.user;
    let reports : contact[] = [];
    const departments = await this.prisma.company_department.findMany();

    if (user.access_level === CONSTANTS.ACCESS_LEVEL_ROOT) {
      reports = await this.prisma.contact.findMany({
        where: {
          company_id: id,
        },
      });
    } else {
      reports = await this.prisma.contact.findMany({
        where: {
          company_id: id,
          owner : user.user_id
        },
      });
    }
    return {
      reports, 
      departments
    }
  }
}
