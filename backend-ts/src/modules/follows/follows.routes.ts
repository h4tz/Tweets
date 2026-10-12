import { Router } from 'express';
import { z } from 'zod';
import { ApiError } from '../../errors';
import { requireAuth } from '../../middleware/auth';
import { asyncHandler } from '../../middleware/error';
import { FollowService, FollowYourselfError } from './follows.service';

export const followsRouter = Router();

const userIdSchema = z.object({
  user_id: z.coerce.number().int().positive(),
});

// POST /api/users/:user_id/follow/ — toggle follow; mirrors Django's status codes
followsRouter.post(
  '/users/:user_id/follow',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { user_id } = userIdSchema.parse(req.params);

    let isFollowed: boolean | null;
    try {
      isFollowed = await FollowService.toggleFollow(req.userId!, user_id);
    } catch (err) {
      if (err instanceof FollowYourselfError) {
        throw new ApiError(400, { detail: 'Cannot follow yourself. ' });
      }
      throw err;
    }

    if (isFollowed === null) {
      throw new ApiError(409, { detail: 'Already following this user.' });
    }
    if (!isFollowed) {
      res.status(204).end();
      return;
    }
    res.status(201).json({ detail: 'Followed successfully' });
  }),
);
