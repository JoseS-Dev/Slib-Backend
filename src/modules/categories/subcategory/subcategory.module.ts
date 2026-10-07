import { Module } from '@nestjs/common';
import { SubcategoryService } from './subcategory.service.js';
import { SubcategoryController } from './subcategory.controller.js';

@Module({
  controllers: [SubcategoryController],
  providers: [SubcategoryService],
})
export class SubcategoryModule {}
