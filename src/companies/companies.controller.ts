import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, ValidationPipe, Req, ParseIntPipe } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { AuthGuard } from '../guards/auth.guard';

@UseGuards(AuthGuard)
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  create(@Body(ValidationPipe) createCompanyDto: CreateCompanyDto) {
    return this.companiesService.create(createCompanyDto);
  }

  @Get()
  findAll(@Query() query) {
    return this.companiesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: string) {
    return this.companiesService.findOne(+id);
  }

  @Get(':id/contacts')
  findCompanyContact(@Param('id', ParseIntPipe) id: string) {
    return this.companiesService.findCompanyContact(+id);
  }

  @Get(':id/job-orders')
  findCompanyJobOrder(@Param('id', ParseIntPipe) id: string) {
    return this.companiesService.findCompanyJobOrder(+id);
  }

  @Get(':id/attachments')
  findCompanyAttachment(@Param('id', ParseIntPipe) id: string) {
    return this.companiesService.findCompanyAttachment(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
    return this.companiesService.update(+id, updateCompanyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.companiesService.remove(+id);
  }
}
