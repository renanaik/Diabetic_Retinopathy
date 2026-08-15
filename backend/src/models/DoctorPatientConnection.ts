/**
 * DoctorPatientConnection.ts — Doctor-Patient Relationship Model
 *
 * Tracks connection requests and relationships between patients and doctors.
 * Status workflow:
 *   - 'pending'  : Patient initiated a connection request to a verified doctor.
 *   - 'accepted' : Doctor accepted the request. Active relationship established.
 *   - 'rejected' : Doctor rejected the request.
 */

import mongoose, { Document, Schema, Model, Types } from 'mongoose';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ConnectionStatus = 'pending' | 'accepted' | 'rejected';

// ─── Document interface ───────────────────────────────────────────────────────

export interface IDoctorPatientConnection extends Document {
  doctorId: Types.ObjectId;
  patientId: Types.ObjectId;
  status: ConnectionStatus;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const doctorPatientConnectionSchema = new Schema<IDoctorPatientConnection>(
  {
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Doctor ID is required'],
      index: true,
    },

    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient ID is required'],
      index: true,
    },

    status: {
      type: String,
      enum: {
        values: ['pending', 'accepted', 'rejected'] as ConnectionStatus[],
        message: 'Invalid connection status. Must be pending, accepted, or rejected.',
      },
      default: 'pending',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

// Compound index for querying relationship between specific doctor and patient
doctorPatientConnectionSchema.index({ doctorId: 1, patientId: 1 });

// Query optimizations for doctor requests and patient connections
doctorPatientConnectionSchema.index({ doctorId: 1, status: 1 });
doctorPatientConnectionSchema.index({ patientId: 1, status: 1 });

// ─── Model ────────────────────────────────────────────────────────────────────

const DoctorPatientConnection = mongoose.model<IDoctorPatientConnection>(
  'DoctorPatientConnection',
  doctorPatientConnectionSchema
);

export default DoctorPatientConnection;
