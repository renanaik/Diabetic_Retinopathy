/**
 * index.ts — API route aggregator
 *
 * All routes are mounted here and registered as /api/* in server.ts.
 *
 * Phase 5A — /health
 * Phase 5B — /auth
 * Phase 5C — /admin, /connections
 * Phase 5D — /ml (AI Screening Prediction)
 * Phase 5E — /screenings (Screening Workflow & Persistent AI Results)
 *
 * Future routes will be added here without modifying server.ts.
 */

import { Router } from 'express';
import healthRouter from './health';
import authRouter from './auth';
import adminRouter from './admin';
import connectionRouter from './connections';
import mlRouter from './ml';
import screeningRouter from './screenings';
import patientRouter from './patient';

const router = Router();

// ── Phase 5A ──────────────────────────────────────────────────────────────────
router.use('/health', healthRouter);

// ── Phase 5B ──────────────────────────────────────────────────────────────────
router.use('/auth', authRouter);

// ── Phase 5C ──────────────────────────────────────────────────────────────────
router.use('/admin', adminRouter);
router.use('/connections', connectionRouter);

// ── Phase 5D ──────────────────────────────────────────────────────────────────
router.use('/ml', mlRouter);

// ── Phase 5E & 5F ─────────────────────────────────────────────────────────────
router.use('/screenings', screeningRouter);

// ── Phase 5G ──────────────────────────────────────────────────────────────────
router.use('/patient', patientRouter);

// ── Future phases ─────────────────────────────────────────────────────────────
// router.use('/users',       usersRouter);

export default router;
