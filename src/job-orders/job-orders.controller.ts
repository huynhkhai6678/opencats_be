import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, UseGuards, ValidationPipe } from '@nestjs/common';
import { JobOrdersService } from './job-orders.service';
import { CreateJobOrderDto } from './dto/create-job-order.dto';
import { UpdateJobOrderDto } from './dto/update-job-order.dto';
import { AuthGuard } from '../guards/auth.guard';

@UseGuards(AuthGuard)
@Controller('job-orders')
export class JobOrdersController {
  constructor(private readonly jobOrdersService: JobOrdersService) {}

  @Post()
  create(@Body(ValidationPipe) createJobOrderDto: CreateJobOrderDto) {
    return this.jobOrdersService.create(createJobOrderDto);
  }

  @Get()
  findAll(@Query() query : any) {
    return this.jobOrdersService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobOrdersService.findOne(+id);
  }

  @Get(':id/detail')
  findDetail(@Param('id', ParseIntPipe) id: string) {
    return this.jobOrdersService.findDetail(+id);
  }

  @Get(':id/attachments')
  findJobOrderAttachment(@Param('id', ParseIntPipe) id: string) {
    return this.jobOrdersService.findJobOrderAttachment(+id);
  }

  @Get('companies/:id')
  findCompanyJobOrder(@Param('id', ParseIntPipe) id: string) {
    return this.jobOrdersService.findCompanyJobOrder(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateJobOrderDto: UpdateJobOrderDto) {
    return this.jobOrdersService.update(+id, updateJobOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.jobOrdersService.remove(+id);
  }
}
