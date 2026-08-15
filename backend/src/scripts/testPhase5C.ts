/**
 * testPhase5C.ts — Automated Verification Script for Phase 5C
 *
 * Runs full end-to-end test suite covering:
 *   - Super Admin Doctor Verification
 *   - requireVerifiedDoctor Middleware
 *   - Patient ↔ Doctor Connection Workflows
 *   - Ownership & Access-Control Verification
 */

import 'dotenv/config';

const BASE_URL = `http://localhost:${process.env.PORT || 5001}/api`;

const timestamp = Date.now();
const emails = {
  admin: process.env.SUPER_ADMIN_EMAIL || 'admin@retinacare.ai',
  adminPassword: process.env.SUPER_ADMIN_PASSWORD || 'Admin@Retina2024!',
  doctorA: `dr.alice.${timestamp}@test.com`,
  doctorB: `dr.bob.${timestamp}@test.com`,
  doctorC: `dr.charlie.${timestamp}@test.com`,
  patientA: `patient.ann.${timestamp}@test.com`,
  patientB: `patient.ben.${timestamp}@test.com`,
  commonPassword: 'Secure@Password123!',
};

let tokens: Record<string, string> = {};
let ids: Record<string, string> = {};

async function request(path: string, options: RequestInit = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const json: any = await res.json().catch(() => null);
  return { status: res.status, body: json };
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`  ✓ ${message}`);
}

