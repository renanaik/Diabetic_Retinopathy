import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, ArrowRight, AlertCircle, User, Stethoscope } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { SignupData, UserRole } from '../types';

export const SignupPage: React.FC = () => {
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Patient specific
  const [dateOfBirth, setDateOfBirth] = useState('1990-01-01');
  const [gender, setGender] = useState('Other');
  const [phone, setPhone] = useState('+1 (555) 000-0000');

  // Doctor specific
  const [licenseNumber, setLicenseNumber] = useState('');
  const [medicalCouncil, setMedicalCouncil] = useState('');
  const [specialization, setSpecialization] = useState('Ophthalmology');
  const [hospital, setHospital] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState(5);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signup } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    let signupPayload: SignupData;
    if (role === 'patient') {
      signupPayload = {
        name,
        email,
        password,
        role: 'patient',
        dateOfBirth,
        gender,
        phone,
      };
    } else {
      signupPayload = {
        name,
        email,
        password,
        role: 'doctor',
        licenseNumber,
        medicalCouncil,
        specialization,
        hospital,
        yearsOfExperience: Number(yearsOfExperience),
      };
    }

    const res = await signup(signupPayload);
    setLoading(false);

    if (res.success) {
      success('Account created successfully!');
      if (role === 'doctor') {
        navigate('/doctor/verification-pending');
      } else {
        navigate('/patient/dashboard');
      }
    } else {
      setError(res.message || 'Signup failed.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="card max-w-lg w-full p-8 shadow-lg border-[var(--color-border)]">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-600 to-cyan-600 flex items-center justify-center mx-auto mb-4 shadow-card">
            <Eye className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-[var(--color-text)]">
            Create an Account
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Choose your account role to get started
          </p>
        </div>

        {/* Role Toggle */}
        <div className="grid grid-cols-2 gap-3 mb-6 p-1 bg-[var(--color-surface-elevated)] rounded-xl border border-[var(--color-border)]">
          <button
            type="button"
            onClick={() => setRole('patient')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              role === 'patient'
                ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-xs font-semibold'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            <User className="w-4 h-4" />
            Patient
          </button>
          <button
            type="button"
            onClick={() => setRole('doctor')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              role === 'doctor'
                ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-xs font-semibold'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            Doctor
          </button>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={role === 'doctor' ? 'Dr. Sarah Connor' : 'Jane Doe'}
              className="input"
            />
          </div>

          <div>
            <label className="label">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="input"
            />
          </div>

          <div>
            <label className="label">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input"
            />
          </div>

          {role === 'patient' ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Date of Birth</label>
                <input
                  type="date"
                  required
                  value={dateOfBirth}
                  onChange={e => setDateOfBirth(e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Gender</label>
                <select
                  value={gender}
                  onChange={e => setGender(e.target.value)}
                  className="input"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Medical License #</label>
                  <input
                    type="text"
                    required
                    value={licenseNumber}
                    onChange={e => setLicenseNumber(e.target.value)}
                    placeholder="MED-12345"
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Medical Council</label>
                  <input
                    type="text"
                    required
                    value={medicalCouncil}
                    onChange={e => setMedicalCouncil(e.target.value)}
                    placeholder="Medical Board"
                    className="input"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Hospital / Clinic</label>
                  <input
                    type="text"
                    required
                    value={hospital}
                    onChange={e => setHospital(e.target.value)}
                    placeholder="City Eye Hospital"
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Years of Experience</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={yearsOfExperience}
                    onChange={e => setYearsOfExperience(Number(e.target.value))}
                    className="input"
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-md w-full justify-center mt-2 shadow-card"
            id="signup-submit-btn"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-[var(--color-text-muted)]">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
};
