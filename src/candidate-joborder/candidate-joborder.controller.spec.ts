import { Test, TestingModule } from '@nestjs/testing';
import { CandidateJoborderController } from './candidate-joborder.controller';
import { CandidateJoborderService } from './candidate-joborder.service';

describe('CandidateJoborderController', () => {
  let controller: CandidateJoborderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CandidateJoborderController],
      providers: [CandidateJoborderService],
    }).compile();

    controller = module.get<CandidateJoborderController>(CandidateJoborderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
