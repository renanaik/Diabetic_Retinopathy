import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Eye, Heart } from 'lucide-react';

export const PublicLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)] text-[var(--color-text)]">
      <Navbar />
      <main className="flex-1">
        {children || <Outlet />}
      </main>
      <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)] py-12 mt-auto">
        <div className="container-main">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-600 to-cyan-600 flex items-center justify-center">
                <Eye className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-sm tracking-tight">
                RetinaCare <span className="text-brand-600 dark:text-brand-400">AI</span>
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-[var(--color-text-muted)]">
              <Link to="/" className="hover:text-[var(--color-text)] transition-colors">Home</Link>
              <Link to="/about" className="hover:text-[var(--color-text)] transition-colors">About</Link>
              <Link to="/how-it-works" className="hover:text-[var(--color-text)] transition-colors">How It Works</Link>
              <Link to="/dr-stages" className="hover:text-[var(--color-text)] transition-colors">DR Stages</Link>
              <Link to="/login" className="hover:text-[var(--color-text)] transition-colors">Login</Link>
              <Link to="/signup" className="hover:text-[var(--color-text)] transition-colors">Sign Up</Link>
            </div>
            <p className="text-xs text-[var(--color-text-subtle)] flex items-center gap-1">
              Academic Project &copy; {new Date().getFullYear()} RetinaCare AI
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
