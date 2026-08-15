/**
 * connection.controller.ts — Doctor-Patient Connection Controller
 *
 * Manages relationships between patients and doctors:
 *   - POST  /api/connections                 — Patient requests a doctor
 *   - GET   /api/connections/requests        — Doctor views pending connection requests
 *   - PATCH /api/connections/:connectionId/accept — Doctor accepts a connection request
 *   - PATCH /api/connections/:connectionId/reject — Doctor rejects a connection request
 *   - GET   /api/connections/my-doctors      — Patient views their doctor connections
 *   - GET   /api/connections/my-patients     — Doctor views their accepted connected patients
 *
 * Security:
 *   - Strict role-based and ownership-based access control.
 *   - Client-provided IDs are never trusted over req.user identity.
 */

import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import DoctorPatientConnection from '../models/DoctorPatientConnection';
import User from '../models/User';
import DoctorProfile from '../models/DoctorProfile';
import PatientProfile from '../models/PatientProfile';
import { validateObjectId } from '../utils/validation';
import { AppError } from '../middleware/errorHandler';

// ─── POST /api/connections (Patient requests a Doctor) ─────────────────────────

export async function requestConnection(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const patientId = req.user!.id;
    const { doctorId } = req.body as { doctorId?: string };

    // 1. Validate doctorId format
    const idError = validateObjectId(doctorId, 'doctorId', 'Doctor ID');
    if (idError) {
      res.status(400).json({ success: false, message: idError.message });
      return;
    }

    // 2. Prevent self-connection
    if (patientId === doctorId) {
      res.status(400).json({
        success: false,
        message: 'You cannot initiate a connection request with yourself.',
      });
      return;
    }

    // 3. Verify target exists and is a VERIFIED doctor
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      res.status(404).json({
        success: false,
        message: 'Doctor not found.',
      });
      return;
    }

    if (doctor.verificationStatus !== 'verified') {
      res.status(400).json({
        success: false,
        message: 'Connection requests can only be sent to verified doctors.',
      });
      return;
    }

    // 4. Check existing connection between this patient and doctor
    let connection = await DoctorPatientConnection.findOne({
      doctorId: new mongoose.Types.ObjectId(doctorId),
      patientId: new mongoose.Types.ObjectId(patientId),
    });

    if (connection) {
      if (connection.status === 'pending') {
        res.status(409).json({
          success: false,
          message: 'A connection request to this doctor is already pending approval.',
        });
        return;
      }
      if (connection.status === 'accepted') {
        res.status(409).json({
          success: false,
          message: 'You are already connected with this doctor.',
        });
        return;
      }
      // If previously rejected, allow re-requesting by transitioning to pending
      connection.status = 'pending';
      await connection.save();
    } else {
      connection = await DoctorPatientConnection.create({
        doctorId: new mongoose.Types.ObjectId(doctorId),
        patientId: new mongoose.Types.ObjectId(patientId),
        status: 'pending',
      });
    }

    const doctorProfile = await DoctorProfile.findOne({ userId: doctor._id });

    res.status(201).json({
      success: true,
      message: `Connection request sent to Dr. ${doctor.name}.`,
      data: {
        connection: {
          id: connection._id.toString(),
          doctorId: connection.doctorId.toString(),
          patientId: connection.patientId.toString(),
          status: connection.status,
          createdAt: connection.createdAt,
          updatedAt: connection.updatedAt,
          doctor: {
            id: doctor._id.toString(),
            name: doctor.name,
            email: doctor.email,
            verificationStatus: doctor.verificationStatus,
            profile: doctorProfile
              ? {
                  licenseNumber: doctorProfile.licenseNumber,
                  medicalCouncil: doctorProfile.medicalCouncil,
                  specialization: doctorProfile.specialization,
                  hospital: doctorProfile.hospital,
                  yearsOfExperience: doctorProfile.yearsOfExperience,
                }
              : null,
          },
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/connections/requests (Doctor views pending requests) ────────────

export async function getDoctorPendingRequests(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const doctorId = req.user!.id;

    const connections = await DoctorPatientConnection.find({
      doctorId: new mongoose.Types.ObjectId(doctorId),
      status: 'pending',
    }).sort({ createdAt: -1 });

    const patientIds = connections.map((c) => c.patientId);
    const patients = await User.find({ _id: { $in: patientIds } });
    const patientProfiles = await PatientProfile.find({ userId: { $in: patientIds } });

    const patientMap = new Map(patients.map((p) => [p._id.toString(), p]));
    const profileMap = new Map(patientProfiles.map((p) => [p.userId.toString(), p]));

    const formattedRequests = connections.map((conn) => {
      const patient = patientMap.get(conn.patientId.toString());
      const profile = profileMap.get(conn.patientId.toString());

      return {
        id: conn._id.toString(),
        doctorId: conn.doctorId.toString(),
        patientId: conn.patientId.toString(),
        status: conn.status,
        createdAt: conn.createdAt,
        updatedAt: conn.updatedAt,
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
      };
    });

    res.status(200).json({
      success: true,
      message: 'Pending connection requests retrieved successfully.',
      data: {
        count: formattedRequests.length,
        requests: formattedRequests,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── PATCH /api/connections/:connectionId/accept (Doctor accepts request) ─────

export async function acceptConnection(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const doctorId = req.user!.id;
    const { connectionId } = req.params;

    const idError = validateObjectId(connectionId, 'connectionId', 'Connection ID');
    if (idError) {
      res.status(400).json({ success: false, message: idError.message });
      return;
    }

    // Must match both connectionId AND the authenticated doctor's ID (Ownership Check)
    const connection = await DoctorPatientConnection.findOne({
      _id: new mongoose.Types.ObjectId(connectionId),
      doctorId: new mongoose.Types.ObjectId(doctorId),
    });

    if (!connection) {
      res.status(404).json({
        success: false,
        message: 'Connection request not found or you do not have permission to manage it.',
      });
      return;
    }

    connection.status = 'accepted';
    await connection.save();

    const patient = await User.findById(connection.patientId);

    res.status(200).json({
      success: true,
      message: 'Connection request accepted successfully.',
      data: {
        connection: {
          id: connection._id.toString(),
          doctorId: connection.doctorId.toString(),
          patientId: connection.patientId.toString(),
          status: connection.status,
          createdAt: connection.createdAt,
          updatedAt: connection.updatedAt,
          patientName: patient ? patient.name : 'Unknown',
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── PATCH /api/connections/:connectionId/reject (Doctor rejects request) ─────

export async function rejectConnection(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const doctorId = req.user!.id;
    const { connectionId } = req.params;

    const idError = validateObjectId(connectionId, 'connectionId', 'Connection ID');
    if (idError) {
      res.status(400).json({ success: false, message: idError.message });
      return;
    }

    // Ownership Check: Doctor must own the target connection
    const connection = await DoctorPatientConnection.findOne({
      _id: new mongoose.Types.ObjectId(connectionId),
      doctorId: new mongoose.Types.ObjectId(doctorId),
    });

    if (!connection) {
      res.status(404).json({
        success: false,
        message: 'Connection request not found or you do not have permission to manage it.',
      });
      return;
    }

    connection.status = 'rejected';
    await connection.save();

    const patient = await User.findById(connection.patientId);

    res.status(200).json({
      success: true,
      message: 'Connection request rejected.',
      data: {
        connection: {
          id: connection._id.toString(),
          doctorId: connection.doctorId.toString(),
          patientId: connection.patientId.toString(),
          status: connection.status,
          createdAt: connection.createdAt,
          updatedAt: connection.updatedAt,
          patientName: patient ? patient.name : 'Unknown',
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/connections/my-doctors (Patient views their connections) ────────

export async function getPatientDoctors(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const patientId = req.user!.id;

    const connections = await DoctorPatientConnection.find({
      patientId: new mongoose.Types.ObjectId(patientId),
    }).sort({ updatedAt: -1 });

    const doctorIds = connections.map((c) => c.doctorId);
    const doctors = await User.find({ _id: { $in: doctorIds } });
    const doctorProfiles = await DoctorProfile.find({ userId: { $in: doctorIds } });

    const doctorMap = new Map(doctors.map((d) => [d._id.toString(), d]));
    const profileMap = new Map(doctorProfiles.map((p) => [p.userId.toString(), p]));

    const formattedConnections = connections.map((conn) => {
      const doctor = doctorMap.get(conn.doctorId.toString());
      const profile = profileMap.get(conn.doctorId.toString());

      return {
        id: conn._id.toString(),
        doctorId: conn.doctorId.toString(),
        patientId: conn.patientId.toString(),
        status: conn.status,
        createdAt: conn.createdAt,
        updatedAt: conn.updatedAt,
        doctor: doctor
          ? {
              id: doctor._id.toString(),
              name: doctor.name,
              email: doctor.email,
              verificationStatus: doctor.verificationStatus,
              profile: profile
                ? {
                    licenseNumber: profile.licenseNumber,
                    medicalCouncil: profile.medicalCouncil,
                    specialization: profile.specialization,
                    hospital: profile.hospital,
                    yearsOfExperience: profile.yearsOfExperience,
                  }
                : null,
            }
          : null,
      };
    });

    res.status(200).json({
      success: true,
      message: 'Doctor connections retrieved successfully.',
      data: {
        count: formattedConnections.length,
        connections: formattedConnections,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/connections/my-patients (Doctor views their accepted patients) ──

export async function getDoctorPatients(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const doctorId = req.user!.id;

    // Only accepted connections represent established clinical relationships
    const connections = await DoctorPatientConnection.find({
      doctorId: new mongoose.Types.ObjectId(doctorId),
      status: 'accepted',
    }).sort({ updatedAt: -1 });

    const patientIds = connections.map((c) => c.patientId);
    const patients = await User.find({ _id: { $in: patientIds } });
    const patientProfiles = await PatientProfile.find({ userId: { $in: patientIds } });

    const patientMap = new Map(patients.map((p) => [p._id.toString(), p]));
    const profileMap = new Map(patientProfiles.map((p) => [p.userId.toString(), p]));

    const formattedPatients = connections.map((conn) => {
      const patient = patientMap.get(conn.patientId.toString());
      const profile = profileMap.get(conn.patientId.toString());

      return {
        connectionId: conn._id.toString(),
        connectedSince: conn.updatedAt,
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
      };
    });

    res.status(200).json({
      success: true,
      message: 'Connected patients retrieved successfully.',
      data: {
        count: formattedPatients.length,
        patients: formattedPatients,
      },
    });
  } catch (err) {
    next(err);
  }
}
