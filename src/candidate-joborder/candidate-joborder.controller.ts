import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe, Inject, UseGuards, ParseIntPipe } from '@nestjs/common';
import { CandidateJoborderService } from './candidate-joborder.service';
import { CreateCandidateJoborderDto } from './dto/create-candidate-joborder.dto';
import { ActivitiesService } from '../activities/activities.service';
import { CONSTANTS } from '../constants';
import { REQUEST } from '@nestjs/core';
import { AuthGuard } from '../guards/auth.guard';
import { UpdateRatingDto } from './dto/update-rating.dto';

@UseGuards(AuthGuard)
@Controller('candidate-joborder')
export class CandidateJoborderController {
  constructor(
    private readonly candidateJoborderService: CandidateJoborderService,
    private readonly activitiesService: ActivitiesService,
    @Inject(REQUEST) private readonly request: any,
  ) {}

  @Post()
  async create(@Body(ValidationPipe) createCandidateJoborderDto: CreateCandidateJoborderDto) {
    await this.candidateJoborderService.create(createCandidateJoborderDto);
    await this.activitiesService.create({
      joborder_id: createCandidateJoborderDto.joborder_id,
      data_item_id: createCandidateJoborderDto.candidate_id,
      data_item_type: CONSTANTS.DATA_ITEM_CANDIDATE,
      type: 400, // Check me
      notes: 'Added candidate to pipeline.'
    });
    return {
      message: 'Create Pipeline successfully'
    }
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: string) {
    return this.candidateJoborderService.findOne(+id);
  }

  @Post(':id/update-rating')
  updateRating(@Param('id', ParseIntPipe) id: string, @Body('rating_value') ratingValue: number) {
    return this.candidateJoborderService.updateRating(+id, ratingValue);
  }

  @Post(':id/update-status')
  async updateStatus(@Param('id', ParseIntPipe) id: string, @Body(ValidationPipe) updateRatingDto: UpdateRatingDto) {
    return this.candidateJoborderService.updateStatus(+id, updateRatingDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: string) {
    return this.candidateJoborderService.remove(+id);
  }
}
