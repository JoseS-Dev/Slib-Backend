import type { SessionPayload } from '../../modules/auth/sessions/sessions.constants.js';

declare global {
  namespace Express {
    interface Request {
      user?: SessionPayload;
    }
  }
}
