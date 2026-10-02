/**
 * testSuperAdmin.ts — Automated Verification Script for Super Admin Panel
 */

import 'dotenv/config';

const PORT = process.env.PORT || 5001;
const BASE_URL = `http://localhost:${PORT}/api`;

const emails = {
  admin: process.env.SUPER_ADMIN_EMAIL || 'admin@retinacare.ai',
  adminPassword: process.env.SUPER_ADMIN_PASSWORD || 'Admin@Retina2024!',
};

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
  console.log('RetinaCare AI — Super Admin Verification Test Suite');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 1. Admin Login
  console.log('1. Authenticating as Super Admin...');
  const adminLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: emails.admin, password: emails.adminPassword }),
  });
  assert(adminLogin.status === 200 && adminLogin.body?.success, 'Super Admin login successful');
  const adminToken = adminLogin.body.data.token;
  assert(Boolean(adminToken), 'Admin JWT token received');

  // 2. GET /api/admin/dashboard
  console.log('\n2. Testing GET /api/admin/dashboard...');
  const dashRes = await request('/admin/dashboard', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(dashRes.status === 200 && dashRes.body?.success, 'Dashboard stats API returns 200 OK');
  assert(dashRes.body.data?.totals !== undefined, 'Dashboard totals object is present');
  assert(typeof dashRes.body.data.totals.patients === 'number', 'Total patients is a real number');
  assert(typeof dashRes.body.data.totals.doctors === 'number', 'Total doctors is a real number');
  assert(typeof dashRes.body.data.totals.screenings === 'number', 'Total screenings is a real number');
  assert(typeof dashRes.body.data.totals.connections === 'number', 'Total connections is a real number');
  assert(Array.isArray(dashRes.body.data.recentScreenings), 'Recent screenings list is present');
  assert(Array.isArray(dashRes.body.data.recentPendingDoctors), 'Recent pending doctors list is present');
  console.log(`     Total Patients: ${dashRes.body.data.totals.patients}`);
  console.log(`     Total Doctors: ${dashRes.body.data.totals.doctors}`);
  console.log(`     Total Screenings: ${dashRes.body.data.totals.screenings}`);
  console.log(`     Active Connections: ${dashRes.body.data.connections.accepted}`);

  // 3. GET /api/admin/doctors
  console.log('\n3. Testing GET /api/admin/doctors...');
  const docRes = await request('/admin/doctors', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(docRes.status === 200 && docRes.body?.success, 'All doctors API returns 200 OK');
  assert(Array.isArray(docRes.body.data?.doctors), 'Doctors list is an array');
  console.log(`     Found ${docRes.body.data.doctors.length} doctors`);
  if (docRes.body.data.doctors.length > 0) {
    const firstDoc = docRes.body.data.doctors[0];
    assert(typeof firstDoc.name === 'string', 'Doctor has name');
    assert(typeof firstDoc.email === 'string', 'Doctor has email');
    assert(firstDoc.connectedPatientsCount !== undefined, 'Doctor has connectedPatientsCount');
    assert(firstDoc.screeningsCount !== undefined, 'Doctor has screeningsCount');
  }

  // 4. GET /api/admin/patients
  console.log('\n4. Testing GET /api/admin/patients...');
  const patRes = await request('/admin/patients', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(patRes.status === 200 && patRes.body?.success, 'Patients API returns 200 OK');
  assert(Array.isArray(patRes.body.data?.patients), 'Patients list is an array');
  console.log(`     Found ${patRes.body.data.patients.length} patients`);
  if (patRes.body.data.patients.length > 0) {
    const firstPat = patRes.body.data.patients[0];
    assert(typeof firstPat.patientId === 'string' && firstPat.patientId.startsWith('RC-'), 'Patient has valid unique Patient ID (RC-...)');
    assert(typeof firstPat.name === 'string', 'Patient has name');
    assert(Array.isArray(firstPat.connectedDoctors), 'Patient has connected doctors list');
    assert(typeof firstPat.screeningsCount === 'number', 'Patient has screenings count');
    console.log(`     Sample Patient ID: ${firstPat.patientId} (${firstPat.name})`);
  }

  // 5. GET /api/admin/connections
  console.log('\n5. Testing GET /api/admin/connections...');
  const connRes = await request('/admin/connections', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(connRes.status === 200 && connRes.body?.success, 'Connections API returns 200 OK');
  assert(Array.isArray(connRes.body.data?.connections), 'Connections list is an array');
  console.log(`     Found ${connRes.body.data.connections.length} connections`);
  if (connRes.body.data.connections.length > 0) {
    const firstConn = connRes.body.data.connections[0];
    assert(firstConn.doctor && typeof firstConn.doctor.name === 'string', 'Connection has doctor details');
    assert(firstConn.patient && typeof firstConn.patient.name === 'string', 'Connection has patient details');
    assert(typeof firstConn.status === 'string', 'Connection has status');
  }

  // 6. GET /api/admin/screenings
  console.log('\n6. Testing GET /api/admin/screenings...');
  const scrRes = await request('/admin/screenings', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(scrRes.status === 200 && scrRes.body?.success, 'Screenings API returns 200 OK');
  assert(Array.isArray(scrRes.body.data?.screenings), 'Screenings list is an array');
  console.log(`     Found ${scrRes.body.data.screenings.length} screenings`);
  if (scrRes.body.data.screenings.length > 0) {
    const firstScr = scrRes.body.data.screenings[0];
    assert(firstScr.aiResult && typeof firstScr.aiResult.predictedLabel === 'string', 'Screening has AI prediction result');
    assert(firstScr.patient && typeof firstScr.patient.name === 'string', 'Screening has patient name');
    assert(firstScr.doctor && typeof firstScr.doctor.name === 'string', 'Screening has doctor name');
  }

  // 7. GET /api/admin/users
  console.log('\n7. Testing GET /api/admin/users...');
  const usrRes = await request('/admin/users', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(usrRes.status === 200 && usrRes.body?.success, 'Users API returns 200 OK');
  assert(Array.isArray(usrRes.body.data?.users), 'Users list is an array');
  console.log(`     Found ${usrRes.body.data.users.length} total registered accounts`);

  // 8. GET /api/admin/reports
  console.log('\n8. Testing GET /api/admin/reports...');
  const repRes = await request('/admin/reports', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(repRes.status === 200 && repRes.body?.success, 'Reports API returns 200 OK');
  assert(repRes.body.data?.summary !== undefined, 'Reports summary is present');
  assert(Array.isArray(repRes.body.data?.stageDistribution), 'Stage distribution is present');
  assert(repRes.body.data.stageDistribution.length === 5, '5 ICDR stages are represented');

  // 9. Authorization Security Checks
  console.log('\n9. Testing Security & Role Authorization...');
  const unauthRes = await request('/admin/dashboard');
  assert(unauthRes.status === 401, 'Unauthenticated request to /api/admin/dashboard returns 401 Unauthorized');

  // Register a patient to test non-admin access blocking
  const testPatientEmail = `test.unauth.patient.${Date.now()}@test.com`;
  const patSignupRes = await request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Unauthorized Patient Tester',
      email: testPatientEmail,
      password: 'Secure@Password123!',
      role: 'patient',
      dateOfBirth: '1995-05-15',
      gender: 'other',
      phone: '1234567890',
    }),
  });
  assert(patSignupRes.status === 201 && patSignupRes.body?.success, 'Created temporary test patient');
  const patientToken = patSignupRes.body.data.token;

  const forbiddenRes = await request('/admin/dashboard', {
    headers: { Authorization: `Bearer ${patientToken}` },
  });
  assert(forbiddenRes.status === 403, 'Patient token accessing /api/admin/dashboard returns 403 Forbidden');

  const forbiddenDocs = await request('/admin/doctors', {
    headers: { Authorization: `Bearer ${patientToken}` },
  });
  assert(forbiddenDocs.status === 403, 'Patient token accessing /api/admin/doctors returns 403 Forbidden');

  const forbiddenPats = await request('/admin/patients', {
    headers: { Authorization: `Bearer ${patientToken}` },
  });
  assert(forbiddenPats.status === 403, 'Patient token accessing /api/admin/patients returns 403 Forbidden');

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ ALL SUPER ADMIN TESTS PASSED SUCCESSFULLY!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
