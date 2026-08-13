import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { ThemeProvider }     from './context/ThemeContext';
import { AuthProvider }      from './context/AuthContext';
import { ToastProvider }     from './context/ToastContext';
import { ProtectedRoute }    from './components/auth/ProtectedRoute';
import { ToastContainer }    from './components/ui/Toast';

// ── Public layouts & pages
import { PublicLayout }      from './components/layout/PublicLayout';
import { HomePage }          from './pages/HomePage';
import { AboutPage }         from './pages/AboutPage';
import { HowItWorksPage }    from './pages/HowItWorksPage';
import { DRStagesPage }      from './pages/DRStagesPage';
import { LoginPage }         from './pages/LoginPage';
import { SignupPage }        from './pages/SignupPage';
import { NotFoundPage }      from './pages/NotFoundPage';
import { AccessDeniedPage }  from './pages/AccessDeniedPage';

// ── Authenticated layouts
import { PatientLayout }     from './components/layout/PatientLayout';
import { DoctorLayout }      from './components/layout/DoctorLayout';
import { AdminLayout }       from './components/layout/AdminLayout';

// ── Patient pages
import { PatientDashboard }      from './pages/patient/PatientDashboard';
import { PatientReports }        from './pages/patient/PatientReports';
import { PatientProgress }       from './pages/patient/PatientProgress';
import { PatientProfile }        from './pages/patient/PatientProfile';
import { PatientSettings }       from './pages/patient/PatientSettings';
import { PatientFindDoctors }    from './pages/patient/PatientFindDoctors';
import { PatientDoctorProfile }  from './pages/patient/PatientDoctorProfile';
import { PatientMyDoctor }       from './pages/patient/PatientMyDoctor';
import { PatientReportDetail }   from './pages/patient/PatientReportDetail';

// ── Doctor pages
import { DoctorDashboard }            from './pages/doctor/DoctorDashboard';
import { DoctorPatients }             from './pages/doctor/DoctorPatients';
import { DoctorNewScreening }         from './pages/doctor/DoctorNewScreening';
import { DoctorResults }              from './pages/doctor/DoctorResults';
import { DoctorProgress }             from './pages/doctor/DoctorProgress';
import { DoctorPatientHistory }       from './pages/doctor/DoctorPatientHistory';
import { DoctorModel }                from './pages/doctor/DoctorModel';
import { DoctorSettings }             from './pages/doctor/DoctorSettings';
import { DoctorVerificationPending }  from './pages/doctor/DoctorVerificationPending';
import { DoctorVerificationRejected } from './pages/doctor/DoctorVerificationRejected';
import { DoctorRequests }             from './pages/doctor/DoctorRequests';
import { DoctorPatientDetail }        from './pages/doctor/DoctorPatientDetail';
import { DoctorProfile }              from './pages/doctor/DoctorProfile';

