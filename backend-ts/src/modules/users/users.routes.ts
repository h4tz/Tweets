import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../middleware/error';
import { optionalAuth, requireAuth } from '../../middleware/auth';
import { userProfileSerializer } from '../../serializers/user';
import { UserService } from './users.service';

export const usersRouter = Router();

const userIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// GET /api/me/ — the authenticated user's profile
usersRouter.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { user, isFollowing } = await UserService.getProfile(req.userId!, req.userId);
    res.status(200).json(userProfileSerializer(user, req.userId, isFollowing));
  }),
);

// GET /api/users/:id/ — public profile of any user
usersRouter.get(
  '/users/:id',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { id } = userIdSchema.parse(req.params);
    const { user, isFollowing } = await UserService.getProfile(id, req.userId);
    res.status(200).json(userProfileSerializer(user, req.userId, isFollowing));
  }),
);
