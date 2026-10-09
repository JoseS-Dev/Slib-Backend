import crypton from 'crypto';
import { fakerES as faker } from '@faker-js/faker';
import type {
  Session,
  RefreshToken,
  User,
} from '../../../generated/prisma/client.js';
import type { PrismaService } from '../../prisma/prisma.service.js';
import { settings } from '../../config/settings.config.js';

const sha256 = (value: string): string =>
  crypton.createHash('sha256').update(value).digest('hex');

export interface SessionsSeedOptions {
  /** Porcentaje (0..1) de usuarios a los que se les crea sesión. Por defecto 0.6. */
  sessionProbability?: number;
  /** Sesiones por usuario (1-3). Por defecto 2. */
  maxSessionsPerUser?: number;
}

interface CreatedSessionBundle {
  session: Session;
  refreshTokens: RefreshToken[];
}

export class SessionsSeeder {
  constructor(private readonly prisma: PrismaService) {}

  async run(
    users: User[],
    options: SessionsSeedOptions = {},
  ): Promise<CreatedSessionBundle[]> {
    const sessionProbability = options.sessionProbability ?? 0.6;
    const maxSessionsPerUser = options.maxSessionsPerUser ?? 2;

    const created: CreatedSessionBundle[] = [];

    for (const user of users) {
      if (faker.datatype.boolean({ probability: 1 - sessionProbability }))
        continue;

      const sessionCount = faker.number.int({
        min: 1,
        max: maxSessionsPerUser,
      });
      for (let i = 0; i < sessionCount; i++) {
        const refreshTokenJti = crypton.randomBytes(16).toString('hex');
        const refreshToken = crypton.randomBytes(32).toString('hex');
        const hashedRefreshToken = sha256(refreshToken);
        const expiresAt = new Date(
          Date.now() + settings.security.jwtRefreshExpiresIn * 1000,
        );

        const session = await this.prisma.session.create({
          data: {
            userId: user.id,
            isActive: true,
            refreshTokens: {
              create: {
                id: refreshTokenJti,
                token: hashedRefreshToken,
                expiresAt,
              },
            },
          },
        });

        const refreshTokens = await this.prisma.refreshToken.findMany({
          where: { sessionId: session.id },
        });

        created.push({ session, refreshTokens });
      }
    }

    return created;
  }

  async clear(): Promise<{ sessions: number; refreshTokens: number }> {
    const refreshTokensDeleted = await this.prisma.refreshToken.deleteMany({});
    const sessionsDeleted = await this.prisma.session.deleteMany({});
    return {
      refreshTokens: refreshTokensDeleted.count,
      sessions: sessionsDeleted.count,
    };
  }
}
