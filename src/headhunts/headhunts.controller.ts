import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, ParseBoolPipe, UseGuards } from '@nestjs/common';
import { HeadhuntsService } from './headhunts.service';
import { CreateHeadhuntDto } from './dto/create-headhunt.dto';
import { UpdateHeadhuntDto } from './dto/update-headhunt.dto';
import { AuthGuard } from '../guards/auth.guard';
import { AdminGuard } from '../guards/admin.guard';

@UseGuards(AuthGuard, AdminGuard)
@Controller('headhunts')
export class HeadhuntsController {
  constructor(private readonly headhuntsService: HeadhuntsService) {}

  @Post()
  create(@Body() createHeadhuntDto: CreateHeadhuntDto) {
    return this.headhuntsService.create(createHeadhuntDto);
  }

  @Get()
  findAll(@Query() query : any) {
    return this.headhuntsService.findAll(query);
  }

  @Get('kpi')
  findKpi(@Query('month') month : number) {
    return this.headhuntsService.findKpi(month);
  }

  @Get(':id/detail')
  findOne(@Param('id', ParseIntPipe) id: string) {
    return this.headhuntsService.findOne(+id);
  }

  @Get(':id/candidates')
  findCandidates(@Param('id', ParseIntPipe) id: string) {
    return this.headhuntsService.findCandidates(+id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: string, @Body() updateHeadhuntDto: UpdateHeadhuntDto) {
    return this.headhuntsService.update(+id, updateHeadhuntDto);
  }

  @Post(':id/update-employee')
  changeEmployee(@Param('id', ParseIntPipe) id: string, @Body('checked', ParseIntPipe) checked: number) {
    return this.headhuntsService.changeEmployee(+id, checked);
  }

  @Post(':id/update-verified')
  changeVerified(@Param('id', ParseIntPipe) id: string, @Body('checked', ParseIntPipe) checked: number) {
    return this.headhuntsService.changeVerified(+id, checked);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: string) {
    return this.headhuntsService.remove(+id);
  }
}
