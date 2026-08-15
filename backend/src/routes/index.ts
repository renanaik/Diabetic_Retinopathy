/**
 * index.ts — API route aggregator
 *
 * All routes are mounted here and registered as /api/* in server.ts.
 *
 * Phase 5A — /health
 * Phase 5B — /auth  (signup, login, me)
 *
 * Future routes will be added here without modifying server.ts.
 */

import { Router } from 'express';
import healthRouter from './health';
import authRouter from './auth';

const router = Router();

// ── Phase 5A ──────────────────────────────────────────────────────────────────
router.use('/health', healthRouter);

// ── Phase 5B ──────────────────────────────────────────────────────────────────
router.use('/auth', authRouter);

// ── Future phases ─────────────────────────────────────────────────────────────
// router.use('/users',       usersRouter);
// router.use('/doctors',     doctorsRouter);
// router.use('/patients',    patientsRouter);
// router.use('/connections', connectionsRouter);
// router.use('/screenings',  screeningsRouter);
// router.use('/reports',     reportsRouter);

export default router;
