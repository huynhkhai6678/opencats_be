import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, UseInterceptors, UploadedFile, ValidationPipe, ParseIntPipe } from '@nestjs/common';
import { CandidatesService } from './candidates.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { AuthGuard } from '../guards/auth.guard';
import { SetAttachmentIdInterceptor } from '../interceptors/set-attachment-id.interceptor';
import { FileInterceptor } from '@nestjs/platform-express';
import { createFileUploadStorage } from '../utils/upload-file.util';
import { documentFilter } from '../utils/file-util';

@UseGuards(AuthGuard)
@Controller('candidates')
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}

  @Post()
  @UseInterceptors(
    SetAttachmentIdInterceptor,
    FileInterceptor('file', {
      storage: createFileUploadStorage('attachments'),
      fileFilter: documentFilter,
    }),
  )
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body(ValidationPipe) createCandidateDto: CreateCandidateDto
  ) {
    return this.candidatesService.create(createCandidateDto, file);
  }

  @Get()
  findAll(@Query() query) {
    return this.candidatesService.findAll(query);
  }

  @Get('get-selection')
  findCandidateListSelection() {
    return this.candidatesService.findCandidateListSelection();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: string) {
    return this.candidatesService.findOne(+id);
  }

  @Get(':id/detail')
  findDetail(@Param('id', ParseIntPipe) id: string) {
    return this.candidatesService.findDetail(+id);
  }

  @Get(':id/attachments')
  findCandidateAttachment(@Param('id', ParseIntPipe) id: string) {
    return this.candidatesService.findCandidateAttachment(+id);
  }

  @Get(':id/pipelines')
  findCandidatePipeline(@Param('id', ParseIntPipe) id: string) {
    return this.candidatesService.findCandidatePipeline(+id);
  }

  @Get(':id/activities')
  findCandidateActivities(@Param('id', ParseIntPipe) id: string) {
    return this.candidatesService.findCandidateActivities(+id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: string, @Body(ValidationPipe) updateCandidateDto: UpdateCandidateDto) {
    return this.candidatesService.update(+id, updateCandidateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: string) {
    return this.candidatesService.remove(+id);
  }
}
