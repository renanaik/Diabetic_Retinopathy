/**
 * patient.controller.ts — Patient Screening & Report Controller
 *
 * Handles patient access to their own completed clinical screening reports:
 *   - GET /api/patient/screenings     — Patient lists their approved screening history
 *   - GET /api/patient/screenings/:id — Patient retrieves a single approved screening report
 *
 * Security & Clinical Rules:
 *   1. Restricted to authenticated patients ONLY (role: 'patient').
 *   2. Strict ownership: patient can only access screenings where patientId === req.user.id.
 *   3. Clinical release rule: patient can ONLY see screenings with status === 'approved'.
 *   4. Rejected and pending_review screenings return 404 to patients.
 *   5. Internal AI metrics (confidence, classProbabilities, referableProbability) are NOT exposed.
 *   6. Patient sees only: final diagnosis, doctor review, and patient-facing report information.
 *   7. No sensitive internal data (passwords, JWTs, filesystem paths) is exposed.
 */

import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Screening from '../models/Screening';
import User from '../models/User';
import DoctorProfile from '../models/DoctorProfile';
import PatientProfile from '../models/PatientProfile';
import { validateObjectId, validateName, collectErrors } from '../utils/validation';
import { generateUniquePatientId, ensurePatientId } from '../utils/patientId';
import { logger } from '../utils/logger';

// ─── GET /api/patient/screenings (List completed screening history) ────────────

export async function getPatientScreenings(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const patientId = req.user!.id;

    // Release rule: only return screenings that have been approved by a doctor
    // Rejected and pending_review screenings are NOT visible to patients
    const screenings = await Screening.find({
      patientId: new mongoose.Types.ObjectId(patientId),
      status: 'approved',
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
        // Patient-facing: only final diagnosis fields, NO internal AI metrics
        aiResult: {
          predictedClass: s.aiResult.predictedClass,
          predictedLabel: s.aiResult.predictedLabel,
          referable: s.aiResult.referable,
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

    // 4. Clinical release check: only approved screenings are visible to patients
    // Both pending_review and rejected screenings return 404
    if (screening.status !== 'approved') {
      res.status(404).json({
        success: false,
        message: 'Screening report not found or is not available.',
      });
      return;
    }

    // 5. Fetch doctor user and profile info
    const doctor = await User.findById(screening.doctorId);
    const doctorProfile = await DoctorProfile.findOne({ userId: screening.doctorId });

    // 6. Fetch patient user and profile info
    const patient = await User.findById(screening.patientId);
    let patientProfile = await PatientProfile.findOne({ userId: screening.patientId });
    if (!patientProfile) {
      const newId = await generateUniquePatientId();
      patientProfile = await PatientProfile.create({
        userId: screening.patientId,
        patientId: newId,
        dateOfBirth: '1990-01-01',
        gender: 'other',
        phone: 'Not provided',
      });
      if (patient) {
        patient.patientId = newId;
        await patient.save();
      }
    } else if (!patientProfile.patientId) {
      const pId = await ensurePatientId(patientProfile);
      if (patient && !patient.patientId) {
        patient.patientId = pId;
        await patient.save();
      }
    } else if (patient && !patient.patientId) {
      patient.patientId = patientProfile.patientId;
      await patient.save();
    }

    // 7. Return structured patient report (patient-facing fields only, no internal AI metrics)
    res.status(200).json({
      success: true,
      message: 'Screening report retrieved successfully.',
      data: {
        screening: {
          id: screening._id.toString(),
          patientId: screening.patientId.toString(),
          doctorId: screening.doctorId.toString(),
          patient: patient
            ? {
                id: patient._id.toString(),
                name: patient.name,
                email: patient.email,
                patientId: patient.patientId || patientProfile?.patientId || 'N/A',
                dateOfBirth: patientProfile?.dateOfBirth || '',
                gender: patientProfile?.gender || '',
                phone: patientProfile?.phone || '',
              }
            : null,
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
          // Patient-facing: only final diagnosis fields, NO internal AI metrics
          aiResult: {
            predictedClass: screening.aiResult.predictedClass,
            predictedLabel: screening.aiResult.predictedLabel,
            referable: screening.aiResult.referable,
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

// ─── GET /api/patient/profile ──────────────────────────────────────────────────

export async function getPatientProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User account not found.' });
      return;
    }

    let profile = await PatientProfile.findOne({ userId });
    if (!profile) {
      const patientId = await generateUniquePatientId();
      profile = await PatientProfile.create({
        userId,
        patientId,
        dateOfBirth: '1990-01-01',
        gender: 'other',
        phone: 'Not provided',
        medicalHistory: '',
        diabetesHistory: '',
        eyeHistory: '',
      });
      user.patientId = patientId;
      await user.save();
    } else if (!profile.patientId) {
      const patientId = await ensurePatientId(profile);
      if (!user.patientId) {
        user.patientId = patientId;
        await user.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Patient profile retrieved successfully.',
      data: {
        user: user.toSafeObject(),
        profile: {
          patientId: profile.patientId,
          dateOfBirth: profile.dateOfBirth,
          gender: profile.gender,
          phone: profile.phone,
          medicalHistory: profile.medicalHistory || '',
          diabetesHistory: profile.diabetesHistory || '',
          eyeHistory: profile.eyeHistory || '',
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── PUT /api/patient/profile ──────────────────────────────────────────────────

export async function updatePatientProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const {
      name,
      phone,
      dateOfBirth,
      gender,
      medicalHistory,
      diabetesHistory,
      eyeHistory,
    } = req.body as Record<string, unknown>;

    // 1. Validation
    const validationChecks = [];
    if (name !== undefined) {
      validationChecks.push(validateName(name));
    }

    const validationErrors = collectErrors(validationChecks);
    if (validationErrors) {
      res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors: validationErrors.reduce((acc, curr) => ({ ...acc, [curr.field]: curr.message }), {}),
      });
      return;
    }

    // 2. Fetch User and PatientProfile
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User account not found.' });
      return;
    }

    let profile = await PatientProfile.findOne({ userId });
    if (!profile) {
      const patientId = await generateUniquePatientId();
      profile = new PatientProfile({
        userId,
        patientId,
        dateOfBirth: '1990-01-01',
        gender: 'other',
        phone: 'Not provided',
      });
      user.patientId = patientId;
    } else if (!profile.patientId) {
      const patientId = await ensurePatientId(profile);
      if (!user.patientId) {
        user.patientId = patientId;
      }
    }

    // 3. Update fields
    if (name !== undefined) {
      user.name = String(name).trim();
    }
    await user.save();

    if (phone !== undefined) profile.phone = String(phone).trim();
    if (dateOfBirth !== undefined) profile.dateOfBirth = String(dateOfBirth).trim();
    if (gender !== undefined) profile.gender = String(gender).trim();
    if (medicalHistory !== undefined) profile.medicalHistory = String(medicalHistory).trim();
    if (diabetesHistory !== undefined) profile.diabetesHistory = String(diabetesHistory).trim();
    if (eyeHistory !== undefined) profile.eyeHistory = String(eyeHistory).trim();

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: {
        user: user.toSafeObject(),
        profile: {
          patientId: profile.patientId,
          dateOfBirth: profile.dateOfBirth,
          gender: profile.gender,
          phone: profile.phone,
          medicalHistory: profile.medicalHistory || '',
          diabetesHistory: profile.diabetesHistory || '',
          eyeHistory: profile.eyeHistory || '',
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}
