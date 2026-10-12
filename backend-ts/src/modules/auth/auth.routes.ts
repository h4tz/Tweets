import { Router } from 'express';
import { z } from 'zod';
import { ApiError } from '../../errors';
import { verifyRefreshToken } from '../../lib/jwt';
import { asyncHandler } from '../../middleware/error';
import { userSerializer } from '../../serializers/user';
import { AuthService } from './auth.service';

export const authRouter = Router();

const registerSchema = z.object({
  username: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8, 'Ensure this field has at least 8 characters.'),
});

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refresh: z.string().min(1),
});

// POST /api/register/ — create an account, returns the public user shape
authRouter.post(
  '/register',
  asyncHandler(async (req, res) => {
    const data = registerSchema.parse(req.body);
    const user = await AuthService.register(data);
    res.status(201).json(userSerializer(user));
  }),
);

// POST /api/login/ — returns { refresh, access } like simplejwt
authRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    const data = loginSchema.parse(req.body);
    const tokens = await AuthService.login(data.username, data.password);
    res.status(200).json(tokens);
  }),
);

// POST /api/refresh/ — rotate tokens from a refresh token
authRouter.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const data = refreshSchema.parse(req.body);
    try {
      const payload = verifyRefreshToken(data.refresh);
      res.status(200).json(AuthService.refresh(payload.user_id));
    } catch {
      throw new ApiError(401, { detail: 'Token is invalid or expired' });
    }
  }),
);
