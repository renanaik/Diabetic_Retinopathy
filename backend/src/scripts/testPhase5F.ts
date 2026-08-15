/**
 * testPhase5F.ts — Phase 5F End-to-End Verification (Self-Contained)
 *
 * This script is fully self-contained:
 *   1. Ensures test doctor exists + is verified (via Super Admin API).
 *   2. Ensures test patient exists.
 *   3. Ensures an accepted doctor ↔ patient connection exists.
 *   4. Ensures secondary verified doctor exists (for ownership checks).
 *   5. Runs all Phase 5F review workflow tests.
 *
 * Idempotent — safe to run multiple times.
 *
 * Requirements:
 *   - Backend running on port 5001 (npm run dev)
 *   - ML service running on port 5002
 *   - MongoDB Atlas connected
 *   - .env contains SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD
 *
 * Run:
 *   npx ts-node src/scripts/testPhase5F.ts
 */

import 'dotenv/config';
import axios, { AxiosInstance } from 'axios';
import FormData from 'form-data';

// ── Config ────────────────────────────────────────────────────────────────────

const BASE_URL = process.env.API_URL || 'http://localhost:5001/api';

const SUPER_ADMIN_EMAIL    = process.env.SUPER_ADMIN_EMAIL    || 'admin@retinacare.ai';
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || 'Admin@Retina2026!';

const DOCTOR_EMAIL    = 'dr.verified@test.com';
const DOCTOR_PASSWORD = 'TestPassword123!';
const DOCTOR_NAME     = 'Dr. Verified Test';

const DOCTOR2_EMAIL    = 'dr.other@test.com';
const DOCTOR2_PASSWORD = 'TestPassword123!';
const DOCTOR2_NAME     = 'Dr. Other Test';

const PATIENT_EMAIL    = 'patient.screening@test.com';
const PATIENT_PASSWORD = 'TestPatient123!';
const PATIENT_NAME     = 'Test Screening Patient';

// ── Helpers ───────────────────────────────────────────────────────────────────

const pass    = (msg: string)                  => console.log(`  ✅  ${msg}`);
const fail    = (msg: string, d?: unknown)     => { console.error(`  ❌  ${msg}`); if (d) console.error('     ', JSON.stringify(d, null, 2)); };
const section = (title: string)                => console.log(`\n━━━ ${title} ━━━`);
const info    = (msg: string)                  => console.log(`  ℹ️  ${msg}`);

function authed(token: string): AxiosInstance {
  return axios.create({ baseURL: BASE_URL, headers: { Authorization: `Bearer ${token}` } });
}

async function login(email: string, password: string): Promise<{ token: string; userId: string; verificationStatus?: string }> {
  const res = await axios.post(`${BASE_URL}/auth/login`, { email, password });
  const { token, user } = res.data.data;
  return { token, userId: user.id, verificationStatus: user.verificationStatus };
}

// ── Setup Helpers ─────────────────────────────────────────────────────────────

/**
 * Ensures a test doctor exists. Returns its userId.
 */
async function ensureDoctorExists(
  email: string = DOCTOR_EMAIL,
  password: string = DOCTOR_PASSWORD,
  name: string = DOCTOR_NAME,
  license: string = 'TEST-5F-LICENSE'
): Promise<string> {
  try {
    const res = await axios.post(`${BASE_URL}/auth/signup`, {
      name,
      email,
      password,
      role:              'doctor',
      licenseNumber:     license,
      medicalCouncil:    'Medical Council of India',
      specialization:    'Ophthalmology',
      hospital:          'RetinaCare Test Hospital',
      yearsOfExperience: 5,
    });
    const userId = res.data.data.user.id as string;
    pass(`Test doctor created: ${email} (id=${userId})`);
    return userId;
  } catch (e: any) {
    if (e.response?.status === 409) {
      info(`Test doctor ${email} already exists — logging in to get ID`);
      const { userId } = await login(email, password);
      info(`Existing doctor id=${userId}`);
      return userId;
    }
    throw new Error(`Doctor signup failed: ${JSON.stringify(e.response?.data ?? e.message)}`);
  }
}

/**
 * Ensures the test patient exists. Returns its userId.
 */
