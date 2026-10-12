import { Router } from 'express';
import { z } from 'zod';
import { optionalAuth, requireAuth } from '../../middleware/auth';
import { asyncHandler } from '../../middleware/error';
import { TweetService } from './tweets.service';

export const tweetsRouter = Router();

const tweetIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const contentSchema = z.object({
  content: z.string().min(1, 'This field may not be blank.'),
});

const cursorQuerySchema = z.object({
  cursor: z.string().optional(),
});

// GET /api/tweets/ — global timeline, cursor paginated (public read)
tweetsRouter.get(
  '/tweets',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const query = cursorQuerySchema.parse(req.query);
    const page = await TweetService.list(query, req.userId);
    res.status(200).json(page);
  }),
);

// POST /api/tweets/ — create a tweet (authenticated)
tweetsRouter.post(
  '/tweets',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { content } = contentSchema.parse(req.body);
    const tweet = await TweetService.create(req.userId!, content, req.userId);
    res.status(201).json(tweet);
  }),
);

// GET /api/tweets/:id/ — single tweet
tweetsRouter.get(
  '/tweets/:id',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { id } = tweetIdSchema.parse(req.params);
    res.status(200).json(await TweetService.get(id, req.userId));
  }),
);

// PUT/PATCH /api/tweets/:id/ — update (owner only)
const updateHandler = asyncHandler(async (req, res) => {
  const { id } = tweetIdSchema.parse(req.params);
  const { content } = contentSchema.parse(req.body);
  res.status(200).json(await TweetService.update(id, content, req.userId!));
});
tweetsRouter.put('/tweets/:id', requireAuth, updateHandler);
tweetsRouter.patch('/tweets/:id', requireAuth, updateHandler);

// DELETE /api/tweets/:id/ — delete (owner only)
tweetsRouter.delete(
  '/tweets/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { id } = tweetIdSchema.parse(req.params);
    await TweetService.destroy(id, req.userId!);
    res.status(204).end();
  }),
);
