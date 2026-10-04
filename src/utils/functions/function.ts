import path from 'path';
import fs from 'fs';

// Función para colocar el .env correcto dependiendo del entorno
export function getEnvFile(env:string = process.env['NODE_ENV'] || 'development'): string {
    const envFile: Record<string, string> = {
        development: '.env.development',
        production: '.env.production',
        test: '.env.test',
    };
    const fileName = envFile[env] || '.env.development';
    return path.resolve(process.cwd(), fileName);
}

// Función para personalizar a prisma con el metodo de soft-delete