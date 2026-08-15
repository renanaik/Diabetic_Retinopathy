/**
 * auth.ts — Authentication routes
 *
 * POST /api/auth/signup  — patient or doctor registration
 * POST /api/auth/login   — login, returns JWT
 * GET  /api/auth/me      — returns the authenticated user's profile
 *
 * Logout is stateless (client discards the JWT).
 * A logout endpoint is not needed at this phase.
 */

import { Router } from 'express';
import { signup, login, me } from '../controllers/auth.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// ── Public routes ──────────────────────────────────────────────────────────────
router.post('/signup', signup);
router.post('/login', login);

// ── Protected routes ───────────────────────────────────────────────────────────
router.get('/me', authenticate, me);

export default router;
