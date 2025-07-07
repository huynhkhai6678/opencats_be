import { Inject, Injectable } from '@nestjs/common';
import { CreateJobOrderDto } from './dto/create-job-order.dto';
import { UpdateJobOrderDto } from './dto/update-job-order.dto';
import { PrismaService } from '../prisma/prisma.service';
import { REQUEST } from '@nestjs/core';

@Injectable()
export class JobOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REQUEST) private readonly request: any,
  ) {}

  create(createJobOrderDto: CreateJobOrderDto) {
    return 'This action adds a new jobOrder';
  }

  findAll() {
    return `This action returns all jobOrders`;
  }

  findOne(id: number) {
    return `This action returns a #${id} jobOrder`;
  }

  update(id: number, updateJobOrderDto: UpdateJobOrderDto) {
    return `This action updates a #${id} jobOrder`;
  }

  remove(id: number) {
    return `This action removes a #${id} jobOrder`;
  }

  async findCompanyJobOrder(id: number) {
    return {
      data : await this.prisma.contact.findMany({
        where : {
          company_id : id
        }
      })
    }
  }
}
