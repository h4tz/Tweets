import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface TokenPayload {
  user_id: number;
  token_type: 'access' | 'refresh';
}

export function generateTokens(userId: number): { access: string; refresh: string } {
  const access = jwt.sign({ user_id: userId, token_type: 'access' }, config.jwtSecret, {
    expiresIn: `${config.access_token_lifetime_minutes}m`,
  });
  const refresh = jwt.sign({ user_id: userId, token_type: 'refresh' }, config.jwtRefreshSecret, {
    expiresIn: `${config.refresh_token_lifetime_days}d`,
  });
  return { access, refresh };
}

export function verifyAccessToken(token: string): TokenPayload {
  const payload = jwt.verify(token, config.jwtSecret) as TokenPayload;
  if (payload.token_type !== 'access') throw new Error('Not an access token');
  return payload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  const payload = jwt.verify(token, config.jwtRefreshSecret) as TokenPayload;
  if (payload.token_type !== 'refresh') throw new Error('Not a refresh token');
  return payload;
}
