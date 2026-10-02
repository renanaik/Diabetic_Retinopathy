/**
 * admin.controller.ts — Super Admin Controller
 *
 * Handles administrative oversight for the RetinaCare platform:
 *   - GET   /api/admin/dashboard              — Platform overview statistics & metrics
 *   - GET   /api/admin/doctors/pending        — List pending doctor verification requests
 *   - GET   /api/admin/doctors                — List all doctors (with profile, connection & screening counts)
 *   - PATCH /api/admin/doctors/:doctorId/approve — Approve a pending doctor
 *   - PATCH /api/admin/doctors/:doctorId/reject  — Reject a doctor verification request
 *   - GET   /api/admin/patients               — List all patients with profiles, IDs, connected doctors, & screening count
 *   - GET   /api/admin/connections            — List all doctor-patient connections
 *   - GET   /api/admin/screenings             — List all AI screenings and reviews
 *   - GET   /api/admin/users                  — List all registered accounts across roles
 *   - GET   /api/admin/reports                — Aggregated diagnostic and clinical system reports
 *
 * Security:
 *   - All endpoints require authenticated super_admin role.
 *   - Sensitive fields like passwordHash are never returned.
 */

import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import DoctorProfile from '../models/DoctorProfile';
import PatientProfile from '../models/PatientProfile';
import DoctorPatientConnection from '../models/DoctorPatientConnection';
import Screening from '../models/Screening';
import { validateObjectId } from '../utils/validation';
import { ensurePatientId, generateUniquePatientId } from '../utils/patientId';

// ─── GET /api/admin/dashboard (Dashboard Overview Stats) ──────────────────────

