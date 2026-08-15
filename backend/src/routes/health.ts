/**
 * health.ts
 * GET /api/health
 *
 * Returns the current status of the API and MongoDB connection.
 * Does NOT expose sensitive configuration or credentials.
 */

import { Router, Request, Response } from 'express';
import { getConnectionState } from '../config/db';

const router = Router();

router.get('/', (_req: Request, res: Response): void => {
  const dbState = getConnectionState();

  res.status(200).json({
    success: true,
    message: 'RetinaCare AI API is running',
    database: dbState,
    environment: process.env.NODE_ENV ?? 'development',
    timestamp: new Date().toISOString(),
  });
});

export default router;
