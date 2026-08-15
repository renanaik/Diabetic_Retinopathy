/**
 * seedSuperAdmin.ts — Super Admin seed script
 *
 * Creates exactly one Super Admin account in the database.
 * Credentials come from environment variables — never hardcoded.
 *
 * Safe to run multiple times: exits cleanly if Super Admin already exists.
 *
 * Usage:
 *   cd backend
 *   npm run seed:admin
 *
 * Required environment variables:
 *   SUPER_ADMIN_NAME      Display name for the admin account
 *   SUPER_ADMIN_EMAIL     Login email for the admin account
 *   SUPER_ADMIN_PASSWORD  Strong password (will be hashed with bcrypt)
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { logger } from '../utils/logger';

// ─── Config validation ────────────────────────────────────────────────────────

function validateSeedConfig(): {
  mongoUri: string;
  name: string;
  email: string;
  password: string;
} {
  const mongoUri = process.env.MONGO_URI;
  const name = process.env.SUPER_ADMIN_NAME;
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;

  const missing: string[] = [];
  if (!mongoUri) missing.push('MONGO_URI');
  if (!name)     missing.push('SUPER_ADMIN_NAME');
  if (!email)    missing.push('SUPER_ADMIN_EMAIL');
  if (!password) missing.push('SUPER_ADMIN_PASSWORD');

  if (missing.length > 0) {
    logger.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.error('SEED ERROR: Missing required environment variables:');
    missing.forEach(v => logger.error(`  - ${v}`));
    logger.error('');
    logger.error('Add these to backend/.env and retry.');
    logger.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    process.exit(1);
  }

  return {
    mongoUri: mongoUri!,
    name: name!.trim(),
    email: email!.trim().toLowerCase(),
    password: password!,
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seedSuperAdmin(): Promise<void> {
  logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  logger.info('RetinaCare AI — Super Admin Seed');
  logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const config = validateSeedConfig();

  // ── Connect to MongoDB ─────────────────────────────────────────────────────
  logger.info('Connecting to MongoDB…');
  await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 10_000 });
  const host = mongoose.connection.host;
  const dbName = mongoose.connection.name;
  logger.info(`Connected  →  host: ${host}  |  db: ${dbName}`);

  // ── Check for existing Super Admin ─────────────────────────────────────────
  const existing = await User.findOne({ role: 'super_admin' });

  if (existing) {
    logger.info('');
    logger.info(`Super Admin already exists:  ${existing.email}`);
    logger.info('No changes made. Seed complete.');
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    await mongoose.disconnect();
    return;
  }

  // ── Create Super Admin ─────────────────────────────────────────────────────
  logger.info(`Creating Super Admin:  ${config.email}`);

  const passwordHash = await bcrypt.hash(config.password, 12);

  const admin = await User.create({
    name: config.name,
    email: config.email,
    passwordHash,
    role: 'super_admin',
    verificationStatus: 'not_applicable',
    isActive: true,
  });

  logger.info('');
  logger.info('✅ Super Admin created successfully!');
  logger.info(`   ID    : ${admin._id.toString()}`);
  logger.info(`   Name  : ${admin.name}`);
  logger.info(`   Email : ${admin.email}`);
  logger.info(`   Role  : ${admin.role}`);
  logger.info('');
  logger.info('Keep the admin credentials secure.');
  logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  await mongoose.disconnect();
}

// ─── Run ──────────────────────────────────────────────────────────────────────

seedSuperAdmin().catch((err: Error) => {
  logger.error('Seed failed:', err.message);
  mongoose.disconnect().finally(() => process.exit(1));
});
