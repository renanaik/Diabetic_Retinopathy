export type UserRole = 'patient' | 'doctor' | 'super_admin';

export type DoctorVerificationStatus =
  | 'pending'
  | 'verified'
  | 'rejected'
  | 'not_applicable';

export type ConnectionStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'revoked';

export type ConnectionRequestedBy = 'patient' | 'doctor';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  verificationStatus: DoctorVerificationStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface DoctorProfile {
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
  createdAt?: string;
  updatedAt?: string;
}

export interface DoctorProfileResponse {
  user: AuthUser;
  profile: DoctorProfile;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

export interface PatientSignupData {
  name: string;
  email: string;
  password: string;
  role: 'patient';
  dateOfBirth: string;
  gender: string;
  phone: string;
  medicalHistory?: string;
  diabetesHistory?: string;
  eyeHistory?: string;
}

export interface DoctorSignupData {
  name: string;
  email: string;
  password: string;
  role: 'doctor';
  licenseNumber: string;
  medicalCouncil: string;
  specialization: string;
  hospital: string;
  yearsOfExperience: number;
}

export type SignupData = PatientSignupData | DoctorSignupData;

export interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signup: (data: SignupData) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateUser: (user: AuthUser) => void;
}

export interface DoctorPatientConnection {
  id: string;
  doctorId: string;
  patientId: string;
  status: ConnectionStatus;
  requestedBy: ConnectionRequestedBy;
  createdAt?: string;
  updatedAt?: string;
}

export interface MockScreening {
  id: string;
  patientId: string;
  doctorId?: string;
  date: string;
  stage: number;
  stageName: string;
  confidence: number;
  status: string;
}
