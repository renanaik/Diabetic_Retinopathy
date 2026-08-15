/**
 * testPhase5D.ts — Automated End-to-End Test Suite for Phase 5D ML Inference
 *
 * Tests:
 *   1. Python ML Service Health & Model Verification
 *   2. Direct Python /predict Endpoint
 *   3. Node.js Express /api/ml/predict Endpoint via Verified Doctor
 *   4. Output Structure & Probability Math Verification
 *   5. Security & Access Control (Patient, Pending Doctor, Rejected Doctor, Super Admin blocked)
 *   6. Upload Validation (Missing file, Invalid non-image format)
 *   7. Multiple Sequential Predictions (Singleton Persistence)
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
  verifiedDoctor: `dr.retina.verified.${timestamp}@test.com`,
  pendingDoctor: `dr.retina.pending.${timestamp}@test.com`,
  rejectedDoctor: `dr.retina.rejected.${timestamp}@test.com`,
  patient: `patient.test.${timestamp}@test.com`,
  password: 'Password@123!',
};

let tokens: Record<string, string> = {};
let doctorIds: Record<string, string> = {};

// Find a real test image from the repository
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
  console.log('RetinaCare AI — Phase 5D ML Inference Test Suite');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Verify sample image exists for testing
  assert(fs.existsSync(sampleImagePath), `Test sample image exists at ${sampleImagePath}`);
  const imageBuffer = fs.readFileSync(sampleImagePath);

  // 1. Test Python ML Service Health
  console.log('1. Checking Python ML Service Health (GET /health)...');
  const mlHealth = await request(ML_BASE_URL, '/health');
  assert(mlHealth.status === 200, 'Python ML service is healthy (200)');
  assert(mlHealth.body.modelLoaded === true, 'EfficientNet-B4 model is loaded in memory');
  assert(mlHealth.body.classes === 5, 'Model configured for 5 classes');
  console.log(`     Device: ${mlHealth.body.device}, Architecture: ${mlHealth.body.architecture}`);

  // 2. Setup Users for Access Control Testing
  console.log('\n2. Setting up test users (Admin, Verified Doctor, Pending Doctor, Rejected Doctor, Patient)...');
  
  // Super Admin login
  const adminLogin = await request(NODE_BASE_URL, '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: emails.admin, password: emails.adminPassword }),
  });
  assert(adminLogin.status === 200, 'Super Admin login succeeded');
  tokens.admin = adminLogin.body.data.token;

  // Verified Doctor signup & approval
  const vDocSignup = await request(NODE_BASE_URL, '/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Dr. Evelyn Reed',
      email: emails.verifiedDoctor,
      password: emails.password,
      role: 'doctor',
      licenseNumber: `MED-V-${timestamp}`,
      medicalCouncil: 'National Medical Council',
      specialization: 'Ophthalmology',
      hospital: 'Vision Research Center',
      yearsOfExperience: 12,
    }),
  });
  assert(vDocSignup.status === 201, 'Verified Doctor registered');
  doctorIds.verified = vDocSignup.body.data.user.id;
  tokens.verifiedDoctor = vDocSignup.body.data.token;

  // Super Admin approves verified doctor
  const approveDoc = await request(NODE_BASE_URL, `/admin/doctors/${doctorIds.verified}/approve`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${tokens.admin}` },
  });
  assert(approveDoc.status === 200, 'Doctor approved to verified status');

  // Re-login to get updated token if needed
  const vDocLogin = await request(NODE_BASE_URL, '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: emails.verifiedDoctor, password: emails.password }),
  });
  tokens.verifiedDoctor = vDocLogin.body.data.token;

  // Pending Doctor signup
  const pDocSignup = await request(NODE_BASE_URL, '/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Dr. Pending Doe',
      email: emails.pendingDoctor,
      password: emails.password,
      role: 'doctor',
      licenseNumber: `MED-P-${timestamp}`,
      medicalCouncil: 'Medical Council',
      specialization: 'Ophthalmology',
      hospital: 'City Clinic',
      yearsOfExperience: 3,
    }),
  });
  assert(pDocSignup.status === 201, 'Pending Doctor registered');
  tokens.pendingDoctor = pDocSignup.body.data.token;

  // Rejected Doctor signup & rejection
  const rDocSignup = await request(NODE_BASE_URL, '/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Dr. Rejected Smith',
      email: emails.rejectedDoctor,
      password: emails.password,
      role: 'doctor',
      licenseNumber: `MED-R-${timestamp}`,
      medicalCouncil: 'State Medical Council',
      specialization: 'Ophthalmology',
      hospital: 'Private Clinic',
      yearsOfExperience: 1,
    }),
  });
  assert(rDocSignup.status === 201, 'Rejected Doctor registered');
  doctorIds.rejected = rDocSignup.body.data.user.id;
  tokens.rejectedDoctor = rDocSignup.body.data.token;

  await request(NODE_BASE_URL, `/admin/doctors/${doctorIds.rejected}/reject`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${tokens.admin}` },
  });

  const rDocLogin = await request(NODE_BASE_URL, '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: emails.rejectedDoctor, password: emails.password }),
  });
  tokens.rejectedDoctor = rDocLogin.body.data.token;

  // Patient signup
  const patientSignup = await request(NODE_BASE_URL, '/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Sarah Connor',
      email: emails.patient,
      password: emails.password,
      role: 'patient',
      dateOfBirth: '1985-02-14',
      gender: 'Female',
      phone: '+1-555-4321',
      medicalHistory: 'Type 2 Diabetes',
      diabetesHistory: 'HbA1c 7.5%',
      eyeHistory: 'Annual checkup',
    }),
  });
  assert(patientSignup.status === 201, 'Patient registered');
  tokens.patient = patientSignup.body.data.token;

  // 3. Test Direct Python /predict Endpoint
  console.log('\n3. Testing Direct Python Inference (POST http://127.0.0.1:5002/predict)...');
  const pythonFormData = new FormData();
  pythonFormData.append('file', new Blob([imageBuffer], { type: 'image/png' }), 'hero.png');

  const directPyPredict = await request(ML_BASE_URL, '/predict', {
    method: 'POST',
    body: pythonFormData,
  });
  assert(directPyPredict.status === 200, 'Direct Python prediction succeeded (200)');
  assert(directPyPredict.body.success === true, 'Success flag is true');
  assert(typeof directPyPredict.body.data.predictedClass === 'number', 'predictedClass is a number (0-4)');
  assert(typeof directPyPredict.body.data.predictedLabel === 'string', 'predictedLabel is a string');
  assert(typeof directPyPredict.body.data.confidence === 'number', 'confidence is a number');
  assert(typeof directPyPredict.body.data.referable === 'boolean', 'referable triage is boolean');

  // 4. Test Node.js Backend POST /api/ml/predict via Verified Doctor
  console.log('\n4. Testing Node.js API (POST /api/ml/predict) via Verified Doctor...');
  const nodeFormData = new FormData();
  nodeFormData.append('image', new Blob([imageBuffer], { type: 'image/png' }), 'retina_sample.png');

  const nodePredict = await request(NODE_BASE_URL, '/ml/predict', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tokens.verifiedDoctor}`,
    },
    body: nodeFormData,
  });

  assert(nodePredict.status === 200, 'Node.js /api/ml/predict succeeded (200)');
  assert(nodePredict.body.success === true, 'Response indicates success');
  
  const pred = nodePredict.body.data.prediction;
  console.log('     Prediction Results:');
  console.log(`       Predicted Class : ${pred.predictedClass} (${pred.predictedLabel})`);
  console.log(`       Confidence      : ${(pred.confidence * 100).toFixed(2)}%`);
  console.log(`       Referable       : ${pred.referable}`);
  console.log(`       Referable Prob  : ${(pred.referableProbability * 100).toFixed(2)}%`);
  console.log(`       Class Probs     : ${JSON.stringify(pred.classProbabilities)}`);
  console.log(`       Doctor Info     : ${nodePredict.body.data.doctor.name} (${nodePredict.body.data.doctor.id})`);

  // 5. Verify Structure & Probability Distribution Math
  console.log('\n5. Verifying Prediction Structure and Mathematical Consistency...');
  assert([0, 1, 2, 3, 4].includes(pred.predictedClass), 'predictedClass is between 0 and 4');
  assert(
    ['No DR', 'Mild DR', 'Moderate DR', 'Severe DR', 'Proliferative DR'].includes(pred.predictedLabel),
    'predictedLabel matches expected class name'
  );
  assert(Object.keys(pred.classProbabilities).length === 5, 'All 5 classes present in classProbabilities');
  
  const probSum = Object.values(pred.classProbabilities).reduce((a: any, b: any) => a + b, 0) as number;
  assert(Math.abs(probSum - 1.0) < 0.01, `Probabilities sum to ~1.0 (actual sum: ${probSum.toFixed(4)})`);
  assert(
    pred.referable === [2, 3, 4].includes(pred.predictedClass),
    'referable flag aligns with predicted class in [2, 3, 4]'
  );
  assert(!!pred.disclaimer, 'Disclaimer string is present');

  // 6. Test Security & Access Control
  console.log('\n6. Testing Security & Access Control on POST /api/ml/predict...');

  // Patient blocked
  const patientBlocked = await request(NODE_BASE_URL, '/ml/predict', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokens.patient}` },
    body: nodeFormData,
  });
  assert(patientBlocked.status === 403, 'Patient is blocked from ML endpoint (403 Forbidden)');

  // Pending doctor blocked
  const pendingDocBlocked = await request(NODE_BASE_URL, '/ml/predict', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokens.pendingDoctor}` },
    body: nodeFormData,
  });
  assert(pendingDocBlocked.status === 403, 'Pending doctor is blocked from ML endpoint (403 Forbidden)');

  // Rejected doctor blocked
  const rejectedDocBlocked = await request(NODE_BASE_URL, '/ml/predict', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokens.rejectedDoctor}` },
    body: nodeFormData,
  });
  assert(rejectedDocBlocked.status === 403, 'Rejected doctor is blocked from ML endpoint (403 Forbidden)');

  // Super Admin blocked from clinical ML endpoint
  const adminBlocked = await request(NODE_BASE_URL, '/ml/predict', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokens.admin}` },
    body: nodeFormData,
  });
  assert(adminBlocked.status === 403, 'Super Admin is blocked from clinical screening endpoint (403 Forbidden)');

  // Unauthenticated blocked
  const unauthBlocked = await request(NODE_BASE_URL, '/ml/predict', {
    method: 'POST',
    body: nodeFormData,
  });
  assert(unauthBlocked.status === 401, 'Unauthenticated request is rejected (401 Unauthorized)');

  // 7. Test Input Validation
  console.log('\n7. Testing Input Validation on /api/ml/predict...');

  // Missing image file
  const emptyForm = new FormData();
  const missingFileRes = await request(NODE_BASE_URL, '/ml/predict', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokens.verifiedDoctor}` },
    body: emptyForm,
  });
  assert(missingFileRes.status === 400, 'Missing file returns 400 Bad Request');

  // Invalid non-image file (text file)
  const invalidForm = new FormData();
  invalidForm.append('image', new Blob(['not an image content'], { type: 'text/plain' }), 'document.txt');
  const invalidFileRes = await request(NODE_BASE_URL, '/ml/predict', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokens.verifiedDoctor}` },
    body: invalidForm,
  });
  assert(invalidFileRes.status === 400, 'Invalid file MIME type returns 400 Bad Request');

  // 8. Test Multiple Sequential Predictions (Singleton model stability)
  console.log('\n8. Testing Multiple Sequential Predictions (Singleton persistence)...');
  for (let i = 1; i <= 3; i++) {
    const seqForm = new FormData();
    seqForm.append('file', new Blob([imageBuffer], { type: 'image/png' }), `seq_test_${i}.png`);
    const seqRes = await request(NODE_BASE_URL, '/ml/predict', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokens.verifiedDoctor}` },
      body: seqForm,
    });
    assert(seqRes.status === 200, `Sequential prediction #${i} succeeded`);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 ALL PHASE 5D ML INFERENCE TESTS PASSED SUCCESSFULLY!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
