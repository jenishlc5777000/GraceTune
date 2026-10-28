import type { RequestHandler } from 'express';
import type { Role } from '@gracetunes/shared';
import { AppError } from '../lib/errors';
import { verifyAccessToken, type AccessClaims } from '../lib/jwt';

declare module 'express-serve-static-core' {
  interface Request {
    auth?: AccessClaims;
  }
}

export const requireAuth: RequestHandler = async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) throw new AppError(401, 'UNAUTHENTICATED', 'Sign in required');
  try {
    req.auth = await verifyAccessToken(header.slice(7));
  } catch {
    throw new AppError(401, 'TOKEN_INVALID', 'Session expired, please sign in again');
  }
  next();
};

export const requireRole =
  (...roles: Role[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.auth || !roles.includes(req.auth.role)) {
      throw new AppError(403, 'FORBIDDEN', 'You do not have permission to do that');
    }
    next();
  };
