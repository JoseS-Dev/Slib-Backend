import { Test, TestingModule } from '@nestjs/testing';
import { BookAuthorController } from './book-author.controller.js';
import { BookAuthorService } from './book-author.service.js';

describe('BookAuthorController', () => {
  let controller: BookAuthorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookAuthorController],
      providers: [BookAuthorService],
    }).compile();

    controller = module.get<BookAuthorController>(BookAuthorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
