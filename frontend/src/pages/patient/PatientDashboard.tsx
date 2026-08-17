import React, { useState, useEffect } from 'react';
import { FileText, TrendingUp, UserCheck, ArrowRight, ShieldCheck, Stethoscope, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const PatientDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const [reportsCount, setReportsCount] = useState<number>(0);
  const [doctorsCount, setDoctorsCount] = useState<number>(0);
  const [latestStageLabel, setLatestStageLabel] = useState<string>('No Active Screening');
  const [latestDoctorName, setLatestDoctorName] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        // 1. Doctors count
        const docRes = await fetch('/api/connections/my-doctors', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const docData = await docRes.json();
        if (docRes.ok && docData.success) {
          const accepted = (docData.data.connections || []).filter((c: any) => c.status === 'accepted');
          setDoctorsCount(accepted.length);
          if (accepted.length > 0 && accepted[0].doctor) {
            setLatestDoctorName(accepted[0].doctor.name);
          }
        }

        // 2. Reports count & Latest DR status
        const repRes = await fetch('/api/patient/screenings', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const repData = await repRes.json();
        if (repRes.ok && repData.success) {
          const list = repData.data.screenings || [];
          setReportsCount(list.length);
          if (list.length > 0) {
            setLatestStageLabel(list[0].aiResult?.predictedLabel || 'Analyzed');
          }
        }
      } catch {
        // Ignore network errors
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [token]);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-[var(--color-text)]">
          Welcome back, {user?.name || 'Patient'}
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Here is an overview of your retinal screening status, clinical reports, and care team.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Link to="/patient/reports" className="card p-5 hover:border-brand-500/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)]">Verified Reports</p>
              <p className="text-xl font-bold text-[var(--color-text)]">
                {loading ? '—' : reportsCount}
              </p>
            </div>
          </div>
        </Link>

        <Link to="/patient/my-doctor" className="card p-5 hover:border-emerald-500/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)]">Connected Doctors</p>
              <p className="text-xl font-bold text-[var(--color-text)]">
                {loading ? '—' : doctorsCount}
              </p>
            </div>
          </div>
        </Link>

        <Link to="/patient/progress" className="card p-5 hover:border-cyan-500/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)]">Latest DR Status</p>
              <p className="text-sm font-semibold text-[var(--color-text)] truncate max-w-[140px]">
                {loading ? '—' : latestStageLabel}
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
        <div className="card p-6 border border-[var(--color-border)] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-[var(--color-text)] flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              Primary Eye Care Team
            </h3>
            {doctorsCount > 0 ? (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold">
                Connected
              </span>
            ) : (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-semibold">
                Action Recommended
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
            {latestDoctorName
              ? `Your assigned primary specialist is Dr. ${latestDoctorName}. You can schedule routine screenings and review historical records.`
              : 'Connect with a certified ophthalmologist to unlock AI retinal examinations and personalized clinical evaluations.'}
          </p>
          <div className="flex items-center gap-2.5">
            <Link
              to={doctorsCount > 0 ? '/patient/my-doctor' : '/patient/doctors'}
              className="btn btn-secondary btn-sm inline-flex items-center gap-1.5"
            >
              <span>{doctorsCount > 0 ? 'My Doctor Profile' : 'Find Ophthalmologists'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="card p-6 border border-[var(--color-border)] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-[var(--color-text)] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Clinical Screening Archive
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 font-semibold">
              {reportsCount} Released
            </span>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
            Access verified diagnostic summaries, deep learning model probability distribution charts, doctor diagnostic annotations, and printable reports.
          </p>
          <div className="flex items-center gap-2.5">
            <Link
              to="/patient/reports"
              className="btn btn-secondary btn-sm inline-flex items-center gap-1.5"
            >
              <span>View Screening Reports</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

