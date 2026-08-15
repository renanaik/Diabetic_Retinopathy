/**
 * server.ts — RetinaCare AI Express server entry point
 *
 * Startup sequence:
 *   1. Load environment variables (.env)
 *   2. Validate required config
 *   3. Connect to MongoDB
 *   4. Initialize Express app
 *   5. Register middleware (CORS, JSON parsing)
 *   6. Mount API routes
 *   7. Register error handlers (404 + centralized error handler)
 *   8. Start listening
 */

import 'dotenv/config';
import express, { Application } from 'express';
import cors from 'cors';

import { connectDB } from './config/db';
import { logger } from './utils/logger';
import apiRouter from './routes/index';
import { notFound } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';

// ─── Environment ──────────────────────────────────────────────────────────────

const PORT = parseInt(process.env.PORT ?? '5000', 10);
const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:5173';
const NODE_ENV = process.env.NODE_ENV ?? 'development';

// ─── CORS configuration ───────────────────────────────────────────────────────

const corsOptions: cors.CorsOptions = {
  origin: FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

// ─── Express app ──────────────────────────────────────────────────────────────

const app: Application = express();

// ── Core middleware ────────────────────────────────────────────────────────────
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api', apiRouter);

// ── Error handling (must come after routes) ───────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────

async function start(): Promise<void> {
  // Connect to MongoDB first — exits process if MONGO_URI is missing or fails
  await connectDB();

  app.listen(PORT, () => {
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.info('  RetinaCare AI — Backend Server');
    logger.info(`  Environment  : ${NODE_ENV}`);
    logger.info(`  Port         : ${PORT}`);
    logger.info(`  API base     : http://localhost:${PORT}/api`);
    logger.info(`  Health check : http://localhost:${PORT}/api/health`);
    logger.info(`  Frontend URL : ${FRONTEND_URL}`);
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  });
}

start().catch((err: Error) => {
  logger.error('Fatal startup error:', err.message);
  process.exit(1);
});
