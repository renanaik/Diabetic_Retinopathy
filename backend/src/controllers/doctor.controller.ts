import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import DoctorProfile from '../models/DoctorProfile';
import { AppError } from '../middleware/errorHandler';
import {
  validateName,
  validatePositiveNumber,
  collectErrors,
} from '../utils/validation';

/**
 * GET /api/doctor/profile
 * Returns the logged-in doctor's user details and professional profile.
 */
export async function getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User account not found.' });
      return;
    }

    let profile = await DoctorProfile.findOne({ userId });
    if (!profile) {
      // Create a default lean profile if none exists for this doctor user
      profile = await DoctorProfile.create({
        userId,
        licenseNumber: 'Not provided',
        medicalCouncil: 'Not provided',
        specialization: 'Ophthalmology',
        hospital: 'Not provided',
        yearsOfExperience: 0,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Doctor profile retrieved successfully.',
      data: {
        user: user.toSafeObject(),
        profile: {
          licenseNumber: profile.licenseNumber,
          medicalCouncil: profile.medicalCouncil,
          specialization: profile.specialization,
          hospital: profile.hospital,
          yearsOfExperience: profile.yearsOfExperience,
          phone: profile.phone || '',
          qualification: profile.qualification || '',
          subSpecialization: profile.subSpecialization || '',
          address: profile.address || '',
          city: profile.city || '',
          state: profile.state || '',
          country: profile.country || '',
          consultationHours: profile.consultationHours || '',
          website: profile.website || '',
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/doctor/profile
 * Updates allowed profile fields for the logged-in doctor.
 */
export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const {
      name,
      phone,
      specialization,
      qualification,
      yearsOfExperience,
      hospital,
      subSpecialization,
      address,
      city,
      state,
      country,
      consultationHours,
      website,
      licenseNumber,
      medicalCouncil,
    } = req.body as Record<string, unknown>;

    // 1. Validation
    const validationChecks = [];
    if (name !== undefined) {
      validationChecks.push(validateName(name));
    }
    if (yearsOfExperience !== undefined) {
      validationChecks.push(validatePositiveNumber(yearsOfExperience, 'yearsOfExperience', 'Years of experience'));
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

    // 2. Fetch User and DoctorProfile
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User account not found.' });
      return;
    }

    let profile = await DoctorProfile.findOne({ userId });
    if (!profile) {
      res.status(404).json({ success: false, message: 'Doctor profile not found.' });
      return;
    }

    // 3. Update fields
    if (name !== undefined) {
      user.name = String(name).trim();
      await user.save();
    }

    if (specialization !== undefined) profile.specialization = String(specialization).trim();
    if (qualification !== undefined) profile.qualification = String(qualification).trim();
    if (yearsOfExperience !== undefined) profile.yearsOfExperience = Number(yearsOfExperience);
    if (hospital !== undefined) profile.hospital = String(hospital).trim();
    if (subSpecialization !== undefined) profile.subSpecialization = String(subSpecialization).trim();
    if (phone !== undefined) profile.phone = String(phone).trim();
    if (address !== undefined) profile.address = String(address).trim();
    if (city !== undefined) profile.city = String(city).trim();
    if (state !== undefined) profile.state = String(state).trim();
    if (country !== undefined) profile.country = String(country).trim();
    if (consultationHours !== undefined) profile.consultationHours = String(consultationHours).trim();
    if (website !== undefined) profile.website = String(website).trim();
    if (licenseNumber !== undefined) profile.licenseNumber = String(licenseNumber).trim();
    if (medicalCouncil !== undefined) profile.medicalCouncil = String(medicalCouncil).trim();

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: {
        user: user.toSafeObject(),
        profile: {
          licenseNumber: profile.licenseNumber,
          medicalCouncil: profile.medicalCouncil,
          specialization: profile.specialization,
          hospital: profile.hospital,
          yearsOfExperience: profile.yearsOfExperience,
          phone: profile.phone || '',
          qualification: profile.qualification || '',
          subSpecialization: profile.subSpecialization || '',
          address: profile.address || '',
          city: profile.city || '',
          state: profile.state || '',
          country: profile.country || '',
          consultationHours: profile.consultationHours || '',
          website: profile.website || '',
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}
