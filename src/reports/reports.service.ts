import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Prisma } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REQUEST) private readonly request: any,
  ) {}
  
  async findAll() {
    return {
      data : {
        company: this.formatData(await this.getCompanyReport()),
        joborder: this.formatData(await this.getJoborderReport()),
        candidate: this.formatData(await this.getCadidateReport()),
        contact: this.formatData(await this.getContactReport()),
        submission: this.formatData(await this.getSubmissionReport()),
        placement: this.formatData(await this.getPlacementReport())
      }
    }
  }

  async getSubmissionReport() {
    const data = await this.prisma.$queryRaw<
      Array<any>
    >(Prisma.sql`
      SELECT
        COUNT(*) AS total,
        SUM(DATE(date) = CURDATE()) AS today,
        SUM(DATE(date) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)) AS yesterday,
        SUM(YEARWEEK(date) = YEARWEEK(NOW())) AS thisWeek,
        SUM(YEARWEEK(date) = YEARWEEK(DATE_SUB(CURDATE(), INTERVAL 7 DAY))) AS lastWeek,
        SUM(EXTRACT(YEAR_MONTH FROM date) = EXTRACT(YEAR_MONTH FROM CURDATE())) AS thisMonth,
        SUM(EXTRACT(YEAR_MONTH FROM date) = EXTRACT(YEAR_MONTH FROM DATE_SUB(CURDATE(), INTERVAL 1 MONTH))) AS lastMonth,
        SUM(YEAR(date) = YEAR(NOW())) AS thisYear,
        SUM(YEAR(date) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 YEAR))) AS lastYear
      FROM
        candidate_joborder_status_history
      LEFT JOIN joborder
        ON joborder.joborder_id = candidate_joborder_status_history.joborder_id
      WHERE
        status_to = 400
      AND
        joborder.status IN ('Active', 'OnHold', 'Full', 'Closed')
    `);

    return data[0];
  }

  async getPlacementReport() {
    const data = await this.prisma.$queryRaw<
      Array<any>
    >(Prisma.sql`
      SELECT
        COUNT(*) AS total,
        SUM(DATE(date) = CURDATE()) AS today,
        SUM(DATE(date) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)) AS yesterday,
        SUM(YEARWEEK(date) = YEARWEEK(NOW())) AS thisWeek,
        SUM(YEARWEEK(date) = YEARWEEK(DATE_SUB(CURDATE(), INTERVAL 7 DAY))) AS lastWeek,
        SUM(EXTRACT(YEAR_MONTH FROM date) = EXTRACT(YEAR_MONTH FROM CURDATE())) AS thisMonth,
        SUM(EXTRACT(YEAR_MONTH FROM date) = EXTRACT(YEAR_MONTH FROM DATE_SUB(CURDATE(), INTERVAL 1 MONTH))) AS lastMonth,
        SUM(YEAR(date) = YEAR(NOW())) AS thisYear,
        SUM(YEAR(date) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 YEAR))) AS lastYear
     FROM
        candidate_joborder_status_history
      WHERE
        status_to = 800
    `);

    return data[0];
  }

  async getCompanyReport() {
    const data = await this.prisma.$queryRaw<
      Array<any>
    >(Prisma.sql`
      SELECT
        COUNT(*) AS total,
        SUM(DATE(date_created) = CURDATE()) AS today,
        SUM(DATE(date_created) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)) AS yesterday,
        SUM(YEARWEEK(date_created) = YEARWEEK(NOW())) AS thisWeek,
        SUM(YEARWEEK(date_created) = YEARWEEK(DATE_SUB(CURDATE(), INTERVAL 7 DAY))) AS lastWeek,
        SUM(EXTRACT(YEAR_MONTH FROM date_created) = EXTRACT(YEAR_MONTH FROM CURDATE())) AS thisMonth,
        SUM(EXTRACT(YEAR_MONTH FROM date_created) = EXTRACT(YEAR_MONTH FROM DATE_SUB(CURDATE(), INTERVAL 1 MONTH))) AS lastMonth,
        SUM(YEAR(date_created) = YEAR(NOW())) AS thisYear,
        SUM(YEAR(date_created) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 YEAR))) AS lastYear
      FROM
        company
    `);

    return data[0];
  }

  async getCadidateReport() {
    const data = await this.prisma.$queryRaw<
      Array<any>
    >(Prisma.sql`
      SELECT
        COUNT(*) AS total,
        SUM(DATE(date_created) = CURDATE()) AS today,
        SUM(DATE(date_created) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)) AS yesterday,
        SUM(YEARWEEK(date_created) = YEARWEEK(NOW())) AS thisWeek,
        SUM(YEARWEEK(date_created) = YEARWEEK(DATE_SUB(CURDATE(), INTERVAL 7 DAY))) AS lastWeek,
        SUM(EXTRACT(YEAR_MONTH FROM date_created) = EXTRACT(YEAR_MONTH FROM CURDATE())) AS thisMonth,
        SUM(EXTRACT(YEAR_MONTH FROM date_created) = EXTRACT(YEAR_MONTH FROM DATE_SUB(CURDATE(), INTERVAL 1 MONTH))) AS lastMonth,
        SUM(YEAR(date_created) = YEAR(NOW())) AS thisYear,
        SUM(YEAR(date_created) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 YEAR))) AS lastYear
      FROM
        candidate
    `);

    return data[0];
  }

   async getContactReport() {
    const data = await this.prisma.$queryRaw<
      Array<any>
    >(Prisma.sql`
      SELECT
        COUNT(*) AS total,
        SUM(DATE(date_created) = CURDATE()) AS today,
        SUM(DATE(date_created) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)) AS yesterday,
        SUM(YEARWEEK(date_created) = YEARWEEK(NOW())) AS thisWeek,
        SUM(YEARWEEK(date_created) = YEARWEEK(DATE_SUB(CURDATE(), INTERVAL 7 DAY))) AS lastWeek,
        SUM(EXTRACT(YEAR_MONTH FROM date_created) = EXTRACT(YEAR_MONTH FROM CURDATE())) AS thisMonth,
        SUM(EXTRACT(YEAR_MONTH FROM date_created) = EXTRACT(YEAR_MONTH FROM DATE_SUB(CURDATE(), INTERVAL 1 MONTH))) AS lastMonth,
        SUM(YEAR(date_created) = YEAR(NOW())) AS thisYear,
        SUM(YEAR(date_created) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 YEAR))) AS lastYear
      FROM
        contact
    `);

    return data[0];
  }

  private async getJoborderReport() {
    const data = await this.prisma.$queryRaw<
      Array<any>
    >(Prisma.sql`
      SELECT
        COUNT(*) AS total,
        SUM(DATE(date_created) = CURDATE()) AS today,
        SUM(DATE(date_created) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)) AS yesterday,
        SUM(YEARWEEK(date_created) = YEARWEEK(NOW())) AS thisWeek,
        SUM(YEARWEEK(date_created) = YEARWEEK(DATE_SUB(CURDATE(), INTERVAL 7 DAY))) AS lastWeek,
        SUM(EXTRACT(YEAR_MONTH FROM date_created) = EXTRACT(YEAR_MONTH FROM CURDATE())) AS thisMonth,
        SUM(EXTRACT(YEAR_MONTH FROM date_created) = EXTRACT(YEAR_MONTH FROM DATE_SUB(CURDATE(), INTERVAL 1 MONTH))) AS lastMonth,
        SUM(YEAR(date_created) = YEAR(NOW())) AS thisYear,
        SUM(YEAR(date_created) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 YEAR))) AS lastYear
      FROM
        joborder
    `);

    return data[0];
  }

  private formatData(data: any) {
    return {
      'toDate': Number(data.total),
      'today': Number(data.today),
      'lastYear': Number(data.lastYear),
      'lastMonth': Number(data.lastMonth),
      'lastWeek': Number(data.lastWeek),
      'yesterday': Number(data.yesterday),
      'thisYear': Number(data.thisYear),
      'thisMonth': Number(data.thisMonth),
      'thisWeek': Number(data.thisWeek),
    }
  }
}
