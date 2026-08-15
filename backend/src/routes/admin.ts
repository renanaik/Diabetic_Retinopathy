/**
 * admin.ts — Super Admin Routes
 *
 * All endpoints require authentication and super_admin role.
 *
 * GET   /api/admin/doctors/pending        — List pending doctor verification requests
 * GET   /api/admin/doctors                — List all doctors
 * PATCH /api/admin/doctors/:doctorId/approve — Approve a pending doctor
 * PATCH /api/admin/doctors/:doctorId/reject  — Reject a doctor verification request
 */

import { Router } from 'express';
import {
  getPendingDoctors,
  getAllDoctors,
  approveDoctor,
  rejectDoctor,
} from '../controllers/admin.controller';
import { authenticate } from '../middleware/authenticate';
import { authorizeRoles } from '../middleware/authorizeRoles';

const router = Router();

// ── Global Super Admin Protection ─────────────────────────────────────────────
router.use(authenticate, authorizeRoles('super_admin'));

// ── Doctor Verification ───────────────────────────────────────────────────────
router.get('/doctors/pending', getPendingDoctors);
router.get('/doctors', getAllDoctors);
router.patch('/doctors/:doctorId/approve', approveDoctor);
router.patch('/doctors/:doctorId/reject', rejectDoctor);

export default router;
