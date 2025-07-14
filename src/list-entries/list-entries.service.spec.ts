import { Test, TestingModule } from '@nestjs/testing';
import { ListEntriesService } from './list-entries.service';

describe('ListEntriesService', () => {
  let service: ListEntriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ListEntriesService],
    }).compile();

    service = module.get<ListEntriesService>(ListEntriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
