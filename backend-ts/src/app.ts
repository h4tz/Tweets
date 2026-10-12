import cors from 'cors';
import express from 'express';
import { config } from './config';
import { errorHandler } from './middleware/error';

export const app = express();

app.use(express.json());
app.use(
  cors({
    origin: config.corsOrigin === '*' ? true : config.corsOrigin.split(',').map((o) => o.trim()),
  }),
);

import { authRouter } from './modules/auth/auth.routes';
import { commentsRouter } from './modules/comments/comments.routes';
import { followsRouter } from './modules/follows/follows.routes';
import { likesRouter } from './modules/likes/likes.routes';
import { tweetsRouter } from './modules/tweets/tweets.routes';
import { usersRouter } from './modules/users/users.routes';

app.get('/api/health/', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', authRouter);
app.use('/api', usersRouter);
app.use('/api', tweetsRouter);
app.use('/api', likesRouter);
app.use('/api', commentsRouter);
app.use('/api', followsRouter);

// 404 + error handlers must be registered last
app.use((_req, res) => {
  res.status(404).json({ detail: 'Not found.' });
});
app.use(errorHandler);
