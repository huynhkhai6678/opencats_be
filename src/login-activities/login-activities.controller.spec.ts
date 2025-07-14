import { Test, TestingModule } from '@nestjs/testing';
import { LoginActivitiesController } from './login-activities.controller';
import { LoginActivitiesService } from './login-activities.service';

describe('LoginActivitiesController', () => {
  let controller: LoginActivitiesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoginActivitiesController],
      providers: [LoginActivitiesService],
    }).compile();

    controller = module.get<LoginActivitiesController>(LoginActivitiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
