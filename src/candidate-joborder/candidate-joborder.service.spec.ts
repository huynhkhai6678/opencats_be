import { Test, TestingModule } from '@nestjs/testing';
import { CandidateJoborderService } from './candidate-joborder.service';

describe('CandidateJoborderService', () => {
  let service: CandidateJoborderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CandidateJoborderService],
    }).compile();

    service = module.get<CandidateJoborderService>(CandidateJoborderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
