import React from 'react';
import { LayoutDashboard, Users, PlusCircle, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-[var(--color-text)]">
            Doctor Workspace
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Welcome back, Dr. {user?.name || 'Doctor'}.
          </p>
        </div>
        <Link to="/doctor/new-screening" className="btn btn-primary btn-md inline-flex">
          <PlusCircle className="w-4 h-4" />
          New Screening
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)]">Connected Patients</p>
              <p className="text-xl font-bold text-[var(--color-text)]">0</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)]">Pending Reviews</p>
              <p className="text-xl font-bold text-[var(--color-text)]">0</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)]">Total Screenings Completed</p>
              <p className="text-xl font-bold text-[var(--color-text)]">0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
