import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { isProduction } from '../config/env';

export class AppError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction): void {
  if (err instanceof ZodError) {
    res.status(400).json({ error: 'Validation failed', details: err.flatten() });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  console.error('[error]', err);
  const message = err instanceof Error ? err.message : 'Internal server error';
  res.status(500).json({ error: isProduction ? 'Internal server error' : message });
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
}
