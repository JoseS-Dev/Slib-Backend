import { Module } from '@nestjs/common';
import { CategoryModule } from './category/category.module.js';
import { SubcategoryModule } from './subcategory/subcategory.module.js';


@Module({
  imports: [CategoryModule, SubcategoryModule],
})
export class CategoriesModule {}