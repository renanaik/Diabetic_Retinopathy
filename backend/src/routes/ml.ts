/**
 * ml.ts — Machine Learning Routes
 *
 * All endpoints require authentication and verified doctor status:
 *   POST /api/ml/predict — Upload retinal image for AI screening prediction
 *
 * Security:
 *   - Only authenticated users with role = 'doctor' and verificationStatus = 'verified'
 *   - Patients, unverified doctors, and super_admin are blocked from running clinical ML inference.
 */

import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { predictRetinaImage } from '../controllers/ml.controller';
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
 * Middleware supporting either 'image' or 'file' field name in multipart form.
 */
function uploadImageMiddleware(req: Request, res: Response, next: NextFunction): void {
  const uploadHandler = upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'file', maxCount: 1 },
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
      if (files['image'] && files['image'][0]) {
        req.file = files['image'][0];
      } else if (files['file'] && files['file'][0]) {
        req.file = files['file'][0];
      }
    }

    next();
  });
}

// ── Protected ML Inference Endpoint (Verified Doctors Only) ──────────────────
router.post(
  '/predict',
  authenticate,
  requireVerifiedDoctor,
  uploadImageMiddleware,
  predictRetinaImage
);

export default router;
