import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { ApiError, ValidationError } from '../errors';

/** Wrap async route handlers so rejections reach the error middleware. */
export function asyncHandler<
  T extends (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
>(fn: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ApiError) {
    res.status(err.status).json(err.body);
    return;
  }
  if (err instanceof ZodError) {
    const errors: Record<string, string[]> = {};
    for (const issue of err.issues) {
      const key = issue.path.join('.') || 'detail';
      (errors[key] ??= []).push(issue.message);
    }
    res.status(400).json(new ValidationError(errors).body);
    return;
  }
  // Unexpected error — log like Django would and return a generic 500.
  console.error(err);
  res.status(500).json({ detail: 'Internal Server Error' });
}
