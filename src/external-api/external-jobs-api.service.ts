import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from 'generated/prisma';
import { CONSTANTS } from '../constants';
import { PrismaService } from '../prisma/prisma.service';
import { REQUEST } from '@nestjs/core';

@Injectable()
export class ExternalJobsApiService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REQUEST) private readonly request: any,
    private readonly configService : ConfigService
  ) {}

  async getAllJobs(status, userID = -1, companyID = -1, contactID = -1, onlyHot = false, onlyPublic = false, allowAdministrativeHidden = false) {
    const jobs = await this.prisma.joborder.findMany({
      where: {
        site_id: 1,
        status: (() => {
          switch (status) {
            case CONSTANTS.JOBORDERS_STATUS_ACTIVE:
              return 'Active';
            case CONSTANTS.JOBORDERS_STATUS_ONHOLDFULL:
              return { in: ['OnHold', 'Full'] };
            case CONSTANTS.JOBORDERS_STATUS_ACTIVEONHOLDFULL:
              return { in: ['Active', 'OnHold', 'Full'] };
            case CONSTANTS.JOBORDERS_STATUS_CLOSED:
              return 'Closed';
            default:
              return undefined;
          }
        })(),
        company_id: companyID >= 0 ? companyID : undefined,
        contact_id: contactID >= 0 ? contactID : undefined,
        is_hot: onlyHot ? 1 : undefined,
        public: onlyPublic ? 1 : undefined,
        is_admin_hidden: allowAdministrativeHidden ? undefined : 0,
      },
      include: {
        company: {
          select: {
            name: true,
            company_id: true,
            logo: true,
          },
        },
      },
      orderBy: [
        { date_created: 'asc' }
      ],
    });

    return jobs.map(job => {
      return {
        jobOrderID: job.joborder_id,
        jobID: "",
        title: job.title,
        briefDescription: job.brief_description,
        jobDescription: job.description,
        type: job.type,
        isHot: job.is_hot,
        openings: job.openings,
        openingsAvailable: job.openings_available,
        duration: job.duration,
        city: job.city,
        state: job.state,
        status: job.status,
        maxRate: job.rate_max,
        salary: job.salary,
        companyName: job.company?.name,
        companyID: job.company_id,
        companyLogo: job.company?.logo,
        jobCategory: job.job_category,
        startDate: job.start_date,
        dateCreated: job.date_created,
        dateModified: job.date_created,
        isAdminHidden: job.is_admin_hidden,
        dateCreatedSort: job.date_created,
        commission : userID >= 0 ? job.commission : null 
      }
    });
  }

  async searchJob(keywords  = "", type = "", location = "", userId = -1) {
    const jobs = await this.prisma.joborder.findMany({
      where: {
        site_id: 1,
        job_category: type != '' ? type : undefined,
        city: location != '' ? location : undefined,
        title: keywords != '' ? keywords : undefined,
      },
      include: {
        company: {
          select: {
            name: true,
            company_id: true,
            logo: true,
          },
        }
      },
      orderBy: [
        { date_created: 'asc' },
        { date_created: 'desc' },
      ],
    });

    return jobs.map(job => {
      return {
        jobOrderID: job.joborder_id,
        jobID: "",
        title: job.title,
        briefDescription: job.brief_description,
        jobDescription: job.description,
        type: job.type,
        isHot: job.is_hot,
        openings: job.openings,
        openingsAvailable: job.openings_available,
        duration: job.duration,
        city: job.city,
        state: job.state,
        status: job.status,
        maxRate: job.rate_max,
        salary: job.salary,
        companyName: job.company?.name,
        companyID: job.company_id,
        companyLogo: job.company?.logo,
        jobCategory: job.job_category,
        startDate: job.start_date,
        dateCreated: job.date_created,
        dateModified: job.date_created,
        isAdminHidden: job.is_admin_hidden,
        dateCreatedSort: job.date_created,
        commission: userId >= 0 ? job.commission : null
      }
    });
  }

  async getMyJob() {
    const user = this.request.user;
    const userId = (user && user.type === 1) ? 1 : -1;
    return {
      data : await this.getMyFavoriteJob(user.id),
      message: "Request Success",
      result: 0
    }
  }

  async getJobDetail(jobId : string) {
    const user = this.request.user;
    const jobDetail = await this.getJobOrder(jobId);
    const userId = (user && user.type === 1) ? 1 : -1;
    return {
      data : {
        job_detail : jobDetail,
        related_jobs : await this.searchJob("", jobDetail?.jobCategory, "", userId)
      },
      message: "Job Detail Success, Good luck",
      result: 0
    }
  }

  async addFavoriteJob(jobId : number) {
    const user = this.request.user;
    await this.prisma.joborder_favorite.create({
      data : {
        user_id : user.id,
        joborder_id: jobId
      }
    });

    return {
      message: "Request Success",
      result: 0
    }
  }

  async removeFavoriteJob(jobId : number) {
    const user = this.request.user;
    await this.prisma.joborder_favorite.deleteMany({
      where : {
        user_id : user.id,
        joborder_id: jobId
      }
    });

    return {
      message: "Request Success",
      result: 0
    }
  }

  async getJobOrder(jobId : string) {
   const data = await this.prisma.$queryRaw<
    Array<{}>
    >(Prisma.sql`
      SELECT
        joborder.joborder_id AS jobOrderID,
        joborder.company_id AS companyID,
        company.name AS companyName,
        company.logo as companyLogo,
        joborder.contact_id AS contactID,
        joborder.client_job_id AS companyJobID,
        joborder.title AS title,
        joborder.brief_description AS briefDescription,
        joborder.description AS description,
        joborder.type AS type,
        joborder.is_hot AS isHot,
        joborder.openings AS openings,
        joborder.openings_available AS openingsAvailable,
        joborder.notes AS notes,
        joborder.duration AS duration,
        joborder.rate_max AS maxRate,
        joborder.salary AS salary,
        joborder.commission AS commission,
        joborder.job_category as jobCategory,
        joborder.status AS status,
        joborder.city AS city,
        joborder.state AS state,
        joborder.recruiter AS recruiter,
        joborder.owner AS owner,
        joborder.public AS public,
        joborder.questionnaire_id as questionnaireID,
        joborder.is_admin_hidden AS isAdminHidden,
        company_department.name AS department,
        CONCAT(
            contact.first_name, ' ', contact.last_name
        ) AS contactFullName,
        contact.phone_work AS contactWorkPhone,
        contact.email1 AS contactEmail,
        CONCAT(
            recruiter_user.first_name, ' ', recruiter_user.last_name
        ) AS recruiterFullName,
        CONCAT(
            entered_by_user.first_name, ' ', entered_by_user.last_name
        ) AS enteredByFullName,
        CONCAT(
            owner_user.first_name, ' ', owner_user.last_name
        ) AS ownerFullName,
        owner_user.email AS owner_email,
        recruiter_user.email AS recruiter_email,
        joborder.start_date AS startDate,
        DATEDIFF(
            NOW(), joborder.date_created
        ) AS daysOld,
        joborder.date_created AS dateCreated,
        joborder.date_modified AS dateModified,
        COUNT(
            candidate_joborder.joborder_id
        ) AS pipeline,
        (
            SELECT
                COUNT(*)
            FROM
                candidate_joborder_status_history
            WHERE
                joborder_id = ${jobId}
            AND
                status_to = ${CONSTANTS.PIPELINE_STATUS_SUBMITTED}
        ) AS submitted,
        company.name AS companyName
      FROM
          joborder
      LEFT JOIN company
          ON joborder.company_id = company.company_id
      LEFT JOIN contact
          ON joborder.contact_id = contact.contact_id
      LEFT JOIN user AS recruiter_user
          ON joborder.recruiter = recruiter_user.user_id
      LEFT JOIN user AS owner_user
          ON joborder.owner = owner_user.user_id
      LEFT JOIN user AS entered_by_user
          ON joborder.entered_by = entered_by_user.user_id
      LEFT JOIN candidate_joborder
          ON joborder.joborder_id = candidate_joborder.joborder_id
      LEFT JOIN company_department
          ON joborder.company_department_id = company_department.company_department_id
      WHERE
          joborder.joborder_id = ${jobId}
      GROUP BY
          joborder.joborder_id
    `);

    const returnData : any = data[0];

    //Get job description
    const id = jobId.split('-')[0];
    const attachement = await this.prisma.attachment.findFirst({
      where : {
        data_item_type : CONSTANTS.DATA_ITEM_JOBORDER,
        data_item_id : parseInt(id)
      },
      orderBy : {
        date_created : 'desc'
      }
    });

    let jdDownload = '';
    if (attachement) {
      // Fix me
      jdDownload = `${this.configService.get<string>('WEB_URL')} `;
    }

    return {
      ...returnData,
      submitted: parseInt(returnData?.submitted || 0),
      pipeline: parseInt(returnData?.pipeline || 0),
      daysOld : parseInt(returnData.daysOld || 0),
      jddownload: jdDownload
    };
  }

  async getMyFavoriteJob(userId : number) {
   const data = await this.prisma.$queryRaw<
    Array<{}>
    >(Prisma.sql`
      SELECT
        joborder.joborder_id AS jobOrderID
      FROM
        joborder
			INNER JOIN joborder_favorite
        ON joborder.joborder_id=joborder_favorite.joborder_id
      WHERE
        joborder_favorite.user_id = ${userId}
    `);

    return data;
  }
}
