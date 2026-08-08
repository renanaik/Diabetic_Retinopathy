import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Eye, Menu, X } from 'lucide-react';
import { Button } from '../ui/Button';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Screening', to: '/screening' },
  { label: 'Progress', to: '/progress' },
  { label: 'History', to: '/history' },
  { label: 'About', to: '/about' },
];

export const Navbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="bg-white border-b border-clinical-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-navy-700 flex items-center justify-center">
            <Eye size={16} className="text-white" />
          </div>
          <div>
            <span className="text-sm font-bold text-navy-800">RetinaCare AI</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                [
                  'px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150',
                  isActive
                    ? 'text-navy-700 bg-navy-50'
                    : 'text-clinical-muted hover:text-navy-700 hover:bg-clinical-bg',
                ].join(' ')
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:block">
          <Link to="/screening">
            <Button variant="primary" size="sm">
              Start Screening
            </Button>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-md text-clinical-muted hover:bg-clinical-bg"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-clinical-border bg-white px-4 pb-4">
          <nav className="pt-2 space-y-1">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  [
                    'block px-3 py-2.5 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'text-navy-700 bg-navy-50'
                      : 'text-clinical-muted hover:text-navy-700 hover:bg-clinical-bg',
                  ].join(' ')
                }
              >
                {link.label}
              </NavLink>
            ))}
            <div className="pt-2">
              <Link to="/screening" onClick={() => setMobileOpen(false)}>
                <Button variant="primary" size="sm" className="w-full justify-center">
                  Start Screening
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
