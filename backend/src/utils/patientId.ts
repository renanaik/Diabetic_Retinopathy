/**
 * patientId.ts — Unique Patient Identifier Generator & Migration Utility
 *
 * Generates permanent, unique, human-readable Patient IDs in the format:
 *   RC-000001, RC-000002, etc.
 *
 * Requirements:
 * - Guaranteed uniqueness across all patients.
 * - Independent from patient name (never changes when name or other profile info changes).
 * - Persisted in the database.
 * - Handles existing patient profiles automatically without breaking accounts.
 */

import mongoose, { Types } from 'mongoose';
import PatientProfile, { IPatientProfile } from '../models/PatientProfile';
import User from '../models/User';
import { logger } from './logger';

const PATIENT_ID_PREFIX = 'RC-';
const PATIENT_ID_PAD_LENGTH = 6;

/**
 * Extracts numeric sequence from a Patient ID (e.g. "RC-000042" -> 42)
 */
function parsePatientIdNumber(idStr?: string | null): number {
  if (!idStr || typeof idStr !== 'string') return 0;
  const match = idStr.match(/^RC-(\d+)$/i);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Formats a number into a standardized Patient ID string (e.g. 1 -> "RC-000001")
 */
export function formatPatientId(seqNumber: number): string {
  const padded = String(seqNumber).padStart(PATIENT_ID_PAD_LENGTH, '0');
  return `${PATIENT_ID_PREFIX}${padded}`;
}

/**
 * Generates a guaranteed unique next sequential Patient ID.
 */
export async function generateUniquePatientId(): Promise<string> {
  // 1. Find the highest existing patientId
  const profiles = await PatientProfile.find({
    patientId: { $regex: /^RC-\d+$/i },
  })
    .select('patientId')
    .lean();

  let maxSeq = 0;
  for (const p of profiles) {
    const num = parsePatientIdNumber(p.patientId);
    if (num > maxSeq) {
      maxSeq = num;
    }
  }

  // Also check total patient profile count as a baseline if sequence was empty
  if (maxSeq === 0) {
    const totalCount = await PatientProfile.countDocuments();
    maxSeq = totalCount;
  }

  let nextSeq = maxSeq + 1;
  let candidateId = formatPatientId(nextSeq);

  // 2. Collision check loop to ensure absolute uniqueness
  let exists = await PatientProfile.exists({ patientId: candidateId });
  while (exists) {
    nextSeq += 1;
    candidateId = formatPatientId(nextSeq);
    exists = await PatientProfile.exists({ patientId: candidateId });
  }

  return candidateId;
}

/**
 * Ensures that a specific PatientProfile has a unique Patient ID.
 * If missing, generates, assigns, and saves it.
 */
export async function ensurePatientId(profile: IPatientProfile): Promise<string> {
  if (profile.patientId && typeof profile.patientId === 'string' && profile.patientId.trim() !== '') {
    return profile.patientId;
  }

  const newId = await generateUniquePatientId();
  profile.patientId = newId;
  await profile.save();
  return newId;
}

/**
 * Retrieves the Patient ID for a given user ID, generating one if missing.
 */
export async function getPatientIdForUser(userId: string | Types.ObjectId): Promise<string> {
  let profile = await PatientProfile.findOne({ userId });
  if (!profile) {
    const newId = await generateUniquePatientId();
    profile = await PatientProfile.create({
      userId,
      patientId: newId,
      dateOfBirth: '1990-01-01',
      gender: 'other',
      phone: 'Not provided',
      medicalHistory: '',
      diabetesHistory: '',
      eyeHistory: '',
    });
    return newId;
  }

  return await ensurePatientId(profile);
}

/**
 * Migration & startup check:
 * Automatically ensures all existing patient profiles and patient users have unique Patient IDs.
 */
export async function ensureAllPatientsHaveIds(): Promise<void> {
  try {
    // 1. Find all PatientProfiles missing patientId
    const missingProfiles = await PatientProfile.find({
      $or: [{ patientId: { $exists: false } }, { patientId: null }, { patientId: '' }],
    });

    for (const profile of missingProfiles) {
      await ensurePatientId(profile);
    }

    // 2. Find any patient Users without a PatientProfile
    const patientUsers = await User.find({ role: 'patient' });
    for (const user of patientUsers) {
      const exists = await PatientProfile.exists({ userId: user._id });
      if (!exists) {
        const newId = await generateUniquePatientId();
        await PatientProfile.create({
          userId: user._id,
          patientId: newId,
          dateOfBirth: '1990-01-01',
          gender: 'other',
          phone: 'Not provided',
        });
      }
    }

    logger.info('Patient ID verification and migration check completed.');
  } catch (err) {
    logger.error('Failed to run patient ID verification check:', err);
  }
}
