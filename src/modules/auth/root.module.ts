import { Module } from '@nestjs/common';
import { RolesModule } from './roles/roles.module.js';

@Module({
  imports: [RolesModule],
})
export class AuthModule {}