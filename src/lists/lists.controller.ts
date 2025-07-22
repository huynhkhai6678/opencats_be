import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, ParseIntPipe, ValidationPipe } from '@nestjs/common';
import { ListsService } from './lists.service';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { AuthGuard } from '../guards/auth.guard';
import { SendEmailDto } from './dto/send-email.dto';

@UseGuards(AuthGuard)
@Controller('lists')
export class ListsController {
  constructor(private readonly listsService: ListsService) {}

  @Post()
  create(@Body(ValidationPipe) createListDto: CreateListDto) {
    return this.listsService.create(createListDto);
  }

  @Post('send-email')
  sendEmail(@Body(ValidationPipe) sendEmailDto: SendEmailDto) {
    return this.listsService.sendEmail(sendEmailDto);
  }

  @Get()
  findAll(@Query() query : any) {
    return this.listsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: string) {
    return this.listsService.findOne(+id);
  }

  @Get(':id/items')
  findItem(@Param('id', ParseIntPipe) id: string) {
    return this.listsService.findItem(+id);
  }

  @Get(':id/details')
  findDetail(@Param('id', ParseIntPipe) id: string, @Query() query : any) {
    return this.listsService.findDetail(+id, query);
  }

  @Get(':id/email')
  findEmailData(@Param('id', ParseIntPipe) id: string, @Query('type') type: string) {
    return this.listsService.findEmailData(+id, type);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: string, @Body() updateListDto: UpdateListDto) {
    return this.listsService.update(+id, updateListDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: string) {
    return this.listsService.remove(+id);
  }
}