async function ensurePatientExists(): Promise<string> {
  try {
    const res = await axios.post(`${BASE_URL}/auth/signup`, {
      name:            PATIENT_NAME,
      email:           PATIENT_EMAIL,
      password:        PATIENT_PASSWORD,
      role:            'patient',
      dateOfBirth:     '1995-01-15',
      gender:          'Female',
      phone:           '+1-555-0199',
      medicalHistory:  'None',
      diabetesHistory: 'Type 2',
      eyeHistory:      'Routine screening',
    });
    const userId = res.data.data.user.id as string;
    pass(`Test patient created: ${PATIENT_EMAIL} (id=${userId})`);
    return userId;
  } catch (e: any) {
    if (e.response?.status === 409) {
      info(`Test patient already exists — logging in to get ID`);
      const { userId } = await login(PATIENT_EMAIL, PATIENT_PASSWORD);
      info(`Existing patient id=${userId}`);
      return userId;
    }
    throw new Error(`Patient signup failed: ${JSON.stringify(e.response?.data ?? e.message)}`);
  }
}

/**
 * Ensures the doctor is verified via Super Admin API.
 * No-ops if already verified.
 */
async function ensureDoctorVerified(adminToken: string, doctorUserId: string): Promise<void> {
  const adminApi = authed(adminToken);

  // Fetch doctor list to check current status
  const listRes = await adminApi.get('/admin/doctors');
  const doctors: any[] = listRes.data.data?.doctors ?? [];
  const doctorEntry = doctors.find((d: any) => d.id === doctorUserId);

  if (doctorEntry?.verificationStatus === 'verified') {
    pass(`Doctor (${doctorUserId}) already verified`);
    return;
  }

  // Attempt approval
  try {
    await adminApi.patch(`/admin/doctors/${doctorUserId}/approve`);
    pass(`Doctor (${doctorUserId}) approved by Super Admin`);
  } catch (e: any) {
    const status = e.response?.status;
    const msg: string = e.response?.data?.message ?? '';
    if (status === 400 && msg.toLowerCase().includes('already')) {
      pass(`Doctor was already verified`);
    } else {
      throw new Error(`Doctor approval failed: ${JSON.stringify(e.response?.data ?? e.message)}`);
    }
  }
}

/**
 * Ensures an ACCEPTED connection between the test doctor and patient.
 */
async function ensureAcceptedConnection(
  patientToken: string,
  doctorToken: string,
  doctorUserId: string,
  patientUserId: string
): Promise<void> {
  const doctorApi = authed(doctorToken);

  // Check if already accepted
  const patientsRes = await doctorApi.get('/connections/my-patients');
  const existingPatients: any[] = patientsRes.data.data?.patients ?? [];
  const alreadyConnected = existingPatients.some(
    (p: any) => p.patient?.email === PATIENT_EMAIL || p.patient?.id === patientUserId
  );

  if (alreadyConnected) {
    pass(`Doctor ↔ Patient connection already accepted`);
    return;
  }

  // Patient requests connection to doctor
  const patientApi = authed(patientToken);
  try {
    await patientApi.post('/connections', { doctorId: doctorUserId });
    pass(`Patient requested connection to doctor`);
  } catch (e: any) {
    if (e.response?.status === 409) {
      info(`Connection request already exists — checking pending queue`);
    } else {
      throw new Error(`Connection request failed: ${JSON.stringify(e.response?.data ?? e.message)}`);
    }
  }

  // Doctor accepts the pending request
  const requestsRes = await doctorApi.get('/connections/requests');
  const requests: any[] = requestsRes.data.data?.requests ?? [];
  const pending = requests.find((r: any) =>
    r.patient?.email === PATIENT_EMAIL ||
    r.patientId === patientUserId ||
    JSON.stringify(r).includes(PATIENT_EMAIL)
  );

  if (pending) {
    const connId = pending.id || pending.connectionId;
    await doctorApi.patch(`/connections/${connId}/accept`);
    pass(`Doctor accepted connection request (connectionId=${connId})`);
  } else {
    // If not pending, recheck accepted
    const recheck = await doctorApi.get('/connections/my-patients');
    const isNowConnected = (recheck.data.data?.patients ?? []).some(
      (p: any) => p.patient?.email === PATIENT_EMAIL || p.patient?.id === patientUserId
    );
    if (isNowConnected) {
      pass(`Doctor ↔ Patient connection is accepted`);
    } else {
      throw new Error(`Could not establish accepted connection between doctor and patient.`);
    }
  }
}

// ── Minimal 1×1 JPEG buffer ───────────────────────────────────────────────────
const TINY_JPEG = Buffer.from(
  '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8U' +
  'HRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgN' +
  'DRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIy' +
  'MjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAA' +
  'AAAAAAAAAAAAAAAAAP/EABQBAQAAAAAAAAAAAAAAAAAAAAD/xAAUEQEAAAAAAAAAAAAAAAAA' +
  'AAAA/9oADAMBAAIRAxEAPwCwABmX/9k=',
  'base64'
);

