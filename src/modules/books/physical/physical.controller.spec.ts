import { Test, TestingModule } from '@nestjs/testing';
import { PhysicalController } from './physical.controller.js';
import { PhysicalService } from './physical.service.js';

describe('PhysicalController', () => {
  let controller: PhysicalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PhysicalController],
      providers: [PhysicalService],
    }).compile();

    controller = module.get<PhysicalController>(PhysicalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
