import { Module } from '@nestjs/common';
import { RolesModule } from './roles/roles.module.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [RolesModule, UsersModule],
})
export class AuthModule {}