/**
 * admin.controller.ts — Super Admin Controller
 *
 * Handles administrative oversight for the RetinaCare platform:
 *   - GET   /api/admin/doctors/pending        — List pending doctor verification requests
 *   - GET   /api/admin/doctors                — List all doctors (with optional status filter)
 *   - PATCH /api/admin/doctors/:doctorId/approve — Approve a pending doctor
 *   - PATCH /api/admin/doctors/:doctorId/reject  — Reject a doctor verification request
 *
 * Security:
 *   - All endpoints require authenticated super_admin role.
 *   - Sensitive fields like passwordHash are never returned.
 */

import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import DoctorProfile from '../models/DoctorProfile';
import { AppError } from '../middleware/errorHandler';
import { validateObjectId } from '../utils/validation';

// ─── GET /api/admin/doctors/pending ───────────────────────────────────────────

export async function getPendingDoctors(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const pendingDoctors = await User.find({
      role: 'doctor',
      verificationStatus: 'pending',
    }).sort({ createdAt: -1 });

    // Fetch matching doctor profiles for all pending doctors
    const doctorIds = pendingDoctors.map((doc) => doc._id);
    const profiles = await DoctorProfile.find({ userId: { $in: doctorIds } });

    // Map profiles by userId string
    const profileMap = new Map(
      profiles.map((p) => [p.userId.toString(), p])
    );

    const doctorsWithProfiles = pendingDoctors.map((doc) => {
      const safeUser = doc.toSafeObject();
      const profile = profileMap.get(doc._id.toString());
      return {
        ...safeUser,
        profile: profile
          ? {
              licenseNumber: profile.licenseNumber,
              medicalCouncil: profile.medicalCouncil,
              specialization: profile.specialization,
              hospital: profile.hospital,
              yearsOfExperience: profile.yearsOfExperience,
              createdAt: profile.createdAt,
              updatedAt: profile.updatedAt,
            }
          : null,
      };
    });

    res.status(200).json({
      success: true,
      message: 'Pending doctors retrieved successfully.',
      data: {
        count: doctorsWithProfiles.length,
        doctors: doctorsWithProfiles,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/admin/doctors ───────────────────────────────────────────────────

export async function getAllDoctors(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { status } = req.query;
    const filter: Record<string, unknown> = { role: 'doctor' };

    if (
      status &&
      typeof status === 'string' &&
      ['pending', 'verified', 'rejected'].includes(status)
    ) {
      filter.verificationStatus = status;
    }

    const doctors = await User.find(filter).sort({ createdAt: -1 });
    const doctorIds = doctors.map((doc) => doc._id);
    const profiles = await DoctorProfile.find({ userId: { $in: doctorIds } });

    const profileMap = new Map(
      profiles.map((p) => [p.userId.toString(), p])
    );

    const doctorsWithProfiles = doctors.map((doc) => {
      const safeUser = doc.toSafeObject();
      const profile = profileMap.get(doc._id.toString());
      return {
        ...safeUser,
        profile: profile
          ? {
              licenseNumber: profile.licenseNumber,
              medicalCouncil: profile.medicalCouncil,
              specialization: profile.specialization,
              hospital: profile.hospital,
              yearsOfExperience: profile.yearsOfExperience,
              createdAt: profile.createdAt,
              updatedAt: profile.updatedAt,
            }
          : null,
      };
    });

    res.status(200).json({
      success: true,
      message: 'Doctors retrieved successfully.',
      data: {
        count: doctorsWithProfiles.length,
        doctors: doctorsWithProfiles,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── PATCH /api/admin/doctors/:doctorId/approve ───────────────────────────────

export async function approveDoctor(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { doctorId } = req.params;

    const idError = validateObjectId(doctorId, 'doctorId', 'Doctor ID');
    if (idError) {
      res.status(400).json({ success: false, message: idError.message });
      return;
    }

    const doctor = await User.findById(doctorId);

    if (!doctor || doctor.role !== 'doctor') {
      res.status(404).json({
        success: false,
        message: 'Doctor account not found.',
      });
      return;
    }

    doctor.verificationStatus = 'verified';
    await doctor.save();

    const profile = await DoctorProfile.findOne({ userId: doctor._id });

    res.status(200).json({
      success: true,
      message: `Doctor ${doctor.name} has been verified successfully.`,
      data: {
        doctor: {
          ...doctor.toSafeObject(),
          profile: profile
            ? {
                licenseNumber: profile.licenseNumber,
                medicalCouncil: profile.medicalCouncil,
                specialization: profile.specialization,
                hospital: profile.hospital,
                yearsOfExperience: profile.yearsOfExperience,
              }
            : null,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── PATCH /api/admin/doctors/:doctorId/reject ────────────────────────────────

export async function rejectDoctor(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { doctorId } = req.params;

    const idError = validateObjectId(doctorId, 'doctorId', 'Doctor ID');
    if (idError) {
      res.status(400).json({ success: false, message: idError.message });
      return;
    }

    const doctor = await User.findById(doctorId);

    if (!doctor || doctor.role !== 'doctor') {
      res.status(404).json({
        success: false,
        message: 'Doctor account not found.',
      });
      return;
    }

    doctor.verificationStatus = 'rejected';
    await doctor.save();

    const profile = await DoctorProfile.findOne({ userId: doctor._id });

    res.status(200).json({
      success: true,
      message: `Doctor ${doctor.name} verification request has been rejected.`,
      data: {
        doctor: {
          ...doctor.toSafeObject(),
          profile: profile
            ? {
                licenseNumber: profile.licenseNumber,
                medicalCouncil: profile.medicalCouncil,
                specialization: profile.specialization,
                hospital: profile.hospital,
                yearsOfExperience: profile.yearsOfExperience,
              }
            : null,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}
