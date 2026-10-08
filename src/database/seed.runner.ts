import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { SeedModule } from './seed.module.js';
import { SeedServices } from './seed.services.js';
import type { SeedResult } from './interfaces/seed-result.interface.js';
import { printResult, parseMode, printHelp } from '../utils/functions/function.js';



/**
 * Función principal que se invoca desde el script de package.json.
 * Levanta un contexto de Nest con el SeedModule, ejecuta la acción
 * solicitada y cierra la aplicación.
 */
export async function runSeed(argv: string[] = process.argv.slice(2)): Promise<SeedResult> {
  const mode = parseMode(argv);
  if (mode === 'help') {
    printHelp();
    return {
      ok: true,
      startedAt: new Date(),
      finishedAt: new Date(),
      durationMs: 0,
      counts: {
        permissions: 0,
        roles: 0,
        rolePermissions: 0,
        users: 0,
        sessions: 0,
        refreshTokens: 0,
        categories: 0,
        subcategories: 0,
        publishers: 0,
        authors: 0,
        books: 0,
        bookAuthors: 0,
        physicalCopies: 0,
        requests: 0,
        requestItems: 0,
        loans: 0,
      },
      errors: [],
    };
  }

  const app = await NestFactory.createApplicationContext(SeedModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const seedServices = app.get(SeedServices);
    const result = mode === 'clear' ? await seedServices.clear() : await seedServices.run();
    printResult(mode === 'clear' ? 'Limpieza' : 'Seed', result);
    return result;
  } finally {
    await app.close();
  }
}

runSeed()