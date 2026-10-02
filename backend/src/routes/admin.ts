/**
 * admin.ts — Super Admin Routes
 *
 * All endpoints require authentication and super_admin role.
 *
 * GET   /api/admin/dashboard              — Platform overview statistics & metrics
 * GET   /api/admin/doctors                — List all doctors (with profile, connection & screening counts)
 * GET   /api/admin/doctors/pending        — List pending doctor verification requests
 * PATCH /api/admin/doctors/:doctorId/approve — Approve a pending doctor
 * PATCH /api/admin/doctors/:doctorId/reject  — Reject a doctor verification request
 * GET   /api/admin/patients               — List all patients with profiles, IDs, & clinical stats
 * GET   /api/admin/connections            — List all doctor-patient connections
 * GET   /api/admin/screenings             — List all AI screenings and reviews
 * GET   /api/admin/users                  — List all registered users
 * GET   /api/admin/reports                — Aggregated clinical & diagnostic reports
 */

import { Router } from 'express';
import {
  getAdminDashboardStats,
  getPendingDoctors,
  getAllDoctors,
  approveDoctor,
  rejectDoctor,
  getAllPatients,
  getAllConnections,
  getAllScreenings,
  getAllUsers,
  getAdminReports,
} from '../controllers/admin.controller';
import { authenticate } from '../middleware/authenticate';
import { authorizeRoles } from '../middleware/authorizeRoles';

const router = Router();

// ── Global Super Admin Protection ─────────────────────────────────────────────
router.use(authenticate, authorizeRoles('super_admin'));

// ── Overview & Statistics ─────────────────────────────────────────────────────
router.get('/dashboard', getAdminDashboardStats);
router.get('/reports', getAdminReports);

// ── Doctor Management & Verification ──────────────────────────────────────────
router.get('/doctors/pending', getPendingDoctors);
router.get('/doctors', getAllDoctors);
router.patch('/doctors/:doctorId/approve', approveDoctor);
router.patch('/doctors/:doctorId/reject', rejectDoctor);

// ── Patient Directory ─────────────────────────────────────────────────────────
router.get('/patients', getAllPatients);

// ── Connections Management ────────────────────────────────────────────────────
router.get('/connections', getAllConnections);

// ── Screenings Oversight ──────────────────────────────────────────────────────
router.get('/screenings', getAllScreenings);

// ── User Management ───────────────────────────────────────────────────────────
router.get('/users', getAllUsers);

export default router;
