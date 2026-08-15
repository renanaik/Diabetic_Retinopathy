/**
 * auth.controller.ts — Authentication controller
 *
 * Handles:
 *   POST /api/auth/signup  — patient and doctor registration
 *   POST /api/auth/login   — credential verification + JWT issuance
 *   GET  /api/auth/me      — returns authenticated user profile
 *
 * Security rules:
 *   - super_admin cannot be created via signup (seed script only)
 *   - passwordHash is NEVER returned to the client
 *   - role is derived from the database (never trusted from client)
 *   - emails are normalized to lowercase before any DB operation
 */

import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';

import User from '../models/User';
import DoctorProfile from '../models/DoctorProfile';
import PatientProfile from '../models/PatientProfile';
import { signToken } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';
import {
  validateName,
  validateEmail,
  validatePassword,
  validateRole,
  validateRequiredString,
  validatePositiveNumber,
  collectErrors,
} from '../utils/validation';

// ─── Constants ────────────────────────────────────────────────────────────────

const BCRYPT_ROUNDS = 12;

// ─── POST /api/auth/signup ────────────────────────────────────────────────────

export async function signup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, email, password, role } = req.body as Record<string, unknown>;

    // ── 1. Base validation ─────────────────────────────────────────────────────
    const baseErrors = collectErrors([
      validateName(name),
      validateEmail(email),
      validatePassword(password),
      validateRole(role),
    ]);

    if (baseErrors) {
      res.status(400).json({ success: false, message: 'Validation failed', errors: baseErrors });
      return;
    }

    // ── 2. Block super_admin signup ────────────────────────────────────────────
    if (role === 'super_admin') {
      res.status(403).json({
        success: false,
        message: 'Super Admin accounts cannot be created through public signup.',
      });
      return;
    }

    const normalizedEmail = (email as string).trim().toLowerCase();

    // ── 3. Check for duplicate email ───────────────────────────────────────────
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
      return;
    }

    // ── 4. Hash password ───────────────────────────────────────────────────────
    const passwordHash = await bcrypt.hash(password as string, BCRYPT_ROUNDS);

    // ── 5. Create user + profile in a single logical transaction ───────────────
    if (role === 'patient') {
      await _createPatient({ name, email: normalizedEmail, passwordHash, body: req.body, res });
    } else {
      // role === 'doctor'
      await _createDoctor({ name, email: normalizedEmail, passwordHash, body: req.body, res });
    }
  } catch (err) {
    next(err);
  }
}

// ─── Patient creation helper ──────────────────────────────────────────────────

async function _createPatient(params: {
  name: unknown;
  email: string;
  passwordHash: string;
  body: Record<string, unknown>;
  res: Response;
}): Promise<void> {
  const { name, email, passwordHash, body, res } = params;
  const { dateOfBirth, gender, phone, medicalHistory, diabetesHistory, eyeHistory } = body;

  // Validate patient-specific required fields
  const profileErrors = collectErrors([
    validateRequiredString(dateOfBirth, 'dateOfBirth', 'Date of birth'),
    validateRequiredString(gender, 'gender', 'Gender'),
    validateRequiredString(phone, 'phone', 'Phone number'),
  ]);

  if (profileErrors) {
    res.status(400).json({ success: false, message: 'Validation failed', errors: profileErrors });
    return;
  }

  // Create user
  const user = await User.create({
    name: (name as string).trim(),
    email,
    passwordHash,
    role: 'patient',
    verificationStatus: 'not_applicable',
    isActive: true,
  });

  // Create patient profile
  await PatientProfile.create({
    userId: user._id,
    dateOfBirth: (dateOfBirth as string).trim(),
    gender: (gender as string).trim(),
    phone: (phone as string).trim(),
    medicalHistory: typeof medicalHistory === 'string' ? medicalHistory.trim() : '',
    diabetesHistory: typeof diabetesHistory === 'string' ? diabetesHistory.trim() : '',
    eyeHistory: typeof eyeHistory === 'string' ? eyeHistory.trim() : '',
  });

  const token = signToken(user._id.toString(), user.role);

  res.status(201).json({
    success: true,
    message: 'Patient account created successfully.',
    data: {
      token,
      user: user.toSafeObject(),
    },
  });
}

// ─── Doctor creation helper ───────────────────────────────────────────────────

async function _createDoctor(params: {
  name: unknown;
  email: string;
  passwordHash: string;
  body: Record<string, unknown>;
  res: Response;
}): Promise<void> {
  const { name, email, passwordHash, body, res } = params;
  const { licenseNumber, medicalCouncil, specialization, hospital, yearsOfExperience } = body;

  // Validate doctor-specific required fields
  const profileErrors = collectErrors([
    validateRequiredString(licenseNumber, 'licenseNumber', 'Medical license number'),
    validateRequiredString(medicalCouncil, 'medicalCouncil', 'Medical council / authority'),
    validateRequiredString(specialization, 'specialization', 'Specialization'),
    validateRequiredString(hospital, 'hospital', 'Hospital / clinic'),
    validatePositiveNumber(yearsOfExperience, 'yearsOfExperience', 'Years of experience'),
  ]);

  if (profileErrors) {
    res.status(400).json({ success: false, message: 'Validation failed', errors: profileErrors });
    return;
  }

  // Create user
  const user = await User.create({
    name: (name as string).trim(),
    email,
    passwordHash,
    role: 'doctor',
    verificationStatus: 'pending', // all new doctors start as pending
    isActive: true,
  });

  // Create doctor profile
  await DoctorProfile.create({
    userId: user._id,
    licenseNumber: (licenseNumber as string).trim(),
    medicalCouncil: (medicalCouncil as string).trim(),
    specialization: (specialization as string).trim(),
    hospital: (hospital as string).trim(),
    yearsOfExperience: Number(yearsOfExperience),
  });

  const token = signToken(user._id.toString(), user.role);

  res.status(201).json({
    success: true,
    message: 'Doctor account created. Your credentials are under review by our admin team.',
    data: {
      token,
      user: user.toSafeObject(),
    },
  });
}

// ─── POST /api/auth/login ─────────────────────────────────────────────────────

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body as Record<string, unknown>;

    // ── 1. Validate inputs ─────────────────────────────────────────────────────
    if (!email || typeof email !== 'string' || email.trim() === '') {
      res.status(400).json({ success: false, message: 'Email is required.' });
      return;
    }
    if (!password || typeof password !== 'string') {
      res.status(400).json({ success: false, message: 'Password is required.' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    // ── 2. Find user (explicitly select passwordHash since select: false) ──────
    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');

    // Generic message — do not reveal whether email exists
    const invalidMsg = 'Invalid email or password.';

    if (!user) {
      res.status(401).json({ success: false, message: invalidMsg });
      return;
    }

    if (!user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
      });
      return;
    }

    // ── 3. Compare password ────────────────────────────────────────────────────
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: invalidMsg });
      return;
    }

    // ── 4. Sign token ──────────────────────────────────────────────────────────
    const token = signToken(user._id.toString(), user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: user.toSafeObject(),
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // req.user is attached by the authenticate middleware
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }

    res.status(200).json({
      success: true,
      message: 'Authenticated user profile.',
      data: {
        user: req.user,
      },
    });
  } catch (err) {
    next(err);
  }
}