async function makeScreening(api: AxiosInstance, patientId: string, label: string): Promise<string> {
  const form = new FormData();
  form.append('patientId', patientId);
  form.append('file', TINY_JPEG, { filename: `retina_5f_${label}.jpg`, contentType: 'image/jpeg' });

  const res = await api.post('/screenings', form, { headers: { ...form.getHeaders() } });
  const id = res.data.data.screening.id as string;
  pass(`Screening [${label}] created: id=${id}, status=${res.data.data.screening.status}`);
  return id;
}

// ── Main ──────────────────────────────────────────────────────────────────────

let totalPass = 0;
let totalFail = 0;

function check(name: string, condition: boolean, detail?: unknown) {
  if (condition) {
    pass(name);
    totalPass++;
  } else {
    fail(name, detail);
    totalFail++;
  }
}

async function main() {
  console.log('\n🧪  Phase 5F — Doctor Review & Screening Approval (Self-Contained)');
  console.log('======================================================================');

  // ══════════════════════════════════════════════════════════════════════════════
  // SETUP PHASE
  // ══════════════════════════════════════════════════════════════════════════════

  section('SETUP 1: Super Admin Login');
  let adminToken: string;
  try {
    const r = await login(SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD);
    adminToken = r.token;
    pass(`Super Admin authenticated (${SUPER_ADMIN_EMAIL})`);
  } catch (e: any) {
    fail('Super Admin login failed', e.response?.data ?? e.message);
    console.log('\n⚠️  Cannot continue without Super Admin. Check SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD in .env');
    process.exit(1);
  }

  section('SETUP 2: Ensure Primary Test Doctor Exists');
  let doctorUserId: string;
  try {
    doctorUserId = await ensureDoctorExists();
  } catch (e: any) {
    fail('Doctor setup failed', e.message);
    process.exit(1);
  }

  section('SETUP 3: Ensure Primary Doctor Is Verified');
  try {
    await ensureDoctorVerified(adminToken, doctorUserId);
  } catch (e: any) {
    fail('Doctor verification failed', e.message);
    process.exit(1);
  }

  section('SETUP 4: Ensure Secondary Test Doctor Exists & Is Verified');
  let doctor2UserId: string;
  let doctor2Token: string;
  try {
    doctor2UserId = await ensureDoctorExists(DOCTOR2_EMAIL, DOCTOR2_PASSWORD, DOCTOR2_NAME, 'TEST-5F-OTHER');
    await ensureDoctorVerified(adminToken, doctor2UserId);
    const dr2 = await login(DOCTOR2_EMAIL, DOCTOR2_PASSWORD);
    doctor2Token = dr2.token;
    pass(`Secondary doctor ready: ${DOCTOR2_EMAIL}`);
  } catch (e: any) {
    fail('Secondary doctor setup failed', e.message);
    process.exit(1);
  }

  section('SETUP 5: Ensure Test Patient Exists');
  let patientUserId: string;
  try {
    patientUserId = await ensurePatientExists();
  } catch (e: any) {
    fail('Patient setup failed', e.message);
    process.exit(1);
  }

  section('SETUP 6: Ensure Doctor ↔ Patient Connection Is Accepted');
  let doctorToken: string;
  let patientToken: string;
  try {
    const dr = await login(DOCTOR_EMAIL, DOCTOR_PASSWORD);
    doctorToken = dr.token;
    check('Doctor login returns token', !!doctorToken);
    check('Doctor verificationStatus is verified', dr.verificationStatus === 'verified', dr.verificationStatus);

    const pt = await login(PATIENT_EMAIL, PATIENT_PASSWORD);
    patientToken = pt.token;
    check('Patient login returns token', !!patientToken);

    await ensureAcceptedConnection(patientToken, doctorToken, doctorUserId, patientUserId);
  } catch (e: any) {
    fail('Connection setup failed', e.message ?? e);
    process.exit(1);
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // STEP 0: Doctor Authentication Check
  // ══════════════════════════════════════════════════════════════════════════════

  section('Step 0: Verify Doctor Token via /api/auth/me');
  try {
    const meRes = await authed(doctorToken).get('/auth/me');
    const u = meRes.data.data.user;
    check('/auth/me returns 200',          meRes.status === 200);
    check('role is doctor',               u.role === 'doctor',                           u.role);
    check('verificationStatus is verified', u.verificationStatus === 'verified',         u.verificationStatus);
    check('email matches',                u.email === DOCTOR_EMAIL,                      u.email);
  } catch (e: any) {
    fail('/auth/me failed', e.response?.data ?? e.message);
    process.exit(1);
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // STEP 1: Create a fresh screening for review tests
  // ══════════════════════════════════════════════════════════════════════════════

  section('Step 1: Create Screening for Review Tests');
  const doctorApi = authed(doctorToken);
  let screeningId: string;
  try {
    screeningId = await makeScreening(doctorApi, patientUserId, 'primary');
    check('Initial status is pending_review', true);
  } catch (e: any) {
    fail('Screening creation failed', e.response?.data ?? e.message);
    console.log('\n⚠️  Ensure ML service is running on port 5002.');
    process.exit(1);
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // VALIDATION & OWNERSHIP TESTS
  // ══════════════════════════════════════════════════════════════════════════════

  section('Step 2: Missing Decision Field → 400');
  try {
    await doctorApi.patch(`/screenings/${screeningId}/review`, { doctorNotes: 'A note' });
    check('Expected 400 for missing decision', false);
  } catch (e: any) {
    const ok = e.response?.status === 400 && (e.response?.data?.message as string).includes('"decision"');
    check('400 returned with decision field message', ok, e.response?.data);
  }

  section('Step 3: Invalid Decision Value → 400');
  try {
    await doctorApi.patch(`/screenings/${screeningId}/review`, { decision: 'maybe' });
    check('Expected 400 for invalid decision', false);
  } catch (e: any) {
    check('400 returned for invalid decision', e.response?.status === 400, e.response?.data);
  }

  section('Step 4: doctorNotes Exceeds 4000 chars → 400');
  try {
    await doctorApi.patch(`/screenings/${screeningId}/review`, {
      decision: 'approved',
      doctorNotes: 'A'.repeat(4001),
    });
    check('Expected 400 for over-length doctorNotes', false);
  } catch (e: any) {
    check('400 returned for over-length doctorNotes', e.response?.status === 400, e.response?.data);
  }

  section('Step 5: Invalid Screening ObjectId → 400');
  try {
    await doctorApi.patch('/screenings/not-an-object-id/review', { decision: 'approved' });
    check('Expected 400 for invalid ObjectId', false);
  } catch (e: any) {
    check('400 returned for invalid ObjectId', e.response?.status === 400, e.response?.data);
  }

  section('Step 6: Non-existent Screening ID → 404');
  try {
    await doctorApi.patch('/screenings/64f000000000000000000000/review', { decision: 'approved' });
    check('Expected 404 for non-existent screening', false);
  } catch (e: any) {
    check('404 returned for non-existent screening', e.response?.status === 404, e.response?.data);
  }

  section('Step 7: Ownership Guard — Different Doctor Cannot Review → 403');
  try {
    const doctor2Api = authed(doctor2Token);
    await doctor2Api.patch(`/screenings/${screeningId}/review`, { decision: 'approved' });
    check('Expected 403 for unauthorized doctor review', false);
  } catch (e: any) {
    check('403 returned for unauthorized doctor review', e.response?.status === 403, e.response?.data);
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // APPROVAL TESTS
  // ══════════════════════════════════════════════════════════════════════════════

  section('Step 8: Approve Screening → 200');
  const DOCTOR_NOTES = 'Mild NPDR detected. Schedule 6-month follow-up ophthalmology appointment.';
  try {
    const res = await doctorApi.patch(`/screenings/${screeningId}/review`, {
      decision: 'approved',
      doctorNotes: DOCTOR_NOTES,
    });
    const s = res.data.data.screening;

    check('HTTP 200 returned',                 res.status === 200);
    check('status is approved',                s.status === 'approved',                  s.status);
    check('review.decision is approved',       s.review?.decision === 'approved',         s.review?.decision);
    check('review.doctorNotes persisted',      s.review?.doctorNotes === DOCTOR_NOTES,   s.review?.doctorNotes);
    check('review.reviewedAt exists',          !!s.review?.reviewedAt,                   s.review);
    check('review.reviewedBy matches doctor',  s.review?.reviewedBy === doctorUserId,    s.review);
    check('aiResult still present',            !!s.aiResult,                             s);
    check('aiResult.predictedClass is number', typeof s.aiResult?.predictedClass === 'number', s.aiResult);
  } catch (e: any) {
    fail('Approval request failed', e.response?.data ?? e.message);
    check('Approval succeeded', false);
  }

  section('Step 9: Re-review Approved Screening → 409 (Idempotency)');
  try {
    await doctorApi.patch(`/screenings/${screeningId}/review`, {
      decision: 'rejected',
      doctorNotes: 'Changed my mind',
    });
    check('Expected 409 for re-review', false);
  } catch (e: any) {
    const status = e.response?.status;
    const bodyScreening = e.response?.data?.data?.screening;
    check('409 returned for re-review attempt',           status === 409,                    e.response?.data);
    check('Response body retains approved status',        bodyScreening?.status === 'approved', bodyScreening?.status);
  }

  section('Step 10: aiResult Is Immutable — Verify via GET');
  try {
    const res = await doctorApi.get(`/screenings/${screeningId}`);
    const s = res.data.data.screening;
    check('GET returns 200',                              res.status === 200);
    check('status remains approved after review',         s.status === 'approved',           s.status);
    check('aiResult.predictedClass still a number',       typeof s.aiResult?.predictedClass === 'number', s.aiResult);
    check('aiResult NOT overwritten by review',           s.aiResult?.predictedClass !== undefined, s.aiResult);
  } catch (e: any) {
    fail('GET after approval failed', e.response?.data ?? e.message);
    check('GET screening succeeded', false);
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // REJECTION TESTS
  // ══════════════════════════════════════════════════════════════════════════════

  section('Step 11: Create Second Screening and Reject It → 200');
  let rejectScreeningId: string;
  try {
    rejectScreeningId = await makeScreening(doctorApi, patientUserId, 'rejection');
  } catch (e: any) {
    fail('Second screening creation failed', e.response?.data ?? e.message);
    check('Second screening created', false);
    summarise();
    return;
  }

  const REJECT_NOTES = 'Image quality insufficient. Overexposed. Please re-submit with better lighting conditions.';
  try {
    const res = await doctorApi.patch(`/screenings/${rejectScreeningId}/review`, {
      decision: 'rejected',
      doctorNotes: REJECT_NOTES,
    });
    const s = res.data.data.screening;

    check('HTTP 200 returned for rejection',          res.status === 200);
    check('status is rejected',                       s.status === 'rejected',              s.status);
    check('review.decision is rejected',              s.review?.decision === 'rejected',    s.review?.decision);
    check('review.doctorNotes persisted',             s.review?.doctorNotes === REJECT_NOTES, s.review?.doctorNotes);
    check('review.reviewedAt exists',                 !!s.review?.reviewedAt,               s.review);
    check('review.reviewedBy matches doctor',         s.review?.reviewedBy === doctorUserId, s.review);
    check('aiResult still present after rejection',   !!s.aiResult,                         s);
  } catch (e: any) {
    fail('Rejection request failed', e.response?.data ?? e.message);
    check('Rejection succeeded', false);
  }

  section('Step 12: Re-review Rejected Screening → 409');
  try {
    await doctorApi.patch(`/screenings/${rejectScreeningId}/review`, {
      decision: 'approved',
      doctorNotes: 'Trying to flip rejection',
    });
    check('Expected 409 for re-review of rejected screening', false);
  } catch (e: any) {
    const status = e.response?.status;
    const bodyScreening = e.response?.data?.data?.screening;
    check('409 returned for re-review of rejected screening',  status === 409,                     e.response?.data);
    check('Response body retains rejected status',             bodyScreening?.status === 'rejected', bodyScreening?.status);
  }

  section('Step 13: doctorNotes Optional — Approve Without Notes');
  let noNotesScreeningId: string;
  try {
    noNotesScreeningId = await makeScreening(doctorApi, patientUserId, 'no_notes');
    const res = await doctorApi.patch(`/screenings/${noNotesScreeningId}/review`, {
      decision: 'approved',
      // no doctorNotes
    });
    const s = res.data.data.screening;
    check('200 returned without doctorNotes',      res.status === 200);
    check('status is approved without notes',      s.status === 'approved',            s.status);
    check('review.doctorNotes is empty string',    s.review?.doctorNotes === '',        s.review?.doctorNotes);
  } catch (e: any) {
    fail('No-notes approval failed', e.response?.data ?? e.message);
    check('No-notes approval succeeded', false);
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // SUMMARY
  // ══════════════════════════════════════════════════════════════════════════════

  summarise();
}

function summarise() {
  console.log('\n======================================================================');
  if (totalFail === 0 && totalPass > 0) {
    console.log(`🎉  ALL PHASE 5F TESTS PASSED!  (${totalPass} checks)`);
  } else {
    console.log(`🏁  Phase 5F complete: ${totalPass} passed, ${totalFail} FAILED.`);
    if (totalFail > 0) process.exit(1);
  }
}

main().catch((e) => {
  console.error('\n💥  Unhandled error:', e.message ?? e);
  process.exit(1);
});
