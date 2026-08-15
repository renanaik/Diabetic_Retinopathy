/**
 * PatientProfile.ts — Patient-specific medical background information
 *
 * Separate from User to keep the auth document lean.
 * Linked to the User document via userId.
 *
 * Fields align with the frontend PatientSignupData type.
 * Only created when role = patient during signup.
 *
 * NOTE: This is non-clinical background context only.
 * Actual screening results are stored in separate Screening documents (Phase 5D+).
 */

import mongoose, { Document, Schema, Types } from 'mongoose';

// ─── Document interface ───────────────────────────────────────────────────────

export interface IPatientProfile extends Document {
  userId: Types.ObjectId;
  dateOfBirth: string;   // stored as ISO date string (YYYY-MM-DD)
  gender: string;
  phone: string;
  medicalHistory: string;
  diabetesHistory: string;
  eyeHistory: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const patientProfileSchema = new Schema<IPatientProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required'],
      unique: true, // one profile per patient
      index: true,
    },

    dateOfBirth: {
      type: String,
      required: [true, 'Date of birth is required'],
      trim: true,
    },

    gender: {
      type: String,
      required: [true, 'Gender is required'],
      trim: true,
    },

    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },

    medicalHistory: {
      type: String,
      default: '',
      trim: true,
    },

    diabetesHistory: {
      type: String,
      default: '',
      trim: true,
    },

    eyeHistory: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Model ────────────────────────────────────────────────────────────────────

const PatientProfile = mongoose.model<IPatientProfile>('PatientProfile', patientProfileSchema);

export default PatientProfile;
