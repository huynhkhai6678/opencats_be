import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { REQUEST } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';
import { contact, Prisma, saved_list } from 'generated/prisma';
import { generateEmailFooter } from 'src/utils/email-util';
import { SendEmailDto } from './dto/send-email.dto';
import { KafkaDelayService } from '../services/kafka-delay.service';
import { CONSTANTS } from 'src/constants';

@Injectable()
export class ListsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly delayService: KafkaDelayService,
    @Inject(REQUEST) private readonly request: any,
  ) {}

  async create(createListDto: CreateListDto) {
    const user = this.request.user;
    const { data_item_type, description, entries } = createListDto;
    const now = new Date();

    await this.prisma.saved_list.create({
      data: {
        description,
        data_item_type,
        site_id: 1,
        created_by: user.user_id,
        date_created: now,
        number_entries: entries.length,
        entries: {
          create: entries.map(data_item_id => ({
            data_item_id,
            data_item_type,
            site_id : 1,
            date_created: now
          }))
        }
      },
      include: {
        entries: true
      }
    });

    return {
      message: 'List created succesfully'
    };
  }

  async findAll(query : any) {
    const {
      sortField = 'saved_list_id',
      sortOrder = 'asc',
      filter,
    } = query;
  
    const page = Number(query.page) || 0;
    const size = Number(query.size) || 10;

    const offset = page * size;
    const limit = size;

    const allowedSortFields = ['number_entries', 'description', 'type', 'is_dynamic'];
    const allowedSortOrders = ['asc', 'desc'];

    // Default to 'company_id' and 'asc' if invalid input
    const safeSortField = allowedSortFields.includes(sortField) ? sortField : 'saved_list_id';
    const safeSortOrder = allowedSortOrders.includes(sortOrder.toLowerCase()) ? sortOrder.toLowerCase() : 'asc';

    const whereClause = filter
    ? Prisma.sql`WHERE (saved_list.description LIKE ${'%' + filter + '%'})`
    : Prisma.empty;

    const data = await this.prisma.$queryRaw<
      Array<{
        parameters: string;
        datagrid_instance: string;
        is_dynamic: number;
        number_entries: number;
        owner: string | null;
        saved_list_id: number;
        type: string;
      }>
    >(Prisma.sql`
      SELECT
        saved_list.*,
        CONCAT(owner_user.first_name, ' ', owner_user.last_name) AS owner,
        data_item_type.short_description as type
      FROM saved_list
      LEFT JOIN user AS owner_user ON saved_list.created_by = owner_user.user_id
      LEFT JOIN data_item_type ON data_item_type.data_item_type_id = saved_list.data_item_type
      ${whereClause}
      GROUP BY saved_list.saved_list_id
      ORDER BY ${Prisma.raw(safeSortField)} ${Prisma.raw(safeSortOrder)}
      LIMIT ${limit} OFFSET ${offset};
    `);

    const [{ total }] = await this.prisma.$queryRaw<{ total: number }[]>(Prisma.sql`
      SELECT COUNT(*) AS total
      FROM saved_list
    `);
    
    return { data, total: Number(total) };
  }

  async findOne(id: number) {
    return {
      data : await this.prisma.saved_list.findFirst({
        where : {
          saved_list_id : id
        }
      }),
      options : await this.prisma.data_item_type.findMany()
    }
  }

  async findItem(id: number) {
    let data : any[] = [];
    switch(id) {
      case 100 :
        data = await this.prisma.$queryRaw`
          SELECT candidate_id AS value, full_name AS label FROM candidate
        `;
        break;
      case 200 :
        data = await this.prisma.$queryRaw`
          SELECT company_id AS value, name AS label FROM company
        `;
        break;

      case 300 :
        data = await this.prisma.$queryRaw`
          SELECT contact_id AS value, 
          CONCAT(contact.first_name, ' ',contact.last_name) AS label FROM contact
        `;
        break;

      case 400 :
        data = await this.prisma.$queryRaw`
          SELECT joborder_id AS value, title AS label FROM joborder
        `;
        break;
    }
 
    return {
      data
    }
  }

  async update(id: number, updateListDto: UpdateListDto) {
    const user = this.request.user;
    const contact = await this.prisma.saved_list.findFirst({
      where: {
        saved_list_id: id,
      },
    })
    
    if (!contact) {
      throw new NotFoundException('This List not existed');
    }

    const { data_item_type, description, entries } = updateListDto;
    const now = new Date();

    await this.prisma.$transaction([
      this.prisma.saved_list.update({
        where: { saved_list_id: id },
        data: { entries: { deleteMany: {} } }
      }),
      this.prisma.saved_list.update({
        where: { saved_list_id: id },
        data: {
          description,
          data_item_type,
          entries: {
            create: entries?.map(data_item_id => ({
              data_item_id,
              data_item_type,
              site_id: 1,
              date_created: now,
            }))
          }
        }
      })
    ]);

    return {
      message : `Update list successfully`
    };
  }

  async remove(id: number) {
    const contact = await this.prisma.saved_list.findFirst({
      where: {
        saved_list_id: id,
      },
    })
    
    if (!contact) {
      throw new NotFoundException('This List not existed');
    }

    await this.prisma.$transaction([
      this.prisma.saved_list_entry.deleteMany({
        where: { saved_list_id: id }
      }),
      this.prisma.saved_list.delete({
        where: { saved_list_id: id }
      })
    ]);

    return {
      message : `Delete list successfully`
    };
  }

  async findDetail(id: number, query : any) {
    const list = await this.prisma.saved_list.findFirst({
      where: {
        saved_list_id: id,
      },
    })
    
    if (!list) {
      throw new NotFoundException('This List not existed');
    }
 
    return {
      data : list
    };
  }

  async findMarketingEmailToEmployee(saveList: saved_list) {
    const entries = await this.prisma.saved_list.findMany({
      where: {
        data_item_type: CONSTANTS.DATA_ITEM_CONTACT,
      },
    });

    const email = await this.prisma.email_template.findFirst({
      where: {
        tag : 'EMAIL_TEMPLATE_MARKETING_TO_EMPLOYEE'
      }
    });

    if (!email) {
      throw new NotFoundException('Email template not existed');
    }

    const candidates = await this.findCandidateByList(saveList.saved_list_id);
    const baseUrl = "https://dtalent.dev/quote.html";
    let candidateContent = '';
    let i = 1;
    for (const candidate of candidates) {
      candidateContent += `<hr style='color:red'/>`;
      candidateContent += `<H1>Candidate ${i}</H1><b>Title</b>: ${candidate.job_title}<br/>`;
      candidateContent += `<b>Experience: </b>${candidate.exp_years}<br/>`;
      candidateContent += `<b>Summary: </b>${candidate.notes}<br/>`;
      candidateContent += `<h2><a href='${baseUrl}'>CONTACT US</a></h2>`;
      i++;
    }

    const previewContent = `${email.text?.replace('%CANDIDATE_LIST%', candidateContent)} ${generateEmailFooter()}`;
    return { 
      data : {
        description: saveList.description,
        list_id: null,
        email_subject: email?.title || '',
        email_body: previewContent,
      },
      entries,
    };
  }

  async findMarketingEmailToCandidate(saveList: saved_list) {
    const entries = await this.prisma.saved_list.findMany({
      where: {
        data_item_type: CONSTANTS.DATA_ITEM_CANDIDATE,
      },
    });

    const email = await this.prisma.email_template.findFirst({
      where: {
        tag : 'EMAIL_TEMPLATE_MARKETING_TO_CANDIDATE'
      }
    });

    if (!email) {
      throw new NotFoundException('Email template not existed');
    }

    const joborders = await this.findJoborderByList(saveList.saved_list_id);
    const baseUrl = "https://dtalent.dev/jobs/job-details/";
    let jobContent = '';
    let i = 1;
    for (const joborder of joborders) {
      const jobTitle = joborder.title.replace(/ /g, '-');
      const jobUrl = `${baseUrl}${joborder.joborder_id}-${jobTitle.replace(/&/g, '')}`;
      jobContent += `<hr style='color:red'/>`;
      jobContent += `<H1>${joborder.companyName}</H1><H2>${joborder.title}</H2>`;
      jobContent += `<b>Location: </b>${joborder.city}<br/><b>Salary: </b>${joborder.salary}<br/>`;
      jobContent += `<h2><a href='${jobUrl}'>JOB DESCRIPTION</a></h2>`;
      i++;
    }

    const previewContent = `${email.text?.replace('%JOB_LIST%', jobContent)} ${generateEmailFooter()}`;
    return { 
      data : {
        description: saveList.description,
        list_id: null,
        email_subject: email?.title || '',
        email_body: previewContent,
      },
      entries,
    };
  }

  async findEmailData(id: number, type: string) {
    const data = await this.prisma.saved_list.findFirst({
      where: {
        saved_list_id: id,
      },
    });

    if (!data) {
      throw new NotFoundException('This List not existed');
    }

    let response: any = {};
    if (type === 'employee') {
      response = await this.findMarketingEmailToEmployee(data);
    }

    if (type === 'candidate') {
      response = await this.findMarketingEmailToCandidate(data);
    }

    return response;
  }

  async sendEmail(sendEmailDto: SendEmailDto) {
    const data = await this.prisma.saved_list.findFirst({
      where: {
        saved_list_id: sendEmailDto.list_id,
      }
    })
    
    if (!data) {
      throw new NotFoundException('This List not existed');
    }

    if (sendEmailDto.type === 'employee') {
      const contacts = await this.findContactByList(sendEmailDto.list_id);
      for (const contact of contacts) {
        const emailBody = sendEmailDto.email_body.replace('%USERNAME%', `${contact.first_name} ${contact.last_name}`);
        await this.delayService.sendEmail({
          to: contact.email1,
          subject: sendEmailDto.email_subject,
          html: emailBody,
        });
      }
    } else if (sendEmailDto.type === 'candidate') {
      const candidates = await this.findCandidateByList(sendEmailDto.list_id);
      for (const candidate of candidates) {
        const emailBody = sendEmailDto.email_body.replace('%USERNAME%', `${candidate.first_name} ${candidate.last_name}`);
        await this.delayService.sendEmail({
          to: candidate.email1,
          subject: sendEmailDto.email_subject,
          html: emailBody,
        });
      }
    }

    return {
      message: 'Email sent successfully',
    }
  }

  async findCandidateByList(id: number) {
    return await this.prisma.$queryRaw<
      Array<any>
    >(Prisma.sql`
      SELECT
        candidate.*
      FROM candidate
      INNER JOIN saved_list_entry 
        ON saved_list_entry.data_item_id=candidate.candidate_id
      WHERE saved_list_entry.saved_list_id=${id} 
      AND saved_list_entry.data_item_type=100;
    `);
  }

  async findContactByList(id: number) {
    return await this.prisma.$queryRaw<
      Array<any>
    >(Prisma.sql`
      SELECT
        contact.*
      FROM contact
      INNER JOIN saved_list_entry 
        ON saved_list_entry.data_item_id=contact.contact_id
      WHERE saved_list_entry.saved_list_id=${id} 
      AND saved_list_entry.data_item_type=300;
    `);
  }

  async findJoborderByList(id: number) {
    return await this.prisma.$queryRaw<
      Array<any>
    >(Prisma.sql`
      SELECT
        joborder.*,
        company.name AS companyName
      FROM joborder
      INNER JOIN company 
        ON joborder.company_id=company.company_id 
      INNER JOIN saved_list_entry 
        ON saved_list_entry.data_item_id=joborder.joborder_id
      WHERE saved_list_entry.saved_list_id=${id} 
      AND saved_list_entry.data_item_type=400;
    `);
  }
}
