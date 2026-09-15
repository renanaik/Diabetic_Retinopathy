import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  Lock,
  Bell,
  Building2,
  Eye,
  Clock,
  Globe,
  EyeOff,
  AlertCircle,
  X
} from 'lucide-react';

interface NotificationPrefs {
  newRequests: boolean;
  assignmentUpdates: boolean;
  newScreening: boolean;
  reviewRequired: boolean;
  approvedReports: boolean;
  systemNotifications: boolean;
}

interface ScreeningPrefs {
  notifyScreeningComplete: boolean;
  notifyReviewRequired: boolean;
  requireReviewBeforeReport: boolean;
}

interface PrivacyPrefs {
  profileVisibility: boolean;
  showClinicToPatients: boolean;
  showContactToPatients: boolean;
}

export const DoctorSettings: React.FC = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  // Local storage state
  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>({
    newRequests: true,
    assignmentUpdates: true,
    newScreening: true,
    reviewRequired: true,
    approvedReports: false,
    systemNotifications: true,
  });

  const [screeningPrefs, setScreeningPrefs] = useState<ScreeningPrefs>({
    notifyScreeningComplete: true,
    notifyReviewRequired: true,
    requireReviewBeforeReport: true,
  });

  const [privacyPrefs, setPrivacyPrefs] = useState<PrivacyPrefs>({
    profileVisibility: true,
    showClinicToPatients: true,
    showContactToPatients: false,
  });

  // Practice preferences
  const [contactPref, setContactPref] = useState('email');
  const [timezone, setTimezone] = useState('GMT+5:30');

  // Read-only profile fields
  const [doctorProfile, setDoctorProfile] = useState<{ hospital?: string; consultationHours?: string } | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Load from localStorage & Profile API on mount
  useEffect(() => {
    // 1. Fetch Doctor Profile info for read-only fields
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/doctor/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setDoctorProfile({
            hospital: data.data.profile.hospital,
            consultationHours: data.data.profile.consultationHours,
          });
        }
      } catch (err) {
        console.error('Failed to load profile details in settings', err);
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();

    // 2. Load Notification Preferences
    try {
      const stored = localStorage.getItem('retinacare_notification_prefs');
      if (stored) setNotifPrefs(JSON.parse(stored));
    } catch (e) {
      console.error(e);
    }

    // 3. Load Screening Preferences
    try {
      const stored = localStorage.getItem('retinacare_screening_prefs');
      if (stored) setScreeningPrefs(JSON.parse(stored));
    } catch (e) {
      console.error(e);
    }

    // 4. Load Privacy Preferences
    try {
      const stored = localStorage.getItem('retinacare_privacy_prefs');
      if (stored) setPrivacyPrefs(JSON.parse(stored));
    } catch (e) {
      console.error(e);
    }

    // 5. Load Contact & Timezone Preferences
    try {
      const storedContact = localStorage.getItem('retinacare_contact_pref');
      if (storedContact) setContactPref(storedContact);
      const storedTimezone = localStorage.getItem('retinacare_timezone_pref');
      if (storedTimezone) setTimezone(storedTimezone);
    } catch (e) {
      console.error(e);
    }
  }, [token]);

  // Sync toggles to localStorage
  const updateNotifPref = (key: keyof NotificationPrefs, val: boolean) => {
    const updated = { ...notifPrefs, [key]: val };
    setNotifPrefs(updated);
    try {
      localStorage.setItem('retinacare_notification_prefs', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const updateScreeningPref = (key: keyof ScreeningPrefs, val: boolean) => {
    const updated = { ...screeningPrefs, [key]: val };
    setScreeningPrefs(updated);
    try {
      localStorage.setItem('retinacare_screening_prefs', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const updatePrivacyPref = (key: keyof PrivacyPrefs, val: boolean) => {
    const updated = { ...privacyPrefs, [key]: val };
    setPrivacyPrefs(updated);
    try {
      localStorage.setItem('retinacare_privacy_prefs', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleContactPrefChange = (val: string) => {
    setContactPref(val);
    try {
      localStorage.setItem('retinacare_contact_pref', val);
    } catch (e) {
      console.error(e);
    }
  };

  const handleTimezoneChange = (val: string) => {
    setTimezone(val);
    try {
      localStorage.setItem('retinacare_timezone_pref', val);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-[var(--color-text)]">
          Doctor Settings
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Configure security, notifications, and clinical workspace preferences.
        </p>
      </div>

      {/* 1. ACCOUNT & SECURITY */}
      <div className="card p-6 border border-[var(--color-border)] shadow-sm space-y-4">
        <h3 className="font-display font-bold text-lg text-[var(--color-text)] flex items-center gap-2 border-b border-[var(--color-border)] pb-3">
          <Lock className="w-5 h-5 text-brand-500" />
          Account & Security
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-1">
          <div>
            <span className="text-xs text-[var(--color-text-muted)] block font-medium">Account Email</span>
            <span className="text-sm font-semibold text-[var(--color-text)]">{user?.email}</span>
          </div>
          <div>
            <span className="text-xs text-[var(--color-text-muted)] block font-medium">Account Status</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 capitalize inline-flex items-center gap-1 mt-0.5">
              Active Account
            </span>
          </div>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setShowPasswordModal(true)}
            className="btn btn-outline btn-sm inline-flex items-center gap-1.5"
          >
            <span>Change Password</span>
          </button>
        </div>
      </div>

      {/* 2. NOTIFICATION PREFERENCES */}
      <div className="card p-6 border border-[var(--color-border)] shadow-sm space-y-4">
        <h3 className="font-display font-bold text-lg text-[var(--color-text)] flex items-center gap-2 border-b border-[var(--color-border)] pb-3">
          <Bell className="w-5 h-5 text-amber-500" />
          Notification Preferences
        </h3>
        <div className="space-y-4 pt-1">
          {/* Item 1 */}
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <h4 className="text-sm font-semibold text-[var(--color-text)]">New Patient Requests</h4>
              <p className="text-xs text-[var(--color-text-muted)]">Notify me when a patient requests to connect with my clinic.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={notifPrefs.newRequests}
                onChange={e => updateNotifPref('newRequests', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-600 dark:peer-checked:bg-brand-500"></div>
            </label>
          </div>

          {/* Item 2 */}
          <div className="flex items-center justify-between gap-4 border-t border-[var(--color-border)] pt-4">
            <div className="space-y-0.5">
              <h4 className="text-sm font-semibold text-[var(--color-text)]">Patient Assignment Updates</h4>
              <p className="text-xs text-[var(--color-text-muted)]">Notify me when a patient is assigned or transferred.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={notifPrefs.assignmentUpdates}
                onChange={e => updateNotifPref('assignmentUpdates', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-600 dark:peer-checked:bg-brand-500"></div>
            </label>
          </div>

          {/* Item 3 */}
          <div className="flex items-center justify-between gap-4 border-t border-[var(--color-border)] pt-4">
            <div className="space-y-0.5">
              <h4 className="text-sm font-semibold text-[var(--color-text)]">New Screening Submitted</h4>
              <p className="text-xs text-[var(--color-text-muted)]">Notify me when a patient screening is ready for my review.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={notifPrefs.newScreening}
                onChange={e => updateNotifPref('newScreening', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-600 dark:peer-checked:bg-brand-500"></div>
            </label>
          </div>

          {/* Item 4 */}
          <div className="flex items-center justify-between gap-4 border-t border-[var(--color-border)] pt-4">
            <div className="space-y-0.5">
              <h4 className="text-sm font-semibold text-[var(--color-text)]">Screening Requires Review</h4>
              <p className="text-xs text-[var(--color-text-muted)]">Alert me when a screening remains in the pending review queue.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={notifPrefs.reviewRequired}
                onChange={e => updateNotifPref('reviewRequired', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-600 dark:peer-checked:bg-brand-500"></div>
            </label>
          </div>

          {/* Item 5 */}
          <div className="flex items-center justify-between gap-4 border-t border-[var(--color-border)] pt-4">
            <div className="space-y-0.5">
              <h4 className="text-sm font-semibold text-[var(--color-text)]">Approved Report Notifications</h4>
              <p className="text-xs text-[var(--color-text-muted)]">Send a copy of reports when they are approved and finalized.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={notifPrefs.approvedReports}
                onChange={e => updateNotifPref('approvedReports', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-600 dark:peer-checked:bg-brand-500"></div>
            </label>
          </div>

          {/* Item 6 */}
          <div className="flex items-center justify-between gap-4 border-t border-[var(--color-border)] pt-4">
            <div className="space-y-0.5">
              <h4 className="text-sm font-semibold text-[var(--color-text)]">System Notifications</h4>
              <p className="text-xs text-[var(--color-text-muted)]">Receive announcements regarding application and AI model updates.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={notifPrefs.systemNotifications}
                onChange={e => updateNotifPref('systemNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-600 dark:peer-checked:bg-brand-500"></div>
            </label>
          </div>
        </div>
      </div>

      {/* 3. PRACTICE PREFERENCES */}
      <div className="card p-6 border border-[var(--color-border)] shadow-sm space-y-4">
        <h3 className="font-display font-bold text-lg text-[var(--color-text)] flex items-center gap-2 border-b border-[var(--color-border)] pb-3">
          <Building2 className="w-5 h-5 text-cyan-500" />
          Practice Preferences
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
          <div>
            <span className="text-xs text-[var(--color-text-muted)] block font-medium">Clinic / Hospital</span>
            {profileLoading ? (
              <span className="text-sm text-[var(--color-text-subtle)]">Loading...</span>
            ) : (
              <span className="text-sm font-semibold text-[var(--color-text)]">{doctorProfile?.hospital || 'Not provided'}</span>
            )}
          </div>

          <div>
            <span className="text-xs text-[var(--color-text-muted)] block font-medium">Consultation Hours</span>
            {profileLoading ? (
              <span className="text-sm text-[var(--color-text-subtle)]">Loading...</span>
            ) : (
              <span className="text-sm font-semibold text-[var(--color-text)]">{doctorProfile?.consultationHours || 'Not provided'}</span>
            )}
          </div>

          <div className="sm:col-span-2 text-xs text-[var(--color-text-muted)] bg-[var(--color-surface-elevated)] p-3 rounded-lg flex items-center justify-between gap-3">
            <span>Primary clinic details and consultation hours are managed directly on your doctor profile.</span>
            <Link to="/doctor/profile" className="text-brand-600 dark:text-brand-400 font-semibold underline hover:text-brand-700">
              Edit in Profile
            </Link>
          </div>

          <div className="border-t border-[var(--color-border)] pt-4 sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="label">Preferred Contact Method</label>
              <select
                className="input"
                value={contactPref}
                onChange={e => handleContactPrefChange(e.target.value)}
              >
                <option value="email">Email Address</option>
                <option value="phone">Phone Number</option>
                <option value="clinic">Clinic Address</option>
              </select>
            </div>

            <div>
              <label className="label">Time Zone</label>
              <select
                className="input font-mono"
                value={timezone}
                onChange={e => handleTimezoneChange(e.target.value)}
              >
                <option value="GMT-8:00">PST (GMT-8:00)</option>
                <option value="GMT-5:00">EST (GMT-5:00)</option>
                <option value="GMT+0:00">UTC (GMT+0:00)</option>
                <option value="GMT+1:00">CET (GMT+1:00)</option>
                <option value="GMT+5:30">IST (GMT+5:30)</option>
                <option value="GMT+8:00">SGT (GMT+8:00)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 4. SCREENING PREFERENCES */}
      <div className="card p-6 border border-[var(--color-border)] shadow-sm space-y-4">
        <h3 className="font-display font-bold text-lg text-[var(--color-text)] flex items-center gap-2 border-b border-[var(--color-border)] pb-3">
          <Eye className="w-5 h-5 text-indigo-500" />
          Screening Preferences
        </h3>
        <div className="space-y-4 pt-1">
          {/* Toggle 1 */}
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <h4 className="text-sm font-semibold text-[var(--color-text)]">Notify me when AI screening is complete</h4>
              <p className="text-xs text-[var(--color-text-muted)]">Receive system alert instantly after fundus classification resolves.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={screeningPrefs.notifyScreeningComplete}
                onChange={e => updateScreeningPref('notifyScreeningComplete', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-600 dark:peer-checked:bg-brand-500"></div>
            </label>
          </div>

          {/* Toggle 2 */}
          <div className="flex items-center justify-between gap-4 border-t border-[var(--color-border)] pt-4">
            <div className="space-y-0.5">
              <h4 className="text-sm font-semibold text-[var(--color-text)]">Notify me when a screening requires review</h4>
              <p className="text-xs text-[var(--color-text-muted)]">Daily notification digest if screenings remain in pending_review status.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={screeningPrefs.notifyReviewRequired}
                onChange={e => updateScreeningPref('notifyReviewRequired', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-600 dark:peer-checked:bg-brand-500"></div>
            </label>
          </div>

          {/* Toggle 3 */}
          <div className="flex items-center justify-between gap-4 border-t border-[var(--color-border)] pt-4">
            <div className="space-y-0.5">
              <h4 className="text-sm font-semibold text-[var(--color-text)]">Require doctor review before patient report visibility</h4>
              <p className="text-xs text-[var(--color-text-muted)]">If enabled, patients will not see AI findings until you sign off and approve the report.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={screeningPrefs.requireReviewBeforeReport}
                onChange={e => updateScreeningPref('requireReviewBeforeReport', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-600 dark:peer-checked:bg-brand-500"></div>
            </label>
          </div>

          <div className="text-[11px] text-[var(--color-text-subtle)] bg-[var(--color-bg)] border border-[var(--color-border)] p-3 rounded-lg leading-relaxed">
            💡 <strong>Model Specifications:</strong> Clinical screening values and classification stages are controlled at system levels using the <strong>EfficientNet-B4</strong> model architecture. Individual custom classification thresholds cannot be altered on this console. Specs are listed on the <Link to="/doctor/ai-model-specs" className="text-brand-600 dark:text-brand-400 font-semibold underline">AI Model Specs</Link> page.
          </div>
        </div>
      </div>



      {/* 6. PRIVACY */}
      <div className="card p-6 border border-[var(--color-border)] shadow-sm space-y-4">
        <h3 className="font-display font-bold text-lg text-[var(--color-text)] flex items-center gap-2 border-b border-[var(--color-border)] pb-3">
          <EyeOff className="w-5 h-5 text-cyan-500" />
          Privacy
        </h3>
        <div className="space-y-4 pt-1">
          {/* Privacy Toggle 1 */}
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <h4 className="text-sm font-semibold text-[var(--color-text)]">Profile Visibility</h4>
              <p className="text-xs text-[var(--color-text-muted)]">Allow connected patients to discover your profile in search listings.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={privacyPrefs.profileVisibility}
                onChange={e => updatePrivacyPref('profileVisibility', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-600 dark:peer-checked:bg-brand-500"></div>
            </label>
          </div>

          {/* Privacy Toggle 2 */}
          <div className="flex items-center justify-between gap-4 border-t border-[var(--color-border)] pt-4">
            <div className="space-y-0.5">
              <h4 className="text-sm font-semibold text-[var(--color-text)]">Show Clinic Information to Connected Patients</h4>
              <p className="text-xs text-[var(--color-text-muted)]">Expose primary hospital, addresses, and hours to patients with accepted connections.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={privacyPrefs.showClinicToPatients}
                onChange={e => updatePrivacyPref('showClinicToPatients', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-600 dark:peer-checked:bg-brand-500"></div>
            </label>
          </div>

          {/* Privacy Toggle 3 */}
          <div className="flex items-center justify-between gap-4 border-t border-[var(--color-border)] pt-4">
            <div className="space-y-0.5">
              <h4 className="text-sm font-semibold text-[var(--color-text)]">Show Contact Information to Connected Patients</h4>
              <p className="text-xs text-[var(--color-text-muted)]">Allow connected patients to view your clinical contact phone and website details.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={privacyPrefs.showContactToPatients}
                onChange={e => updatePrivacyPref('showContactToPatients', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-600 dark:peer-checked:bg-brand-500"></div>
            </label>
          </div>
        </div>
      </div>



      {/* PASSWORD CHANGE MODAL */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-lg max-w-md w-full relative">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
              <h3 className="font-display font-bold text-base text-[var(--color-text)] flex items-center gap-2">
                <Lock className="w-4 h-4 text-brand-500" />
                Change Account Password
              </h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-1 rounded-md text-[var(--color-text-subtle)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-elevated)] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Password modifications are restricted on this environment. Self-service updates are currently disabled.</span>
              </div>

              <div>
                <label className="label">Current Password</label>
                <div className="relative">
                  <input
                    disabled
                    type={showCurrentPassword ? 'text' : 'password'}
                    className="input pr-10 cursor-not-allowed bg-[var(--color-surface-elevated)]"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                  />
                  <button
                    disabled
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-subtle)]"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="label">New Password</label>
                <div className="relative">
                  <input
                    disabled
                    type={showNewPassword ? 'text' : 'password'}
                    className="input pr-10 cursor-not-allowed bg-[var(--color-surface-elevated)]"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                  />
                  <button
                    disabled
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-subtle)]"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="label">Confirm New Password</label>
                <div className="relative">
                  <input
                    disabled
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="input pr-10 cursor-not-allowed bg-[var(--color-surface-elevated)]"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                  />
                  <button
                    disabled
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-subtle)]"
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
              >
                Close
              </button>
              <button
                disabled
                className="px-4 py-2 bg-brand-400 dark:bg-brand-600 text-white/50 rounded-lg text-xs font-semibold cursor-not-allowed"
              >
                Save Password
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
