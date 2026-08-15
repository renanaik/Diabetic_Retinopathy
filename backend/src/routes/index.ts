/**
 * index.ts — API route aggregator
 *
 * All routes are mounted here and registered as /api/* in server.ts.
 *
 * Phase 5A — only /health is implemented.
 * Future routes (auth, users, doctors, patients, connections, screenings, reports)
 * will be added here in later phases without modifying server.ts.
 */

import { Router } from 'express';
import healthRouter from './health';

const router = Router();

// ── Phase 5A ──────────────────────────────────────────────────────────────────
router.use('/health', healthRouter);

// ── Future phases (stubs — do NOT implement here yet) ─────────────────────────
// router.use('/auth',        authRouter);
// router.use('/users',       usersRouter);
// router.use('/doctors',     doctorsRouter);
// router.use('/patients',    patientsRouter);
// router.use('/connections', connectionsRouter);
// router.use('/screenings',  screeningsRouter);
// router.use('/reports',     reportsRouter);

export default router;
