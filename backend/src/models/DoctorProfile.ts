/**
 * DoctorProfile.ts — Doctor-specific professional information
 *
 * Separate from User to keep the auth document lean.
 * Linked to the User document via userId.
 *
 * Only created when role = doctor during signup.
 */

import mongoose, { Document, Schema, Model, Types } from 'mongoose';

// ─── Document interface ───────────────────────────────────────────────────────

export interface IDoctorProfile extends Document {
  userId: Types.ObjectId;
  licenseNumber: string;
  medicalCouncil: string;
  specialization: string;
  hospital: string;
  yearsOfExperience: number;
  phone?: string;
  qualification?: string;
  subSpecialization?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  consultationHours?: string;
  website?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const doctorProfileSchema = new Schema<IDoctorProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required'],
      unique: true, // one profile per doctor
      index: true,
    },

    licenseNumber: {
      type: String,
      required: [true, 'Medical license number is required'],
      trim: true,
    },

    medicalCouncil: {
      type: String,
      required: [true, 'Medical council / authority is required'],
      trim: true,
    },

    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      trim: true,
    },

    hospital: {
      type: String,
      required: [true, 'Hospital / clinic name is required'],
      trim: true,
    },

    yearsOfExperience: {
      type: Number,
      required: [true, 'Years of experience is required'],
      min: [0, 'Years of experience cannot be negative'],
      max: [70, 'Years of experience seems unrealistic'],
    },

    phone: {
      type: String,
      trim: true,
      default: '',
    },

    qualification: {
      type: String,
      trim: true,
      default: '',
    },

    subSpecialization: {
      type: String,
      trim: true,
      default: '',
    },

    address: {
      type: String,
      trim: true,
      default: '',
    },

    city: {
      type: String,
      trim: true,
      default: '',
    },

    state: {
      type: String,
      trim: true,
      default: '',
    },

    country: {
      type: String,
      trim: true,
      default: '',
    },

    consultationHours: {
      type: String,
      trim: true,
      default: '',
    },

    website: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// ─── Model ────────────────────────────────────────────────────────────────────

const DoctorProfile = mongoose.model<IDoctorProfile>('DoctorProfile', doctorProfileSchema);

export default DoctorProfile;
