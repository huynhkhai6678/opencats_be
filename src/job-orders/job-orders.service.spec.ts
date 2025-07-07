import { Test, TestingModule } from '@nestjs/testing';
import { JobOrdersService } from './job-orders.service';

describe('JobOrdersService', () => {
  let service: JobOrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JobOrdersService],
    }).compile();

    service = module.get<JobOrdersService>(JobOrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
