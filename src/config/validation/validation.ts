import z from 'zod';
import dotenv from 'dotenv';
import { createEnv } from '@t3-oss/env-core';
import { getEnvFile } from '../../utils/functions/function.js';

dotenv.config({ path: getEnvFile(process.env['NODE_ENV']) });

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    PORT: z.coerce.number().default(3000),
    BASE_PATH: z.string().default('/api'),
    CORS_ORIGIN: z.string().default('http://localhost:5173'),
    METHODS_ALLOWED: z.string().default('GET,HEAD,PUT,PATCH,POST,DELETE'),
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
    MAX_PAGINATION: z.coerce.number().default(100),
    JWT_SECRET: z.string().min(32),
    COOKIE_SECRET: z.string().min(32),
    JWT_EXPIRES_IN: z.coerce.number().default(3600),
    JWT_REFRESH_EXPIRES_IN: z.coerce.number().default(604800),
    JWT_ALGORITHM: z.enum(['HS256', 'HS384', 'HS512']).default('HS256'),
    COOKIE_NAME: z.string().default('token'),
    COOKIE_EXPIRES_IN: z.coerce.number().default(3600),
    COOKIE_SECURE: z.coerce.boolean().default(false),
    COOKIE_SAME_SITE: z.enum(['strict', 'lax', 'none']).default('lax'),
    MAX_FAILED_LOGIN_ATTEMPTS: z.coerce.number().default(5),
    LOCK_TIME_MINUTES: z.coerce.number().default(15),
    LOGIN_LIMIT_WINDOW_MS: z.coerce.number().default(6000),
    LOGIN_LIMIT_MAX: z.coerce.number().default(5),
    LIMIT_READ_WINDOWS_MS: z.coerce.number().default(60000),
    LIMIT_READ_MAX: z.coerce.number().default(100),
    LIMIT_WRITE_WINDOWS_MS: z.coerce.number().default(60000),
    LIMIT_WRITE_MAX: z.coerce.number().default(50),
    LIMIT_EMAIL_WINDOWS_MS: z.coerce.number().default(60000),
    LIMIT_EMAIL_MAX: z.coerce.number().default(5),
    RESEND_API_KEY: z.string().min(1),
    EMAIL_FROM: z.string().default('Slib <onboarding@resend.dev>'),
    UPLOADS_DIR: z.string().default('uploads'),
    MAX_FILE_SIZE: z.coerce.number().default(10485760),
    ALLOWED_FILE_TYPES: z
      .string()
      .default('image/jpeg,image/png,image/gif,application/pdf'),
    ALLOWED_FILE_EXTENSIONS: z.string().default('.jpg,.jpeg,.png,.gif,.pdf'),
  },
  client: {},
  clientPrefix: 'VITE_',
  runtimeEnv: process.env,
  onValidationError: (error) => {
    console.error('Error de validación de variables de entorno:', error);
    process.exit(1);
  },
});
