/**
 * connections.ts — Doctor-Patient Connection Routes
 *
 * All endpoints require authentication.
 *
 * Patient endpoints:
 *   POST /api/connections             — Request a connection with a verified doctor
 *   GET  /api/connections/my-doctors   — View doctor connections
 *
 * Verified Doctor endpoints:
 *   GET   /api/connections/requests        — View incoming pending connection requests
 *   PATCH /api/connections/:connectionId/accept — Accept connection request
 *   PATCH /api/connections/:connectionId/reject — Reject connection request
 *   GET   /api/connections/my-patients     — View assigned/accepted patients
 */

import { Router } from 'express';
import {
  requestConnection,
  getDoctorPendingRequests,
  acceptConnection,
  rejectConnection,
  getPatientDoctors,
  getDoctorPatients,
  getAvailableDoctors,
} from '../controllers/connection.controller';
import { authenticate } from '../middleware/authenticate';
import { authorizeRoles } from '../middleware/authorizeRoles';
import { requireVerifiedDoctor } from '../middleware/requireVerifiedDoctor';

const router = Router();

// ── Global Authentication ─────────────────────────────────────────────────────
router.use(authenticate);

// ── Patient Endpoints ─────────────────────────────────────────────────────────
router.get('/doctors', authorizeRoles('patient'), getAvailableDoctors);
router.post('/', authorizeRoles('patient'), requestConnection);
router.get('/my-doctors', authorizeRoles('patient'), getPatientDoctors);

// ── Doctor Endpoints (Verified Doctors Only) ──────────────────────────────────
router.get('/requests', requireVerifiedDoctor, getDoctorPendingRequests);
router.patch('/:connectionId/accept', requireVerifiedDoctor, acceptConnection);
router.patch('/:connectionId/reject', requireVerifiedDoctor, rejectConnection);
router.get('/my-patients', requireVerifiedDoctor, getDoctorPatients);

export default router;
