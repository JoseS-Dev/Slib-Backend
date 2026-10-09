import { Module } from '@nestjs/common';
import { SuspensionModule } from './suspension/suspension.module.js';
import { FavoritesModule } from './favorites/favorites.module.js';
import { ReviewModule } from './review/review.module.js';

@Module({
  imports: [SuspensionModule, FavoritesModule, ReviewModule],
})
export class GeneralModule {}