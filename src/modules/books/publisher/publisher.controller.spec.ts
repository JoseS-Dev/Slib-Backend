import { Test, TestingModule } from '@nestjs/testing';
import { PublisherController } from './publisher.controller.js';
import { PublisherService } from './publisher.service.js';

describe('PublisherController', () => {
  let controller: PublisherController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublisherController],
      providers: [PublisherService],
    }).compile();

    controller = module.get<PublisherController>(PublisherController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
