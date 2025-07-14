import { Test, TestingModule } from '@nestjs/testing';
import { ListEntriesController } from './list-entries.controller';
import { ListEntriesService } from './list-entries.service';

describe('ListEntriesController', () => {
  let controller: ListEntriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ListEntriesController],
      providers: [ListEntriesService],
    }).compile();

    controller = module.get<ListEntriesController>(ListEntriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
