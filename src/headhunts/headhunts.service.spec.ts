import { Test, TestingModule } from '@nestjs/testing';
import { HeadhuntsService } from './headhunts.service';

describe('HeadhuntsService', () => {
  let service: HeadhuntsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HeadhuntsService],
    }).compile();

    service = module.get<HeadhuntsService>(HeadhuntsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
