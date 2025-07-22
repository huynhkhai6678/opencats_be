import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, UseInterceptors, UploadedFile, ValidationPipe, ParseIntPipe, Res } from '@nestjs/common';
import { CandidatesService } from './candidates.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { AuthGuard } from '../guards/auth.guard';
import { SetAttachmentIdInterceptor } from '../interceptors/set-attachment-id.interceptor';
import { FileInterceptor } from '@nestjs/platform-express';
import { createFileUploadStorage } from '../utils/upload-file.util';
import { documentFilter } from '../utils/file-util';
import { Response } from 'express';
import { ExcelService } from '../services/excel.service';

@UseGuards(AuthGuard)
@Controller('candidates')
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService, private readonly excelService: ExcelService) {}

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
  
  @Get('export')
  async exportCsv(@Res() res: Response) {
    const candidates = await this.candidatesService.findCandidateToExport();
    
    const columns = [
      { header: 'Full Name', key: 'full_name' },
      { header: 'Job Title', key: 'job_title' },
      { header: 'E-Mail', key: 'email1' },
      { header: '2nd E-Mail', key: 'email2' },
      { header: 'Home Phone', key: 'phone_home' },
      { header: 'Cell Phone', key: 'phone_cell' },
      { header: 'Work Phone', key: 'phone_work' },
      { header: 'Address', key: 'address' },
      { header: 'City', key: 'city' },
      { header: 'State', key: 'state' },
      { header: 'Zip', key: 'zip' },
      { header: 'Misc Notes', key: 'notes' },
      { header: 'Web Site', key: 'web_site' },
      { header: 'Key Skills', key: 'key_skills' },
      { header: 'Languages', key: 'language' },
      { header: 'Source', key: 'source' },
      { header: 'Available', key: 'date_available' },
      { header: 'Current Employer', key: 'current_employer' },
      { header: 'Current Pay', key: 'current_pay' },
      { header: 'Desired Pay', key: 'desired_pay' },
      { header: 'Can Relocate', key: 'can_relocate' },
      { header: 'Owner', key: 'owner_name' },
      { header: 'Created', key: 'date_created' },
      { header: 'Modified', key: 'date_modified' },
    ];

    const csvBuffer = await this.excelService.exportCsv(columns, candidates);
    const BOM = '\uFEFF';
    const bufferWithBOM = Buffer.concat([Buffer.from(BOM), csvBuffer]);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=candidates.csv');
    res.send(bufferWithBOM);
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
