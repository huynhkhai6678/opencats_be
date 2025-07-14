import { Test, TestingModule } from '@nestjs/testing';
import { LoginActivitiesService } from './login-activities.service';

describe('LoginActivitiesService', () => {
  let service: LoginActivitiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoginActivitiesService],
    }).compile();

    service = module.get<LoginActivitiesService>(LoginActivitiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
