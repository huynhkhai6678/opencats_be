import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from 'generated/prisma';
import { CONSTANTS } from '../constants';
import { PrismaService } from '../prisma/prisma.service';
import { REQUEST } from '@nestjs/core';

@Injectable()
export class ExternalCandidateApiService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REQUEST) private readonly request: any,
    private readonly configService : ConfigService
  ) {}
  
  async getMyCandidates() {
    const user = this.request.user;
    const candidates = await this.prisma.candidate.findMany({
      where: {
        entered_by: user.id,
        source_type: 1,
      },
      orderBy: [
        { last_name: 'asc' },
        { first_name: 'desc' },
      ]
    });

    const candidateIds = candidates.map((candidate) => candidate.candidate_id);
    const companyHistories = await this.prisma.candidate_joborder.findMany({
      where: {
        candidate_id: {
          in: candidateIds,
        },
      },
      select: {
        candidate : {
          select : {
            candidate_id : true
          }
        },
        joborder : {
          select : {
            company : {
              select : {
                name: true
              }
            }
          }
        }
      },
    });

    return {
      data: candidates.map((candidate) => {
        return { 
          candidateID: candidate.candidate_id,
          company: this.getCompany(candidate, companyHistories),
          dateCreated: candidate.date_created,
          dateCreatedSort: candidate.date_created,
          dateModified: candidate.date_modified,
          desiredWorkLocation: candidate.desired_work_location,
          email1: candidate.email1,
          firstName: candidate.first_name,
          fullName : candidate.full_name,
          isHot: candidate.is_hot,
          keySkills: candidate.key_skills,
          lastName: candidate.last_name,
          phoneCell: candidate.phone_cell,
          phoneHome: candidate.phone_home
        }
      }),
      message: "Request Success",
      result: 0
    }
  }

  getCompany(candidate: any, companies : any) {
    const companyName : string[] = [];
    companies.forEach((company : any) => {
      if (company.candidate.candidate_id === candidate.candidate_id) {
        companyName.push(company.joborder.company.name);
      }
    });
    return companyName;
  }
}
