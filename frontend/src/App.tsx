import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { Navbar } from './components/layout/Navbar';

import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { ScreeningPage } from './pages/ScreeningPage';
import { ResultsPage } from './pages/ResultsPage';
import { ProgressTrackerPage } from './pages/ProgressTrackerPage';
import { PatientHistoryPage } from './pages/PatientHistoryPage';
import { AboutPage } from './pages/AboutPage';

// Pages that use the app shell (sidebar + top bar)
const APP_ROUTES = [
  '/dashboard',
  '/screening',
  '/results',
  '/progress',
  '/history',
  '/about',
];

function useIsAppRoute(): boolean {
  const { pathname } = useLocation();
  return APP_ROUTES.some((r) => pathname.startsWith(r));
}

// App shell wraps pages that need sidebar navigation
const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-clinical-bg">
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((c) => !c)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar on mobile */}
        <div className="lg:hidden bg-white border-b border-clinical-border flex items-center justify-between px-4 h-14 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-navy-700 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-white" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="4" />
                <path d="M12 4a8 8 0 1 0 0 16A8 8 0 0 0 12 4z" opacity={0.3} />
              </svg>
            </div>
            <span className="text-sm font-bold text-navy-800">RetinaCare AI</span>
          </div>
        </div>

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  );
};

const AppRoutes: React.FC = () => {
  const isApp = useIsAppRoute();

  if (!isApp) {
    // Public routes (landing page with Navbar)
    return (
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <AppShell>
      <Routes>
        <Route path="/dashboard"  element={<DashboardPage />} />
        <Route path="/screening"  element={<ScreeningPage />} />
        <Route path="/results"    element={<ResultsPage />} />
        <Route path="/results/:screeningId" element={<ResultsPage />} />
        <Route path="/progress"   element={<ProgressTrackerPage />} />
        <Route path="/history"    element={<PatientHistoryPage />} />
        <Route path="/about"      element={<AboutPage />} />
        {/* Fallback within app */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppShell>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
