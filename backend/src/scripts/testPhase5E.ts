/**
 * testPhase5E.ts — Automated End-to-End Test Suite for Phase 5E Retinal Screening Workflow
 *
 * Tests:
 *   1. Verified Doctor creating Screening for Connected & Accepted Patient
 *   2. Persistence of Screening & Full AI Prediction in MongoDB
 *   3. Initial Screening Status = "pending_review"
 *   4. Doctor listing their screenings (and filtering by patientId)
 *   5. Doctor retrieving single screening by ID
 *   6. Ownership Enforcement (Doctor B cannot access Doctor A's screening)
 *   7. Relationship Validation (Unconnected, Pending, and Rejected connections blocked)
 *   8. Role & Verification Guards (Pending doctor, Rejected doctor, Patient, Super Admin blocked)
 *   9. Input & Image Validation (Missing patientId, Missing image, Invalid format)
 *  10. Patient Privacy (Patients blocked from accessing screenings)
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';

const NODE_BASE_URL = `http://localhost:${process.env.PORT || 5001}/api`;
const ML_BASE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:5002';

const timestamp = Date.now();
const emails = {
  admin: process.env.SUPER_ADMIN_EMAIL || 'admin@retinacare.ai',
  adminPassword: process.env.SUPER_ADMIN_PASSWORD || 'Admin@Retina2026!',
  doctorA: `dr.alpha.${timestamp}@test.com`,
  doctorB: `dr.beta.${timestamp}@test.com`,
  doctorPending: `dr.pending.${timestamp}@test.com`,
  doctorRejected: `dr.rejected.${timestamp}@test.com`,
  patientA: `patient.alice.${timestamp}@test.com`,
  patientB: `patient.bob.${timestamp}@test.com`,
  patientPending: `patient.pnd.${timestamp}@test.com`,
  patientRejected: `patient.rej.${timestamp}@test.com`,
  password: 'Password@123!',
};

let tokens: Record<string, string> = {};
let ids: Record<string, string> = {};

const sampleImagePath = path.resolve(__dirname, '../../../frontend/src/assets/hero.png');

async function request(baseUrl: string, path: string, options: RequestInit = {}) {
  const url = `${baseUrl}${path}`;
  const res = await fetch(url, options);
  const json: any = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, body: json };
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
  console.log('RetinaCare AI — Phase 5E Retinal Screening Test Suite');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  assert(fs.existsSync(sampleImagePath), `Sample retinal image exists at ${sampleImagePath}`);
  const imageBuffer = fs.readFileSync(sampleImagePath);

  // 1. Verify ML service is running
  console.log('1. Verifying Python ML Service readiness...');
  const mlHealth = await request(ML_BASE_URL, '/health');
  assert(mlHealth.status === 200, 'Python ML service is healthy');
  assert(mlHealth.body.modelLoaded === true, 'EfficientNet-B4 model loaded');

  // 2. Setup Super Admin, Doctors, and Patients
  console.log('\n2. Setting up test accounts and connection states...');
  
  // Super Admin login
  const adminLogin = await request(NODE_BASE_URL, '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: emails.admin, password: emails.adminPassword }),
  });
  assert(adminLogin.status === 200, 'Super Admin logged in');
  tokens.admin = adminLogin.body.data.token;

  // Doctor A (will be verified)
  const docASignup = await request(NODE_BASE_URL, '/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Dr. Alpha Specialist',
      email: emails.doctorA,
      password: emails.password,
      role: 'doctor',
      licenseNumber: `MED-A-${timestamp}`,
      medicalCouncil: 'Medical Council of India',
      specialization: 'Ophthalmology',
      hospital: 'Metro Eye Care',
      yearsOfExperience: 10,
    }),
  });
  ids.doctorA = docASignup.body.data.user.id;
  tokens.doctorA = docASignup.body.data.token;

  // Doctor B (will be verified)
  const docBSignup = await request(NODE_BASE_URL, '/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Dr. Beta Physician',
      email: emails.doctorB,
      password: emails.password,
      role: 'doctor',
      licenseNumber: `MED-B-${timestamp}`,
      medicalCouncil: 'Medical Council of India',
      specialization: 'Ophthalmology',
      hospital: 'Apex Eye Clinic',
      yearsOfExperience: 8,
    }),
  });
  ids.doctorB = docBSignup.body.data.user.id;
  tokens.doctorB = docBSignup.body.data.token;

  // Doctor Pending (remains pending)
  const docPendingSignup = await request(NODE_BASE_URL, '/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Dr. Pending',
      email: emails.doctorPending,
      password: emails.password,
      role: 'doctor',
      licenseNumber: `MED-P-${timestamp}`,
      medicalCouncil: 'State Medical Council',
      specialization: 'Ophthalmology',
      hospital: 'Community Clinic',
      yearsOfExperience: 2,
    }),
  });
  ids.doctorPending = docPendingSignup.body.data.user.id;
  tokens.doctorPending = docPendingSignup.body.data.token;

  // Doctor Rejected (will be rejected)
  const docRejSignup = await request(NODE_BASE_URL, '/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Dr. Rejected',
      email: emails.doctorRejected,
      password: emails.password,
      role: 'doctor',
      licenseNumber: `MED-R-${timestamp}`,
      medicalCouncil: 'State Council',
      specialization: 'Ophthalmology',
      hospital: 'Clinic',
      yearsOfExperience: 1,
    }),
  });
  ids.doctorRejected = docRejSignup.body.data.user.id;
  tokens.doctorRejected = docRejSignup.body.data.token;

  // Approve Doctor A & Doctor B, Reject Doctor Rejected
  await request(NODE_BASE_URL, `/admin/doctors/${ids.doctorA}/approve`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${tokens.admin}` },
  });
  await request(NODE_BASE_URL, `/admin/doctors/${ids.doctorB}/approve`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${tokens.admin}` },
  });
  await request(NODE_BASE_URL, `/admin/doctors/${ids.doctorRejected}/reject`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${tokens.admin}` },
  });

  // Re-login to get fresh tokens
  const docALogin = await request(NODE_BASE_URL, '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: emails.doctorA, password: emails.password }),
  });
  tokens.doctorA = docALogin.body.data.token;

  const docBLogin = await request(NODE_BASE_URL, '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: emails.doctorB, password: emails.password }),
  });
  tokens.doctorB = docBLogin.body.data.token;

  // Create Patient A (Accepted with Doctor A)
  const patientASignup = await request(NODE_BASE_URL, '/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Alice Patient',
      email: emails.patientA,
      password: emails.password,
      role: 'patient',
      dateOfBirth: '1990-04-15',
      gender: 'Female',
      phone: '+1-555-1001',
      medicalHistory: 'Type 2 Diabetes (2019)',
      diabetesHistory: 'HbA1c 7.2%',
      eyeHistory: 'None',
    }),
  });
  ids.patientA = patientASignup.body.data.user.id;
  tokens.patientA = patientASignup.body.data.token;

  // Connect Patient A to Doctor A and Accept
  const connA = await request(NODE_BASE_URL, '/connections', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokens.patientA}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ doctorId: ids.doctorA }),
  });
  const connAId = connA.body.data.connection.id;
  await request(NODE_BASE_URL, `/connections/${connAId}/accept`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${tokens.doctorA}` },
  });

  // Create Patient B (Unconnected to Doctor A)
  const patientBSignup = await request(NODE_BASE_URL, '/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Bob Unconnected',
      email: emails.patientB,
      password: emails.password,
      role: 'patient',
      dateOfBirth: '1982-08-20',
      gender: 'Male',
      phone: '+1-555-1002',
      medicalHistory: 'None',
      diabetesHistory: 'Type 1',
      eyeHistory: 'None',
    }),
  });
  ids.patientB = patientBSignup.body.data.user.id;
  tokens.patientB = patientBSignup.body.data.token;

  // Create Patient Pending (Requested Doctor A but NOT accepted)
  const patientPndSignup = await request(NODE_BASE_URL, '/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Paula Pending',
      email: emails.patientPending,
      password: emails.password,
      role: 'patient',
      dateOfBirth: '1995-10-10',
      gender: 'Female',
      phone: '+1-555-1003',
      medicalHistory: 'None',
      diabetesHistory: 'None',
      eyeHistory: 'None',
    }),
  });
  ids.patientPending = patientPndSignup.body.data.user.id;
  tokens.patientPending = patientPndSignup.body.data.token;
  await request(NODE_BASE_URL, '/connections', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokens.patientPending}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ doctorId: ids.doctorA }),
  });

  // Create Patient Rejected (Requested Doctor A and REJECTED)
  const patientRejSignup = await request(NODE_BASE_URL, '/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Ron Rejected',
      email: emails.patientRejected,
      password: emails.password,
      role: 'patient',
      dateOfBirth: '1970-01-01',
      gender: 'Male',
      phone: '+1-555-1004',
      medicalHistory: 'None',
      diabetesHistory: 'None',
      eyeHistory: 'None',
    }),
  });
  ids.patientRejected = patientRejSignup.body.data.user.id;
  tokens.patientRejected = patientRejSignup.body.data.token;
  const connRej = await request(NODE_BASE_URL, '/connections', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokens.patientRejected}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ doctorId: ids.doctorA }),
  });
  await request(NODE_BASE_URL, `/connections/${connRej.body.data.connection.id}/reject`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${tokens.doctorA}` },
  });

  console.log('     Accounts and relationships prepared successfully.');

  // 3. Test Verified Doctor A creating Screening for Accepted Patient A
  console.log('\n3. Testing POST /api/screenings (Doctor A screening Patient A)...');
  const validForm = new FormData();
  validForm.append('patientId', ids.patientA);
  validForm.append('file', new Blob([imageBuffer], { type: 'image/png' }), 'fundus_left.png');

  const createScreeningRes = await request(NODE_BASE_URL, '/screenings', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokens.doctorA}` },
    body: validForm,
  });

  assert(createScreeningRes.status === 201, 'Screening created successfully (201 Created)');
  assert(createScreeningRes.body.success === true, 'Success flag is true');
  
  const createdScreening = createScreeningRes.body.data.screening;
  const screeningId = createdScreening.id;

  console.log('     Screening Persistence Details:');
  console.log(`       Screening ID : ${screeningId}`);
  console.log(`       Status       : ${createdScreening.status}`);
  console.log(`       Predicted DR : ${createdScreening.aiResult.predictedLabel} (Class ${createdScreening.aiResult.predictedClass})`);
  console.log(`       Confidence   : ${(createdScreening.aiResult.confidence * 100).toFixed(2)}%`);
  console.log(`       Referable    : ${createdScreening.aiResult.referable} (Prob: ${(createdScreening.aiResult.referableProbability * 100).toFixed(2)}%)`);
  console.log(`       Patient      : ${createdScreening.patient.name} (${createdScreening.patient.id})`);
  console.log(`       Doctor       : ${createdScreening.doctor.name} (${createdScreening.doctor.id})`);

  // 4. Verify Screening Model fields and AI Output Structure
  console.log('\n4. Verifying Screening document structure and AI metrics in response...');
  assert(createdScreening.status === 'pending_review', 'Initial status is strictly "pending_review"');
  assert(createdScreening.patientId === ids.patientA, 'patientId matches Patient A');
  assert(createdScreening.doctorId === ids.doctorA, 'doctorId matches Doctor A');
  assert([0, 1, 2, 3, 4].includes(createdScreening.aiResult.predictedClass), 'predictedClass is 0..4');
  assert(typeof createdScreening.aiResult.confidence === 'number', 'confidence is numeric');
  assert(Object.keys(createdScreening.aiResult.classProbabilities).length === 5, '5 class probabilities present');
  assert(typeof createdScreening.aiResult.referable === 'boolean', 'referable is boolean');
  assert(createdScreening.image.originalFilename === 'fundus_left.png', 'Original filename preserved');
  assert(createdScreening.image.mimeType === 'image/png', 'MIME type preserved');

  // 5. Test Doctor listing screenings (GET /api/screenings)
  console.log('\n5. Testing Doctor listing screenings (GET /api/screenings)...');
  const listScreenings = await request(NODE_BASE_URL, '/screenings', {
    headers: { Authorization: `Bearer ${tokens.doctorA}` },
  });
  assert(listScreenings.status === 200, 'Doctor A listed screenings (200 OK)');
  assert(listScreenings.body.data.count >= 1, 'At least 1 screening returned');
  const found = listScreenings.body.data.screenings.find((s: any) => s.id === screeningId);
  assert(!!found, 'Created screening found in doctor history');

  // 6. Test Doctor listing screenings with ?patientId filter
  console.log('\n6. Testing Doctor filtering screenings by patientId (GET /api/screenings?patientId=)...');
  const filteredScreenings = await request(NODE_BASE_URL, `/screenings?patientId=${ids.patientA}`, {
    headers: { Authorization: `Bearer ${tokens.doctorA}` },
  });
  assert(filteredScreenings.status === 200, 'Screenings filtered by patientId');
  assert(filteredScreenings.body.data.screenings.every((s: any) => s.patientId === ids.patientA), 'All results match filtered patientId');

  // 7. Test Doctor retrieving single screening (GET /api/screenings/:id)
  console.log('\n7. Testing Doctor retrieving single screening (GET /api/screenings/:id)...');
  const singleScreening = await request(NODE_BASE_URL, `/screenings/${screeningId}`, {
    headers: { Authorization: `Bearer ${tokens.doctorA}` },
  });
  assert(singleScreening.status === 200, 'Doctor A retrieved single screening');
  assert(singleScreening.body.data.screening.id === screeningId, 'Screening ID matches');
  assert(singleScreening.body.data.screening.patient.email === emails.patientA, 'Patient details populated');

  // 8. Test Ownership Security: Doctor B cannot access Doctor A's screening
  console.log('\n8. Testing Ownership Isolation (Doctor B attempting to access Doctor A screening)...');
  const docBAccess = await request(NODE_BASE_URL, `/screenings/${screeningId}`, {
    headers: { Authorization: `Bearer ${tokens.doctorB}` },
  });
  assert(docBAccess.status === 403, 'Doctor B blocked with 403 Forbidden');
  assert(docBAccess.body.message.includes('permission') || docBAccess.body.message.includes('Access denied'), 'Ownership error message returned');

  // 9. Test Relationship Validation (Unconnected, Pending, Rejected patients blocked)
  console.log('\n9. Testing Doctor-Patient Connection Requirements for Screening...');
  
  // Unconnected patient
  const unconnForm = new FormData();
  unconnForm.append('patientId', ids.patientB);
  unconnForm.append('file', new Blob([imageBuffer], { type: 'image/png' }), 'retina.png');
  const unconnRes = await request(NODE_BASE_URL, '/screenings', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokens.doctorA}` },
    body: unconnForm,
  });
  assert(unconnRes.status === 403, 'Unconnected patient screening rejected with 403 Forbidden');

  // Pending connection patient
  const pndForm = new FormData();
  pndForm.append('patientId', ids.patientPending);
  pndForm.append('file', new Blob([imageBuffer], { type: 'image/png' }), 'retina.png');
  const pndRes = await request(NODE_BASE_URL, '/screenings', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokens.doctorA}` },
    body: pndForm,
  });
  assert(pndRes.status === 403, 'Pending connection patient screening rejected with 403 Forbidden');

  // Rejected connection patient
  const rejForm = new FormData();
  rejForm.append('patientId', ids.patientRejected);
  rejForm.append('file', new Blob([imageBuffer], { type: 'image/png' }), 'retina.png');
  const rejRes = await request(NODE_BASE_URL, '/screenings', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokens.doctorA}` },
    body: rejForm,
  });
  assert(rejRes.status === 403, 'Rejected connection patient screening rejected with 403 Forbidden');

  // 10. Test Role & Verification Authorization
  console.log('\n10. Testing Role and Doctor Verification Access Control...');
  
  // Pending Doctor blocked
  const pDocRes = await request(NODE_BASE_URL, '/screenings', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokens.doctorPending}` },
    body: validForm,
  });
  assert(pDocRes.status === 403, 'Pending doctor blocked with 403 Forbidden');

  // Rejected Doctor blocked
  const rDocRes = await request(NODE_BASE_URL, '/screenings', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokens.doctorRejected}` },
    body: validForm,
  });
  assert(rDocRes.status === 403, 'Rejected doctor blocked with 403 Forbidden');

  // Patient blocked
  const patientRes = await request(NODE_BASE_URL, '/screenings', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokens.patientA}` },
    body: validForm,
  });
  assert(patientRes.status === 403, 'Patient blocked from creating screening (403 Forbidden)');

  // Super Admin blocked from clinical screening endpoint
  const adminRes = await request(NODE_BASE_URL, '/screenings', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokens.admin}` },
    body: validForm,
  });
  assert(adminRes.status === 403, 'Super Admin blocked from clinical screening (403 Forbidden)');

  // 11. Test Input & File Validation
  console.log('\n11. Testing Input & File Validation...');
  
  // Missing patientId
  const noPatientForm = new FormData();
  noPatientForm.append('file', new Blob([imageBuffer], { type: 'image/png' }), 'retina.png');
  const noPatientRes = await request(NODE_BASE_URL, '/screenings', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokens.doctorA}` },
    body: noPatientForm,
  });
  assert(noPatientRes.status === 400, 'Missing patientId rejected with 400 Bad Request');

  // Missing image file
  const noImageForm = new FormData();
  noImageForm.append('patientId', ids.patientA);
  const noImageRes = await request(NODE_BASE_URL, '/screenings', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokens.doctorA}` },
    body: noImageForm,
  });
  assert(noImageRes.status === 400, 'Missing image rejected with 400 Bad Request');

  // Invalid non-image format
  const textFileForm = new FormData();
  textFileForm.append('patientId', ids.patientA);
  textFileForm.append('file', new Blob(['test text'], { type: 'text/plain' }), 'report.txt');
  const textFileRes = await request(NODE_BASE_URL, '/screenings', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokens.doctorA}` },
    body: textFileForm,
  });
  assert(textFileRes.status === 400, 'Invalid MIME type rejected with 400 Bad Request');

  // 12. Patient Privacy Verification
  console.log('\n12. Verifying Patient Privacy Restrictions...');
  const patientListScreenings = await request(NODE_BASE_URL, '/screenings', {
    headers: { Authorization: `Bearer ${tokens.patientA}` },
  });
  assert(patientListScreenings.status === 403, 'Patient cannot list screenings (403 Forbidden)');

  const patientGetSingle = await request(NODE_BASE_URL, `/screenings/${screeningId}`, {
    headers: { Authorization: `Bearer ${tokens.patientA}` },
  });
  assert(patientGetSingle.status === 403, 'Patient cannot retrieve screening by ID (403 Forbidden)');

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 ALL PHASE 5E SCREENING WORKFLOW TESTS PASSED!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
