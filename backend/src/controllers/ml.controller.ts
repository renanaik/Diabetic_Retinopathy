/**
 * ml.controller.ts — Machine Learning Inference Controller
 *
 * Handles communication between Node.js Express API and the Python ML inference service:
 *   - POST /api/ml/predict — Receives retinal fundus image, sends to Python service, returns 5-class prediction
 *
 * Security:
 *   - Only authenticated verified doctors can access this endpoint.
 *   - Role and verificationStatus are strictly validated by middleware.
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:5002';

// ─── Allowed Image MIME types ──────────────────────────────────────────────────
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

/**
 * POST /api/ml/predict
 * Receives uploaded retinal image and proxies to Python ML inference engine.
 */
export async function predictRetinaImage(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // 1. Validate file presence
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No retinal image file provided. Please upload an image under the "image" or "file" field.',
      });
      return;
    }

    // 2. Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(req.file.mimetype)) {
      res.status(400).json({
        success: false,
        message: `Unsupported file type: ${req.file.mimetype}. Allowed formats: JPEG, JPG, PNG, WEBP.`,
      });
      return;
    }

    logger.info(
      `Doctor ${req.user!.name} (${req.user!.id}) requested ML prediction for image: ${req.file.originalname} (${req.file.size} bytes)`
    );

    // 3. Prepare multipart FormData for Python ML Service
    const formData = new FormData();
    const blob = new Blob([new Uint8Array(req.file.buffer)], { type: req.file.mimetype });
    formData.append('file', blob, req.file.originalname || 'retina.jpg');

    // 4. Send request to Python inference service
    let mlResponse: globalThis.Response;
    try {
      mlResponse = await fetch(`${ML_SERVICE_URL}/predict`, {
        method: 'POST',
        body: formData,
      });
    } catch (netErr: any) {
      logger.error('Failed to communicate with Python ML service:', netErr.message);
      res.status(503).json({
        success: false,
        message: 'ML inference service is currently unavailable. Please ensure the Python inference service is running.',
        error: process.env.NODE_ENV === 'development' ? netErr.message : undefined,
      });
      return;
    }

    // 5. Parse Python service response
    const mlData = (await mlResponse.json().catch(() => null)) as any;

    if (!mlResponse.ok || !mlData || !mlData.success) {
      const errorMsg =
        mlData?.detail || mlData?.message || 'Inference engine failed to process image.';
      logger.error(`Python ML service returned status ${mlResponse.status}: ${errorMsg}`);
      res.status(mlResponse.status >= 400 && mlResponse.status < 600 ? mlResponse.status : 500).json({
        success: false,
        message: errorMsg,
      });
      return;
    }

    // 6. Return structured prediction to doctor
    res.status(200).json({
      success: true,
      message: 'Retinal image analysis completed successfully.',
      data: {
        prediction: mlData.data,
        doctor: {
          id: req.user!.id,
          name: req.user!.name,
        },
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    next(err);
  }
}
