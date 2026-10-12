import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { prisma } from '../db';
import { invalidToken, notAuthenticated } from '../errors';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

function readBearer(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header) return null;
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return token;
}

/**
 * Requires a valid JWT access token (like rest_framework_simplejwt), then
 * verifies the user still exists and attaches its id to the request.
 */
export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = readBearer(req);
  if (!token) return next(notAuthenticated());

  try {
    const payload = jwt.verify(token, config.jwtSecret) as { user_id: number; token_type: string };
    if (payload.token_type !== 'access') return next(invalidToken());

    const user = await prisma.user.findUnique({ where: { id: payload.user_id } });
    if (!user) return next(invalidToken());

    req.userId = user.id;
    next();
  } catch {
    next(invalidToken());
  }
}

/**
 * Attaches userId when a valid token is present, but allows anonymous
 * requests through (for IsAuthenticatedOrReadOnly style endpoints).
 */
export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const token = readBearer(req);
  if (!token) return next();

  try {
    const payload = jwt.verify(token, config.jwtSecret) as { user_id: number; token_type: string };
    if (payload.token_type === 'access') {
      const user = await prisma.user.findUnique({ where: { id: payload.user_id } });
      if (user) req.userId = user.id;
    }
  } catch {
    // anonymous request
  }
  next();
}
