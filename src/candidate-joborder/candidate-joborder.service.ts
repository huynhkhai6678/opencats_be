import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCandidateJoborderDto } from './dto/create-candidate-joborder.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { REQUEST } from '@nestjs/core';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { candidate_joborder } from 'generated/prisma';
import { ActivitiesService } from '../activities/activities.service';
import { CONSTANTS } from '../constants';

@Injectable()
export class CandidateJoborderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activitiesService: ActivitiesService,
    @Inject(REQUEST) private readonly request: any,
  ) {}

  async create(createCandidateJoborderDto: CreateCandidateJoborderDto) {
    const pipeline = await this.prisma.candidate_joborder.findFirst({
      where: {
        candidate_id: createCandidateJoborderDto.candidate_id,
        joborder_id: createCandidateJoborderDto.joborder_id
      },
    })

    if (pipeline) {
      throw new NotFoundException('This candidate already apply to this job');
    }

    return await this.prisma.candidate_joborder.create({
      data : {
        ...createCandidateJoborderDto,
        site_id: 1,
        date_created: new Date(),
        date_modified: new Date()
      }
    })
  }

  async findOne(id: number) {
    return {
      data: await this.prisma.candidate_joborder.findFirst({
        where : {
          candidate_joborder_id : id
        }
      }),
      types : await this.prisma.activity_type.findMany(),
      statuses : await this.prisma.candidate_joborder_status.findMany()
    };
  }

  async updateRating(id: number, ratingValue: number) {
    const pipeline = await this.prisma.candidate_joborder.findFirst({
      where: {
        candidate_joborder_id: id
      },
    })

    if (!pipeline) {
      throw new NotFoundException('This pipeline not existed');
    }

    await this.prisma.candidate_joborder.update({
      where : {
        candidate_joborder_id: id
      },
      data : {
        rating_value: ratingValue
      }
    });

    return {
      message : `Update Rating  successfully`
    };
  }

  async updateStatus(id: number, updateRatingDto: UpdateRatingDto) {
    const pipeline = await this.prisma.candidate_joborder.findFirst({
      where: {
        candidate_joborder_id: id
      },
    })

    if (!pipeline) {
      throw new NotFoundException('This pipeline not existed');
    }

    if (updateRatingDto.change_status) {
      const result = await this.updatePipelineStatus(pipeline, updateRatingDto.status);
      if (!result) {
        throw new NotFoundException('Can\'t change status');
      }
    }

    if (updateRatingDto.create_activity) {
      const result = this.activitiesService.create({
        joborder_id: pipeline.joborder_id,
        data_item_id: pipeline.candidate_id,
        data_item_type: CONSTANTS.DATA_ITEM_CANDIDATE,
        type: updateRatingDto.activity_type, // Check me
        notes: updateRatingDto.activity_notes
      });
      if (!result) {
        throw new NotFoundException('Can\'t change status');
      }
    }

    return {
      message: 'Update Pipeline status successfully'
    }
  }

  async remove(id: number) {
    const candidate = await this.prisma.candidate_joborder.findFirst({
      where: {
        candidate_joborder_id: id,
      },
    })

    if (!candidate) {
      throw new NotFoundException('This pipeline not existed');
    }

    await this.prisma.candidate_joborder.delete({
      where: {
        candidate_joborder_id: id
      },
    });

    return {
      message: 'Remove pipeline successfully'
    }
  }

  async updatePipelineStatus(pipeline : candidate_joborder, status: number) {
    const oldStatus = pipeline.status;
    // Update pipeline status
    await this.prisma.candidate_joborder.update({
      where : {
        candidate_joborder_id: pipeline.candidate_joborder_id
      },
      data : {
        status: status
      }
    });

    // Create pipeline history
    await this.prisma.candidate_joborder_status_history.create({
      data : {
        candidate_id : pipeline.candidate_id,
        joborder_id: pipeline.joborder_id,
        status_from: oldStatus,
        status_to: status
      }
    });

    // TODO send mail

    return true;
  }
}
