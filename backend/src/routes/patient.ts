/**
 * patient.ts — Patient Routes
 *
 * All endpoints require authentication and patient role:
 *   GET /api/patient/screenings     — List patient's approved screening history (approved only)
 *   GET /api/patient/screenings/:id — Retrieve single approved screening report (ownership enforced)
 *
 * Security:
 *   - Only authenticated users with role === 'patient' can access these routes.
 *   - Doctors and Super Admins are rejected with 403 Forbidden.
 *   - Unauthenticated requests are rejected with 401 Unauthorized.
 *   - Screenings in 'pending_review' or 'rejected' status return 404 to protect clinical workflow integrity.
 *   - Internal AI metrics (confidence, classProbabilities, referableProbability) are NOT exposed.
 */

import { Router } from 'express';
import {
  getPatientScreenings,
  getPatientScreeningById,
  getPatientProfile,
  updatePatientProfile,
} from '../controllers/patient.controller';
import { authenticate } from '../middleware/authenticate';
import { authorizeRoles } from '../middleware/authorizeRoles';

const router = Router();

// ── Global Patient Protection ─────────────────────────────────────────────────
router.use(authenticate, authorizeRoles('patient'));

// ── Patient Profile Endpoints ─────────────────────────────────────────────────
router.get('/profile', getPatientProfile);
router.put('/profile', updatePatientProfile);

// ── Patient Screening Endpoints ───────────────────────────────────────────────
router.get('/screenings', getPatientScreenings);
router.get('/screenings/:id', getPatientScreeningById);

export default router;
