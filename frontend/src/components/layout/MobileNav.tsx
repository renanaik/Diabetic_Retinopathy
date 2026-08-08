import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ScanLine,
  FileText,
  TrendingUp,
  Clock,
  Info,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Screening', to: '/screening', icon: ScanLine },
  { label: 'Results', to: '/results', icon: FileText },
  { label: 'Progress', to: '/progress', icon: TrendingUp },
  { label: 'History', to: '/history', icon: Clock },
  { label: 'About', to: '/about', icon: Info },
];

export const MobileNav: React.FC = () => (
  <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-clinical-border">
    <div className="flex items-center justify-around py-1">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                'flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-md transition-colors min-w-0',
                isActive ? 'text-navy-700' : 'text-clinical-muted',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={20} className={isActive ? 'text-navy-700' : 'text-clinical-muted'} />
                <span className="text-[10px] font-medium truncate">{item.label}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </div>
  </nav>
);