export async function getAdminDashboardStats(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const [
      totalPatients,
      totalDoctors,
      totalSuperAdmins,
      pendingDoctors,
      verifiedDoctors,
      rejectedDoctors,
      totalScreenings,
      approvedScreenings,
      pendingScreenings,
      rejectedScreenings,
      totalConnections,
      acceptedConnections,
      pendingConnections,
      rejectedConnections,
    ] = await Promise.all([
      User.countDocuments({ role: 'patient' }),
      User.countDocuments({ role: 'doctor' }),
      User.countDocuments({ role: 'super_admin' }),
      User.countDocuments({ role: 'doctor', verificationStatus: 'pending' }),
      User.countDocuments({ role: 'doctor', verificationStatus: 'verified' }),
      User.countDocuments({ role: 'doctor', verificationStatus: 'rejected' }),
      Screening.countDocuments(),
      Screening.countDocuments({ status: 'approved' }),
      Screening.countDocuments({ status: 'pending_review' }),
      Screening.countDocuments({ status: 'rejected' }),
      DoctorPatientConnection.countDocuments(),
      DoctorPatientConnection.countDocuments({ status: 'accepted' }),
      DoctorPatientConnection.countDocuments({ status: 'pending' }),
      DoctorPatientConnection.countDocuments({ status: 'rejected' }),
    ]);

    // Diagnostic DR stage breakdown (0 to 4)
    const stageCountsAgg = await Screening.aggregate([
      {
        $group: {
          _id: '$aiResult.predictedClass',
          count: { $sum: 1 },
        },
      },
    ]);

    const stageBreakdown: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
    stageCountsAgg.forEach((item) => {
      if (item._id !== undefined && item._id !== null) {
        stageBreakdown[item._id] = item.count;
      }
    });

    // Recent 5 Screenings
    const recentScreeningsRaw = await Screening.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const recentPatientIds = recentScreeningsRaw.map((s) => s.patientId);
    const recentDoctorIds = recentScreeningsRaw.map((s) => s.doctorId);

    const [recentPatientUsers, recentPatientProfiles, recentDoctorUsers] = await Promise.all([
      User.find({ _id: { $in: recentPatientIds } }).lean(),
      PatientProfile.find({ userId: { $in: recentPatientIds } }).lean(),
      User.find({ _id: { $in: recentDoctorIds } }).lean(),
    ]);

    const patientMap = new Map(recentPatientUsers.map((u) => [u._id.toString(), u]));
    const patientProfileMap = new Map(recentPatientProfiles.map((p) => [p.userId.toString(), p]));
    const doctorMap = new Map(recentDoctorUsers.map((u) => [u._id.toString(), u]));

    const recentScreenings = recentScreeningsRaw.map((s) => {
      const patient = patientMap.get(s.patientId.toString());
      const profile = patientProfileMap.get(s.patientId.toString());
      const doctor = doctorMap.get(s.doctorId.toString());

      return {
        id: s._id.toString(),
        patientName: patient?.name || 'Unknown Patient',
        patientId: patient?.patientId || profile?.patientId || 'N/A',
        doctorName: doctor?.name || 'Unknown Doctor',
        predictedLabel: s.aiResult?.predictedLabel || 'N/A',
        predictedClass: s.aiResult?.predictedClass ?? 0,
        referable: s.aiResult?.referable ?? false,
        status: s.status,
        createdAt: s.createdAt,
      };
    });

    // Recent 5 Doctor Verifications Pending
    const recentPendingDoctorsRaw = await User.find({
      role: 'doctor',
      verificationStatus: 'pending',
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const pendingDocUserIds = recentPendingDoctorsRaw.map((d) => d._id);
    const pendingDocProfiles = await DoctorProfile.find({ userId: { $in: pendingDocUserIds } }).lean();
    const pendingDocProfileMap = new Map(pendingDocProfiles.map((p) => [p.userId.toString(), p]));

    const recentPendingDoctors = recentPendingDoctorsRaw.map((d) => {
      const profile = pendingDocProfileMap.get(d._id.toString());
      return {
        id: d._id.toString(),
        name: d.name,
        email: d.email,
        specialization: profile?.specialization || 'Ophthalmology',
        hospital: profile?.hospital || 'Not provided',
        medicalCouncil: profile?.medicalCouncil || 'Not provided',
        licenseNumber: profile?.licenseNumber || 'Not provided',
        yearsOfExperience: profile?.yearsOfExperience ?? 0,
        createdAt: d.createdAt,
      };
    });

    res.status(200).json({
      success: true,
      message: 'Admin dashboard statistics retrieved successfully.',
      data: {
        totals: {
          patients: totalPatients,
          doctors: totalDoctors,
          superAdmins: totalSuperAdmins,
          totalUsers: totalPatients + totalDoctors + totalSuperAdmins,
          screenings: totalScreenings,
          connections: totalConnections,
        },
        screenings: {
          total: totalScreenings,
          approved: approvedScreenings,
          pendingReview: pendingScreenings,
          rejected: rejectedScreenings,
          stageBreakdown,
        },
        doctors: {
          total: totalDoctors,
          pending: pendingDoctors,
          verified: verifiedDoctors,
          rejected: rejectedDoctors,
        },
        connections: {
          total: totalConnections,
          accepted: acceptedConnections,
          pending: pendingConnections,
          rejected: rejectedConnections,
        },
        recentScreenings,
        recentPendingDoctors,
      },
    });
  } catch (err) {
    next(err);
  }
}

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

    const doctorIds = pendingDoctors.map((doc) => doc._id);
    const profiles = await DoctorProfile.find({ userId: { $in: doctorIds } });

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

// ─── GET /api/admin/doctors (All Doctors with Connection & Screening counts) ─

export async function getAllDoctors(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { status, search } = req.query;
    const filter: Record<string, unknown> = { role: 'doctor' };

    if (
      status &&
      typeof status === 'string' &&
      ['pending', 'verified', 'rejected'].includes(status)
    ) {
      filter.verificationStatus = status;
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    const doctors = await User.find(filter).sort({ createdAt: -1 });
    const doctorIds = doctors.map((doc) => doc._id);

    // Fetch matching doctor profiles
    const profiles = await DoctorProfile.find({ userId: { $in: doctorIds } });
    const profileMap = new Map(
      profiles.map((p) => [p.userId.toString(), p])
    );

    // Fetch accepted connection counts per doctor
    const connectionsAgg = await DoctorPatientConnection.aggregate([
      { $match: { doctorId: { $in: doctorIds }, status: 'accepted' } },
      { $group: { _id: '$doctorId', count: { $sum: 1 } } },
    ]);
    const connectionCountMap = new Map(
      connectionsAgg.map((item) => [item._id.toString(), item.count])
    );

    // Fetch screening counts per doctor
    const screeningsAgg = await Screening.aggregate([
      { $match: { doctorId: { $in: doctorIds } } },
      { $group: { _id: '$doctorId', count: { $sum: 1 } } },
    ]);
    const screeningCountMap = new Map(
      screeningsAgg.map((item) => [item._id.toString(), item.count])
    );

    const doctorsWithProfiles = doctors.map((doc) => {
      const safeUser = doc.toSafeObject();
      const profile = profileMap.get(doc._id.toString());
      return {
        ...safeUser,
        connectedPatientsCount: connectionCountMap.get(doc._id.toString()) || 0,
        screeningsCount: screeningCountMap.get(doc._id.toString()) || 0,
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

// ─── GET /api/admin/patients (Patients Directory) ─────────────────────────────

export async function getAllPatients(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { search } = req.query;
    const filter: Record<string, unknown> = { role: 'patient' };

    if (search && typeof search === 'string' && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { patientId: searchRegex },
      ];
    }

    const patients = await User.find(filter).sort({ createdAt: -1 });
    const patientUserIds = patients.map((p) => p._id);

    // Fetch Patient Profiles
    const profiles = await PatientProfile.find({ userId: { $in: patientUserIds } });
    const profileMap = new Map(
      profiles.map((p) => [p.userId.toString(), p])
    );

    // Fetch Connected Doctors per Patient
    const connections = await DoctorPatientConnection.find({
      patientId: { $in: patientUserIds },
      status: 'accepted',
    }).populate('doctorId', 'name email');

    const connectionsMap = new Map<string, Array<{ id: string; name: string; email: string }>>();
    connections.forEach((conn) => {
      const patIdStr = conn.patientId.toString();
      const doc = conn.doctorId as any;
      if (doc && doc._id) {
        const list = connectionsMap.get(patIdStr) || [];
        list.push({
          id: doc._id.toString(),
          name: doc.name,
          email: doc.email,
        });
        connectionsMap.set(patIdStr, list);
      }
    });

    // Fetch Screenings count and latest screening per patient
    const screenings = await Screening.find({
      patientId: { $in: patientUserIds },
    }).sort({ createdAt: -1 });

    const screeningCountMap = new Map<string, number>();
    const latestScreeningMap = new Map<string, any>();

    screenings.forEach((scr) => {
      const patIdStr = scr.patientId.toString();
      screeningCountMap.set(patIdStr, (screeningCountMap.get(patIdStr) || 0) + 1);
      if (!latestScreeningMap.has(patIdStr)) {
        latestScreeningMap.set(patIdStr, {
          id: scr._id.toString(),
          date: scr.createdAt,
          stage: scr.aiResult?.predictedLabel || 'N/A',
          predictedClass: scr.aiResult?.predictedClass ?? 0,
          status: scr.status,
          referable: scr.aiResult?.referable ?? false,
        });
      }
    });

    // Build patient items, ensuring unique Patient ID is present
    const formattedPatients = await Promise.all(
      patients.map(async (pat) => {
        let profile = profileMap.get(pat._id.toString());
        let pId = pat.patientId || profile?.patientId;

        if (!pId) {
          if (profile) {
            pId = await ensurePatientId(profile);
          } else {
            pId = await generateUniquePatientId();
            profile = await PatientProfile.create({
              userId: pat._id,
              patientId: pId,
              dateOfBirth: '1990-01-01',
              gender: 'other',
              phone: 'Not provided',
            });
          }
          pat.patientId = pId;
          await pat.save();
        }

        const safeUser = pat.toSafeObject();
        const connectedDoctors = connectionsMap.get(pat._id.toString()) || [];
        const totalScreenings = screeningCountMap.get(pat._id.toString()) || 0;
        const latestScreening = latestScreeningMap.get(pat._id.toString()) || null;

        return {
          id: safeUser.id,
          patientId: pId,
          name: safeUser.name,
          email: safeUser.email,
          isActive: safeUser.isActive,
          createdAt: safeUser.createdAt,
          profile: profile
            ? {
                dateOfBirth: profile.dateOfBirth,
                gender: profile.gender,
                phone: profile.phone,
                medicalHistory: profile.medicalHistory || '',
                diabetesHistory: profile.diabetesHistory || '',
                eyeHistory: profile.eyeHistory || '',
              }
            : null,
          connectedDoctors,
          connectedDoctorsCount: connectedDoctors.length,
          screeningsCount: totalScreenings,
          latestScreening,
        };
      })
    );

    res.status(200).json({
      success: true,
      message: 'Patients retrieved successfully.',
      data: {
        count: formattedPatients.length,
        patients: formattedPatients,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/admin/connections (Doctor-Patient Connections) ──────────────────

export async function getAllConnections(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { status, search } = req.query;
    const filter: Record<string, unknown> = {};

    if (
      status &&
      typeof status === 'string' &&
      ['pending', 'accepted', 'rejected'].includes(status)
    ) {
      filter.status = status;
    }

    const connections = await DoctorPatientConnection.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    const doctorIds = connections.map((c) => c.doctorId);
    const patientIds = connections.map((c) => c.patientId);

    const [doctorUsers, doctorProfiles, patientUsers, patientProfiles] = await Promise.all([
      User.find({ _id: { $in: doctorIds } }).lean(),
      DoctorProfile.find({ userId: { $in: doctorIds } }).lean(),
      User.find({ _id: { $in: patientIds } }).lean(),
      PatientProfile.find({ userId: { $in: patientIds } }).lean(),
    ]);

    const doctorMap = new Map(doctorUsers.map((u) => [u._id.toString(), u]));
    const doctorProfileMap = new Map(doctorProfiles.map((p) => [p.userId.toString(), p]));
    const patientMap = new Map(patientUsers.map((u) => [u._id.toString(), u]));
    const patientProfileMap = new Map(patientProfiles.map((p) => [p.userId.toString(), p]));

    let formattedConnections = connections.map((conn) => {
      const docUser = doctorMap.get(conn.doctorId.toString());
      const docProf = doctorProfileMap.get(conn.doctorId.toString());
      const patUser = patientMap.get(conn.patientId.toString());
      const patProf = patientProfileMap.get(conn.patientId.toString());

      return {
        id: conn._id.toString(),
        status: conn.status,
        createdAt: conn.createdAt,
        updatedAt: conn.updatedAt,
        doctor: {
          id: conn.doctorId.toString(),
          name: docUser?.name || 'Unknown Doctor',
          email: docUser?.email || '',
          specialization: docProf?.specialization || 'Ophthalmology',
          hospital: docProf?.hospital || 'Clinic',
          verificationStatus: docUser?.verificationStatus || 'not_applicable',
        },
        patient: {
          id: conn.patientId.toString(),
          name: patUser?.name || 'Unknown Patient',
          email: patUser?.email || '',
          patientId: patUser?.patientId || patProf?.patientId || 'N/A',
          phone: patProf?.phone || 'Not provided',
        },
      };
    });

    if (search && typeof search === 'string' && search.trim() !== '') {
      const s = search.trim().toLowerCase();
      formattedConnections = formattedConnections.filter(
        (c) =>
          c.doctor.name.toLowerCase().includes(s) ||
          c.doctor.email.toLowerCase().includes(s) ||
          c.patient.name.toLowerCase().includes(s) ||
          c.patient.email.toLowerCase().includes(s) ||
          c.patient.patientId.toLowerCase().includes(s)
      );
    }

    res.status(200).json({
      success: true,
      message: 'Connections retrieved successfully.',
      data: {
        count: formattedConnections.length,
        connections: formattedConnections,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/admin/screenings (All AI Screenings & Reviews) ───────────────────

export async function getAllScreenings(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { status, search } = req.query;
    const filter: Record<string, unknown> = {};

    if (
      status &&
      typeof status === 'string' &&
      ['pending_review', 'approved', 'rejected'].includes(status)
    ) {
      filter.status = status;
    }

    const screenings = await Screening.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    const doctorIds = screenings.map((s) => s.doctorId);
    const patientIds = screenings.map((s) => s.patientId);

    const [doctorUsers, doctorProfiles, patientUsers, patientProfiles] = await Promise.all([
      User.find({ _id: { $in: doctorIds } }).lean(),
      DoctorProfile.find({ userId: { $in: doctorIds } }).lean(),
      User.find({ _id: { $in: patientIds } }).lean(),
      PatientProfile.find({ userId: { $in: patientIds } }).lean(),
    ]);

    const doctorMap = new Map(doctorUsers.map((u) => [u._id.toString(), u]));
    const doctorProfileMap = new Map(doctorProfiles.map((p) => [p.userId.toString(), p]));
    const patientMap = new Map(patientUsers.map((u) => [u._id.toString(), u]));
    const patientProfileMap = new Map(patientProfiles.map((p) => [p.userId.toString(), p]));

    let formattedScreenings = screenings.map((scr) => {
      const docUser = doctorMap.get(scr.doctorId.toString());
      const docProf = doctorProfileMap.get(scr.doctorId.toString());
      const patUser = patientMap.get(scr.patientId.toString());
      const patProf = patientProfileMap.get(scr.patientId.toString());

      return {
        id: scr._id.toString(),
        status: scr.status,
        createdAt: scr.createdAt,
        updatedAt: scr.updatedAt,
        image: {
          originalFilename: scr.image?.originalFilename || 'fundus.jpg',
          size: scr.image?.size || 0,
          mimeType: scr.image?.mimeType || 'image/jpeg',
        },
        aiResult: {
          predictedClass: scr.aiResult?.predictedClass ?? 0,
          predictedLabel: scr.aiResult?.predictedLabel || 'No DR',
          confidence: scr.aiResult?.confidence ?? 0,
          referable: scr.aiResult?.referable ?? false,
          referableProbability: scr.aiResult?.referableProbability ?? 0,
        },
        review: scr.review
          ? {
              decision: scr.review.decision,
              doctorNotes: scr.review.doctorNotes || '',
              reviewedAt: scr.review.reviewedAt,
            }
          : null,
        doctor: {
          id: scr.doctorId.toString(),
          name: docUser?.name || 'Unknown Doctor',
          email: docUser?.email || '',
          specialization: docProf?.specialization || 'Ophthalmology',
          hospital: docProf?.hospital || 'Clinic',
        },
        patient: {
          id: scr.patientId.toString(),
          name: patUser?.name || 'Unknown Patient',
          email: patUser?.email || '',
          patientId: patUser?.patientId || patProf?.patientId || 'N/A',
        },
      };
    });

    if (search && typeof search === 'string' && search.trim() !== '') {
      const s = search.trim().toLowerCase();
      formattedScreenings = formattedScreenings.filter(
        (scr) =>
          scr.patient.name.toLowerCase().includes(s) ||
          scr.patient.email.toLowerCase().includes(s) ||
          scr.patient.patientId.toLowerCase().includes(s) ||
          scr.doctor.name.toLowerCase().includes(s) ||
          scr.aiResult.predictedLabel.toLowerCase().includes(s)
      );
    }

    res.status(200).json({
      success: true,
      message: 'Screenings retrieved successfully.',
      data: {
        count: formattedScreenings.length,
        screenings: formattedScreenings,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/admin/users (All Registered Accounts Across Roles) ──────────────

export async function getAllUsers(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { role, search } = req.query;
    const filter: Record<string, unknown> = {};

    if (
      role &&
      typeof role === 'string' &&
      ['patient', 'doctor', 'super_admin'].includes(role)
    ) {
      filter.role = role;
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { patientId: searchRegex },
      ];
    }

    const users = await User.find(filter).sort({ createdAt: -1 });

    const formattedUsers = users.map((u) => u.toSafeObject());

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully.',
      data: {
        count: formattedUsers.length,
        users: formattedUsers,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/admin/reports (System Clinical & Diagnostic Reports) ─────────────

export async function getAdminReports(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const [
      totalScreenings,
      approvedCount,
      rejectedCount,
      pendingCount,
      referableCount,
      nonReferableCount,
      stageCounts,
    ] = await Promise.all([
      Screening.countDocuments(),
      Screening.countDocuments({ status: 'approved' }),
      Screening.countDocuments({ status: 'rejected' }),
      Screening.countDocuments({ status: 'pending_review' }),
      Screening.countDocuments({ 'aiResult.referable': true }),
      Screening.countDocuments({ 'aiResult.referable': false }),
      Screening.aggregate([
        {
          $group: {
            _id: {
              predictedClass: '$aiResult.predictedClass',
              predictedLabel: '$aiResult.predictedLabel',
            },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const stageMap: Record<number, { label: string; count: number }> = {
      0: { label: 'No DR', count: 0 },
      1: { label: 'Mild DR', count: 0 },
      2: { label: 'Moderate DR', count: 0 },
      3: { label: 'Severe DR', count: 0 },
      4: { label: 'Proliferative DR', count: 0 },
    };

    stageCounts.forEach((item) => {
      const cls = item._id?.predictedClass;
      if (cls !== undefined && stageMap[cls]) {
        stageMap[cls].count = item.count;
      }
    });

    const approvalRate = totalScreenings > 0
      ? Number(((approvedCount / (approvedCount + rejectedCount || 1)) * 100).toFixed(1))
      : 100;

    res.status(200).json({
      success: true,
      message: 'System reports and analytics retrieved successfully.',
      data: {
        summary: {
          totalScreenings,
          approvedCount,
          rejectedCount,
          pendingCount,
          referableCount,
          nonReferableCount,
          approvalRate,
        },
        stageDistribution: Object.entries(stageMap).map(([stageNum, val]) => ({
          stage: Number(stageNum),
          label: val.label,
          count: val.count,
          percentage: totalScreenings > 0 ? Number(((val.count / totalScreenings) * 100).toFixed(1)) : 0,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
}
