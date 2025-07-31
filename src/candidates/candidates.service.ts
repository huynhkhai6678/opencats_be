import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { PrismaService } from '../prisma/prisma.service';
import { REQUEST } from '@nestjs/core';
import { Prisma } from 'generated/prisma';
import { CandidateSourceService } from '../services/candidate-source.service';
import { AttachmentsService } from '../attachments/attachments.service';
import { CONSTANTS } from '../constants';
import * as md5 from 'md5';
import { CONTAINS } from 'class-validator';

@Injectable()
export class CandidatesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly candidateSoureService: CandidateSourceService,
    private readonly attachmentService: AttachmentsService,
    @Inject(REQUEST) private readonly request: any,
  ) {}
    
  async create(createCandidateDto: CreateCandidateDto, file: Express.Multer.File) {
    const user = this.request.user;

    // Create new candidate source
    if (typeof createCandidateDto.source_id === 'string') {
      const source = await this.candidateSoureService.createSource(createCandidateDto.source_id);
      createCandidateDto['source'] = source.source_id;
    }

    createCandidateDto['site_id'] = 1;
    createCandidateDto['date_created']  = new Date();
    createCandidateDto['date_modified'] = new Date();
    createCandidateDto['owner'] = user.user_id;
    createCandidateDto.full_name = `${createCandidateDto.first_name} ${createCandidateDto.last_name}`

    const candidate = await this.prisma.candidate.create({
      data: createCandidateDto
    });

    // Create attachment
    if (file) {
      await this.attachmentService.create(candidate.candidate_id, CONSTANTS.DATA_ITEM_CANDIDATE, file);
    }

    return {
      message: 'Candidate created succesfully'
    };
  }

  async findAll(query : any) {
    const {
      sortField = 'company_id',
      sortOrder = 'asc',
      filter,
      isMyCompany = query.is_my_company,
      isHotCompany = query.is_hot_company
    } = query;
    const user = this.request.user;
    const page = Number(query.page) || 0;
    const size = Number(query.size) || 10;

    const offset = page * size;
    const limit = size;

    const allowedSortFields = ['full_name', 'key_skills', 'date_modified', 'desired_pay', 'city'];
    const allowedSortOrders = ['asc', 'desc'];

    // Default to 'company_id' and 'asc' if invalid input
    const safeSortField = allowedSortFields.includes(sortField) ? sortField : 'candidate_id';
    const safeSortOrder = allowedSortOrders.includes(sortOrder.toLowerCase()) ? sortOrder.toLowerCase() : 'asc';

    let whereClause = Prisma.empty;
    let conditions : any[] = [];
    if (filter) {
      conditions.push(Prisma.sql`WHERE (candidate.full_name LIKE ${'%' + filter + '%'} 
      OR candidate.key_skills LIKE ${'%' + filter + '%'}
      OR candidate.city LIKE ${'%' + filter + '%'})`);
    }

    if (isMyCompany !== undefined && isMyCompany !== 'false') {
      conditions.push(Prisma.sql`candidate.owner = ${user.user_id}`);
    }

    if (isHotCompany !== undefined && isHotCompany !== 'false') {
      conditions.push(Prisma.sql`candidate.is_hot = 1`);
    }

    // Combine all conditions using AND
    if (conditions.length > 0) {
      whereClause = Prisma.sql`WHERE ${Prisma.join(conditions, ` AND `)}`;
    }

    const data = await this.prisma.$queryRaw<
      Array<{
        candidate_id: number;
        full_name: string;
        key_skills: string;
        date_modified: string;
        city: string;
        attachmentPresent: number;
      }>
    >(Prisma.sql`
      SELECT
        candidate.candidate_id,
        candidate.full_name,
        candidate.key_skills,
        candidate.date_modified,
        candidate.desired_pay,
        candidate.city,
        IF(MAX(attachment.attachment_id), 1, 0) AS attachmentPresent
      FROM candidate
      LEFT JOIN attachment
        ON
        (
          candidate.candidate_id = attachment.data_item_id
          AND attachment.data_item_type = 100
        )
      ${whereClause}
      GROUP BY candidate.candidate_id
      ORDER BY ${Prisma.raw(safeSortField)} ${Prisma.raw(safeSortOrder)}
      LIMIT ${limit} OFFSET ${offset};
    `);

    const [{ total }] = await this.prisma.$queryRaw<{ total: number }[]>(Prisma.sql`
      SELECT COUNT(*) AS total
      FROM candidate
      ${whereClause}
    `);

    data.forEach(item => {
      item.attachmentPresent = Number(item.attachmentPresent);
    });
    
    return { data, total: Number(total) };
  }

  async  findOne(id: number) {
    const data = await this.prisma.candidate.findFirst({ where : { candidate_id : id }});
    const sources = await this.prisma.candidate_source.findMany();

    return {
      data  ,
      sources
    };
  }

  async update(id: number, updateCandidateDto: UpdateCandidateDto) {
    const candidate = await this.prisma.candidate.findFirst({
      where: {
        candidate_id: id,
      },
    })

    if (!candidate) {
      throw new NotFoundException('This contact not existed');
    }

    // Create new candidate source
    if (typeof updateCandidateDto.source_id === 'string') {
      const source = await this.candidateSoureService.createSource(updateCandidateDto.source_id);
      updateCandidateDto['source'] = source.source_id;
    }

    await this.prisma.candidate.update({
      where: {
        candidate_id: id
      },
      data: updateCandidateDto
    });

    return {
      message : `Update Candidate successfully`
    };
  }

  async remove(id: number) {
    const candidate = await this.prisma.candidate.findFirst({
      where: {
        candidate_id: id,
      },
    })

    if (!candidate) {
      throw new NotFoundException('This company not existed');
    }

    await this.prisma.candidate.delete({
      where: {
        candidate_id: id
      },
    });

    // To do remove attachment

    return {
      message : `Delete candidate successfully`
    };
  }

  async findDetail(id: number) {
    const whereClause = Prisma.sql`WHERE candidate.candidate_id = ${id}`;

    const data = await this.prisma.$queryRaw<
      Array<any>
    >(Prisma.sql`
      SELECT
        candidate.*,
        user.first_name AS owner_first_name,
        user.last_name AS owner_last_name,
        COUNT(candidate_joborder.joborder_id) AS pipeline,
        (
          SELECT COUNT(*)
          FROM candidate_joborder_status_history
          WHERE candidate_id = candidate.candidate_id
          AND status_to = 400
        ) AS submitted
      FROM candidate
      LEFT JOIN candidate_joborder
        ON candidate.candidate_id = candidate_joborder.candidate_id
      LEFT JOIN user
        ON user.user_id = candidate.owner
      ${whereClause}
      GROUP BY candidate.candidate_id;
    `);

    return  {
      data : {
        ...data[0],
        submitted : Number(data[0].submitted),
        pipeline : Number(data[0].pipeline),
      }
    }
  }

  async findCandidateAttachment(id: number) {
    const data = await this.prisma.attachment.findMany({
      where : {
        data_item_id: id,
        data_item_type: CONSTANTS.DATA_ITEM_CANDIDATE
      }
    });

    data.forEach(item => {
      item['hash'] = md5(item.directory_name);
    });

    return {
      data,
    }
  }

  async findCandidatePipeline(id: number) {
    const data = await this.prisma.candidate_joborder.findMany({
      where : {
        candidate_id :id
      },
      select : {
        candidate_joborder_id : true,
        candidate_confirm_status: true,
        rating_value: true,
        date_created: true,
        joborder_id: true,
        candidate: {
          select: {
            entered_user: {
              select: {
                name: true
              }
            }
          }
        },
        status_info: {
          select : {
            short_description : true
          }
        },
        joborder : {
          select : {
            title: true,
            company_id: true,
            company : {
              select : {
                name : true,
                company_id: true,
                owner_user : {
                  select : {
                    first_name : true,
                    last_name: true
                  }
                }
              }
            }
          }
        }
      }
    });

    return {
      data,
    }
  }

  async findCandidateActivities(id: number) {
    const data = await this.prisma.activity.findMany({
      where : {
        data_item_id: id,
        data_item_type: CONSTANTS.DATA_ITEM_CANDIDATE
      },
      select : {
        activity_id: true,
        date_created : true,
        notes: true,
        type_info : {
          select : {
            short_description: true
          }
        },
        joborder : {
          select : {
            title: true,
            company_id: true,
            company : {
              select : {
                name: true
              }
            }
          }
        },
        entered_user : {
          select : {
            first_name: true,
            last_name: true
          }
        }
      }
    });

    return {
      data,
    }
  }

  async findCandidateCalendar(id: number) {
    return {
      data : await this.prisma.calendar_event.findMany({
        where : {
          data_item_type : CONSTANTS.DATA_ITEM_CANDIDATE,
          data_item_id : id
        }
      })
    }
  }

  async findCandidateListSelection() {
    const data = await this.prisma.candidate.findMany({
      select : {
        candidate_id: true,
        full_name: true
      }
    });

    return {
      data,
    }
  }

  async findCandidateToExport() {
    const data = await this.prisma.candidate.findMany({
      include:{
        owner_user : {
          select: {
            name: true
          }
        }
      }
    });

    return data.map(item => ({
      ...item,
      owner_name: item.owner_user ? item.owner_user.name : ''
    }));
  }
}
