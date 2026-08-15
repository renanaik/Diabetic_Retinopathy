/**
 * patient.controller.ts — Patient Screening & Report Controller
 *
 * Handles patient access to their own completed clinical screening reports:
 *   - GET /api/patient/screenings     — Patient lists their reviewed screening history
 *   - GET /api/patient/screenings/:id — Patient retrieves a single reviewed screening report
 *
 * Security & Clinical Rules:
 *   1. Restricted to authenticated patients ONLY (role: 'patient').
 *   2. Strict ownership: patient can only access screenings where patientId === req.user.id.
 *   3. Clinical release rule: patient can ONLY see screenings with status IN ['approved', 'rejected'].
 *   4. Unreviewed screenings (status: 'pending_review') return 404 to prevent premature disclosure.
 *   5. AI result (aiResult) and Doctor review (review) are clearly distinguished.
 *   6. No sensitive internal data (passwords, JWTs, filesystem paths) is exposed.
 */

import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Screening from '../models/Screening';
import User from '../models/User';
import DoctorProfile from '../models/DoctorProfile';
import { validateObjectId } from '../utils/validation';
import { logger } from '../utils/logger';

// ─── GET /api/patient/screenings (List completed screening history) ────────────

export async function getPatientScreenings(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const patientId = req.user!.id;

    // Release rule: only return screenings that have been reviewed by a doctor (approved or rejected)
    const screenings = await Screening.find({
      patientId: new mongoose.Types.ObjectId(patientId),
      status: { $in: ['approved', 'rejected'] },
    }).sort({ createdAt: -1 });

    // Fetch doctor user records and doctor profiles for clinical context
    const doctorIds = screenings.map((s) => s.doctorId);
    const doctors = await User.find({ _id: { $in: doctorIds } });
    const doctorProfiles = await DoctorProfile.find({ userId: { $in: doctorIds } });

    const doctorMap = new Map(doctors.map((d) => [d._id.toString(), d]));
    const profileMap = new Map(doctorProfiles.map((p) => [p.userId.toString(), p]));

    const formattedScreenings = screenings.map((s) => {
      const doctor = doctorMap.get(s.doctorId.toString());
      const profile = profileMap.get(s.doctorId.toString());

      return {
        id: s._id.toString(),
        patientId: s.patientId.toString(),
        doctorId: s.doctorId.toString(),
        doctor: doctor
          ? {
              id: doctor._id.toString(),
              name: doctor.name,
              specialization: profile?.specialization || 'Ophthalmology',
              hospital: profile?.hospital || 'RetinaCare Partner Clinic',
            }
          : null,
        image: {
          originalFilename: s.image.originalFilename,
          mimeType: s.image.mimeType,
          size: s.image.size,
        },
        status: s.status,
        aiResult: {
          predictedClass: s.aiResult.predictedClass,
          predictedLabel: s.aiResult.predictedLabel,
          confidence: s.aiResult.confidence,
          classProbabilities: s.aiResult.classProbabilities,
          referable: s.aiResult.referable,
          referableProbability: s.aiResult.referableProbability,
          disclaimer: s.aiResult.disclaimer || 'AI prediction is a screening aid and requires doctor review.',
        },
        review: s.review
          ? {
              decision: s.review.decision,
              doctorNotes: s.review.doctorNotes,
              reviewedAt: s.review.reviewedAt,
              reviewedBy: s.review.reviewedBy ? s.review.reviewedBy.toString() : s.doctorId.toString(),
            }
          : null,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      };
    });

    res.status(200).json({
      success: true,
      message: 'Patient screening reports retrieved successfully.',
      data: {
        count: formattedScreenings.length,
        screenings: formattedScreenings,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/patient/screenings/:id (Retrieve single screening report) ───────

export async function getPatientScreeningById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const patientId = req.user!.id;
    const { id } = req.params;

    // 1. Validate screening ID format
    const idError = validateObjectId(id, 'id', 'Screening ID');
    if (idError) {
      res.status(400).json({
        success: false,
        message: idError.message,
      });
      return;
    }

    // 2. Load screening from database
    const screening = await Screening.findById(id);

    if (!screening) {
      res.status(404).json({
        success: false,
        message: 'Screening report not found.',
      });
      return;
    }

    // 3. Strict ownership enforcement: must belong to the requesting patient
    if (screening.patientId.toString() !== patientId) {
      res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to view this screening report.',
      });
      return;
    }

    // 4. Clinical release check: pending_review screenings must NOT be exposed to patients
    if (screening.status === 'pending_review') {
      res.status(404).json({
        success: false,
        message: 'Screening report not found or is still awaiting doctor review.',
      });
      return;
    }

    // 5. Fetch doctor user and profile info
    const doctor = await User.findById(screening.doctorId);
    const doctorProfile = await DoctorProfile.findOne({ userId: screening.doctorId });

    // 6. Return structured patient report
    res.status(200).json({
      success: true,
      message: 'Screening report retrieved successfully.',
      data: {
        screening: {
          id: screening._id.toString(),
          patientId: screening.patientId.toString(),
          doctorId: screening.doctorId.toString(),
          doctor: doctor
            ? {
                id: doctor._id.toString(),
                name: doctor.name,
                specialization: doctorProfile?.specialization || 'Ophthalmology',
                hospital: doctorProfile?.hospital || 'RetinaCare Partner Clinic',
              }
            : null,
          image: {
            originalFilename: screening.image.originalFilename,
            mimeType: screening.image.mimeType,
            size: screening.image.size,
          },
          status: screening.status,
          aiResult: {
            predictedClass: screening.aiResult.predictedClass,
            predictedLabel: screening.aiResult.predictedLabel,
            confidence: screening.aiResult.confidence,
            classProbabilities: screening.aiResult.classProbabilities,
            referable: screening.aiResult.referable,
            referableProbability: screening.aiResult.referableProbability,
            disclaimer: screening.aiResult.disclaimer || 'AI prediction is a screening aid and requires doctor review.',
          },
          review: screening.review
            ? {
                decision: screening.review.decision,
                doctorNotes: screening.review.doctorNotes,
                reviewedAt: screening.review.reviewedAt,
                reviewedBy: screening.review.reviewedBy ? screening.review.reviewedBy.toString() : screening.doctorId.toString(),
              }
            : null,
          createdAt: screening.createdAt,
          updatedAt: screening.updatedAt,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}
