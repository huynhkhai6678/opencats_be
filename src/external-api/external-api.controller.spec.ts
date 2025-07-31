import { Test, TestingModule } from '@nestjs/testing';
import { ExternalApiController } from './external-api.controller';
import { ExternalApiService } from './external-api.service';

describe('ExternalApiController', () => {
  let controller: ExternalApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExternalApiController],
      providers: [ExternalApiService],
    }).compile();

    controller = module.get<ExternalApiController>(ExternalApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
