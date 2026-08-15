/**
 * db.ts
 * MongoDB connection module for RetinaCare AI.
 *
 * Reads MONGO_URI from the environment.
 * Never logs or exposes the connection string or credentials.
 */

import mongoose from 'mongoose';
import { logger } from '../utils/logger';

// ─── Connection State ─────────────────────────────────────────────────────────

let isConnected = false;

export function getConnectionState(): 'connected' | 'disconnected' | 'connecting' | 'disconnecting' {
  const states: Record<number, 'connected' | 'disconnected' | 'connecting' | 'disconnecting'> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return states[mongoose.connection.readyState] ?? 'disconnected';
}

// ─── Connect ──────────────────────────────────────────────────────────────────

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGO_URI;

  // ── Guard: require MONGO_URI ───────────────────────────────────────────────
  if (!uri || uri.trim() === '') {
    logger.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.error('CONFIGURATION ERROR: MONGO_URI is not set.');
    logger.error('');
    logger.error('Please create backend/.env and add:');
    logger.error('  MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/<db>');
    logger.error('');
    logger.error('Copy backend/.env.example to get started.');
    logger.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    process.exit(1);
  }

  // ── Guard: already connected ───────────────────────────────────────────────
  if (isConnected) {
    logger.debug('MongoDB already connected — skipping reconnect.');
    return;
  }

  try {
    logger.info('Connecting to MongoDB…');

    await mongoose.connect(uri, {
      // Mongoose 8+ sets these sensible defaults, but we make them explicit
      serverSelectionTimeoutMS: 10_000, // fail fast after 10 s
      socketTimeoutMS: 45_000,
    });

    isConnected = true;

    // Log the host only (never log the full URI with credentials)
    const host = mongoose.connection.host;
    const dbName = mongoose.connection.name;
    logger.info(`MongoDB connected  →  host: ${host}  |  db: ${dbName}`);
  } catch (err) {
    logger.error('MongoDB connection failed:', err instanceof Error ? err.message : err);
    process.exit(1);
  }

  // ── Handle post-connect events ─────────────────────────────────────────────
  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    logger.warn('MongoDB disconnected.');
  });

  mongoose.connection.on('error', (err: Error) => {
    logger.error('MongoDB error:', err.message);
  });

  mongoose.connection.on('reconnected', () => {
    isConnected = true;
    logger.info('MongoDB reconnected.');
  });
}
