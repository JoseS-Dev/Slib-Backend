import { env } from "./validation/validation.js";

export const settings = {
    server: {
        databaseUrl: env.DATABASE_URL,
        port: env.PORT,
        basePath: env.BASE_PATH,
        corsOrigin: env.CORS_ORIGIN,
        nodeEnv: env.NODE_ENV,
        maxPagination: env.MAX_PAGINATION,
        apiKey: env.RESEND_API_KEY,
        methodsAllowed: env.METHODS_ALLOWED,
        emailFrom: env.EMAIL_FROM,
    },
    security: {
        jwtSecret: env.JWT_SECRET,
        cookieSecret: env.COOKIE_SECRET,
        jwtExpiresIn: env.JWT_EXPIRES_IN,
        jwtRefreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
        jwtAlgorithm: env.JWT_ALGORITHM,
        cookieName: env.COOKIE_NAME,
        cookieExpiresIn: env.COOKIE_EXPIRES_IN,
        cookieSecure: env.COOKIE_SECURE,
        cookieSameSite: env.COOKIE_SAME_SITE,
    },
    rateLimit: {
        maxFailedLoginAttempts: env.MAX_FAILED_LOGIN_ATTEMPTS,
        lockTimeMinutes: env.LOCK_TIME_MINUTES,
        loginLimitWindowMs: env.LOGIN_LIMIT_WINDOW_MS,
        loginLimitMax: env.LOGIN_LIMIT_MAX,
        limitReadWindowsMs: env.LIMIT_READ_WINDOWS_MS,
        limitReadMax: env.LIMIT_READ_MAX,
        limitWriteWindowsMs: env.LIMIT_WRITE_WINDOWS_MS,
        limitWriteMax: env.LIMIT_WRITE_MAX,
        limitEmailWindowsMs: env.LIMIT_EMAIL_WINDOWS_MS,
        limitEmailMax: env.LIMIT_EMAIL_MAX,
    },
    uploads: {
        uploadsDir: env.UPLOADS_DIR,
        maxFileSize: env.MAX_FILE_SIZE,
        allowedFileTypes: env.ALLOWED_FILE_TYPES,
        allowedFileExtensions: env.ALLOWED_FILE_EXTENSIONS,
    }
}