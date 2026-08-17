import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, PlusCircle, BarChart3, Inbox, ArrowRight, Activity, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const DoctorDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const [patientCount, setPatientCount] = useState<number>(0);
  const [pendingReviewCount, setPendingReviewCount] = useState<number>(0);
  const [totalScreeningsCount, setTotalScreeningsCount] = useState<number>(0);
  const [pendingRequestsCount, setPendingRequestsCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadDashboardMetrics() {
      try {
        // 1. Patients count
        const patRes = await fetch('/api/connections/my-patients', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const patData = await patRes.json();
        if (patRes.ok && patData.success) {
          setPatientCount(patData.data.count || 0);
        }

        // 2. Screenings & Pending review count
        const scrRes = await fetch('/api/screenings', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const scrData = await scrRes.json();
        if (scrRes.ok && scrData.success) {
          const list = scrData.data.screenings || [];
          setTotalScreeningsCount(list.length);
          setPendingReviewCount(list.filter((s: any) => s.status === 'pending_review').length);
        }

        // 3. Pending requests count
        const reqRes = await fetch('/api/connections/requests', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const reqData = await reqRes.json();
        if (reqRes.ok && reqData.success) {
          setPendingRequestsCount(reqData.data.count || 0);
        }
      } catch {
        // Ignore network errors on dashboard
      } finally {
        setLoading(false);
      }
    }

    loadDashboardMetrics();
  }, [token]);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-[var(--color-text)]">
            Doctor Workspace
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Welcome back, Dr. {user?.name || 'Doctor'}. Here is your clinical screening overview.
          </p>
        </div>
        <Link to="/doctor/new-screening" className="btn btn-primary btn-md inline-flex items-center gap-2">
          <PlusCircle className="w-4 h-4" />
          <span>New Screening</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
        <Link to="/doctor/patients" className="card p-5 hover:border-brand-500/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)]">Connected Patients</p>
              <p className="text-xl font-bold text-[var(--color-text)]">
                {loading ? '—' : patientCount}
              </p>
            </div>
          </div>
        </Link>

        <Link to="/doctor/results" className="card p-5 hover:border-amber-500/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)]">Pending Reviews</p>
              <p className="text-xl font-bold text-[var(--color-text)]">
                {loading ? '—' : pendingReviewCount}
              </p>
            </div>
          </div>
        </Link>

        <Link to="/doctor/results" className="card p-5 hover:border-emerald-500/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)]">Total Screenings</p>
              <p className="text-xl font-bold text-[var(--color-text)]">
                {loading ? '—' : totalScreeningsCount}
              </p>
            </div>
          </div>
        </Link>

        <Link to="/doctor/requests" className="card p-5 hover:border-cyan-500/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)]">New Requests</p>
              <p className="text-xl font-bold text-[var(--color-text)]">
                {loading ? '—' : pendingRequestsCount}
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Action Navigation Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
        <div className="card p-6 border border-[var(--color-border)] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-[var(--color-text)] flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              Screening Review Queue
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-semibold">
              {pendingReviewCount} Awaiting Review
            </span>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
            Review deep learning EfficientNet-B4 predictions, inspect retinal fundus images, record diagnostic annotations, and release official reports to patients.
          </p>
          <Link
            to="/doctor/results"
            className="btn btn-secondary btn-sm inline-flex items-center gap-1.5"
          >
            <span>Open Review Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="card p-6 border border-[var(--color-border)] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-[var(--color-text)] flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-500" />
              Patient Longitudinal Trajectory
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 font-semibold">
              {patientCount} Connected
            </span>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
            Examine multi-visit retinopathy trends across all stages (No DR to Proliferative) to track progression and therapeutic efficacy.
          </p>
          <Link
            to="/doctor/patient-history"
            className="btn btn-secondary btn-sm inline-flex items-center gap-1.5"
          >
            <span>View Patient History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

