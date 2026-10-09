import { Module } from '@nestjs/common';
import { RolesModule } from './roles/roles.module.js';
import { UsersModule } from './users/users.module.js';
import { SessionsModule } from './sessions/sessions.module.js';

@Module({
  imports: [RolesModule, UsersModule, SessionsModule],
})
export class AuthModule {}
