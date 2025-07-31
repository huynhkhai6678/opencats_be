import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from 'generated/prisma';
import { CONSTANTS } from '../constants';
import { PrismaService } from '../prisma/prisma.service';
import { REQUEST } from '@nestjs/core';

@Injectable()
export class ExternalPipelineApiService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REQUEST) private readonly request: any,
    private readonly configService : ConfigService
  ) {}

  async getCandidatePipelines() {
    const user = this.request.user;
    const candidate = await this.getCandidateByUserID(user.id);
    if (candidate) {
      return {
        data: await this.getCandidatePipeline(candidate.candidate_id), 
        code: 0,
        message: 'Request Success'
      }
    } else {
      return {
        code: 1,
        message: 'Invalid verification code!'
      }
    }
  }

  async getOwnerPipeline() {
    const user = this.request.user;
    return {
      data: await this.getAllByOwner(user.id), 
      code: 0,
      message: 'Request Success'
    }
  }

  async getOwnerPlace() {
    const user = this.request.user;
    return {
      data: await this.getAllByOwner(user.id, true), 
      code: 0,
      message: 'Request Success'
    }
  }

  async getAllByOwner(ownerId : number , isPlaced = false) {
    const placeCondition = isPlaced
    ? Prisma.sql` AND candidate_joborder_status.candidate_joborder_status_id = 800 `
    : Prisma.sql``;

    const data = await this.prisma.$queryRaw<
      Array<{}>
        >(Prisma.sql`
          SELECT
            candidate_joborder.candidate_joborder_id as candidateJobOrderID,
            company.company_id AS companyID,
            company.name AS companyName,
            joborder.joborder_id AS jobOrderID,
            joborder.title AS title,
            joborder.type AS type,
            joborder.duration AS duration,
            joborder.rate_max AS maxRate,
            joborder.status AS jobOrderStatus,
            joborder.salary AS salary,
            joborder.is_hot AS isHot,
            joborder.openings AS openings,
    			  activity.notes,
            joborder.openings_available AS openingsAvailable,
            joborder.start_date AS start_date,
            candidate_joborder.date_modified AS dateCreated,
    			  candidate.full_name as candidateName,
            candidate.candidate_id AS candidateID,
            candidate.email1 AS candidateEmail,
            candidate.desired_work_location AS desiredWorkLocation,
            candidate_joborder_status.candidate_joborder_status_id AS statusID,
            candidate_joborder_status.short_description AS status,
            owner_user.name AS ownerFullName
          FROM
              candidate_joborder
          LEFT JOIN candidate
              ON candidate_joborder.candidate_id = candidate.candidate_id
          LEFT JOIN joborder
              ON candidate_joborder.joborder_id = joborder.joborder_id
          LEFT JOIN company
              ON company.company_id = joborder.company_id
          LEFT JOIN external_users AS owner_user
              ON joborder.entered_by = owner_user.id
          LEFT JOIN candidate_joborder_status
              ON candidate_joborder.status = candidate_joborder_status.candidate_joborder_status_id
          LEFT JOIN activity
            ON candidate_joborder.joborder_id=activity.joborder_id AND candidate_joborder.candidate_id=data_item_id
          WHERE
            candidate.source_type=1
          AND
            candidate.entered_by = ${Prisma.sql([ownerId.toString()])}
          AND 
            activity.home_display=1
          ${placeCondition}
          ORDER BY candidate_joborder.date_modified DESC
        `);

    return data;
  }

  async getCandidatePipeline(candidateId : number){
    const data = await this.prisma.$queryRaw<
      Array<{}>
        >(Prisma.sql`
          SELECT
            company.company_id AS companyID,
            company.name AS companyName,
            joborder.joborder_id AS jobOrderID,
            joborder.title AS title,
            joborder.type AS type,
            joborder.duration AS duration,
            joborder.rate_max AS maxRate,
            joborder.status AS jobOrderStatus,
            joborder.salary AS salary,
            joborder.is_hot AS isHot,
            joborder.start_date AS start_date,
            joborder.date_created AS dateCreated,
            candidate.candidate_id AS candidateID,
            candidate.email1 AS candidateEmail,
            candidate_joborder_status.candidate_joborder_status_id AS statusID,
            candidate_joborder_status.short_description AS status,
            candidate_joborder.candidate_joborder_id AS candidateJobOrderID,
            candidate_joborder.rating_value AS ratingValue,
            owner_user.first_name AS ownerFirstName,
            owner_user.last_name AS ownerLastName,
            added_user.first_name AS addedByFirstName,
            added_user.last_name AS addedByLastName
          FROM
              candidate_joborder
          INNER JOIN candidate
              ON candidate_joborder.candidate_id = candidate.candidate_id
          INNER JOIN joborder
              ON candidate_joborder.joborder_id = joborder.joborder_id
          INNER JOIN company
              ON company.company_id = joborder.company_id
          LEFT JOIN user AS owner_user
              ON joborder.owner = owner_user.user_id
          LEFT JOIN user AS added_user
              ON candidate_joborder.added_by = added_user.user_id
          INNER JOIN candidate_joborder_status
              ON candidate_joborder.status = candidate_joborder_status.candidate_joborder_status_id
          WHERE
            candidate.candidate_id = ${Prisma.sql([candidateId.toString()])}
        `);

    return data
  } 

  async getCandidateByUserID(userId : number){
    return await this.prisma.candidate.findFirst({
      where : {
        entered_by : userId,
        source_type : 2
      }
    })
  } 
}
