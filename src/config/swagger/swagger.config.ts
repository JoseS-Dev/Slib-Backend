import { DocumentBuilder } from '@nestjs/swagger';
import { settings } from '../settings.config.js';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('SLIB API')
  .setDescription(
    'Documentación de la API de SLIB (Sistema de Biblioteca). ' +
      'Todas las rutas están prefijadas con la ruta base del servidor. ' +
      'Las rutas protegidas requieren un token JWT (Bearer) con los roles adecuados.',
  )
  .setVersion('1.0.0')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description:
        'Autenticación mediante token JWT. Obténlo en /auth/login y úsalo como: Authorization: Bearer <token>',
    },
    'JWT',
  )
  .addTag(`${settings.server.basePath}`, 'Rutas de la API de SLIB')
  .addTag('Seguridad - Permisos', 'Gestión de permisos del sistema')
  .addTag(
    'Seguridad - Asociación Rol-Permiso',
    'Asociación entre roles y permisos',
  )
  .addTag('Autenticación - Roles', 'Gestión de roles del sistema')
  .addTag('Autenticación - Usuarios', 'Gestión de usuarios')
  .addTag('Autenticación - Sesiones', 'Inicio, refresh y cierre de sesión')
  .build();
