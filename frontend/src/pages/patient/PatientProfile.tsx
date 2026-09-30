import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  User,
  Mail,
  Shield,
  Phone,
  Calendar,
  Activity,
  HeartPulse,
  Eye,
  Stethoscope,
  Settings,
  Loader2
} from 'lucide-react';
import { PatientProfile as IPatientProfile } from '../../types';

export const PatientProfile: React.FC = () => {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState<IPatientProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/patient/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setProfile(data.data.profile);
        }
      } catch (err) {
        console.error('Failed to load patient profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--color-text)]">Patient Profile</h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Your official demographic and diabetic eye health records.
          </p>
        </div>
        <Link
          to="/patient/settings"
          className="btn btn-outline btn-sm inline-flex items-center gap-1.5"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Edit in Settings</span>
        </Link>
      </div>

      <div className="card p-6 space-y-6 border border-[var(--color-border)] shadow-sm">
        {loading ? (
          <div className="py-8 flex items-center justify-center gap-2 text-xs text-[var(--color-text-muted)]">
            <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
            <span>Loading profile...</span>
          </div>
        ) : (
          <>
            {/* Top Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              <div>
                <span className="text-xs text-[var(--color-text-muted)] block font-medium flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-brand-500" />
                  Patient ID
                </span>
                <span className="font-mono text-sm font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 px-2 py-0.5 rounded border border-brand-200 dark:border-brand-800 inline-block mt-1">
                  {profile?.patientId || user?.patientId || 'RC-000000'}
                </span>
              </div>

              <div>
                <span className="text-xs text-[var(--color-text-muted)] block font-medium flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-brand-500" />
                  Full Name
                </span>
                <span className="text-sm font-semibold text-[var(--color-text)] mt-1 block">
                  {user?.name}
                </span>
              </div>

              <div>
                <span className="text-xs text-[var(--color-text-muted)] block font-medium flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-brand-500" />
                  Account Email
                </span>
                <span className="text-sm font-semibold text-[var(--color-text)] mt-1 block">
                  {user?.email}
                </span>
              </div>

              <div>
                <span className="text-xs text-[var(--color-text-muted)] block font-medium flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-brand-500" />
                  Phone Number
                </span>
                <span className="text-sm font-semibold text-[var(--color-text)] mt-1 block">
                  {profile?.phone || 'Not provided'}
                </span>
              </div>

              <div>
                <span className="text-xs text-[var(--color-text-muted)] block font-medium flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-brand-500" />
                  Date of Birth
                </span>
                <span className="text-sm font-semibold text-[var(--color-text)] mt-1 block">
                  {profile?.dateOfBirth || 'Not provided'}
                </span>
              </div>

              <div>
                <span className="text-xs text-[var(--color-text-muted)] block font-medium flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-brand-500" />
                  Gender
                </span>
                <span className="text-sm font-semibold text-[var(--color-text)] capitalize mt-1 block">
                  {profile?.gender ? profile.gender.replace(/_/g, ' ') : 'Not provided'}
                </span>
              </div>
            </div>

            {/* Health Context */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[var(--color-border)]">
              <div className="bg-[var(--color-surface-elevated)] p-3.5 rounded-xl space-y-1">
                <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 flex items-center gap-1.5">
                  <HeartPulse className="w-3.5 h-3.5" />
                  Diabetes History
                </span>
                <p className="text-xs text-[var(--color-text)] leading-relaxed">
                  {profile?.diabetesHistory || 'No diabetes notes recorded.'}
                </p>
              </div>

              <div className="bg-[var(--color-surface-elevated)] p-3.5 rounded-xl space-y-1">
                <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  Eye & Vision History
                </span>
                <p className="text-xs text-[var(--color-text)] leading-relaxed">
                  {profile?.eyeHistory || 'No eye condition history recorded.'}
                </p>
              </div>

              <div className="bg-[var(--color-surface-elevated)] p-3.5 rounded-xl space-y-1">
                <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5" />
                  General Medical Notes
                </span>
                <p className="text-xs text-[var(--color-text)] leading-relaxed">
                  {profile?.medicalHistory || 'No general medical notes recorded.'}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
