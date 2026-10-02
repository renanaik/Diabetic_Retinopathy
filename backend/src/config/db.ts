/**
 * db.ts
 * MongoDB connection module for RetinaCare AI.
 *
 * Reads MONGO_URI from the environment.
 * Never logs or exposes the connection string or credentials.
 */

import mongoose from 'mongoose';
import dns from 'dns';
import net from 'net';
import { logger } from '../utils/logger';

// Set DNS servers to public resolvers (Google / Cloudflare) to bypass problematic local DNS
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (err) {
  logger.warn('Failed to set custom DNS servers:', err instanceof Error ? err.message : err);
}

/**
 * Custom lookup function to resolve hostnames via dns.resolve4 (which respects dns.setServers)
 * instead of the default dns.lookup (which uses the OS resolver and ignores setServers).
 */
const customLookup = (
  hostname: string,
  options: any,
  callback: (err: Error | null, address?: any, family?: number) => void
) => {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  if (net.isIP(hostname)) {
    const family = net.isIP(hostname);
    if (options.all) {
      callback(null, [{ address: hostname, family }]);
    } else {
      callback(null, hostname, family);
    }
    return;
  }

  dns.resolve4(hostname, (err, addresses) => {
    if (err || !addresses || addresses.length === 0) {
      // Fallback to standard OS lookup
      dns.lookup(hostname, options, callback);
    } else {
      if (options.all) {
        callback(null, addresses.map(addr => ({ address: addr, family: 4 })));
      } else {
        callback(null, addresses[0], 4);
      }
    }
  });
};


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
      lookup: customLookup as any,
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
