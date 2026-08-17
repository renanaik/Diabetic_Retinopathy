import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { AuthUser } from '../types/auth';

/** Map an authenticated user to their landing page after login. */
function getDestination(user: AuthUser, from?: string): string {
  // If user came from a specific page:
  if (from && from !== '/' && from !== '/login') {
    // If a verified doctor came from verification-pending, redirect to dashboard instead
    if (from === '/doctor/verification-pending' && user.role === 'doctor' && user.verificationStatus === 'verified') {
      return '/doctor/dashboard';
    }
    return from;
  }

  // Default role-based landing
  switch (user.role) {
    case 'super_admin':
      return '/admin';
    case 'doctor':
      if (user.verificationStatus === 'verified') {
        return '/doctor/dashboard';
      }
      if (user.verificationStatus === 'rejected') {
        return '/doctor/verification-rejected';
      }
      return '/doctor/verification-pending';
    case 'patient':
      return '/patient/dashboard';
    default:
      return '/';
  }
}

export const LoginPage: React.FC = () => {
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');

  const { login } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // If the user was redirected here from a protected route, go back there after login.
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      success('Logged in successfully!');

      try {
        const stored = localStorage.getItem('retinacare_auth_user');
        if (stored) {
          const freshUser = JSON.parse(stored) as AuthUser;
          const target = getDestination(freshUser, from);
          navigate(target, { replace: true });
          return;
        }
      } catch {
        // fall back
      }
      navigate('/', { replace: true });
    } else {
      setError(res.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="card max-w-md w-full p-8 shadow-lg border-[var(--color-border)]">

        {/* ── Header ── */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-600 to-cyan-600 flex items-center justify-center mx-auto mb-4 shadow-card">
            <Eye className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-[var(--color-text)]">
            Welcome Back
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Sign in to access your RetinaCare AI dashboard
          </p>
        </div>

        {/* ── Error banner ── */}
        {error && (
          <div className="mb-6 p-3.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>

          {/* Email */}
          <div>
            <label className="label" htmlFor="login-email">Email Address</label>
            <div className="relative">
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input pl-10"
                disabled={loading}
              />
              <Mail className="w-4 h-4 text-[var(--color-text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="label" htmlFor="login-password">Password</label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input pl-10 pr-10"
                disabled={loading}
              />
              <Lock className="w-4 h-4 text-[var(--color-text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword
                  ? <EyeOff className="w-4 h-4" />
                  : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !email || !password}
            className="btn btn-primary btn-md w-full justify-center mt-2 shadow-card disabled:opacity-60 disabled:cursor-not-allowed"
            id="login-submit-btn"
          >
            {loading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Signing In…
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* ── Footer ── */}
        <div className="mt-6 text-center text-xs text-[var(--color-text-muted)]">
          Don't have an account?{' '}
          <Link to="/signup" className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">
            Sign up here
          </Link>
        </div>
      </div>
    </div>
  );
};
