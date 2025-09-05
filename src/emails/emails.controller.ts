import { Controller, Get, Body, Patch, Param, Delete, Query, ParseIntPipe, UseGuards, ValidationPipe } from '@nestjs/common';
import { EmailsService } from './emails.service';
import { AuthGuard } from '../guards/auth.guard';
import { UpdateEmailDto } from './dto/update-email.dto';
import { AdminGuard } from '../guards/admin.guard';

@UseGuards(AuthGuard, AdminGuard)
@Controller('emails')
export class EmailsController {
  constructor(private readonly emailsService: EmailsService) {}

  @Get()
  findAll(@Query() query : any) {
    return this.emailsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: string) {
    return this.emailsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: string, @Body(ValidationPipe) updateEmailDto: UpdateEmailDto) {
    return this.emailsService.update(+id, updateEmailDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: string) {
    return this.emailsService.remove(+id);
  }
}
