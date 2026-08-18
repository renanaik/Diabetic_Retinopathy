import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Mail,
  Phone,
  Building2,
  Award,
  Clock,
  Globe,
  Activity,
  Edit2,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  MapPin
} from 'lucide-react';
import { DoctorProfile as IDoctorProfile } from '../../types';

interface ProfileData {
  licenseNumber: string;
  medicalCouncil: string;
  specialization: string;
  hospital: string;
  yearsOfExperience: number;
  phone: string;
  qualification: string;
  subSpecialization: string;
  address: string;
  city: string;
  state: string;
  country: string;
  consultationHours: string;
  website: string;
  createdAt?: string;
  updatedAt?: string;
}

export const DoctorProfile: React.FC = () => {
  const { token, user, updateUser } = useAuth();
  
  // Loading & error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Doctor profile data
  const [profile, setProfile] = useState<ProfileData | null>(null);
  
  // Statistics states
  const [stats, setStats] = useState({
    patients: 0,
    screenings: 0,
    reviewed: 0,
    pending: 0,
    approved: 0,
  });
  
  // Edit state & form data
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<ProfileData & { name: string }>({
    name: '',
    licenseNumber: '',
    medicalCouncil: '',
    specialization: '',
    hospital: '',
    yearsOfExperience: 0,
    phone: '',
    qualification: '',
    subSpecialization: '',
    address: '',
    city: '',
    state: '',
    country: '',
    consultationHours: '',
    website: '',
  });
  
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Fetch profile and statistics
  const fetchProfileAndStats = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch Profile info
      const profileRes = await fetch('/api/doctor/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const profileData = await profileRes.json();
      if (!profileRes.ok || !profileData.success) {
        throw new Error(profileData.message || 'Failed to retrieve doctor profile details.');
      }
      
      const p = profileData.data.profile;
      const u = profileData.data.user;
      
      setProfile(p);
      setEditForm({
        name: u.name || '',
        licenseNumber: p.licenseNumber || '',
        medicalCouncil: p.medicalCouncil || '',
        specialization: p.specialization || '',
        hospital: p.hospital || '',
        yearsOfExperience: p.yearsOfExperience || 0,
        phone: p.phone || '',
        qualification: p.qualification || '',
        subSpecialization: p.subSpecialization || '',
        address: p.address || '',
        city: p.city || '',
        state: p.state || '',
        country: p.country || '',
        consultationHours: p.consultationHours || '',
        website: p.website || '',
      });

      // 2. Fetch statistics (patients count)
      try {
        const patientsRes = await fetch('/api/connections/my-patients', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const patientsData = await patientsRes.json();
        if (patientsRes.ok && patientsData.success) {
          setStats(prev => ({ ...prev, patients: patientsData.data.count || 0 }));
        }
      } catch (e) {
        console.error('Failed to load patient statistics', e);
      }

      // 3. Fetch screenings statistics
      try {
        const screeningsRes = await fetch('/api/screenings', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const screeningsData = await screeningsRes.json();
        if (screeningsRes.ok && screeningsData.success) {
          const list = screeningsData.data.screenings || [];
          const total = list.length;
          const pending = list.filter((s: any) => s.status === 'pending_review').length;
          const approved = list.filter((s: any) => s.status === 'approved').length;
          const reviewed = list.filter((s: any) => s.status !== 'pending_review').length;
          setStats(prev => ({
            ...prev,
            screenings: total,
            pending,
            approved,
            reviewed,
          }));
        }
      } catch (e) {
        console.error('Failed to load screening statistics', e);
      }

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while loading profile data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfileAndStats();
    }
  }, [token]);

  // Handle edit form submit
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch('/api/doctor/profile', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update doctor profile.');
      }

      // Update values locally
      setProfile(data.data.profile);
      
      // Update global context user
      if (user) {
        updateUser({
          ...user,
          name: data.data.user.name,
        });
      }

      setIsEditing(false);
    } catch (err: any) {
      setSaveError(err.message || 'An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  // Helper for generating initials for avatar
  const getInitials = (name?: string) => {
    if (!name) return 'DR';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <Loader2 className="w-10 h-10 animate-spin text-brand-600 dark:text-brand-400" />
        <p className="text-sm text-[var(--color-text-muted)] font-medium">Loading clinical profile details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-8 max-w-xl mx-auto text-center space-y-4 border-red-200 dark:border-red-800">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-[var(--color-text)]">Failed to Load Profile</h2>
        <p className="text-sm text-[var(--color-text-muted)]">{error}</p>
        <button onClick={fetchProfileAndStats} className="btn btn-primary btn-md">
          Retry Loading
        </button>
      </div>
    );
  }

  const verStatus = user?.verificationStatus || 'pending';
  const verBadgeClasses = {
    verified: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    pending: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    rejected: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
    not_applicable: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  }[verStatus];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* HEADER SECTION */}
      <div className="card p-6 md:p-8 relative overflow-hidden border border-[var(--color-border)] shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 dark:bg-brand-400/5 rounded-full blur-3xl pointer-events-none translate-x-20 -translate-y-20"></div>
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5">
            {/* Initials-based Avatar */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-brand-600 to-cyan-500 text-white flex items-center justify-center font-display text-3xl font-bold shadow-md shrink-0 border-4 border-[var(--color-surface)] dark:border-[var(--color-surface-elevated)]">
              {getInitials(user?.name)}
            </div>

            {/* Main identity details */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h1 className="font-display text-2xl md:text-3xl font-bold text-[var(--color-text)]">
                  Dr. {user?.name}
                </h1>
                <div className="flex items-center gap-2 mt-1 sm:mt-0 justify-center">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${verBadgeClasses} capitalize inline-flex items-center gap-1`}>
                    {verStatus === 'verified' && <CheckCircle2 className="w-3 h-3" />}
                    {verStatus === 'pending' && <Clock className="w-3 h-3" />}
                    {verStatus === 'rejected' && <AlertCircle className="w-3 h-3" />}
                    {verStatus}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Active Account
                  </span>
                </div>
              </div>
              <p className="text-base text-brand-600 dark:text-brand-400 font-semibold">
                {profile?.specialization || 'Ophthalmologist'} {profile?.subSpecialization && `• ${profile.subSpecialization}`}
              </p>

              {/* Quick Contacts */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1.5 pt-1.5 text-sm text-[var(--color-text-muted)]">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-[var(--color-text-subtle)] shrink-0" />
                  <span>{user?.email}</span>
                </div>
                {profile?.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-[var(--color-text-subtle)] shrink-0" />
                    <span>{profile.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(true)}
            className="btn btn-outline btn-md inline-flex items-center gap-2 shrink-0 self-center md:self-start mt-2 md:mt-0"
          >
            <Edit2 className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* Row 1: Credentials & Activity */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Professional Credentials Card */}
        <div className="md:col-span-2">
          <div className="card h-full p-6 border border-[var(--color-border)] shadow-sm space-y-4">
            <h3 className="font-display font-bold text-lg text-[var(--color-text)] flex items-center gap-2 border-b border-[var(--color-border)] pb-3">
              <Award className="w-5 h-5 text-brand-500" />
              Professional Credentials
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
              <div>
                <span className="text-xs text-[var(--color-text-muted)] block font-medium">Qualification</span>
                <span className="text-sm font-semibold text-[var(--color-text)]">
                  {profile?.qualification || 'Not provided'}
                </span>
              </div>
              
              <div>
                <span className="text-xs text-[var(--color-text-muted)] block font-medium">Specialization</span>
                <span className="text-sm font-semibold text-[var(--color-text)]">
                  {profile?.specialization || 'Not provided'}
                </span>
              </div>

              <div>
                <span className="text-xs text-[var(--color-text-muted)] block font-medium">Sub-Specialization</span>
                <span className="text-sm font-semibold text-[var(--color-text)]">
                  {profile?.subSpecialization || 'Not provided'}
                </span>
              </div>

              <div>
                <span className="text-xs text-[var(--color-text-muted)] block font-medium">Clinical Experience</span>
                <span className="text-sm font-semibold text-[var(--color-text)]">
                  {profile?.yearsOfExperience !== undefined ? `${profile.yearsOfExperience} Years` : 'Not provided'}
                </span>
              </div>

              <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5 border-t border-[var(--color-border)] pt-4 mt-1">
                <div>
                  <span className="text-xs text-[var(--color-text-muted)] block font-medium">Medical Registration Number</span>
                  <span className="text-sm font-mono font-semibold text-[var(--color-text)] uppercase">
                    {profile?.licenseNumber || 'Not provided'}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-[var(--color-text-muted)] block font-medium">Licensing Authority / Council</span>
                  <span className="text-sm font-semibold text-[var(--color-text)]">
                    {profile?.medicalCouncil || 'Not provided'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RetinaCare Activity Statistics Card */}
        <div className="md:col-span-1">
          <div className="card h-full p-6 border border-[var(--color-border)] shadow-sm space-y-4">
            <h3 className="font-display font-bold text-lg text-[var(--color-text)] flex items-center gap-2 border-b border-[var(--color-border)] pb-3">
              <Activity className="w-5 h-5 text-indigo-500" />
              RetinaCare Activity
            </h3>
            
            <div className="space-y-3.5 pt-1">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--color-bg)] hover:bg-[var(--color-surface-elevated)] transition-colors">
                <span className="text-xs text-[var(--color-text-muted)] font-medium">Connected Patients</span>
                <span className="text-base font-bold text-[var(--color-text)]">{stats.patients}</span>
              </div>
              
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--color-bg)] hover:bg-[var(--color-surface-elevated)] transition-colors">
                <span className="text-xs text-[var(--color-text-muted)] font-medium">Total Screenings</span>
                <span className="text-base font-bold text-[var(--color-text)]">{stats.screenings}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--color-bg)] hover:bg-[var(--color-surface-elevated)] transition-colors">
                <span className="text-xs text-[var(--color-text-muted)] font-medium">Reports Reviewed</span>
                <span className="text-base font-bold text-[var(--color-text)]">{stats.reviewed}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--color-bg)] hover:bg-[var(--color-surface-elevated)] transition-colors">
                <span className="text-xs text-[var(--color-text-muted)] font-medium">Pending Reviews</span>
                <span className="text-base font-bold text-amber-600 dark:text-amber-400">{stats.pending}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--color-bg)] hover:bg-[var(--color-surface-elevated)] transition-colors">
                <span className="text-xs text-[var(--color-text-muted)] font-medium">Approved Reports</span>
                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">{stats.approved}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Row 2: Practice & Clinic Information Card */}
      <div className="card p-6 border border-[var(--color-border)] shadow-sm space-y-4">
        <h3 className="font-display font-bold text-lg text-[var(--color-text)] flex items-center gap-2 border-b border-[var(--color-border)] pb-3">
          <Building2 className="w-5 h-5 text-cyan-500" />
          Practice & Clinic Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
          <div className="sm:col-span-2">
            <span className="text-xs text-[var(--color-text-muted)] block font-medium">Primary Hospital / Clinic Name</span>
            <span className="text-sm font-semibold text-[var(--color-text)]">
              {profile?.hospital || 'Not provided'}
            </span>
          </div>

          <div className="sm:col-span-2">
            <span className="text-xs text-[var(--color-text-muted)] block font-medium">Clinic Address</span>
            <div className="text-sm font-semibold text-[var(--color-text)] flex items-start gap-1.5 mt-0.5">
              <MapPin className="w-4 h-4 text-[var(--color-text-subtle)] shrink-0 mt-0.5" />
              <span>
                {profile?.address ? (
                  <>
                    {profile.address}
                    {(profile.city || profile.state || profile.country) && <br />}
                    {[profile.city, profile.state, profile.country].filter(Boolean).join(', ')}
                  </>
                ) : 'No clinic address available'}
              </span>
            </div>
          </div>

          <div>
            <span className="text-xs text-[var(--color-text-muted)] block font-medium">Consultation Hours</span>
            <div className="text-sm font-semibold text-[var(--color-text)] flex items-center gap-1.5 mt-0.5">
              <Clock className="w-4 h-4 text-[var(--color-text-subtle)] shrink-0" />
              <span>{profile?.consultationHours || 'Not provided'}</span>
            </div>
          </div>

          <div>
            <span className="text-xs text-[var(--color-text-muted)] block font-medium">Professional Website</span>
            <div className="text-sm font-semibold text-[var(--color-text)] flex items-center gap-1.5 mt-0.5">
              <Globe className="w-4 h-4 text-[var(--color-text-subtle)] shrink-0" />
              {profile?.website ? (
                <a
                  href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 underline"
                >
                  {profile.website}
                </a>
              ) : 'Not provided'}
            </div>
          </div>
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-lg max-w-2xl w-full max-h-[90vh] flex flex-col relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
              <h3 className="font-display font-bold text-lg text-[var(--color-text)] flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-brand-500" />
                Update Professional Profile
              </h3>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setSaveError(null);
                }}
                className="p-1 rounded-md text-[var(--color-text-subtle)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-elevated)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
              {saveError && (
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 flex items-center gap-2.5 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{saveError}</span>
                </div>
              )}

              {/* Section 1: Basic Identity */}
              <div className="space-y-4">
                <h4 className="font-display font-bold text-sm text-brand-600 dark:text-brand-400 uppercase tracking-wider border-b border-[var(--color-border)] pb-1">
                  1. Clinical Identity
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Full Name</label>
                    <input
                      type="text"
                      className="input"
                      value={editForm.name}
                      onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Contact Phone</label>
                    <input
                      type="text"
                      className="input"
                      value={editForm.phone}
                      onChange={e => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="label">Medical Registration No.</label>
                    <input
                      type="text"
                      className="input font-mono uppercase"
                      value={editForm.licenseNumber}
                      onChange={e => setEditForm(prev => ({ ...prev, licenseNumber: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Medical Licensing Council</label>
                    <input
                      type="text"
                      className="input"
                      value={editForm.medicalCouncil}
                      onChange={e => setEditForm(prev => ({ ...prev, medicalCouncil: e.target.value }))}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Clinical Credentials */}
              <div className="space-y-4">
                <h4 className="font-display font-bold text-sm text-brand-600 dark:text-brand-400 uppercase tracking-wider border-b border-[var(--color-border)] pb-1">
                  2. Credentials & Credentials
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Professional Qualifications</label>
                    <input
                      type="text"
                      placeholder="e.g. MBBS, MD, MS Ophthalmology"
                      className="input"
                      value={editForm.qualification}
                      onChange={e => setEditForm(prev => ({ ...prev, qualification: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="label">Clinical Specialization</label>
                    <input
                      type="text"
                      className="input"
                      value={editForm.specialization}
                      onChange={e => setEditForm(prev => ({ ...prev, specialization: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Sub-Specialization</label>
                    <input
                      type="text"
                      placeholder="e.g. Retina Specialist, Diabetic Eye Care"
                      className="input"
                      value={editForm.subSpecialization}
                      onChange={e => setEditForm(prev => ({ ...prev, subSpecialization: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="label">Years of Experience</label>
                    <input
                      type="number"
                      className="input"
                      value={editForm.yearsOfExperience}
                      onChange={e => setEditForm(prev => ({ ...prev, yearsOfExperience: Number(e.target.value) }))}
                      min="0"
                      max="70"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Practice Details */}
              <div className="space-y-4">
                <h4 className="font-display font-bold text-sm text-brand-600 dark:text-brand-400 uppercase tracking-wider border-b border-[var(--color-border)] pb-1">
                  3. Practice & Clinic Locations
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="label">Hospital / Clinic Name</label>
                    <input
                      type="text"
                      className="input"
                      value={editForm.hospital}
                      onChange={e => setEditForm(prev => ({ ...prev, hospital: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Clinic Address</label>
                    <input
                      type="text"
                      className="input"
                      value={editForm.address}
                      onChange={e => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="label">City</label>
                    <input
                      type="text"
                      className="input"
                      value={editForm.city}
                      onChange={e => setEditForm(prev => ({ ...prev, city: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="label">State / Province</label>
                    <input
                      type="text"
                      className="input"
                      value={editForm.state}
                      onChange={e => setEditForm(prev => ({ ...prev, state: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="label">Country</label>
                    <input
                      type="text"
                      className="input"
                      value={editForm.country}
                      onChange={e => setEditForm(prev => ({ ...prev, country: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="label">Website</label>
                    <input
                      type="text"
                      placeholder="e.g. clinicwebsite.com"
                      className="input"
                      value={editForm.website}
                      onChange={e => setEditForm(prev => ({ ...prev, website: e.target.value }))}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Consultation Hours</label>
                    <input
                      type="text"
                      placeholder="e.g. Mon-Fri 09:00 AM - 05:00 PM"
                      className="input"
                      value={editForm.consultationHours}
                      onChange={e => setEditForm(prev => ({ ...prev, consultationHours: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--color-border)] sticky bottom-0 bg-[var(--color-surface)] z-10">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setSaveError(null);
                  }}
                  disabled={saving}
                  className="btn btn-outline btn-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary btn-md inline-flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <span>Save Profile</span>
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
