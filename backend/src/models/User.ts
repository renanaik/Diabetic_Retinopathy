/**
 * User.ts — Mongoose User model
 *
 * Central authentication document for all roles.
 * Roles: patient | doctor | super_admin
 *
 * verificationStatus applies to doctors only.
 * Patients and Super Admins always use "not_applicable".
 *
 * IMPORTANT: passwordHash is NEVER returned in API responses.
 * Use toSafeObject() whenever sending user data to the client.
 */

import mongoose, { Document, Schema, Model } from 'mongoose';

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole = 'patient' | 'doctor' | 'super_admin';

export type VerificationStatus =
  | 'pending'        // doctor awaiting admin review
  | 'verified'       // doctor approved
  | 'rejected'       // doctor rejected
  | 'not_applicable'; // patient / super_admin

// ─── Safe user shape returned to clients ─────────────────────────────────────

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  verificationStatus: VerificationStatus;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Document interface ───────────────────────────────────────────────────────

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  verificationStatus: VerificationStatus;
  createdAt: Date;
  updatedAt: Date;
  // Instance method
  toSafeObject(): SafeUser;
}

// ─── Static methods interface ─────────────────────────────────────────────────

export interface IUserModel extends Model<IUser> {
  // reserved for future static methods
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const userSchema = new Schema<IUser, IUserModel>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name must be at most 100 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,    // normalize on save
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email is not valid'],
    },

    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false, // never returned in queries by default
    },

    role: {
      type: String,
      enum: {
        values: ['patient', 'doctor', 'super_admin'] as UserRole[],
        message: 'Role must be patient, doctor, or super_admin',
      },
      required: [true, 'Role is required'],
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    verificationStatus: {
      type: String,
      enum: {
        values: ['pending', 'verified', 'rejected', 'not_applicable'] as VerificationStatus[],
        message: 'Invalid verification status',
      },
      default: 'not_applicable',
    },
  },
  {
    timestamps: true, // adds createdAt + updatedAt automatically
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

// email unique index is created by the `unique: true` field option above.
// Explicitly define a partial index for doctors to speed up verification queries.
userSchema.index({ role: 1, verificationStatus: 1 });

// ─── Instance methods ─────────────────────────────────────────────────────────

/**
 * Returns a safe user object without passwordHash.
 * Use this whenever returning user data in an API response.
 */
userSchema.methods.toSafeObject = function (): SafeUser {
  return {
    id: (this._id as mongoose.Types.ObjectId).toString(),
    name: this.name,
    email: this.email,
    role: this.role,
    isActive: this.isActive,
    verificationStatus: this.verificationStatus,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

// ─── Model ────────────────────────────────────────────────────────────────────

const User = mongoose.model<IUser, IUserModel>('User', userSchema);

export default User;
