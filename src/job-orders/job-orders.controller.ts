import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { JobOrdersService } from './job-orders.service';
import { CreateJobOrderDto } from './dto/create-job-order.dto';
import { UpdateJobOrderDto } from './dto/update-job-order.dto';

@Controller('job-orders')
export class JobOrdersController {
  constructor(private readonly jobOrdersService: JobOrdersService) {}

  @Post()
  create(@Body() createJobOrderDto: CreateJobOrderDto) {
    return this.jobOrdersService.create(createJobOrderDto);
  }

  @Get()
  findAll() {
    return this.jobOrdersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobOrdersService.findOne(+id);
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
