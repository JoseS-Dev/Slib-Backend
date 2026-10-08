import { Test, TestingModule } from '@nestjs/testing';
import { PhysicalService } from './physical.service.js';

describe('PhysicalService', () => {
  let service: PhysicalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PhysicalService],
    }).compile();

    service = module.get<PhysicalService>(PhysicalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
