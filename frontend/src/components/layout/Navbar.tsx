import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Sun, Moon, Menu, X, Eye } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

interface NavLink {
  to: string;
  label: string;
  exact: boolean;
  isAnchor?: boolean;
}

const NAV_LINKS: NavLink[] = [
  { to: '/',             label: 'Home',         exact: true },
  { to: '/about',        label: 'About',        exact: false },
  { to: '/how-it-works', label: 'How It Works', exact: false },
  { to: '/dr-stages',    label: 'DR Stages',    exact: false },
  { to: '/#features',    label: 'Features',     exact: false, isAnchor: true },
];

export const Navbar: React.FC = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  const [isScrolled, setIsScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen]     = useState(false);
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Detect scroll for glass effect
  useEffect(() => {
    const handler = () => setIsScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const isActive = (to: string, exact: boolean) => {
    if (exact) return location.pathname === to;
    return location.pathname.startsWith(to);
  };

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled || mobileOpen
            ? 'navbar shadow-xs'
            : 'bg-transparent border-b border-transparent'
        )}
      >
        <div className="container-main">
          <div className="flex items-center justify-between h-16">

            {/* ── Brand ── */}
            <Link
              to="/"
              className="flex items-center gap-2.5 group"
              aria-label="RetinaCare AI - Home"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-600 to-cyan-600 flex items-center justify-center shadow-card group-hover:shadow-glow transition-shadow duration-300">
                <Eye className="w-4 h-4 text-white" strokeWidth={2.5} aria-hidden="true" />
              </div>
              <span className="font-display font-bold text-[var(--color-text)] text-base tracking-tight leading-none">
                RetinaCare <span className="text-brand-600 dark:text-brand-400">AI</span>
              </span>
            </Link>

            {/* ── Desktop Navigation ── */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
              {NAV_LINKS.map(({ to, label, exact, isAnchor }) => {
                if (isAnchor) {
                  return (
                    <a
                      key={to}
                      href={location.pathname === '/' ? '#features' : '/#features'}
                      className="px-3 py-2 rounded-md text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-elevated)] transition-all duration-150"
                    >
                      {label}
                    </a>
                  );
                }
                return (
                  <NavLink
                    key={to}
                    to={to}
                    end={exact}
                    className={({ isActive: navActive }) =>
                      cn(
                        'px-3 py-2 rounded-md text-sm font-medium transition-all duration-150',
                        navActive
                          ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40'
                          : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-elevated)]'
                      )
                    }
                  >
                    {label}
                  </NavLink>
                );
              })}
            </nav>

            {/* ── Right Side Actions ── */}
            <div className="flex items-center gap-2">
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="w-9 h-9 rounded-md flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-elevated)] transition-all duration-150"
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark
                  ? <Sun  className="w-4.5 h-4.5" aria-hidden="true" />
                  : <Moon className="w-4.5 h-4.5" aria-hidden="true" />
                }
              </button>

              {/* Login */}
              <Link
                to="/login"
                className="hidden sm:inline-flex btn btn-ghost btn-sm"
                id="nav-login-btn"
              >
                Login
              </Link>

              {/* Get Started */}
              <Link
                to="/signup"
                className="hidden sm:inline-flex btn btn-primary btn-sm"
                id="nav-signup-btn"
              >
                Get Started
              </Link>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(o => !o)}
                className="md:hidden w-9 h-9 rounded-md flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-elevated)] transition-all duration-150"
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
              >
                {mobileOpen
                  ? <X    className="w-5 h-5" aria-hidden="true" />
                  : <Menu className="w-5 h-5" aria-hidden="true" />
                }
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile Menu Overlay ── */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        className={cn(
          'fixed inset-0 z-40 md:hidden transition-all duration-300',
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />

        {/* Slide-in panel */}
        <nav
          className={cn(
            'absolute top-16 left-0 right-0 bg-[var(--color-surface)] border-b border-[var(--color-border)] shadow-lg',
            'transition-transform duration-300 ease-out',
            mobileOpen ? 'translate-y-0' : '-translate-y-4'
          )}
        >
          <div className="container-main py-4 flex flex-col gap-1">
            {NAV_LINKS.map(({ to, label, exact, isAnchor }) => {
              if (isAnchor) {
                return (
                  <a
                    key={to}
                    href="/#features"
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 rounded-lg text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-elevated)] transition-all duration-150"
                  >
                    {label}
                  </a>
                );
              }
              return (
                <NavLink
                  key={to}
                  to={to}
                  end={exact}
                  className={({ isActive: navActive }) =>
                    cn(
                      'px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150',
                      navActive
                        ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40'
                        : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-elevated)]'
                    )
                  }
                >
                  {label}
                </NavLink>
              );
            })}

            {/* Divider */}
            <div className="my-2 border-t border-[var(--color-border)]" />

            {/* Auth buttons */}
            <Link
              to="/login"
              className="btn btn-outline btn-md w-full justify-center"
              id="mobile-login-btn"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="btn btn-primary btn-md w-full justify-center"
              id="mobile-signup-btn"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </div>

      {/* Spacer so content doesn't hide behind fixed navbar */}
      <div className="h-16" aria-hidden="true" />
    </>
  );
};
