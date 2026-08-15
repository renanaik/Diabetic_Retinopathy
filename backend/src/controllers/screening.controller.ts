/**
 * screening.controller.ts — Retinal Screening Controller
 *
 * Handles clinical screening creation, ML inference integration, and persistence:
 *   - POST /api/screenings       — Verified doctor creates a screening for an accepted patient
 *   - GET  /api/screenings       — Verified doctor lists their screenings (supports ?patientId=)
 *   - GET  /api/screenings/:id   — Verified doctor retrieves a single screening by ID (ownership enforced)
 *
 * Security:
 *   - Strict verified doctor authorization required (requireVerifiedDoctor).
 *   - Screenings can ONLY be created for patients with an ACCEPTED connection.
 *   - Doctor ownership is strictly enforced on all queries.
 *   - Patients and Super Admins cannot access screening records in this phase.
 */

import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Screening from '../models/Screening';
import User from '../models/User';
import DoctorPatientConnection from '../models/DoctorPatientConnection';
import PatientProfile from '../models/PatientProfile';
import { validateObjectId } from '../utils/validation';
import { logger } from '../utils/logger';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:5002';
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// ─── POST /api/screenings (Create & Analyze Screening) ─────────────────────────

export async function createScreening(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const doctorId = req.user!.id;
    const { patientId } = req.body as { patientId?: string };

    // 1. Validate patientId format and presence
    const patientIdError = validateObjectId(patientId, 'patientId', 'Patient ID');
    if (patientIdError) {
      res.status(400).json({ success: false, message: patientIdError.message });
      return;
    }

    // 2. Validate patient exists in User model
    const patient = await User.findById(patientId);
    if (!patient || patient.role !== 'patient') {
      res.status(404).json({
        success: false,
        message: 'Target patient account not found.',
      });
      return;
    }

    // 3. Verify ACCEPTED connection between Doctor and Patient
    const connection = await DoctorPatientConnection.findOne({
      doctorId: new mongoose.Types.ObjectId(doctorId),
      patientId: new mongoose.Types.ObjectId(patientId),
    });

    if (!connection || connection.status !== 'accepted') {
      res.status(403).json({
        success: false,
        message:
          'You can only create retinal screenings for patients with an active accepted connection.',
      });
      return;
    }

    // 4. Validate uploaded retinal image
    if (!req.file) {
      res.status(400).json({
        success: false,
        message:
          'No retinal image file provided. Please upload an image under the "file" or "image" field.',
      });
      return;
    }

    if (!ALLOWED_MIME_TYPES.includes(req.file.mimetype)) {
      res.status(400).json({
        success: false,
        message: `Unsupported image format: ${req.file.mimetype}. Allowed formats: JPEG, JPG, PNG, WEBP.`,
      });
      return;
    }

    logger.info(
      `Doctor ${req.user!.name} (${doctorId}) initiating screening for Patient ${patient.name} (${patientId}). File: ${req.file.originalname} (${req.file.size} bytes)`
    );

    // 5. Forward image to Python ML inference service
    const formData = new FormData();
    const blob = new Blob([new Uint8Array(req.file.buffer)], { type: req.file.mimetype });
    formData.append('file', blob, req.file.originalname || 'retina.jpg');

    let mlResponse: globalThis.Response;
    try {
      mlResponse = await fetch(`${ML_SERVICE_URL}/predict`, {
        method: 'POST',
        body: formData,
      });
    } catch (netErr: any) {
      logger.error('Failed to connect to Python ML service for screening:', netErr.message);
      res.status(503).json({
        success: false,
        message:
          'ML inference service is currently unavailable. Screening record was not created.',
        error: process.env.NODE_ENV === 'development' ? netErr.message : undefined,
      });
      return;
    }

    const mlData = (await mlResponse.json().catch(() => null)) as any;

    if (!mlResponse.ok || !mlData || !mlData.success) {
      const errorMsg =
        mlData?.detail || mlData?.message || 'ML inference engine failed to process retinal image.';
      logger.error(`Python ML service returned error: ${errorMsg}`);
      res.status(mlResponse.status >= 400 && mlResponse.status < 600 ? mlResponse.status : 500).json({
        success: false,
        message: errorMsg,
      });
      return;
    }

    const pred = mlData.data;

    // 6. Create and persist Screening record in MongoDB
    const screening = await Screening.create({
      patientId: new mongoose.Types.ObjectId(patientId),
      doctorId: new mongoose.Types.ObjectId(doctorId),
      image: {
        originalFilename: req.file.originalname || 'retina_image.jpg',
        mimeType: req.file.mimetype,
        size: req.file.size,
      },
      aiResult: {
        predictedClass: pred.predictedClass,
        predictedLabel: pred.predictedLabel,
        confidence: pred.confidence,
        classProbabilities: {
          '0': Number(pred.classProbabilities['0']),
          '1': Number(pred.classProbabilities['1']),
          '2': Number(pred.classProbabilities['2']),
          '3': Number(pred.classProbabilities['3']),
          '4': Number(pred.classProbabilities['4']),
        },
        referable: pred.referable,
        referableProbability: pred.referableProbability,
        disclaimer: pred.disclaimer || 'AI prediction is a screening aid and requires doctor review.',
      },
      status: 'pending_review',
    });

    logger.info(
      `Screening created successfully: ID ${screening._id} | Prediction: ${pred.predictedLabel} (${pred.confidence * 100}%)`
    );

    // 7. Return structured response to doctor
    res.status(201).json({
      success: true,
      message: 'Retinal screening created and analyzed successfully.',
      data: {
        screening: {
          id: screening._id.toString(),
          patientId: screening.patientId.toString(),
          doctorId: screening.doctorId.toString(),
          image: screening.image,
          aiResult: screening.aiResult,
          status: screening.status,
          patient: {
            id: patient._id.toString(),
            name: patient.name,
            email: patient.email,
          },
          doctor: {
            id: req.user!.id,
            name: req.user!.name,
          },
          createdAt: screening.createdAt,
          updatedAt: screening.updatedAt,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/screenings (List Doctor's Screenings) ────────────────────────────

export async function getDoctorScreenings(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const doctorId = req.user!.id;
    const { patientId } = req.query as { patientId?: string };

    const filter: Record<string, any> = {
      doctorId: new mongoose.Types.ObjectId(doctorId),
    };

    if (patientId) {
      const pIdError = validateObjectId(patientId, 'patientId', 'Patient ID');
      if (pIdError) {
        res.status(400).json({ success: false, message: pIdError.message });
        return;
      }
      filter.patientId = new mongoose.Types.ObjectId(patientId);
    }

    const screenings = await Screening.find(filter).sort({ createdAt: -1 });

    // Fetch patient details and profiles
    const patientIds = Array.from(new Set(screenings.map((s) => s.patientId.toString())));
    const patients = await User.find({ _id: { $in: patientIds } });
    const patientProfiles = await PatientProfile.find({ userId: { $in: patientIds } });

    const patientMap = new Map(patients.map((p) => [p._id.toString(), p]));
    const profileMap = new Map(patientProfiles.map((p) => [p.userId.toString(), p]));

    const formattedScreenings = screenings.map((s) => {
      const patient = patientMap.get(s.patientId.toString());
      const profile = profileMap.get(s.patientId.toString());

      return {
        id: s._id.toString(),
        patientId: s.patientId.toString(),
        doctorId: s.doctorId.toString(),
        image: s.image,
        aiResult: s.aiResult,
        status: s.status,
        patient: patient
          ? {
              id: patient._id.toString(),
              name: patient.name,
              email: patient.email,
              profile: profile
                ? {
                    dateOfBirth: profile.dateOfBirth,
                    gender: profile.gender,
                    phone: profile.phone,
                    medicalHistory: profile.medicalHistory,
                    diabetesHistory: profile.diabetesHistory,
                    eyeHistory: profile.eyeHistory,
                  }
                : null,
            }
          : null,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      };
    });

    res.status(200).json({
      success: true,
      message: 'Doctor screenings retrieved successfully.',
      data: {
        count: formattedScreenings.length,
        screenings: formattedScreenings,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/screenings/:id (Get Single Screening by ID) ─────────────────────

export async function getScreeningById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const doctorId = req.user!.id;
    const { id } = req.params;

    const idError = validateObjectId(id, 'id', 'Screening ID');
    if (idError) {
      res.status(400).json({ success: false, message: idError.message });
      return;
    }

    const screening = await Screening.findById(id);
    if (!screening) {
      res.status(404).json({
        success: false,
        message: 'Screening record not found.',
      });
      return;
    }

    // Ownership check: only the doctor who conducted the screening can access it
    if (screening.doctorId.toString() !== doctorId) {
      res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to view this screening record.',
      });
      return;
    }

    const patient = await User.findById(screening.patientId);
    const patientProfile = await PatientProfile.findOne({ userId: screening.patientId });

    res.status(200).json({
      success: true,
      message: 'Screening record retrieved successfully.',
      data: {
        screening: {
          id: screening._id.toString(),
          patientId: screening.patientId.toString(),
          doctorId: screening.doctorId.toString(),
          image: screening.image,
          aiResult: screening.aiResult,
          status: screening.status,
          patient: patient
            ? {
                id: patient._id.toString(),
                name: patient.name,
                email: patient.email,
                profile: patientProfile
                  ? {
                      dateOfBirth: patientProfile.dateOfBirth,
                      gender: patientProfile.gender,
                      phone: patientProfile.phone,
                      medicalHistory: patientProfile.medicalHistory,
                      diabetesHistory: patientProfile.diabetesHistory,
                      eyeHistory: patientProfile.eyeHistory,
                    }
                  : null,
              }
            : null,
          doctor: {
            id: req.user!.id,
            name: req.user!.name,
          },
          createdAt: screening.createdAt,
          updatedAt: screening.updatedAt,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}
