import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCandidateJoborderDto } from './dto/create-candidate-joborder.dto';
import { UpdateCandidateJoborderDto } from './dto/update-candidate-joborder.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { REQUEST } from '@nestjs/core';

@Injectable()
export class CandidateJoborderService {
  constructor(
    private prisma: PrismaService,
    @Inject(REQUEST) private readonly request: any,
  ) {}

  async create(createCandidateJoborderDto: CreateCandidateJoborderDto) {
   return await this.prisma.candidate_joborder.create({
    data : {
      ...createCandidateJoborderDto,
      site_id: 1,
      date_created: new Date(),
      date_modified: new Date()
    }
   })
  }

  findAll() {
    return `This action returns all candidateJoborder`;
  }

  findOne(id: number) {
    return `This action returns a #${id} candidateJoborder`;
  }

  update(id: number, updateCandidateJoborderDto: UpdateCandidateJoborderDto) {
    return `This action updates a #${id} candidateJoborder`;
  }

  async updateRating(id: number, ratingValue: number) {
    const candidate = await this.prisma.candidate_joborder.findFirst({
      where: {
        candidate_joborder_id: id
      },
    })

    if (!candidate) {
      throw new NotFoundException('This contact not existed');
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

  remove(id: number) {
    return `This action removes a #${id} candidateJoborder`;
  }
}
