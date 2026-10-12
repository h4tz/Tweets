import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../middleware/auth';
import { asyncHandler } from '../../middleware/error';
import { LikeService } from './likes.service';

export const likesRouter = Router();

const tweetIdSchema = z.object({
  tweet_id: z.coerce.number().int().positive(),
});

// POST /api/tweets/:tweet_id/like/ — toggle like; 201 when liked, 204 when unliked
likesRouter.post(
  '/tweets/:tweet_id/like',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { tweet_id } = tweetIdSchema.parse(req.params);
    const isLiked = await LikeService.toggleLike(req.userId!, tweet_id);

    if (!isLiked) {
      res.status(204).end();
      return;
    }
    res.status(201).json({ detail: 'Tweet Liked' });
  }),
);
