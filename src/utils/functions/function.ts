import path from 'path';
import fs from 'fs';
import Handlebars from 'handlebars';
import { Socket } from 'socket.io';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { settings } from '../../config/settings.config.js';
import type { SeedResult } from '../../database/interfaces/seed-result.interface.js';

// Función para colocar el .env correcto dependiendo del entorno
export function getEnvFile(
  env: string = process.env['NODE_ENV'] || 'development',
): string {
  const envFile: Record<string, string> = {
    development: '.env.development',
    production: '.env.production',
    test: '.env.test',
  };
  const fileName = envFile[env] || '.env.development';
  return path.resolve(process.cwd(), fileName);
}

// Funciones de la Semilla de la base de Datos
export const printResult = (label: string, result: SeedResult): void => {
  console.log(`\n=== ${label} ===`);

  console.log(JSON.stringify(result, null, 2));
};

export const parseMode = (argv: string[]): 'run' | 'clear' | 'help' => {
  const flag = argv.find((arg) => arg.startsWith('--'));
  switch (flag) {
    case '--clear':
      return 'clear';
    case '--help':
    case '-h':
      return 'help';
    default:
      return 'run';
  }
};

export const printHelp = (): void => {
  console.log(`
    Uso: pnpm seed [opciones]

    Opciones:
      (sin flag)   Ejecuta la semilla (idempotente: respeta datos previos).
      --clear      Limpia los datos generados por la semilla.
      --help, -h   Muestra esta ayuda.

    Credenciales generadas por la semilla:
      admin@slib.com      / secreto1   (rol Administrador)
      recepcion@slib.com  / secreto1   (rol Recepcionista)
      usuario@slib.com    / secreto1   (rol Usuario)
    `);
};

// Función para compilar los templates de Handlebars
export function compileTemplate(templatePath: string, context: any) {
  const fileName = `${templatePath}.hbs`;
  const filePath = path.join(
    process.cwd(),
    'src',
    'modules',
    'mailer',
    'templates',
    fileName,
  );
  // Se verifica que exista el archivo del template
  if (!fs.existsSync(filePath)) {
    throw new BadRequestException(
      `El archivo de template ${fileName} no existe en la ruta ${filePath}`,
    );
  }
  // Si existe, se lee el contenido del archivo y se compila con Handlebars
  const templateContent = fs.readFileSync(filePath, 'utf-8');
  const template = Handlebars.compile(templateContent);
  return template(context);
}

// Función para que resuelve la ruta absoluta de una rchivo guardado
export async function deleteStoredFile(storedPath: string): Promise<void> {
  const uploadDir = path.resolve(process.cwd(), settings.uploads.uploadsDir);
  const targetPath = path.resolve(uploadDir, storedPath);
  if (
    !targetPath.startsWith(uploadDir + path.sep) &&
    targetPath !== uploadDir
  ) {
    throw new BadRequestException('Ruta de archivo inválida');
  }
  if (fs.existsSync(targetPath)) {
    await fs.promises.unlink(targetPath);
  }
}

// Función para extraer el token de un socket
export function extractToken(client: Socket): string {
  const authToken = (client.handshake.auth as any)?.token;
  if (authToken) return authToken;
  const authHeader = client.handshake.headers['authorization'];
  const parts = (authHeader as string)?.split(' ') ?? [];
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    throw new UnauthorizedException(
      'No se proporcionó un token de autenticación válido',
    );
  }
  const [type, token] = (authHeader as string)?.split(' ') ?? [];
  if (type === 'Bearer' && token) return token;
  throw new UnauthorizedException(
    'No se proporcionó un token de autenticación válido',
  );
}
