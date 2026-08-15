/**
 * screenings.ts — Retinal Screening Routes
 *
 * All endpoints require authentication and verified doctor status:
 *   POST /api/screenings       — Create and analyze a new retinal screening for a connected patient
 *   GET  /api/screenings       — List screenings for authenticated doctor (supports ?patientId=)
 *   GET  /api/screenings/:id   — Retrieve single screening details (ownership verified)
 *
 * Security:
 *   - Only verified doctors can create or view screenings.
 *   - Patients, pending/rejected doctors, and super_admin are blocked.
 *   - Doctor-patient connection MUST be in 'accepted' status.
 */

import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import {
  createScreening,
  getDoctorScreenings,
  getScreeningById,
} from '../controllers/screening.controller';
import { authenticate } from '../middleware/authenticate';
import { requireVerifiedDoctor } from '../middleware/requireVerifiedDoctor';

const router = Router();

// ── Configure Multer for In-Memory Image Uploads ──────────────────────────────
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15 MB
  },
});

/**
 * Middleware supporting either 'file' or 'image' field name in multipart form.
 */
function uploadImageMiddleware(req: Request, res: Response, next: NextFunction): void {
  const uploadHandler = upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'image', maxCount: 1 },
  ]);

  uploadHandler(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        res.status(413).json({
          success: false,
          message: 'Image size exceeds maximum limit of 15 MB.',
        });
        return;
      }
      res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`,
      });
      return;
    } else if (err) {
      next(err);
      return;
    }

    // Attach chosen file to req.file
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    if (files) {
      if (files['file'] && files['file'][0]) {
        req.file = files['file'][0];
      } else if (files['image'] && files['image'][0]) {
        req.file = files['image'][0];
      }
    }

    next();
  });
}

// ── Global Protection (Verified Doctors Only) ─────────────────────────────────
router.use(authenticate, requireVerifiedDoctor);

// ── Screening Endpoints ───────────────────────────────────────────────────────
router.post('/', uploadImageMiddleware, createScreening);
router.get('/', getDoctorScreenings);
router.get('/:id', getScreeningById);

export default router;
