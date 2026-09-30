import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Lock,
  Bell,
  Palette,
  Sun,
  Moon,
  Monitor,
  Shield,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Edit2,
  Save,
  X,
  Eye,
  EyeOff,
  LogOut,
  Activity,
  HeartPulse,
  Stethoscope,
  Users
} from 'lucide-react';
import { ThemePreference, PatientProfile } from '../../types';

interface PatientNotifPrefs {
  reportApprovals: boolean;
  connectionUpdates: boolean;
  screeningReminders: boolean;
  healthTips: boolean;
}

export const PatientSettings: React.FC = () => {
  const { user, token, logout, updateUser } = useAuth();
  const { themePreference, setThemePreference } = useTheme();
  const navigate = useNavigate();

  // Profile data states
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Form fields
  const [patientId, setPatientId] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('other');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [diabetesHistory, setDiabetesHistory] = useState('');
  const [eyeHistory, setEyeHistory] = useState('');

  // Initial backup for cancel
  const [initialData, setInitialData] = useState<{
    name: string;
    phone: string;
    dateOfBirth: string;
    gender: string;
    medicalHistory: string;
    diabetesHistory: string;
    eyeHistory: string;
  } | null>(null);

  // Notification Preferences (localStorage)
  const [notifPrefs, setNotifPrefs] = useState<PatientNotifPrefs>({
    reportApprovals: true,
    connectionUpdates: true,
    screeningReminders: true,
    healthTips: false,
  });

  // Password Change Modal States
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // 1. Fetch Profile & Notifications on mount
  useEffect(() => {
    const fetchPatientProfile = async () => {
      try {
        const res = await fetch('/api/patient/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.success) {
          const u = data.data.user;
          const p: PatientProfile = data.data.profile;

          setPatientId(p.patientId || u.patientId || 'N/A');
          setName(u.name || '');
          setPhone(p.phone || '');
          setDateOfBirth(p.dateOfBirth || '');
          setGender(p.gender || 'other');
          setMedicalHistory(p.medicalHistory || '');
          setDiabetesHistory(p.diabetesHistory || '');
          setEyeHistory(p.eyeHistory || '');

          setInitialData({
            name: u.name || '',
            phone: p.phone || '',
            dateOfBirth: p.dateOfBirth || '',
            gender: p.gender || 'other',
            medicalHistory: p.medicalHistory || '',
            diabetesHistory: p.diabetesHistory || '',
            eyeHistory: p.eyeHistory || '',
          });
        }
      } catch (err) {
        console.error('Failed to load patient profile', err);
        setProfileError('Failed to load personal profile data.');
      } finally {
        setProfileLoading(false);
      }
    };

    fetchPatientProfile();

    try {
      const storedNotifs = localStorage.getItem('retinacare_patient_notif_prefs');
      if (storedNotifs) {
        setNotifPrefs(JSON.parse(storedNotifs));
      }
    } catch {
      // ignore
    }
  }, [token]);

  // Sync Notification updates
  const updateNotifPref = (key: keyof PatientNotifPrefs, val: boolean) => {
    const updated = { ...notifPrefs, [key]: val };
    setNotifPrefs(updated);
    try {
      localStorage.setItem('retinacare_patient_notif_prefs', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Cancel profile edits
  const handleCancelEdit = () => {
    if (initialData) {
      setName(initialData.name);
      setPhone(initialData.phone);
      setDateOfBirth(initialData.dateOfBirth);
      setGender(initialData.gender);
      setMedicalHistory(initialData.medicalHistory);
      setDiabetesHistory(initialData.diabetesHistory);
      setEyeHistory(initialData.eyeHistory);
    }
    setIsEditingProfile(false);
    setProfileError(null);
  };

  // Save profile edits
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);

    if (!name.trim()) {
      setProfileError('Full name is required.');
      return;
    }

    setProfileSaving(true);

    try {
      const res = await fetch('/api/patient/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          dateOfBirth,
          gender,
          medicalHistory: medicalHistory.trim(),
          diabetesHistory: diabetesHistory.trim(),
          eyeHistory: eyeHistory.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const u = data.data.user;
        const p: PatientProfile = data.data.profile;

        setInitialData({
          name: u.name,
          phone: p.phone || '',
          dateOfBirth: p.dateOfBirth || '',
          gender: p.gender || 'other',
          medicalHistory: p.medicalHistory || '',
          diabetesHistory: p.diabetesHistory || '',
          eyeHistory: p.eyeHistory || '',
        });

        if (user && u.name !== user.name) {
          updateUser({ ...user, name: u.name });
        }

        setIsEditingProfile(false);
        setProfileSuccess('Profile information updated successfully.');
        setTimeout(() => setProfileSuccess(null), 3000);
      } else {
        setProfileError(data.message || 'Failed to update profile details.');
      }
    } catch {
      setProfileError('Network error connecting to server.');
    } finally {
      setProfileSaving(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      setPasswordError('New password must contain at least one uppercase letter.');
      return;
    }

    if (!/[0-9]/.test(newPassword)) {
      setPasswordError('New password must contain at least one number.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }

    if (newPassword === currentPassword) {
      setPasswordError('New password cannot be identical to your current password.');
      return;
    }

    setPasswordLoading(true);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setPasswordSuccess('Your password has been changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          setShowPasswordModal(false);
          setPasswordSuccess(null);
        }, 2000);
      } else {
        setPasswordError(data.message || 'Failed to change password. Please check your credentials.');
      }
    } catch {
      setPasswordError('Network error connecting to authentication server.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-[var(--color-text)]">
          Account Settings
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Manage your personal medical profile, visual appearance, security, and notifications.
        </p>
      </div>

      {profileSuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-sm text-emerald-700 dark:text-emerald-300 flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{profileSuccess}</span>
        </div>
      )}

      {profileError && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl text-sm text-rose-700 dark:text-rose-300 flex items-center gap-2.5 animate-in fade-in">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{profileError}</span>
        </div>
      )}

      {/* 1. PROFILE & MEDICAL INFORMATION */}
      <div className="card p-6 border border-[var(--color-border)] shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
          <h3 className="font-display font-bold text-lg text-[var(--color-text)] flex items-center gap-2">
            <User className="w-5 h-5 text-brand-500" />
            Personal & Medical Profile
          </h3>
          {!isEditingProfile && !profileLoading && (
            <button
              onClick={() => setIsEditingProfile(true)}
              className="btn btn-outline btn-sm inline-flex items-center gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>

        {profileLoading ? (
          <div className="py-8 flex items-center justify-center gap-2 text-sm text-[var(--color-text-muted)]">
            <Loader2 className="w-5 h-5 animate-spin text-brand-500" />
            <span>Loading profile details...</span>
          </div>
        ) : isEditingProfile ? (
          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name</label>
                <input
                  type="text"
                  required
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                />
              </div>

              <div>
                <label className="label">Account Email (Read-only)</label>
                <input
                  type="email"
                  disabled
                  className="input cursor-not-allowed bg-[var(--color-surface-elevated)] opacity-80"
                  value={user?.email || ''}
                />
              </div>

              <div>
                <label className="label">Phone Number</label>
                <input
                  type="tel"
                  className="input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +1 (555) 019-2834"
                />
              </div>

              <div>
                <label className="label">Date of Birth</label>
                <input
                  type="date"
                  className="input"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="label">Gender</label>
                <select
                  className="input"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div className="space-y-4 pt-2 border-t border-[var(--color-border)]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-subtle)]">
                Health & Vision Context
              </h4>

              <div>
                <label className="label">Diabetes History & Status</label>
                <textarea
                  rows={2}
                  className="input resize-none"
                  value={diabetesHistory}
                  onChange={(e) => setDiabetesHistory(e.target.value)}
                  placeholder="e.g. Type 2 diabetes diagnosed 5 years ago. Currently managed with metformin."
                />
              </div>

              <div>
                <label className="label">Eye / Vision Conditions</label>
                <textarea
                  rows={2}
                  className="input resize-none"
                  value={eyeHistory}
                  onChange={(e) => setEyeHistory(e.target.value)}
                  placeholder="e.g. Mild blurry vision in left eye, wears prescription glasses."
                />
              </div>

              <div>
                <label className="label">General Medical Background</label>
                <textarea
                  rows={2}
                  className="input resize-none"
                  value={medicalHistory}
                  onChange={(e) => setMedicalHistory(e.target.value)}
                  placeholder="e.g. Hypertension, regular blood pressure checkups."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={profileSaving}
                className="btn btn-outline btn-sm inline-flex items-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
              <button
                type="submit"
                disabled={profileSaving}
                className="btn btn-primary btn-sm inline-flex items-center gap-1.5"
              >
                {profileSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              <div>
                <span className="text-xs text-[var(--color-text-muted)] block font-medium flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-brand-500" />
                  Patient ID
                </span>
                <span className="font-mono text-sm font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 px-2 py-0.5 rounded border border-brand-200 dark:border-brand-800 inline-block mt-1">
                  {patientId || user?.patientId || 'RC-000000'}
                </span>
              </div>

              <div>
                <span className="text-xs text-[var(--color-text-muted)] block font-medium flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-brand-500" />
                  Full Name
                </span>
                <span className="text-sm font-semibold text-[var(--color-text)] mt-1 block">
                  {name || 'Not provided'}
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
                <span className="text-sm font-semibold text-[var(--color-text)] mt-0.5 block">
                  {phone || 'Not provided'}
                </span>
              </div>

              <div>
                <span className="text-xs text-[var(--color-text-muted)] block font-medium flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-brand-500" />
                  Date of Birth
                </span>
                <span className="text-sm font-semibold text-[var(--color-text)] mt-0.5 block">
                  {dateOfBirth || 'Not provided'}
                </span>
              </div>

              <div>
                <span className="text-xs text-[var(--color-text-muted)] block font-medium flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-brand-500" />
                  Gender
                </span>
                <span className="text-sm font-semibold text-[var(--color-text)] capitalize mt-0.5 block">
                  {gender.replace(/_/g, ' ')}
                </span>
              </div>

              <div>
                <span className="text-xs text-[var(--color-text-muted)] block font-medium flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-500" />
                  Account Status
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 capitalize inline-flex items-center gap-1 mt-0.5">
                  Active Patient
                </span>
              </div>
            </div>

            {/* Health context cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[var(--color-border)]">
              <div className="bg-[var(--color-surface-elevated)] p-3.5 rounded-xl space-y-1">
                <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 flex items-center gap-1.5">
                  <HeartPulse className="w-3.5 h-3.5" />
                  Diabetes History
                </span>
                <p className="text-xs text-[var(--color-text)] leading-relaxed">
                  {diabetesHistory || 'No diabetes history recorded yet.'}
                </p>
              </div>

              <div className="bg-[var(--color-surface-elevated)] p-3.5 rounded-xl space-y-1">
                <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  Eye & Vision History
                </span>
                <p className="text-xs text-[var(--color-text)] leading-relaxed">
                  {eyeHistory || 'No eye condition history recorded yet.'}
                </p>
              </div>

              <div className="bg-[var(--color-surface-elevated)] p-3.5 rounded-xl space-y-1">
                <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5" />
                  General Medical Notes
                </span>
                <p className="text-xs text-[var(--color-text)] leading-relaxed">
                  {medicalHistory || 'No general medical notes recorded yet.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. APPEARANCE & THEME */}
      <div className="card p-6 border border-[var(--color-border)] shadow-sm space-y-4">
        <h3 className="font-display font-bold text-lg text-[var(--color-text)] flex items-center gap-2 border-b border-[var(--color-border)] pb-3">
          <Palette className="w-5 h-5 text-purple-500" />
          Appearance & Theme
        </h3>
        <p className="text-xs text-[var(--color-text-muted)]">
          Select your visual theme preference for the patient portal.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {/* Dark Mode */}
          <button
            type="button"
            onClick={() => setThemePreference('dark')}
            className={`flex flex-col items-center gap-3 p-4 rounded-xl border text-center transition-all ${
              themePreference === 'dark'
                ? 'border-brand-500 bg-brand-50/20 dark:bg-brand-950/40 ring-2 ring-brand-500/20 text-brand-600 dark:text-brand-300 font-semibold'
                : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)]'
            }`}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-900 text-slate-100 border border-slate-700">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-medium">Dark Theme</div>
              <div className="text-[11px] text-[var(--color-text-subtle)] mt-0.5">High contrast dark mode</div>
            </div>
            {themePreference === 'dark' && (
              <span className="text-[10px] font-semibold text-brand-600 dark:text-brand-400 bg-brand-100 dark:bg-brand-950/60 px-2 py-0.5 rounded-full">
                Active
              </span>
            )}
          </button>

          {/* Light Mode */}
          <button
            type="button"
            onClick={() => setThemePreference('light')}
            className={`flex flex-col items-center gap-3 p-4 rounded-xl border text-center transition-all ${
              themePreference === 'light'
                ? 'border-brand-500 bg-brand-50/20 dark:bg-brand-950/40 ring-2 ring-brand-500/20 text-brand-600 dark:text-brand-300 font-semibold'
                : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)]'
            }`}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-amber-50 text-amber-600 border border-amber-200">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-medium">Light Theme</div>
              <div className="text-[11px] text-[var(--color-text-subtle)] mt-0.5">Bright clean interface</div>
            </div>
            {themePreference === 'light' && (
              <span className="text-[10px] font-semibold text-brand-600 dark:text-brand-400 bg-brand-100 dark:bg-brand-950/60 px-2 py-0.5 rounded-full">
                Active
              </span>
            )}
          </button>

          {/* System Default */}
          <button
            type="button"
            onClick={() => setThemePreference('system' as ThemePreference)}
            className={`flex flex-col items-center gap-3 p-4 rounded-xl border text-center transition-all ${
              themePreference === 'system'
                ? 'border-brand-500 bg-brand-50/20 dark:bg-brand-950/40 ring-2 ring-brand-500/20 text-brand-600 dark:text-brand-300 font-semibold'
                : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)]'
            }`}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-medium">System Preference</div>
              <div className="text-[11px] text-[var(--color-text-subtle)] mt-0.5">Match device settings</div>
            </div>
            {themePreference === 'system' && (
              <span className="text-[10px] font-semibold text-brand-600 dark:text-brand-400 bg-brand-100 dark:bg-brand-950/60 px-2 py-0.5 rounded-full">
                Active
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 3. SECURITY & PASSWORD */}
      <div className="card p-6 border border-[var(--color-border)] shadow-sm space-y-4">
        <h3 className="font-display font-bold text-lg text-[var(--color-text)] flex items-center gap-2 border-b border-[var(--color-border)] pb-3">
          <Lock className="w-5 h-5 text-brand-500" />
          Security & Password
        </h3>
        <p className="text-xs text-[var(--color-text-muted)]">
          Manage your account credentials to keep your retinal health records protected.
        </p>
        <div className="pt-1">
          <button
            onClick={() => {
              setPasswordError(null);
              setPasswordSuccess(null);
              setShowPasswordModal(true);
            }}
            className="btn btn-primary btn-sm inline-flex items-center gap-1.5"
          >
            <Shield className="w-4 h-4" />
            <span>Change Password</span>
          </button>
        </div>
      </div>

      {/* 4. NOTIFICATION PREFERENCES */}
      <div className="card p-6 border border-[var(--color-border)] shadow-sm space-y-4">
        <h3 className="font-display font-bold text-lg text-[var(--color-text)] flex items-center gap-2 border-b border-[var(--color-border)] pb-3">
          <Bell className="w-5 h-5 text-amber-500" />
          Notification Preferences
        </h3>
        <div className="space-y-4 pt-1">
          {/* Toggle 1 */}
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <h4 className="text-sm font-semibold text-[var(--color-text)]">Doctor Report Approvals</h4>
              <p className="text-xs text-[var(--color-text-muted)]">Notify me when my assigned doctor reviews and approves my retinal report.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={notifPrefs.reportApprovals}
                onChange={(e) => updateNotifPref('reportApprovals', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-600 dark:peer-checked:bg-brand-500"></div>
            </label>
          </div>

          {/* Toggle 2 */}
          <div className="flex items-center justify-between gap-4 border-t border-[var(--color-border)] pt-4">
            <div className="space-y-0.5">
              <h4 className="text-sm font-semibold text-[var(--color-text)]">Doctor Connection Updates</h4>
              <p className="text-xs text-[var(--color-text-muted)]">Notify me when my requested doctor responds to connection requests.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={notifPrefs.connectionUpdates}
                onChange={(e) => updateNotifPref('connectionUpdates', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-600 dark:peer-checked:bg-brand-500"></div>
            </label>
          </div>

          {/* Toggle 3 */}
          <div className="flex items-center justify-between gap-4 border-t border-[var(--color-border)] pt-4">
            <div className="space-y-0.5">
              <h4 className="text-sm font-semibold text-[var(--color-text)]">Screening Reminders</h4>
              <p className="text-xs text-[var(--color-text-muted)]">Remind me when periodic annual or bi-annual retinal screenings are recommended.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={notifPrefs.screeningReminders}
                onChange={(e) => updateNotifPref('screeningReminders', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-600 dark:peer-checked:bg-brand-500"></div>
            </label>
          </div>

          {/* Toggle 4 */}
          <div className="flex items-center justify-between gap-4 border-t border-[var(--color-border)] pt-4">
            <div className="space-y-0.5">
              <h4 className="text-sm font-semibold text-[var(--color-text)]">System & Health Announcements</h4>
              <p className="text-xs text-[var(--color-text-muted)]">Receive helpful guidance on managing diabetic eye health and platform updates.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={notifPrefs.healthTips}
                onChange={(e) => updateNotifPref('healthTips', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-600 dark:peer-checked:bg-brand-500"></div>
            </label>
          </div>
        </div>
      </div>

      {/* 5. ACCOUNT ACTIONS & SESSION */}
      <div className="card p-6 border border-rose-200 dark:border-rose-900/30 bg-rose-50/10 space-y-4">
        <h3 className="font-display font-bold text-lg text-rose-600 dark:text-rose-400 flex items-center gap-2 border-b border-rose-200 dark:border-rose-900/30 pb-3">
          <LogOut className="w-5 h-5" />
          Account Session & Actions
        </h3>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-[var(--color-text)]">Sign Out of Patient Portal</h4>
            <p className="text-xs text-[var(--color-text-muted)]">
              Terminate your active session safely on this computer.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="btn bg-rose-600 hover:bg-rose-700 text-white btn-sm inline-flex items-center gap-1.5 self-start sm:self-auto"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        <div className="pt-3 border-t border-rose-200 dark:border-rose-900/20 text-xs text-[var(--color-text-muted)] flex flex-wrap items-center justify-between gap-2">
          <span>Need to find or change your ophthalmologist?</span>
          <Link
            to="/patient/my-doctor"
            className="text-brand-600 dark:text-brand-400 font-semibold underline hover:text-brand-700 inline-flex items-center gap-1"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Manage My Doctor</span>
          </Link>
        </div>
      </div>

      {/* PASSWORD CHANGE MODAL */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-xl max-w-md w-full relative">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
              <h3 className="font-display font-bold text-base text-[var(--color-text)] flex items-center gap-2">
                <Lock className="w-4 h-4 text-brand-500" />
                Change Account Password
              </h3>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordError(null);
                  setPasswordSuccess(null);
                }}
                className="p-1 rounded-md text-[var(--color-text-subtle)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-elevated)] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePasswordChange}>
              <div className="p-6 space-y-4">
                {passwordError && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-lg text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{passwordError}</span>
                  </div>
                )}

                {passwordSuccess && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-lg text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{passwordSuccess}</span>
                  </div>
                )}

                <div>
                  <label className="label">Current Password</label>
                  <div className="relative">
                    <input
                      required
                      type={showCurrentPassword ? 'text' : 'password'}
                      className="input pr-10"
                      placeholder="Enter your current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-subtle)] hover:text-[var(--color-text)]"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="label">New Password</label>
                  <div className="relative">
                    <input
                      required
                      type={showNewPassword ? 'text' : 'password'}
                      className="input pr-10"
                      placeholder="At least 8 chars, 1 uppercase, 1 number"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-subtle)] hover:text-[var(--color-text)]"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="label">Confirm New Password</label>
                  <div className="relative">
                    <input
                      required
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="input pr-10"
                      placeholder="Re-enter your new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-subtle)] hover:text-[var(--color-text)]"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--color-border)] bg-[var(--color-surface-elevated)] rounded-b-xl">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="btn btn-outline btn-sm"
                  disabled={passwordLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="btn btn-primary btn-sm inline-flex items-center gap-1.5"
                >
                  {passwordLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <span>Save Password</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
