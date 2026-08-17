import React from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { Eye, LayoutDashboard, Users, PlusCircle, BarChart3, History, Cpu, Settings, Inbox, User, LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

const navItems = [
  { to: '/doctor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/doctor/patients', label: 'Patients', icon: Users },
  { to: '/doctor/requests', label: 'Requests', icon: Inbox },
  { to: '/doctor/new-screening', label: 'New Screening', icon: PlusCircle },
  { to: '/doctor/results', label: 'Results & Reviews', icon: BarChart3 },
  { to: '/doctor/patient-history', label: 'Patient History', icon: History },
  { to: '/doctor/model', label: 'AI Model Specs', icon: Cpu },
  { to: '/doctor/profile', label: 'My Profile', icon: User },
  { to: '/doctor/settings', label: 'Settings', icon: Settings },
];

export const DoctorLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--color-bg)] text-[var(--color-text)]">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col p-4">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border)] mb-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-600 to-cyan-600 flex items-center justify-center">
              <Eye className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-sm">
              RetinaCare <span className="text-brand-600 dark:text-brand-400">Doctor</span>
            </span>
          </Link>
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-md text-[var(--color-text-muted)] hover:bg-[var(--color-surface-elevated)]"
            title="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        <div className="px-2 py-1.5 mb-3 bg-cyan-50 dark:bg-cyan-950/40 rounded-lg">
          <p className="text-xs text-[var(--color-text-muted)]">Doctor Console</p>
          <p className="text-sm font-semibold truncate">Dr. {user?.name || 'Doctor'}</p>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-600 text-white dark:bg-brand-500'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-elevated)]'
                )
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="pt-4 border-t border-[var(--color-border)] mt-auto">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};
