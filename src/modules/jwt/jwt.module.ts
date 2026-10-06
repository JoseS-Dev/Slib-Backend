import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { settings } from '../../config/settings.config.js';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: async () => ({
        secret: settings.security.jwtSecret,
        signOptions: {
          expiresIn: settings.security.jwtExpiresIn * 1000,
          algorithm: settings.security.jwtAlgorithm,
        },
        verifyOptions: {
          algorithms: [settings.security.jwtAlgorithm] as const,
        },
      }),
    }),
  ],
  exports: [JwtModule],
})
export class JwtModuleGlobal {}
