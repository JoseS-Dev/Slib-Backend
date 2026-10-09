import { Module } from '@nestjs/common';
import { ReviewModule } from './review/review.module.js';
import { ReportModule } from './report/report.module.js';
import { IncidentModule } from './incident/incident.module.js';
import { FavoritesModule } from './favorites/favorites.module.js';
import { SuspensionModule } from './suspension/suspension.module.js';

@Module({
  imports: [SuspensionModule, FavoritesModule, ReviewModule, ReportModule, IncidentModule],
})
export class GeneralModule {}