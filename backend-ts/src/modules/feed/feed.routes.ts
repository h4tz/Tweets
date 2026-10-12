import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../middleware/auth';
import { asyncHandler } from '../../middleware/error';
import { FeedService } from './feed.service';

export const feedRouter = Router();

const cursorQuerySchema = z.object({
  cursor: z.string().optional(),
});

// GET /api/feed/ — tweets from accounts the authenticated user follows
feedRouter.get(
  '/feed',
  requireAuth,
  asyncHandler(async (req, res) => {
    const query = cursorQuerySchema.parse(req.query);
    res.status(200).json(await FeedService.listFeed(req.userId!, query));
  }),
);
