import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Palette,
  Sun,
  Moon,
  Monitor,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Eye,
  EyeOff,
  LogOut,
  Server,
  Activity
} from 'lucide-react';
import { ThemePreference } from '../../types';

export const AdminSettings: React.FC = () => {
  const { user, token, logout } = useAuth();
  const { themePreference, setThemePreference } = useTheme();
  const navigate = useNavigate();

  // Password modal states
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
        setPasswordSuccess('Admin password changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          setShowPasswordModal(false);
          setPasswordSuccess(null);
        }, 2000);
      } else {
        setPasswordError(data.message || 'Failed to change password.');
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
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-[var(--color-text)]">
          System & Admin Settings
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Global platform settings, admin security credentials, and visual appearance preferences.
        </p>
      </div>

      {/* 1. ADMIN ACCOUNT */}
      <div className="card p-6 border border-[var(--color-border)] shadow-sm space-y-4">
        <h3 className="font-display font-bold text-lg text-[var(--color-text)] flex items-center gap-2 border-b border-[var(--color-border)] pb-3">
          <ShieldCheck className="w-5 h-5 text-brand-500" />
          Super Admin Credentials & Security
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-1">
          <div>
            <span className="text-xs text-[var(--color-text-muted)] block font-medium">Admin Email</span>
            <span className="text-sm font-semibold text-[var(--color-text)]">{user?.email}</span>
          </div>
          <div>
            <span className="text-xs text-[var(--color-text-muted)] block font-medium">Access Privileges</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 capitalize inline-flex items-center gap-1 mt-1">
              Super Administrator
            </span>
          </div>
        </div>
        <div className="pt-2">
          <button
            onClick={() => {
              setPasswordError(null);
              setPasswordSuccess(null);
              setShowPasswordModal(true);
            }}
            className="btn btn-primary btn-sm inline-flex items-center gap-1.5"
          >
            <Lock className="w-4 h-4" />
            <span>Change Admin Password</span>
          </button>
        </div>
      </div>

      {/* 2. APPEARANCE */}
      <div className="card p-6 border border-[var(--color-border)] shadow-sm space-y-4">
        <h3 className="font-display font-bold text-lg text-[var(--color-text)] flex items-center gap-2 border-b border-[var(--color-border)] pb-3">
          <Palette className="w-5 h-5 text-purple-500" />
          Appearance & Theme
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
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
              <div className="text-sm font-medium">Dark Mode</div>
              <div className="text-[11px] text-[var(--color-text-subtle)] mt-0.5">High contrast dark view</div>
            </div>
          </button>

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
              <div className="text-sm font-medium">Light Mode</div>
              <div className="text-[11px] text-[var(--color-text-subtle)] mt-0.5">Bright clean interface</div>
            </div>
          </button>

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
              <div className="text-sm font-medium">System Default</div>
              <div className="text-[11px] text-[var(--color-text-subtle)] mt-0.5">Match operating system</div>
            </div>
          </button>
        </div>
      </div>

      {/* 3. PLATFORM SPECIFICATIONS */}
      <div className="card p-6 border border-[var(--color-border)] shadow-sm space-y-4">
        <h3 className="font-display font-bold text-lg text-[var(--color-text)] flex items-center gap-2 border-b border-[var(--color-border)] pb-3">
          <Server className="w-5 h-5 text-cyan-500" />
          Environment & Engine Status
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[var(--color-text)]">
          <div className="bg-[var(--color-surface-elevated)] p-3 rounded-lg flex justify-between items-center">
            <span className="text-[var(--color-text-muted)]">AI Classifier:</span>
            <span className="font-semibold font-mono">EfficientNet-B4 (PyTorch)</span>
          </div>
          <div className="bg-[var(--color-surface-elevated)] p-3 rounded-lg flex justify-between items-center">
            <span className="text-[var(--color-text-muted)]">Database Engine:</span>
            <span className="font-semibold font-mono">MongoDB (Mongoose)</span>
          </div>
          <div className="bg-[var(--color-surface-elevated)] p-3 rounded-lg flex justify-between items-center">
            <span className="text-[var(--color-text-muted)]">Auth Architecture:</span>
            <span className="font-semibold font-mono">JWT / HMAC-SHA256</span>
          </div>
          <div className="bg-[var(--color-surface-elevated)] p-3 rounded-lg flex justify-between items-center">
            <span className="text-[var(--color-text-muted)]">Platform Engine:</span>
            <span className="font-semibold font-mono">Express + React (Vite)</span>
          </div>
        </div>
      </div>

      {/* 4. SIGN OUT */}
      <div className="card p-6 border border-rose-200 dark:border-rose-900/30 bg-rose-50/10 space-y-4">
        <h3 className="font-display font-bold text-lg text-rose-600 dark:text-rose-400 flex items-center gap-2 border-b border-rose-200 dark:border-rose-900/30 pb-3">
          <LogOut className="w-5 h-5" />
          Admin Session
        </h3>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h4 className="text-sm font-semibold text-[var(--color-text)]">Sign Out of Admin Console</h4>
            <p className="text-xs text-[var(--color-text-muted)]">Terminate super admin session on this device.</p>
          </div>
          <button
            onClick={handleLogout}
            className="btn bg-rose-600 hover:bg-rose-700 text-white btn-sm inline-flex items-center gap-1.5 self-start sm:self-auto"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* PASSWORD CHANGE MODAL */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-xl max-w-md w-full relative">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
              <h3 className="font-display font-bold text-base text-[var(--color-text)] flex items-center gap-2">
                <Lock className="w-4 h-4 text-brand-500" />
                Change Admin Password
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
                      placeholder="Enter current admin password"
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
                      placeholder="Min 8 chars, 1 uppercase, 1 number"
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
                      placeholder="Re-enter new password"
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
