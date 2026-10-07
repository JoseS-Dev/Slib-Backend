# SLIB Backend

API REST en NestJS 11 que da soporte al sistema SLIB, una plataforma de gestión de biblioteca en español: cubre el ciclo completo de préstamos, solicitudes, multas, sanciones, incidencias y notificaciones, además del módulo de autenticación, seguridad con RBAC y catálogo de libros.

El dominio del proyecto (vocabulario, comentarios, valores de los `enum` de Prisma, mensajes de error) está en español; los identificadores del código se mantienen en inglés. Los datos se persisten en PostgreSQL a través de Prisma 7 con un driver adapter de `pg`. La validación de entrada se hace con Zod 4 vía `nestjs-zod`, y el hashing de contraseñas usa `argon2`.

---

## Tabla de contenidos

- [Características](#features)
- [Stack tecnológico](#stack-tecnológico)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Variables de entorno](#variables-de-entorno)
- [Scripts disponibles](#scripts-disponibles)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Módulos](#módulos)
- [Base de datos](#base-de-datos)
- [Seed de la base de datos](#seed-de-la-base-de-datos)
- [Plantillas de correo](#plantillas-de-correo)
- [Pruebas REST (REST Client)](#pruebas-rest-rest-client)
- [Problemas conocidos y solución de errores](#problemas-conocidos-y-solución-de-errores)
- [Licencia](#licencia)

---

## Características

- **Auth (`/api/users`, `/api/sessions`, `/api/roles`)** — registro público con asignación del rol por defecto (`Usuario`), creación de usuarios por administrador con envío de correo de invitación, listado paginado y filtrado por activos, actualización parcial, soft delete, hashing de contraseñas con `argon2`, autenticación con access token JWT (HS256) más refresh token persistido en cookie httpOnly y base de datos (sha256-hashed), bloqueo de cuenta tras intentos fallidos configurables (`MAX_FAILED_LOGIN_ATTEMPTS` / `LOCK_TIME_MINUTES`), refresh rotativo con revocación automática de sesiones previas y verificación de sesión activa.
- **Roles y permisos (`/api/roles`, `/api/permissions`, `/api/role-permission`)** — RBAC mediante el decorador `@Roles(...)` y el guard `RolesGuard`; asociación muchos a muchos entre roles y permisos con la tabla pivote `RolePermission`; control de acceso basado en roles en español (`Administrador`, `Recepcionista`, `Bibliotecario`, `Usuario`) y catálogo de 52 permisos seed.
- **Mailer (`/api/mailer`)** — endpoints públicos para verificación de cuenta, definición inicial de contraseña, recuperación de contraseña y reseteo con token; envío vía Resend; plantillas Handlebars compiladas dinámicamente.
- **Categorías y subcategorías (`/api/category`, `/api/subcategory`)** — CRUD con paginación, activación/desactivación (`isActive`), listado por categoría padre, soporte para crear subcategorías en línea al crear/actualizar una categoría.
- **Libros (`/api/book`)** — CRUD con paginación, asociación a categoría, subcategoría y editorial, soporte para subir portada vía multipart (`Multer`), borrado físico del archivo al actualizar o eliminar el libro, listado por categoría / subcategoría / editorial, soft delete, campos opcionales para el tipo MIME y tamaño del archivo.
- **Catálogo base (seed)** — poblado inicial idempotente bajo `src/database/`: permisos, roles, asociación rol-permiso, usuarios con contraseñas hasheadas, sesiones y refresh tokens, categorías, subcategorías.
- **Seguridad y hardening** — `helmet` para cabeceras HTTP, CORS con whitelist configurable, `cookie-parser`, validación global con `ZodValidationPipe` (Zod 4), filtros para errores de Zod, Prisma, `NotFound` y excepción genérica, middleware de correlación (`CorrelationMiddleware`) aplicado a todas las rutas, interceptores para logging y formato uniforme de respuesta.
- **Almacenamiento local** — servicio de archivos para portadas (`StorageService` + `MulterInterceptor`), ruta configurable vía `UPLOADS_DIR`, tamaño máximo y tipos MIME/extension permitidos validados en `src/config/storages/`.

---

## Stack tecnológico

| Capa | Dependencia | Versión |
|---|---|---|
| Framework | `@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express` | `^11.0.1` |
| ORM | `prisma`, `@prisma/client`, `@prisma/adapter-pg` | `7.8.0` |
| Base de datos | PostgreSQL (vía `@prisma/adapter-pg`) | 14+ recomendado |
| Validación | `zod` + `nestjs-zod` | `^4.6.5` / `^5.5.0` |
| Auth | `@nestjs/jwt`, `argon2` | `11.0.1` / `^0.45.1` |
| Correo | `resend` | `^6.32.0` |
| Plantillas | `handlebars` | `^4.7.9` |
| Subida de archivos | `multer` + `@types/multer` | `^2.4.0` |
| Middlewares | `helmet`, `morgan`, `cookie-parser` | `^8.3.0` / `^1.12.1` / `^1.4.7` |
| Rate limiting | `@nestjs/throttler` | `^6.7.1` |
| Config | `dotenv` + `@t3-oss/env-core` | `^18.0.5` / `^0.13.11` |
| Lenguaje | `typescript` | `^5.7.3` |
| Utilidades | `socket.io`, `@nestjs/websockets`, `@nestjs/schedule`, `@nestjs/swagger`, `@faker-js/faker` (dev), `tsx`, `tsconfig-paths` | — |

Configuración del compilador: `module` y `moduleResolution: NodeNext`, `verbatimModuleSyntax`, `noUncheckedIndexedAccess`, `noPropertyAccessFromIndexSignature`, `strict`, `noImplicitOverride`. Esto significa que todos los imports relativos deben llevar la extensión **emitida** `.js` y los accesos indexados devuelven `T | undefined`.

---

## Requisitos

- Node.js 20 o superior (recomendado 22 LTS, alineado con `@types/node` 24).
- PostgreSQL 14 o superior.
- pnpm 10+.
- Una API key de [Resend](https://resend.com/) para el envío de correos transaccionales.
- (Opcional) `pnpm-workspace.yaml` para autorizar los postinstall nativos (`argon2`, `prisma`, `@prisma/engines`, `@scarf/scarf`). Ver [Problemas conocidos](#problemas-conocidos-y-solución-de-errores).

---

## Instalación

```bash
pnpm install
```

Copia el archivo `.env.development` que ya viene en el repositorio (o crea el tuyo propio a partir del esquema en `src/config/validation/validation.ts`). El loader (`src/utils/functions/function.ts:9`, `getEnvFile`) mapea `NODE_ENV` a uno de los siguientes archivos en la raíz del proyecto:

- `.env.development`
- `.env.production`
- `.env.test`

`.env.local` **no** se carga — no existe en el esquema actual.

Genera el cliente de Prisma y aplica las migraciones:

```bash
pnpm prisma:generate
pnpm prisma:migrate
```

Siembra la base de datos con datos idempotentes (permisos, roles, usuarios, etc.):

```bash
pnpm prisma:seed
```

Arranca el servidor en modo watch:

```bash
pnpm start:dev
```

El servidor escucha en `http://localhost:${PORT}${BASE_PATH}` (por defecto `4500` y `/api` según `.env.development`).

---

## Variables de entorno

El esquema de referencia está en `src/config/validation/validation.ts`. La validación se hace con `@t3-oss/env-core` al arrancar; un fallo invoca `process.exit(1)` con un error en español.

| Variable | Tipo | Default | Notas |
|---|---|---|---|
| `NODE_ENV` | enum | `development` | `development` \| `production` \| `test` |
| `DATABASE_URL` | string | — | requerido, conexión PostgreSQL |
| `PORT` | number | `3000` | puerto del servidor |
| `BASE_PATH` | string | `/api` | prefijo global |
| `CORS_ORIGIN` | string | `http://localhost:5173` | origen permitido para CORS |
| `METHODS_ALLOWED` | CSV | `GET,HEAD,PUT,PATCH,POST,DELETE` | métodos HTTP permitidos |
| `MAX_PAGINATION` | number | `100` | límite máximo por página |
| `RESEND_API_KEY` | string | — | requerido, clave de Resend |
| `EMAIL_FROM` | string | `Slib <onboarding@resend.dev>` | remitente |
| `JWT_SECRET` | string | — | requerido, **mínimo 32 caracteres** |
| `JWT_EXPIRES_IN` | number | `3600` | segundos |
| `JWT_REFRESH_SECRET` | string | — | (no usado por `JwtModule` actual, queda en el esquema) |
| `JWT_REFRESH_EXPIRES_IN` | number | `604800` | segundos |
| `JWT_ALGORITHM` | enum | `HS256` | `HS256` \| `HS384` \| `HS512` |
| `COOKIE_SECRET` | string | — | requerido, **mínimo 32 caracteres** |
| `COOKIE_NAME` | string | `token` | nombre de la cookie de refresh |
| `COOKIE_EXPIRES_IN` | number | `3600` | segundos |
| `COOKIE_SECURE` | boolean | `false` | |
| `COOKIE_SAME_SITE` | enum | `lax` | `strict` \| `lax` \| `none` |
| `MAX_FAILED_LOGIN_ATTEMPTS` | number | `5` | |
| `LOCK_TIME_MINUTES` | number | `15` | minutos de bloqueo |
| `LOGIN_LIMIT_WINDOW_MS` | number | `6000` | ventana para rate-limit de login |
| `LOGIN_LIMIT_MAX` | number | `5` | máximo de intentos por ventana |
| `LIMIT_READ_WINDOWS_MS` | number | `60000` | rate-limit lecturas |
| `LIMIT_READ_MAX` | number | `100` | |
| `LIMIT_WRITE_WINDOWS_MS` | number | `60000` | rate-limit escrituras |
| `LIMIT_WRITE_MAX` | number | `50` | |
| `LIMIT_EMAIL_WINDOWS_MS` | number | `60000` | rate-limit de emails |
| `LIMIT_EMAIL_MAX` | number | `5` | |
| `UPLOADS_DIR` | string | `uploads` | directorio local para archivos |
| `MAX_FILE_SIZE` | number | `10485760` | bytes (10 MB) |
| `ALLOWED_FILE_TYPES` | CSV | `image/jpeg,image/png,image/gif,application/pdf` | tipos MIME aceptados por Multer |
| `ALLOWED_FILE_EXTENSIONS` | CSV | `.jpg,.jpeg,.png,.gif,.pdf` | extensiones aceptadas |

> **Variables con nombres desalineados — el zod las ignora silenciosamente.** El esquema sólo conoce los nombres listados arriba. Si tu `.env` tiene las claves de la columna izquierda, el `default` del esquema se aplica sin error y la variable real no surte efecto:

| `.env` tiene | El esquema espera |
|---|---|
| `JWT_SECRET_EXPIRES_IN` | `JWT_EXPIRES_IN` |
| `JWT_SECRET_EXPIRES_IN_REFRESH` | `JWT_REFRESH_EXPIRES_IN` |
| `COOKIE_SAMESITE` | `COOKIE_SAME_SITE` |
| `LIMIT_*_WINDOW_MS` (singular) | `LIMIT_*_WINDOWS_MS` (plural) |
| `MAX_PAGINATION_LIMIT` | `MAX_PAGINATION` |

> **`.env.test` rompe la validación.** Sus `JWT_SECRET` (19 caracteres) y `COOKIE_SECRET` (22 caracteres) no cumplen el `min(32)` del esquema, por lo que cualquier script que se ejecute con `NODE_ENV=test` falla al arrancar.

---

## Scripts disponibles

Definidos en `package.json`. La convención es `pnpm <script>`.

| Script | Comando interno | Descripción |
|---|---|---|
| `build` | `nest build` | Compila TypeScript a `dist/`. **Quirk:** emite en `dist/src/main.js`, ejecutar con `node dist/src/main.js`. |
| `start` | `nest start` | Inicia el servidor (sin watch). |
| `start:dev` | `cross-env NODE_ENV=development nest start --watch` | Modo desarrollo con hot-reload. **No arranca** si falta `.env.development`. |
| `start:debug` | `nest start --debug --watch` | Variante con debugger. |
| `start:prod` | `node dist/main` | **Ruta incorrecta**, usar `node dist/src/main.js`. |
| `lint` | `eslint "{src,apps,libs,test}/**/*.ts" --fix` | ESLint con `--fix` activo (reescribe archivos). Para sólo lectura: `pnpm exec eslint "{src,test}/**/*.ts"`. |
| `format` | `prettier --write "src/**/*.ts" "test/**/*.ts"` | |
| `test` | `jest` | **Roto**: ts-jest emite CommonJS pero `package.json` tiene `"type": "module"`. |
| `test:watch` | `jest --watch` | |
| `test:cov` | `jest --coverage` | |
| `test:e2e` | `jest --config ./test/jest-e2e.json` | Igual problema de ESM. |
| `prisma:generate` | `prisma generate` | Regenera el cliente en `generated/prisma/`. |
| `prisma:migrate` | `cross-env NODE_ENV=development prisma migrate dev` | Aplica migraciones en desarrollo. |
| `prisma:reset` | `cross-env NODE_ENV=development prisma migrate reset` | **Borra todos los datos** y vuelve a migrar. |
| `prisma:seed` | `cross-env NODE_ENV=development tsx src/database/seed.runner.ts` | Ejecuta la semilla idempotente. |
| `prisma:seed:clear` | `… tsx src/database/seed.runner.ts --clear` | Limpia los datos sembrados. |
| `seed` / `seed:clear` | alias de los anteriores. |

Typecheck rápido sin script dedicado:

```bash
pnpm exec tsc --noEmit
```

CLI de Prisma en general:

```bash
pnpm exec prisma validate | generate | migrate dev
```

---

## Estructura del proyecto

```
src/
├── main.ts                 — bootstrap, middleware, pipes, filtros, interceptores
├── app.module.ts           — composición de módulos + CorrelationMiddleware
├── app.controller.ts       — endpoint raíz
├── app.service.ts
├── config/
│   ├── settings.config.ts          — env validada re-exportada como objeto plano
│   ├── validation/validation.ts    — esquema Zod + @t3-oss/env-core
│   ├── storages/                   — servicio de archivos + uploads.config.ts
│   └── swagger/                    — placeholder
├── common/
│   ├── decorators/                 — @Public, @Roles, @User
│   ├── filters/                    — Zod, Prisma, NotFound, Exception
│   ├── interceptors/               — ApiResponse, Logging
│   └── middlewares/                — Correlation
├── database/
│   ├── interfaces/
│   ├── seeders/                    — 7 seeders idempotentes
│   ├── seed.module.ts
│   ├── seed.services.ts            — orquesta el seed y el clear
│   └── seed.runner.ts              — CLI (--clear / --help)
├── modules/
│   ├── auth/
│   │   ├── root.module.ts
│   │   ├── users/                  — CRUD + admin create
│   │   ├── roles/                  — CRUD
│   │   └── sessions/               — login/refresh/logout/verify + guards
│   ├── jwt/                        — JwtModuleGlobal (configurado con settings)
│   ├── mailer/                     — Resend + plantillas Handlebars
│   ├── categories/
│   │   ├── root.module.ts
│   │   ├── category/
│   │   └── subcategory/
│   ├── books/
│   │   ├── root.module.ts
│   │   └── book/                   — multipart, file cleanup
│   └── security/
│       ├── root.module.ts
│       ├── permissions/
│       └── role-permission/
├── prisma/                         — PrismaModule + PrismaService (driver pg)
├── shared/
│   ├── dtos/                       — Zod DTOs reutilizables
│   └── interfaces/
└── utils/
    ├── context/                    — contexto de correlación
    ├── cookies/                    — cookieOptions, refreshCookieOptions
    ├── functions/                  — getEnvFile, compileTemplate, deleteStoredFile
    └── prisma/                     — extended Prisma client (softDelete, etc.)

prisma/
├── schema.prisma                   — 17 modelos + 7 enums en español
└── migrations/                     — carpeta vacía: todavía no se ha generado ninguna migración

rest/                               — archivos .http para REST Client
├── auth/{users,sessions,roles}/
├── mailer/mailer.http
├── categories/{category,subcategory}/
├── books/book/
└── security/{permissions,role-permission}/

generated/                          — gitignored; cliente Prisma (output del generator)
templates/                          — 5 archivos .hbs (Handlebars) para los correos del mailer
```

---

## Módulos

Todos los endpoints se sirven bajo el prefijo global `/api` (configurable vía `BASE_PATH`). Las anotaciones `@Roles(...)` se traducen al español en la capa de autorización.

### Auth — `/api/users`, `/api/roles`, `/api/sessions`

- `POST /api/users` — **público** — crea un usuario con el rol por defecto (`Usuario`).
- `POST /api/users/admin` — **Administrador** — crea cualquier usuario con cualquier rol; genera contraseña temporal y dispara el flujo de invitación.
- `GET /api/users?page=&limit=` — **Administrador, Recepcionista** — listado paginado.
- `GET /api/users/active?page=&limit=` — **Administrador, Recepcionista** — sólo no bloqueados y activos.
- `GET /api/users/:id` — **Administrador, Recepcionista, Usuario** — un usuario por id.
- `PATCH /api/users/:id` — **Administrador, Recepcionista, Usuario** — actualización parcial.
- `PATCH /api/users/status/:id` — **Administrador** — activa/desactiva una cuenta.
- `DELETE /api/users/:id` — **Administrador** — soft delete.
- `POST /api/sessions/login` — **público** — devuelve `accessToken` en el cuerpo y establece las cookies `slib_jwt` (refresh) y `slib_jwt-access`. Implementa bloqueo progresivo y validación de `verified`.
- `POST /api/sessions/refresh` — **público** — lee la cookie de refresh y rota ambos tokens.
- `POST /api/sessions/logout` — autenticado — cierra la sesión activa y revoca los refresh tokens.
- `GET /api/sessions/verify` — autenticado — sanity check del JWT.
- `POST /api/roles` — **Administrador** — crea un rol.
- `GET /api/roles?page=&limit=` — **Administrador** — paginado.
- `GET /api/roles/:id` — **Administrador**.
- `PATCH /api/roles/:id` — **Administrador**.
- `DELETE /api/roles/:id` — **Administrador**.

### Seguridad — `/api/permissions`, `/api/role-permission`

- `POST /api/permissions` — **Administrador**.
- `GET /api/permissions?page=&limit=` — **Administrador**.
- `GET /api/permissions/:id` — **Administrador**.
- `PATCH /api/permissions/:id` — **Administrador**.
- `DELETE /api/permissions/:id` — **Administrador**.
- `POST /api/role-permission` — **Administrador** — asocia un permiso a un rol.
- `GET /api/role-permission?page=&limit=` — **Administrador**.
- `GET /api/role-permission/role/:roleId?page=&limit=` — **Administrador** — permisos efectivos de un rol.
- `DELETE /api/role-permission/role/:roleId/permission/:permissionId` — **Administrador**.

### Mailer — `/api/mailer` (todos públicos)

- `POST /api/mailer/welcome?email=&token=` — valida el token de verificación recibido por correo y marca al usuario como verificado.
- `POST /api/mailer/set-password` — define la contraseña inicial del usuario invitado (body: `{ email, newPassword, token }`).
- `POST /api/mailer/forgot-password` — envía correo de recuperación (body: `{ email }`).
- `POST /api/mailer/reset-password` — aplica la nueva contraseña validando el token (body: `{ email, newPassword, token }`).

### Categorías — `/api/category`, `/api/subcategory`

- `POST /api/category` — **Administrador** — crea categoría y, opcionalmente, subcategorías en la misma operación (`subCategories[]`).
- `GET /api/category?page=&limit=` — **Administrador, Recepcionista** — paginado, incluye subcategorías.
- `GET /api/category/active?page=&limit=` — **Administrador, Recepcionista, Usuario** — sólo activas.
- `GET /api/category/:id` — **Administrador, Recepcionista, Usuario**.
- `PATCH /api/category/status/:id` — **Administrador, Recepcionista** — toggle `isActive`.
- `PATCH /api/category/:id` — **Administrador**.
- `DELETE /api/category/:id` — **Administrador** — soft delete.
- `POST /api/subcategory` — **Administrador**.
- `GET /api/subcategory?page=&limit=` — **Administrador, Recepcionista**.
- `GET /api/subcategory/active?page=&limit=` — **Administrador, Recepcionista, Usuario**.
- `GET /api/subcategory/category/:categoryId?page=&limit=` — **Administrador, Recepcionista, Usuario**.
- `GET /api/subcategory/:id` — **Administrador, Recepcionista, Usuario**.
- `PATCH /api/subcategory/:id` — **Administrador**.
- `DELETE /api/subcategory/:id` — **Administrador** — soft delete.

### Libros — `/api/book`

- `POST /api/book` — **Administrador** — acepta `multipart/form-data` con cabecera `x-upload: <subfolder>` para la portada; persistiendo además `mimeType` y `fileSize`.
- `GET /api/book?page=&limit=` — **Administrador, Recepcionista, Usuario**.
- `GET /api/book/category/:categoryId?page=&limit=` — **Administrador, Recepcionista, Usuario**.
- `GET /api/book/subcategory/:subcategoryId?page=&limit=` — **Administrador, Recepcionista, Usuario**.
- `GET /api/book/publisher/:publisherId?page=&limit=` — **Administrador, Recepcionista, Usuario**.
- `GET /api/book/:id` — **Administrador, Recepcionista, Usuario**.
- `PATCH /api/book/:id` — **Administrador, Recepcionista** — multipart; reemplaza la portada anterior en disco si la hay.
- `DELETE /api/book/:id` — **Administrador** — soft delete + borrado físico de la portada.

---

## Base de datos

- **PostgreSQL** vía `DATABASE_URL`. La conexión se establece con `PrismaPg` (driver adapter de `@prisma/adapter-pg`); no se usa el cliente "clásico" `new PrismaClient()`.
- `prisma/schema.prisma` es la fuente de verdad del modelo de datos. Modelos en PascalCase inglés mapeados vía `@@map` a tablas `snake_case` (`User` → `users`, `RolePermission` → `role_permissions`, etc.).
- **Valores de enum en español y sin comillas** — son etiquetas literales de Postgres:
  - `PhysicalCopyStatus`: `Disponible`, `Prestado`, `Dañado`, `Extraviado`, `Mantenimiento`.
  - `RequestStatus`: `Pendiente`, `Aprobada`, `Rechazada`, `Cancelada`.
  - `LoanStatus`: `Activo`, `Finalizado`, `Vencido`.
  - `FineStatus`: `Pendiente`, `Pagada`, `Condonada`.
  - `SuspensionStatus`: `Activa`, `Finalizada`, `Revocada`.
  - `IncidentType`: `Pendiente`, `En_Revision`, `Resuelta`.
  - `NotificationType`: `BIENVENIDA`, `CAMBIO_ROL`, `SOLICITUD_CREADA`, `SOLICITUD_APROBADA`, `SOLICITUD_RECHAZADA`, `PRESTAMO_REGISTRADO`, `RECORDATORIO_DEVOLUCION`, `PRESTAMO_VENCIDO`, `DEVOLUCION_COMPLETADA`, `MULTA_GENERADA`, `SUSPENSION_APLICADA`, `INCIDENCIA_REPORTADA`, `INCIDENCIA_ACTUALIZADA`, `NUEVO_LIBRO_REGISTRADO`.
- Modelos principales: `User`, `Role`, `Permission`, `RolePermission`, `Session`, `RefreshToken`, `Category`, `Subcategory`, `Book`, `Author`, `BookAuthor`, `Publisher`, `PhysicalCopy`, `Request`, `Loan`, `Fine`, `Suspension`, `Favorite`, `Review`, `Report`, `Incident`, `Notification`.
- **Typos históricos que ya forman parte del esquema** (no "arreglar" sin migración): `pyhsicalCopyId` (`Loan`, `Incident`), `ubication` (`PhysicalCopy`).
- El **generador** es `provider = "prisma-client"` (no `prisma-client-js`) y emite en `../generated/prisma/` (carpeta gitignored). Después de cualquier cambio al schema: `pnpm exec prisma generate`.
- El **datasource** no tiene `url` declarado: la URL la lee `prisma.config.ts` desde `process.env["DATABASE_URL"]`, por lo que la carga del `.env` correspondiente es crítica.
- Hay **0 migraciones** en `prisma/migrations/` (la carpeta aún no existe). Para crear la primera y aplicarla: `pnpm exec prisma migrate dev --name <nombre>`.

---

## Seed de la base de datos

El sistema de seed vive en `src/database/` y se ejecuta como un `ApplicationContext` independiente de Nest (`src/database/seed.runner.ts`), de modo que puede correr sin arrancar el servidor HTTP.

```bash
pnpm prisma:seed          # ejecuta la semilla (idempotente)
pnpm prisma:seed:clear    # borra los datos sembrados en orden inverso
pnpm prisma:seed --help   # imprime ayuda
```

La ejecución imprime al final un resumen con los conteos por entidad (`permissions`, `roles`, `rolePermissions`, `users`, `sessions`, `refreshTokens`, `categories`, `subcategories`) y la lista de errores si alguno falló.

Orden de ejecución (respeta las claves foráneas):

1. **Permisos** — 52 hardcoded en `src/database/seeders/permissions.seeder.ts` (catálogo `PERMISSION_CATALOG`).
2. **Roles** — 4 roles base en `roles.seeder.ts`:
   - `Administrador` (no por defecto)
   - `Recepcionista` (no por defecto)
   - `Bibliotecario` (no por defecto)
   - `Usuario` (`isDefault = true`; se asigna a los registros públicos).
3. **Asociación rol-permiso** — matriz `ROLE_PERMISSIONS_MATRIX` en `role-permission.seeder.ts`.
4. **Usuarios** — 3 usuarios conocidos más 15 aleatorios con `@faker-js/faker` (`fakerES`):
   - `admin@slib.com` — Admin Principal (Administrador).
   - `usuario@slib.com` — Juan Pérez (Usuario).
   - `recepcion@slib.com` — María González (Recepcionista).
   - Los faker usan una contraseña aleatoria de 6 caracteres generada y hasheada con `argon2`.
5. **Categorías** — 8 categorías base (`CATEGORY_CATALOG`): Ficción, Ciencia, Historia, Literatura, Infantil, Académico, Arte, Tecnología.
6. **Subcategorías** — 28 subcategorías asociadas a las categorías anteriores (`SUBCATEGORY_CATALOG`).
7. **Sesiones y refresh tokens** — 60% de probabilidad por usuario, máximo 2 sesiones por usuario; cada sesión recibe refresh tokens con hash sha256.

Las contraseñas de los 3 usuarios conocidos están hasheadas con `argon2` y son **`secreto1`**. Son las credenciales que imprime `printHelp()` y las que se usan en los archivos `rest/`.

---

## Plantillas de correo

Las plantillas viven en la carpeta raíz `templates/` (no en `src/modules/mailer/`). Son archivos `.hbs` (Handlebars) y se compilan en tiempo de ejecución desde `compileTemplate(templatePath, context)` (`src/utils/functions/function.ts:58`), que resuelve el path con `process.cwd()`.

| Archivo | Uso |
|---|---|
| `welcome.hbs` | Correo de bienvenida con enlace de verificación (`/verify?token=…&email=…`). |
| `set-password.hbs` | Correo para definir la contraseña inicial desde una invitación. |
| `forgot-password.hbs` | Correo de recuperación de contraseña con enlace de reseteo. |
| `password-change.hbs` | Aviso de cambio de contraseña (también se envía tras un `resetPassword`). |
| `password-set.hbs` | Aviso de contraseña establecida (se envía tras `setPassword`). |

> El endpoint `POST /api/mailer/reset-password` no tiene plantilla propia: internamente llama a `sendPasswordChangeEmail` y envía `password-change.hbs`.

Las plantillas esperan un contexto con claves como `firstName`, `lastName`, `link`, `login`, `year`. Las URLs se construyen a partir de `settings.server.corsOrigin`.

---

## Pruebas REST (REST Client)

La carpeta `rest/` contiene archivos `.http` que se ejecutan con la extensión [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) de VS Code (o equivalentes como `httpYac` e IntelliJ HTTP Client).

```
rest/
├── auth/
│   ├── users/users.http
│   ├── roles/roles.http
│   └── sessions/sessions.http
├── mailer/mailer.http
├── categories/{category,subcategory}/*.http
├── books/book/book.http
└── security/{permissions,role-permission}/*.http
```

Variables compartidas al inicio de cada archivo:

| Variable | Default | Uso |
|---|---|---|
| `@host` | `http://localhost:4500` | URL base (coincide con `PORT` del `.env.development`). |
| `@basePath` | `{{host}}/api` | Prefijo global. |
| `@contentType` | `application/json` | Cabecera `Content-Type`. |
| `@accessToken` | _(vacío)_ | Pegar aquí el `accessToken` recibido en `/api/sessions/login`. |
| `@authHeader` | `Bearer {{accessToken}}` | Cabecera `Authorization`. |

Flujo típico:

1. Arrancar el servidor (`pnpm start:dev`).
2. Ejecutar `POST /api/sessions/login` con las credenciales seed.
3. Pegar el `accessToken` en la variable `@accessToken` del archivo que se vaya a usar.
4. Pulsar **Send Request** sobre cada bloque `###`.

Para los endpoints multipart (`POST /api/book`, `PATCH /api/book/:id`) los archivos `.http` usan la sintaxis de REST Client para adjuntar archivos (`< ./ruta/a/portada.jpg`) y la cabecera `x-upload` para el subdirectorio.

Los endpoints de mailer son públicos; no requieren la cabecera `Authorization`.

---

## Problemas conocidos y solución de errores

- **El mapeo de `.env` está desfasado.** `src/utils/functions/function.ts` (`getEnvFile`) sólo conoce `.env.development`, `.env.production` y `.env.test`. Si añades un `.env.local`, no se cargará. Ver [Variables de entorno](#variables-de-entorno) para la lista de claves con nombres desalineados que el esquema ignora silenciosamente.
- **`JWT_SECRET` y `COOKIE_SECRET` de `.env.test` no pasan la validación** porque no alcanzan el `min(32)` del esquema Zod. Cualquier script con `NODE_ENV=test` muere al arrancar.
- **Imports relativos en TypeScript deben terminar en `.js`.** `package.json` declara `"type": "module"` y `tsconfig.json` usa `NodeNext`; el archivo fuente es `.ts` pero el import debe apuntar al archivo emitido. No hay alias de path en tiempo de build — la extensión es la única forma de resolver el módulo.
- **El cliente de Prisma se genera fuera de `node_modules`.** El generador emite en `generated/prisma/` y esa carpeta está gitignored. Cualquier import desde el código debe usar `../../generated/prisma/client.js` (ver `src/prisma/prisma.service.ts:4`). Después de modificar `schema.prisma`, ejecuta `pnpm exec prisma generate`.
- **`pnpm test` y `pnpm test:e2e` están rotos.** La config de Jest en `package.json` usa `ts-jest` (que emite CommonJS), pero el paquete es ESM. Falta `extensionsToTreatAsEsm: ['.ts']` y/o lanzar Jest con `NODE_OPTIONS=--experimental-vm-modules`.
- **`pnpm start:prod` apunta a un binario que no existe.** `nest build` emite en `dist/src/main.js` (la presencia del `prisma.config.ts` en la raíz amplía el `rootDir` inferido). Usa `node dist/src/main.js`.
- **`pnpm lint` reescribe tus archivos.** El script lleva `--fix` por defecto. Para un check de sólo lectura: `pnpm exec eslint "{src,test}/**/*.ts"`. El glob también incluye `apps/` y `libs/` (que no existen en este proyecto).
- **`pnpm-workspace.yaml` está gitignored.** Sirve como allowlist de `allowBuilds` de pnpm 10 para los postinstall nativos (`argon2`, `prisma`, `@prisma/engines`). Un clon fresco puede no traerla y bloquear la compilación nativa. Además contiene un placeholder `'@scarf/scarf': set this to true or false` que debes resolver explícitamente.
- **`AGENTS.md` es la documentación operativa real.** Este README la complementa pero no la sustituye. En particular, ahí están listados archivos "rota-olvidados" del starter que todavía fallan en `tsc` / `lint` (p. ej. `src/app.controller.spec.ts:19` llamando a `appController.getHello()`, o `src/utils/functions/function.ts` con un `import fs` no utilizado).

---

## Licencia

`UNLICENSED` — proyecto privado (`"private": true` en `package.json`). Todos los derechos reservados.