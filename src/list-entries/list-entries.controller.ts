import { Controller, Get, Param, Query } from '@nestjs/common';
import { ListEntriesService } from './list-entries.service';

@Controller('list-entries')
export class ListEntriesController {
  constructor(private readonly listEntriesService: ListEntriesService) {}

  @Get(':id/candidate')
  findCandidateList(@Param('id') id: string, @Query() query: any) {
    return this.listEntriesService.findCandidateList(+id, query);
  }

  @Get(':id/contact')
  findContactList(@Param('id') id: string, @Query() query: any) {
    return this.listEntriesService.findContactList(+id, query);
  }

  @Get(':id/company')
  findCompanyList(@Param('id') id: string, @Query() query: any) {
    return this.listEntriesService.findCompanyList(+id, query);
  }

  @Get(':id/job-order')
  findJobOrderList(@Param('id') id: string, @Query() query: any) {
    return this.listEntriesService.findJobOrderList(+id, query);
  }
}
