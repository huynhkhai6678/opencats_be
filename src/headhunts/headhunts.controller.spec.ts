import { Test, TestingModule } from '@nestjs/testing';
import { HeadhuntsController } from './headhunts.controller';
import { HeadhuntsService } from './headhunts.service';

describe('HeadhuntsController', () => {
  let controller: HeadhuntsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HeadhuntsController],
      providers: [HeadhuntsService],
    }).compile();

    controller = module.get<HeadhuntsController>(HeadhuntsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
