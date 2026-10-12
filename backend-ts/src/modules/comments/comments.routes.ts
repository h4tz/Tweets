import { Router } from 'express';
import { z } from 'zod';
import { optionalAuth, requireAuth } from '../../middleware/auth';
import { asyncHandler } from '../../middleware/error';
import { CommentService } from './comments.service';

export const commentsRouter = Router();

const tweetIdSchema = z.object({
  tweet_id: z.coerce.number().int().positive(),
});

const cursorQuerySchema = z.object({
  cursor: z.string().optional(),
});

const createSchema = z.object({
  content: z.string().min(1, 'This field may not be blank.'),
  parent_comment: z.coerce.number().int().positive().nullish(),
});

// GET /api/tweets/:tweet_id/comments/ — paginated comments on a tweet
commentsRouter.get(
  '/tweets/:tweet_id/comments',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { tweet_id } = tweetIdSchema.parse(req.params);
    const query = cursorQuerySchema.parse(req.query);
    res.status(200).json(await CommentService.list(tweet_id, query, req.userId));
  }),
);

// POST /api/tweets/:tweet_id/comments/ — add a comment or reply
commentsRouter.post(
  '/tweets/:tweet_id/comments',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { tweet_id } = tweetIdSchema.parse(req.params);
    const data = createSchema.parse(req.body);
    const comment = await CommentService.create(
      tweet_id,
      req.userId!,
      data.content,
      data.parent_comment ?? null,
      req.userId,
    );
    res.status(201).json(comment);
  }),
);
