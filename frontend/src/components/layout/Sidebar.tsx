import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Eye,
  LayoutDashboard,
  ScanLine,
  FileText,
  TrendingUp,
  Clock,
  Info,
  Settings,
  ChevronLeft,
  ChevronRight,
  Activity,
} from 'lucide-react';

interface NavItem {
  label: string;
  to: string;
  icon: React.FC<{ size?: number; className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'New Screening', to: '/screening', icon: ScanLine },
  { label: 'Results', to: '/results', icon: FileText },
  { label: 'Progress Tracker', to: '/progress', icon: TrendingUp },
  { label: 'Patient History', to: '/history', icon: Clock },
  { label: 'Model Information', to: '/about', icon: Info },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed = false,
  onToggle,
}) => {
  const location = useLocation();

  return (
    <aside
      className={[
        'hidden lg:flex flex-col h-screen sticky top-0 bg-white border-r border-clinical-border',
        'transition-all duration-200 flex-shrink-0',
        collapsed ? 'w-16' : 'w-60',
      ].join(' ')}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-16 border-b border-clinical-border flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-navy-700 flex items-center justify-center flex-shrink-0">
          <Eye size={16} className="text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-navy-800 leading-tight">RetinaCare AI</p>
            <p className="text-xs text-clinical-muted">Screening Platform</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
        {!collapsed && (
          <p className="px-3 mb-2 text-xs font-semibold text-clinical-muted uppercase tracking-wider">
            Navigation
          </p>
        )}
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to ||
            (item.to === '/results' && location.pathname.startsWith('/results'));
          return (
            <NavLink
              key={item.to}
              to={item.to}
              title={collapsed ? item.label : undefined}
              className={[
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium',
                'transition-colors duration-150 group',
                isActive
                  ? 'bg-navy-700 text-white'
                  : 'text-clinical-muted hover:bg-clinical-bg hover:text-navy-700',
              ].join(' ')}
            >
              <Icon
                size={17}
                className={isActive ? 'text-white' : 'text-clinical-muted group-hover:text-navy-600'}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-clinical-border p-2">
        {!collapsed && (
          <NavLink
            to="/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-clinical-muted hover:bg-clinical-bg hover:text-navy-700 transition-colors"
          >
            <Settings size={17} />
            <span>Settings</span>
          </NavLink>
        )}
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center p-2 mt-1 rounded-md text-clinical-muted hover:bg-clinical-bg hover:text-navy-700 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
};
