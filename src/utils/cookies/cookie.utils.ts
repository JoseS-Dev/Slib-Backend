import { settings } from '../../config/settings.config.js';

export const cookieOptions = {
  httpOnly: true,
  secure: settings.server.nodeEnv === 'production',
  sameSite: settings.security.cookieSameSite,
  maxAge: settings.security.cookieExpiresIn * 1000,
};

export const refreshCookieOptions = {
  ...cookieOptions,
  maxAge: settings.security.jwtRefreshExpiresIn * 1000,
};
