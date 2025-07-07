import { Test, TestingModule } from '@nestjs/testing';
import { JobOrdersController } from './job-orders.controller';
import { JobOrdersService } from './job-orders.service';

describe('JobOrdersController', () => {
  let controller: JobOrdersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobOrdersController],
      providers: [JobOrdersService],
    }).compile();

    controller = module.get<JobOrdersController>(JobOrdersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