// ── Admin pages
import { AdminDashboard }    from './pages/admin/AdminDashboard';
import { AdminUsers }        from './pages/admin/AdminUsers';
import { AdminDoctors }      from './pages/admin/AdminDoctors';
import { AdminPatients }     from './pages/admin/AdminPatients';
import { AdminConnections }  from './pages/admin/AdminConnections';
import { AdminScreenings }   from './pages/admin/AdminScreenings';
import { AdminReports }      from './pages/admin/AdminReports';
import { AdminSettings }     from './pages/admin/AdminSettings';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <ToastContainer />
            <Routes>

              {/* ══════════════════════════════════════
                  PUBLIC ROUTES
              ══════════════════════════════════════ */}
              <Route path="/"             element={<PublicLayout><HomePage /></PublicLayout>} />
              <Route path="/about"        element={<PublicLayout><AboutPage /></PublicLayout>} />
              <Route path="/how-it-works" element={<PublicLayout><HowItWorksPage /></PublicLayout>} />
              <Route path="/dr-stages"    element={<PublicLayout><DRStagesPage /></PublicLayout>} />
              <Route path="/login"        element={<PublicLayout><LoginPage /></PublicLayout>} />
              <Route path="/signup"       element={<PublicLayout><SignupPage /></PublicLayout>} />
              <Route path="/access-denied" element={<AccessDeniedPage />} />

              {/* ══════════════════════════════════════
                  PATIENT ROUTES  [role: patient]
              ══════════════════════════════════════ */}
              <Route
                path="/patient"
                element={
                  <ProtectedRoute allowedRoles={['patient']}>
                    <PatientLayout />
                  </ProtectedRoute>
                }
              >
                <Route index             element={<PatientDashboard />} />
                <Route path="dashboard"  element={<PatientDashboard />} />
                <Route path="reports"    element={<PatientReports />} />
                <Route path="reports/:reportId" element={<PatientReportDetail />} />
                <Route path="progress"   element={<PatientProgress />} />
                <Route path="profile"    element={<PatientProfile />} />
                <Route path="settings"   element={<PatientSettings />} />
                {/* Phase 3: Doctor discovery & connection */}
                <Route path="doctors"          element={<PatientFindDoctors />} />
                <Route path="doctors/:doctorId" element={<PatientDoctorProfile />} />
                <Route path="my-doctor"        element={<PatientMyDoctor />} />
              </Route>

              {/* ══════════════════════════════════════
                  DOCTOR ROUTES  [role: doctor]
              ══════════════════════════════════════ */}

              {/* Verification pending — any doctor status can reach this */}
              <Route
                path="/doctor/verification-pending"
                element={
                  <ProtectedRoute allowedRoles={['doctor']} requireVerified={false}>
                    <DoctorVerificationPending />
                  </ProtectedRoute>
                }
              />

              {/* Verification rejected */}
              <Route
                path="/doctor/verification-rejected"
                element={
                  <ProtectedRoute allowedRoles={['doctor']} requireVerified={false}>
                    <DoctorVerificationRejected />
                  </ProtectedRoute>
                }
              />

              {/* All other doctor routes — verified doctors only */}
              <Route
                path="/doctor"
                element={
                  <ProtectedRoute allowedRoles={['doctor']}>
                    <DoctorLayout />
                  </ProtectedRoute>
                }
              >
                <Route index                       element={<DoctorDashboard />} />
                <Route path="dashboard"            element={<DoctorDashboard />} />
                <Route path="patients"             element={<DoctorPatients />} />
                {/* Phase 3: Patient detail with resource-level auth */}
                <Route path="patients/:patientId"  element={<DoctorPatientDetail />} />
                {/* Phase 3: Connection requests */}
                <Route path="requests"             element={<DoctorRequests />} />
                {/* Phase 3: Doctor's own profile */}
                <Route path="profile"              element={<DoctorProfile />} />
                <Route path="new-screening"        element={<DoctorNewScreening />} />
                <Route path="results"              element={<DoctorResults />} />
                <Route path="progress"             element={<DoctorProgress />} />
                <Route path="patient-history"      element={<DoctorPatientHistory />} />
                <Route path="model"                element={<DoctorModel />} />
                <Route path="settings"             element={<DoctorSettings />} />
              </Route>

              {/* ══════════════════════════════════════
                  ADMIN ROUTES  [role: super_admin]
              ══════════════════════════════════════ */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['super_admin']}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index               element={<AdminDashboard />} />
                <Route path="dashboard"    element={<AdminDashboard />} />
                <Route path="users"        element={<AdminUsers />} />
                <Route path="doctors"      element={<AdminDoctors />} />
                <Route path="patients"     element={<AdminPatients />} />
                {/* Phase 3: Connection management */}
                <Route path="connections"  element={<AdminConnections />} />
                <Route path="screenings"   element={<AdminScreenings />} />
                <Route path="reports"      element={<AdminReports />} />
                <Route path="settings"     element={<AdminSettings />} />
              </Route>

              {/* ══════════════════════════════════════
                  404 CATCH-ALL
              ══════════════════════════════════════ */}
              <Route path="*" element={<PublicLayout><NotFoundPage /></PublicLayout>} />

            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
