import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe } from '@nestjs/common';
import { CandidateJoborderService } from './candidate-joborder.service';
import { CreateCandidateJoborderDto } from './dto/create-candidate-joborder.dto';
import { UpdateCandidateJoborderDto } from './dto/update-candidate-joborder.dto';

@Controller('candidate-joborder')
export class CandidateJoborderController {
  constructor(private readonly candidateJoborderService: CandidateJoborderService) {}

  @Post()
  create(@Body(ValidationPipe) createCandidateJoborderDto: CreateCandidateJoborderDto) {
    return this.candidateJoborderService.create(createCandidateJoborderDto);
  }

  @Get()
  findAll() {
    return this.candidateJoborderService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.candidateJoborderService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCandidateJoborderDto: UpdateCandidateJoborderDto) {
    return this.candidateJoborderService.update(+id, updateCandidateJoborderDto);
  }

  @Post(':id/update-rating')
  updateRating(@Param('id') id: string, @Body('rating_value') ratingValue: number) {
    return this.candidateJoborderService.updateRating(+id, ratingValue);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.candidateJoborderService.remove(+id);
  }
}