async function runTests() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('RetinaCare AI — Phase 5C End-to-End Test Suite');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 1. Admin Login
  console.log('1. Logging in as Super Admin...');
  const adminLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: emails.admin, password: emails.adminPassword }),
  });
  assert(adminLogin.status === 200, 'Super Admin login succeeded');
  assert(adminLogin.body.data.user.role === 'super_admin', 'Role is super_admin');
  tokens.admin = adminLogin.body.data.token;
  ids.admin = adminLogin.body.data.user.id;

  // 2. Doctor A Signup (starts pending)
  console.log('\n2. Signing up Doctor A (Alice)...');
  const docASignup = await request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Dr. Alice Smith',
      email: emails.doctorA,
      password: emails.commonPassword,
      role: 'doctor',
      licenseNumber: `MED-A-${timestamp}`,
      medicalCouncil: 'General Medical Council',
      specialization: 'Retina Specialist',
      hospital: 'St. Jude Eye Hospital',
      yearsOfExperience: 10,
    }),
  });
  assert(docASignup.status === 201, 'Doctor A signup succeeded (201)');
  assert(docASignup.body.data.user.verificationStatus === 'pending', 'Doctor A starts as pending');
  tokens.doctorA = docASignup.body.data.token;
  ids.doctorA = docASignup.body.data.user.id;

  // 3. Doctor B Signup
  console.log('\n3. Signing up Doctor B (Bob)...');
  const docBSignup = await request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Dr. Bob Jones',
      email: emails.doctorB,
      password: emails.commonPassword,
      role: 'doctor',
      licenseNumber: `MED-B-${timestamp}`,
      medicalCouncil: 'Medical Council of India',
      specialization: 'Ophthalmology',
      hospital: 'Apex Vision Clinic',
      yearsOfExperience: 6,
    }),
  });
  assert(docBSignup.status === 201, 'Doctor B signup succeeded (201)');
  tokens.doctorB = docBSignup.body.data.token;
  ids.doctorB = docBSignup.body.data.user.id;

  // 4. Doctor C Signup (for reject test)
  console.log('\n4. Signing up Doctor C (Charlie)...');
  const docCSignup = await request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Dr. Charlie Brown',
      email: emails.doctorC,
      password: emails.commonPassword,
      role: 'doctor',
      licenseNumber: `MED-C-${timestamp}`,
      medicalCouncil: 'State Medical Council',
      specialization: 'General Eye Care',
      hospital: 'Metro Hospital',
      yearsOfExperience: 3,
    }),
  });
  assert(docCSignup.status === 201, 'Doctor C signup succeeded (201)');
  tokens.doctorC = docCSignup.body.data.token;
  ids.doctorC = docCSignup.body.data.user.id;

  // 5. Patient A & Patient B Signup
  console.log('\n5. Signing up Patient A & Patient B...');
  const patientASignup = await request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Ann Peterson',
      email: emails.patientA,
      password: emails.commonPassword,
      role: 'patient',
      dateOfBirth: '1988-05-12',
      gender: 'Female',
      phone: '+1-555-0101',
      medicalHistory: 'Hypertension',
      diabetesHistory: 'Type 2 diagnosed 2018',
      eyeHistory: 'Mild blurring',
    }),
  });
  assert(patientASignup.status === 201, 'Patient A signup succeeded (201)');
  tokens.patientA = patientASignup.body.data.token;
  ids.patientA = patientASignup.body.data.user.id;

  const patientBSignup = await request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Ben Franklin',
      email: emails.patientB,
      password: emails.commonPassword,
      role: 'patient',
      dateOfBirth: '1975-11-20',
      gender: 'Male',
      phone: '+1-555-0102',
      medicalHistory: 'None',
      diabetesHistory: 'Type 1 diagnosed 2005',
      eyeHistory: 'None',
    }),
  });
  assert(patientBSignup.status === 201, 'Patient B signup succeeded (201)');
  tokens.patientB = patientBSignup.body.data.token;
  ids.patientB = patientBSignup.body.data.user.id;

  // 6. Super Admin views pending doctors
  console.log('\n6. Testing Super Admin GET /api/admin/doctors/pending...');
  const pendingDocs = await request('/admin/doctors/pending', {
    headers: { Authorization: `Bearer ${tokens.admin}` },
  });
  assert(pendingDocs.status === 200, 'Super Admin can view pending doctors');
  const foundDoctorA = pendingDocs.body.data.doctors.find((d: any) => d.id === ids.doctorA);
  assert(!!foundDoctorA, 'Doctor A found in pending list');
  assert(foundDoctorA.profile.licenseNumber === `MED-A-${timestamp}`, 'Doctor A profile info populated');

  // 7. Non-admin users cannot access admin endpoints
  console.log('\n7. Testing Access Control on Admin Endpoints (Doctor & Patient blocked)...');
  const docForbidden = await request('/admin/doctors/pending', {
    headers: { Authorization: `Bearer ${tokens.doctorA}` },
  });
  assert(docForbidden.status === 403, 'Doctor cannot access admin pending endpoint (403)');

  const patientForbidden = await request('/admin/doctors/pending', {
    headers: { Authorization: `Bearer ${tokens.patientA}` },
  });
  assert(patientForbidden.status === 403, 'Patient cannot access admin pending endpoint (403)');

  // 8. Pending doctor cannot access verified doctor functionality
  console.log('\n8. Testing requireVerifiedDoctor middleware on pending Doctor A...');
  const pendingDocRequests = await request('/connections/requests', {
    headers: { Authorization: `Bearer ${tokens.doctorA}` },
  });
  assert(pendingDocRequests.status === 403, 'Pending doctor is blocked from doctor requests (403)');
  assert(pendingDocRequests.body.message.includes('pending verification'), 'Diagnostic message indicates pending verification');

  // 9. Super Admin Approves Doctor A & Doctor B
  console.log('\n9. Super Admin approving Doctor A and Doctor B...');
  const approveA = await request(`/admin/doctors/${ids.doctorA}/approve`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${tokens.admin}` },
  });
  assert(approveA.status === 200, 'Doctor A approved (200)');
  assert(approveA.body.data.doctor.verificationStatus === 'verified', 'Doctor A is now verified');

  const approveB = await request(`/admin/doctors/${ids.doctorB}/approve`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${tokens.admin}` },
  });
  assert(approveB.status === 200, 'Doctor B approved (200)');

  // 10. Super Admin Rejects Doctor C
  console.log('\n10. Super Admin rejecting Doctor C...');
  const rejectC = await request(`/admin/doctors/${ids.doctorC}/reject`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${tokens.admin}` },
  });
  assert(rejectC.status === 200, 'Doctor C rejected (200)');
  assert(rejectC.body.data.doctor.verificationStatus === 'rejected', 'Doctor C is now rejected');

  // 11. Rejected Doctor access check
  console.log('\n11. Testing requireVerifiedDoctor on rejected Doctor C...');
  const rejectedDocAccess = await request('/connections/requests', {
    headers: { Authorization: `Bearer ${tokens.doctorC}` },
  });
  assert(rejectedDocAccess.status === 403, 'Rejected doctor is blocked (403)');
  assert(rejectedDocAccess.body.message.includes('rejected'), 'Diagnostic message indicates rejection');

  // 12. Verified Doctor A can now access doctor endpoints
  console.log('\n12. Verified Doctor A accessing GET /api/connections/requests...');
  const verifiedDocRequests = await request('/connections/requests', {
    headers: { Authorization: `Bearer ${tokens.doctorA}` },
  });
  assert(verifiedDocRequests.status === 200, 'Verified Doctor A can access requests endpoint (200)');
  assert(verifiedDocRequests.body.data.count === 0, 'No requests initially');

  // 13. Patient A cannot request unverified/rejected Doctor C
  console.log('\n13. Patient A attempting to request rejected Doctor C...');
  const reqRejectedDoc = await request('/connections', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokens.patientA}` },
    body: JSON.stringify({ doctorId: ids.doctorC }),
  });
  assert(reqRejectedDoc.status === 400, 'Patient cannot connect to unverified doctor (400)');

  // 14. Patient A requests verified Doctor A
  console.log('\n14. Patient A requesting verified Doctor A...');
  const connReq = await request('/connections', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokens.patientA}` },
    body: JSON.stringify({ doctorId: ids.doctorA }),
  });
  assert(connReq.status === 201, 'Connection request created (201)');
  assert(connReq.body.data.connection.status === 'pending', 'Connection status is pending');
  const connectionId = connReq.body.data.connection.id;

  // 15. Duplicate Connection Check
  console.log('\n15. Testing duplicate connection request prevention...');
  const duplicateReq = await request('/connections', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokens.patientA}` },
    body: JSON.stringify({ doctorId: ids.doctorA }),
  });
  assert(duplicateReq.status === 409, 'Duplicate connection request prevented (409)');

  // 16. Doctor A sees incoming request
  console.log('\n16. Doctor A viewing pending requests...');
  const docARequests = await request('/connections/requests', {
    headers: { Authorization: `Bearer ${tokens.doctorA}` },
  });
  assert(docARequests.status === 200, 'Doctor A retrieved requests');
  assert(docARequests.body.data.count === 1, 'Doctor A has 1 pending request');
  assert(docARequests.body.data.requests[0].id === connectionId, 'Request ID matches');
  assert(docARequests.body.data.requests[0].patient.name === 'Ann Peterson', 'Patient name matches');

  // 17. Doctor B does NOT see Doctor A's request
  console.log('\n17. Verifying Doctor B cannot see Doctor A requests (Data Isolation)...');
  const docBRequests = await request('/connections/requests', {
    headers: { Authorization: `Bearer ${tokens.doctorB}` },
  });
  assert(docBRequests.status === 200, 'Doctor B retrieved requests');
  assert(docBRequests.body.data.count === 0, 'Doctor B has 0 requests');

  // 18. Doctor B cannot accept Doctor A's connection (Ownership Enforcement)
  console.log('\n18. Doctor B attempting to accept Doctor A connection (Ownership check)...');
  const docBAccept = await request(`/connections/${connectionId}/accept`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${tokens.doctorB}` },
  });
  assert(docBAccept.status === 404, 'Doctor B cannot modify Doctor A connection (404/403)');

  // 19. Patient cannot accept connection
  console.log('\n19. Patient attempting to accept connection (Role check)...');
  const patientAccept = await request(`/connections/${connectionId}/accept`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${tokens.patientA}` },
  });
  assert(patientAccept.status === 403, 'Patient cannot accept connection (403)');

  // 20. Doctor A accepts the connection
  console.log('\n20. Doctor A accepting connection...');
  const acceptConn = await request(`/connections/${connectionId}/accept`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${tokens.doctorA}` },
  });
  assert(acceptConn.status === 200, 'Doctor A accepted connection (200)');
  assert(acceptConn.body.data.connection.status === 'accepted', 'Status updated to accepted');

  // 21. Doctor A views my-patients
  console.log('\n21. Doctor A viewing GET /api/connections/my-patients...');
  const docAPatients = await request('/connections/my-patients', {
    headers: { Authorization: `Bearer ${tokens.doctorA}` },
  });
  assert(docAPatients.status === 200, 'Doctor A retrieved my-patients');
  assert(docAPatients.body.data.count === 1, 'Doctor A has 1 accepted patient');
  assert(docAPatients.body.data.patients[0].patient.name === 'Ann Peterson', 'Patient is Ann Peterson');

  // 22. Doctor B my-patients is empty
  console.log('\n22. Doctor B viewing GET /api/connections/my-patients (Must be isolated)...');
  const docBPatients = await request('/connections/my-patients', {
    headers: { Authorization: `Bearer ${tokens.doctorB}` },
  });
  assert(docBPatients.status === 200, 'Doctor B retrieved my-patients');
  assert(docBPatients.body.data.count === 0, 'Doctor B sees 0 patients');

  // 23. Patient A views my-doctors
  console.log('\n23. Patient A viewing GET /api/connections/my-doctors...');
  const patientADoctors = await request('/connections/my-doctors', {
    headers: { Authorization: `Bearer ${tokens.patientA}` },
  });
  assert(patientADoctors.status === 200, 'Patient A retrieved my-doctors');
  assert(patientADoctors.body.data.count === 1, 'Patient A has 1 connection');
  assert(patientADoctors.body.data.connections[0].status === 'accepted', 'Connection status is accepted');
  assert(patientADoctors.body.data.connections[0].doctor.name === 'Dr. Alice Smith', 'Doctor is Dr. Alice Smith');

  // 24. Patient B my-doctors is empty
  console.log('\n24. Patient B viewing GET /api/connections/my-doctors (Must be isolated)...');
  const patientBDoctors = await request('/connections/my-doctors', {
    headers: { Authorization: `Bearer ${tokens.patientB}` },
  });
  assert(patientBDoctors.status === 200, 'Patient B retrieved my-doctors');
  assert(patientBDoctors.body.data.count === 0, 'Patient B sees 0 doctor connections');

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 ALL 24 TEST SCENARIOS PASSED WITH ZERO ERRORS!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
