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
  .addTag('Categorías', 'Gestión de categorías')
  .addTag('Subcategorías', 'Gestión de subcategorías')
  .addTag('General - Notificaciones', 'Gestión de notificaciones del sistema')
  .addTag('General - Favoritos', 'Gestión de libros favoritos por usuario')
  .addTag('General - Incidencias', 'Reporte y seguimiento de incidencias')
  .addTag('General - Reportes', 'Gestión de reportes administrativos')
  .addTag('General - Reseñas', 'Reseñas de libros por usuarios')
  .addTag('General - Suspensiones', 'Suspensiones de usuarios')
  .addTag(
    'Servicio de Correo',
    'Envío de correos transaccionales (bienvenida, recuperación y establecimiento de contraseña)',
  )
  .addTag('Solicitudes', 'Gestión de solicitudes de libros')
  .addTag('Préstamos', 'Gestión de préstamos de ejemplares')
  .addTag('Multas', 'Gestión de multas asociadas a préstamos')
  .addTag('Items de Solicitud', 'Items (ejemplares) asociados a una solicitud')
  .addTag('Libros - Autores', 'Gestión de autores de libros')
  .addTag('Libros - Editoriales', 'Gestión de editoriales')
  .addTag('Libros - Ejemplares Físicos', 'Gestión de copias físicas de los libros')
  .addTag('Libros', 'Gestión de libros del catálogo')
  .addTag('Libros - Relación Libro-Autor', 'Asociación entre libros y autores')
  .build();
