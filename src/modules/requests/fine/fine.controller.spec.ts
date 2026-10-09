import { Test, TestingModule } from '@nestjs/testing';
import { FineController } from './fine.controller.js';
import { FineService } from './fine.service.js';

describe('FineController', () => {
  let controller: FineController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FineController],
      providers: [FineService],
    }).compile();

    controller = module.get<FineController>(FineController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
