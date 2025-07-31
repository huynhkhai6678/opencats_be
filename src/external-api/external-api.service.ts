import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';
import { ExternalJobsApiService } from './external-jobs-api.service';
import { Prisma } from 'generated/prisma';

@Injectable()
export class ExternalApiService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly jobApiService: ExternalJobsApiService,
    @Inject(REQUEST) private readonly request: any,
  ) {}

  async homeApi() {
    const user = this.request.user;
    const userId = user && user.type === 1 ? 1: -1;
    return {
      data : {
        hotjobs : await this.jobApiService.getAllJobs(100, userId,-1,-1,true,true,false),
        trending_keywords: [
          "Account Manager",
          "Administrative",
          "Android",
          "Angular",
          "appASP.NET"
        ],
        cities: await this.prisma.joborder.groupBy({
          by: ['city'],
        }),
        types : {
          'C' : 'Project/Contract',
          'FT' : 'Full-time',
          'FTR' : 'Full-time Remote',
          'PT' : 'Part-time'
        },
        job_categories : await this.prisma.job_categories.findMany({
          select : {
            job_category_id: true,
            job_category_name: true
          },
          orderBy : {
            display_order : 'asc'
          }
        }),
        fulljobs : await this.jobApiService.getAllJobs(100, userId,-1,-1,false,true,false),
        reviews: await this.prisma.user_review.findMany()
      },
      message: "this is sample of home message",
      result: 0
    }
  }

  async confirmJob(body: {tokenID : string}) {
    const pipeline = await this.getPipelineByCode(body.tokenID);
    if (!pipeline) {
      throw new NotFoundException('Token is invalid');
    }

    return {
      result: 0,
      message: "Request Success",
      data: {
        confirm_id: pipeline.candidate_confirm_key,
        candidateName: pipeline.candidate?.full_name,
        companyName: pipeline.joborder?.company?.name,
        jobOrderID: pipeline.joborder_id,
        title: pipeline.joborder?.title,
        desiredPay: pipeline.candidate?.desired_pay,
        dateAvail: pipeline.candidate?.date_available,
        jobBriefDescription: pipeline.joborder?.brief_description,
        jobDescription: pipeline.joborder?.description
      }
    }
  }

  async confirmJobRequest(body: {tokenID : string, confirm_id: string}) {
    const pipeline = await this.getPipelineByCode(body.tokenID);
    if (!pipeline) {
      throw new NotFoundException('Token is invalid');
    }

    const confirmId = parseInt(body.confirm_id);
    if (confirmId != pipeline.candidate_joborder_id) {
      throw new NotFoundException('Confirm id is invalid');
    }

    // Update status
    await this.prisma.candidate_joborder.update({
      where : {
        candidate_joborder_id : confirmId
      },
      data : {
        candidate_confirm_status : true,
        candidate_confirm_date : new Date(),
      }
    });

    return {
      message: "Request Success",
      result: 0,
      data : {
        hotJobs : await this.jobApiService.getAllJobs(100,-1,-1,-1,true,true,false),
        sameJobs : await this.jobApiService.searchJob(pipeline.joborder?.title)
      }
    }
  }

  async getPipelineByCode(code : string) {
    return await this.prisma.candidate_joborder.findFirst({
      where : {
        candidate_confirm_key : code
      },
      include : {
        candidate : true,
        joborder: {
          include : {
            company: true
          }
        }
      }
    });
  }

  async createSubscription(email : string) {
    const sub = await this.prisma.subscription.findFirst({
      where : {
        email
      },
    });

    if (!sub) {
      await this.prisma.subscription.create({
        data : {
          email
        },
      });
    }

    return {
      message: "Request Success",
      result: 0
    }
  }

  async getDashboard() {
    const user = this.request.user;
    const systemDashboard = await this.prisma.system_dashboard.findFirst();
    const headhuntDashboard = await this.prisma.headhunt_dashboard.findFirst({
      where : {
        headhunt_id :user.id
      }
    })

    let placementPlace = 0;
    let avgCommissionRate = 0;
    let noSubmitted = 0;
    let noInterViewed = 0;
    let noOffered = 0;
    let noPlaced = 0;
    let noSubmittedPercent = 0;
    let noInterViewedPercent = 0;
    let noOfferedPercent = 0;
    let noPlacedPercent = 0;
    if (headhuntDashboard) {
      placementPlace = (headhuntDashboard.placed_candidate / headhuntDashboard.applied_candidate) * 100;
      avgCommissionRate = headhuntDashboard.total_commission / headhuntDashboard.placed_candidate;
      noSubmitted = headhuntDashboard.no_submitted;
      noInterViewed = headhuntDashboard.no_interviewed;
      noOffered = headhuntDashboard.no_offered;
      noPlaced = headhuntDashboard.no_placed;

      noSubmittedPercent = 100;
      noInterViewedPercent= (noInterViewed/noSubmitted)*100;
      noOfferedPercent= (noOffered/noSubmitted)*100;
      noPlacedPercent= (noPlaced/noSubmitted)*100;
    }

    let recruitmentFunnel = [
      {
        'label': 'CVs Submitted',
        'qty' : noSubmitted,
        'percent' : '100%' 
      },
      {
        'label': 'Interviewed',
        'qty' : noInterViewed,
        'percent' : noInterViewedPercent.toString()  + '%' 
      },
      {
        'label': 'Offered',
        'qty' : noOffered,
        'percent' : noOfferedPercent.toString() + '%' 
      },
      {
        'label': 'Placed',
        'qty' : noPlaced,
        'percent' : noPlacedPercent.toString() + '%' 
      }
    ];

    // Fake data now
    let placeCandidates = [
      {
        full_name : 'Jack Daniels',
        placed_date : new Date(),
        company : 'Dtalent',
        role : 'Senior Android Dev',
        total_comission : 10000000,
        paid_commission : 5000000
      },
      {
        full_name : 'Jack Daniels 1',
        placed_date : new Date(),
        company : 'Dtalent',
        role : 'Senior Android Dev',
        total_comission : 10000000,
        paid_commission : 5000000
      },
       {
        full_name : 'Jack Daniels 2',
        placed_date : new Date(),
        company : 'Dtalent',
        role : 'Senior Android Dev',
        total_comission : 10000000,
        paid_commission : 5000000
      },
    ]

    return {
      data : {
        open_position : {
          label : 'Open Jobs',
          amount : systemDashboard?.open_jobs
        },
        new_roles : {
          label : 'New Jobs',
          amount : systemDashboard?.new_jobs
        },
        total_roles : {
          label : 'Total Jobs',
          amount : systemDashboard?.total_jobs
        },
        candidates_placed : {
          label : 'Candidates Placed',
          amount : headhuntDashboard?.placed_candidate
        },
        placement_rate : {
          label : 'Placement Rate',
          amount : placementPlace
        },
        total_commission : {
          label : 'Total Commission',
          amount : headhuntDashboard?.total_commission
        },
        avg_commission_rate : {
          label : 'Average Commission Rate',
          amount : avgCommissionRate
        },
        active_candidates : {
          label : 'Active Candidates',
          amount : headhuntDashboard?.active_candidate
        },
        avg_day_to_hire : {
          label : 'Days to Hire',
          amount : headhuntDashboard?.day_to_hire
        },
        recruitment_funnel : recruitmentFunnel,
        place_candidates : placeCandidates,
        calendar : await this.getUpcomingEventsByHeadHunt(user.id),
        active_jobs : await this.jobApiService.getAllJobs(100, user.id, - 1, - 1, true, true, false)
      },
      message: "Request Success",
      result: 0
    }
  }

  async getUpcomingEventsByHeadHunt(headhuntId : number) {
    const data = await this.prisma.$queryRaw<
      Array<{}>
        >(Prisma.sql`
          SELECT
           calendar_event.calendar_event_id AS eventID,
          calendar_event.title AS title,
          calendar_event.all_day AS allDay,
          calendar_event.description AS description,
          calendar_event.public AS public,
          calendar_event.date AS dateShow,
          calendar_event.date AS day,
          calendar_event.date AS month,
          calendar_event.date AS year,
          calendar_event.date AS dateSort,
          calendar_event_type.short_description AS type,
    			candidate.full_name as candidate_full_name
          FROM
            calendar_event
          LEFT JOIN user AS entered_by_user
            ON calendar_event.entered_by = entered_by_user.user_id
          LEFT JOIN calendar_event_type
            ON calendar_event.type = calendar_event_type.calendar_event_type_id
    		  LEFT JOIN candidate
    			  ON calendar_event.data_item_id=candidate.candidate_id
          WHERE candidate.owner = ${Prisma.sql([headhuntId.toString()])}
          AND calendar_event.data_item_type=100
    		  AND candidate.source_type=1
          ORDER BY dateSort ASC
        `);

    return data;
  }

}
