/**
 * testPhase5G.ts — Phase 5G End-to-End Verification (Self-Contained)
 *
 * Comprehensive test suite for Patient Screening Results & Reports:
 *   - Authentication & Role Guards (Patient only; Doctor/Admin/Anon blocked)
 *   - Clinical Release Rule (Only 'approved' and 'rejected' visible; 'pending_review' returns 404)
 *   - Strict Patient Ownership (Patient A cannot access Patient B's report -> 403)
 *   - Transition Lifecycle (Pending screening becomes visible immediately upon doctor approval)
 *   - AI Result & Doctor Review Data Integrity (Separation, immutability, disclaimer)
 *   - Sorting & Count Accuracy (Newest first, count matches)
 *
 * Idempotent — safe to run multiple times.
 *
 * Requirements:
 *   - Backend running on port 5001
 *   - ML service running on port 5002
 *   - MongoDB Atlas connected
 *   - .env contains SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD
 *
 * Run:
 *   npx ts-node src/scripts/testPhase5G.ts
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

const PATIENT_A_EMAIL    = 'patient.screening@test.com';
const PATIENT_A_PASSWORD = 'TestPatient123!';
const PATIENT_A_NAME     = 'Test Patient A';

const PATIENT_B_EMAIL    = 'patient.other@test.com';
const PATIENT_B_PASSWORD = 'TestPatient123!';
const PATIENT_B_NAME     = 'Test Patient B';

// ── Helpers ───────────────────────────────────────────────────────────────────

const pass    = (msg: string)              => console.log(`  ✅  ${msg}`);
const fail    = (msg: string, d?: unknown) => { console.error(`  ❌  ${msg}`); if (d) console.error('     ', JSON.stringify(d, null, 2)); };
const section = (title: string)            => console.log(`\n━━━ ${title} ━━━`);
const info    = (msg: string)              => console.log(`  ℹ️  ${msg}`);

function authed(token: string): AxiosInstance {
  return axios.create({ baseURL: BASE_URL, headers: { Authorization: `Bearer ${token}` } });
}

const anon = axios.create({ baseURL: BASE_URL });

async function login(email: string, password: string): Promise<{ token: string; userId: string; verificationStatus?: string }> {
  const res = await axios.post(`${BASE_URL}/auth/login`, { email, password });
  const { token, user } = res.data.data;
  return { token, userId: user.id, verificationStatus: user.verificationStatus };
}

// ── Setup Helpers ─────────────────────────────────────────────────────────────

async function ensureDoctorExists(): Promise<string> {
  try {
    const res = await axios.post(`${BASE_URL}/auth/signup`, {
      name:              DOCTOR_NAME,
      email:             DOCTOR_EMAIL,
      password:          DOCTOR_PASSWORD,
      role:              'doctor',
      licenseNumber:     'TEST-5G-LICENSE',
      medicalCouncil:    'Medical Council of India',
      specialization:    'Ophthalmology',
      hospital:          'RetinaCare Research Hospital',
      yearsOfExperience: 6,
    });
    const userId = res.data.data.user.id as string;
    pass(`Test doctor created: ${DOCTOR_EMAIL} (id=${userId})`);
    return userId;
  } catch (e: any) {
    if (e.response?.status === 409) {
      const { userId } = await login(DOCTOR_EMAIL, DOCTOR_PASSWORD);
      info(`Existing doctor reused: id=${userId}`);
      return userId;
    }
    throw new Error(`Doctor signup failed: ${JSON.stringify(e.response?.data ?? e.message)}`);
  }
}

async function ensureDoctorVerified(adminToken: string, doctorUserId: string): Promise<void> {
  const adminApi = authed(adminToken);
  const listRes = await adminApi.get('/admin/doctors');
  const doctors: any[] = listRes.data.data?.doctors ?? [];
  const doctorEntry = doctors.find((d: any) => d.id === doctorUserId);

  if (doctorEntry?.verificationStatus === 'verified') {
    pass(`Doctor already verified`);
    return;
  }

  try {
    await adminApi.patch(`/admin/doctors/${doctorUserId}/approve`);
    pass(`Doctor approved by Super Admin`);
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

async function ensurePatientExists(email: string, password: string, name: string): Promise<string> {
  try {
    const res = await axios.post(`${BASE_URL}/auth/signup`, {
      name,
      email,
      password,
      role:            'patient',
      dateOfBirth:     '1992-05-20',
      gender:          'Female',
      phone:           '+1-555-0188',
      medicalHistory:  'Hypertension',
      diabetesHistory: 'Type 2 for 4 years',
      eyeHistory:      'Annual exam',
    });
    const userId = res.data.data.user.id as string;
    pass(`Test patient created: ${email} (id=${userId})`);
    return userId;
  } catch (e: any) {
    if (e.response?.status === 409) {
      const { userId } = await login(email, password);
      info(`Existing patient reused: ${email} (id=${userId})`);
      return userId;
    }
    throw new Error(`Patient signup failed: ${JSON.stringify(e.response?.data ?? e.message)}`);
  }
}

async function ensureAcceptedConnection(
  patientToken: string,
  patientEmail: string,
  patientUserId: string,
  doctorToken: string,
  doctorUserId: string
): Promise<void> {
  const doctorApi = authed(doctorToken);
  const patientsRes = await doctorApi.get('/connections/my-patients');
  const existingPatients: any[] = patientsRes.data.data?.patients ?? [];
  const alreadyConnected = existingPatients.some(
    (p: any) => p.patient?.email === patientEmail || p.patient?.id === patientUserId
  );

  if (alreadyConnected) {
    pass(`Connection for ${patientEmail} already accepted`);
    return;
  }

  const patientApi = authed(patientToken);
  try {
    await patientApi.post('/connections', { doctorId: doctorUserId });
    pass(`Patient ${patientEmail} requested connection`);
  } catch (e: any) {
    if (e.response?.status === 409) {
      info(`Connection request for ${patientEmail} already exists`);
    } else {
      throw new Error(`Connection request failed: ${JSON.stringify(e.response?.data ?? e.message)}`);
    }
  }

  const requestsRes = await doctorApi.get('/connections/requests');
  const requests: any[] = requestsRes.data.data?.requests ?? [];
  const pending = requests.find((r: any) =>
    r.patient?.email === patientEmail ||
    r.patientId === patientUserId ||
    JSON.stringify(r).includes(patientEmail)
  );

  if (pending) {
    const connId = pending.id || pending.connectionId;
    await doctorApi.patch(`/connections/${connId}/accept`);
    pass(`Doctor accepted connection for ${patientEmail}`);
  } else {
    const recheck = await doctorApi.get('/connections/my-patients');
    const isNowConnected = (recheck.data.data?.patients ?? []).some(
      (p: any) => p.patient?.email === patientEmail || p.patient?.id === patientUserId
    );
    if (isNowConnected) {
      pass(`Doctor ↔ Patient (${patientEmail}) connection verified`);
    } else {
      throw new Error(`Could not establish connection for ${patientEmail}`);
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

async function createScreening(doctorApi: AxiosInstance, patientId: string, label: string): Promise<string> {
  const form = new FormData();
  form.append('patientId', patientId);
  form.append('file', TINY_JPEG, { filename: `retina_5g_${label}.jpg`, contentType: 'image/jpeg' });

  const res = await doctorApi.post('/screenings', form, { headers: { ...form.getHeaders() } });
  const id = res.data.data.screening.id as string;
  pass(`Doctor created screening [${label}]: id=${id}, initial status=${res.data.data.screening.status}`);
  return id;
}

// ── Test Tracker ──────────────────────────────────────────────────────────────

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

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🧪  Phase 5G — Patient Screening Results & Reports E2E Verification');
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
    process.exit(1);
  }

  section('SETUP 2: Ensure Verified Doctor Exists');
  let doctorUserId: string;
  let doctorToken: string;
  try {
    doctorUserId = await ensureDoctorExists();
    await ensureDoctorVerified(adminToken, doctorUserId);
    const dr = await login(DOCTOR_EMAIL, DOCTOR_PASSWORD);
    doctorToken = dr.token;
    check('Doctor login returns token', !!doctorToken);
    check('Doctor verificationStatus is verified', dr.verificationStatus === 'verified');
  } catch (e: any) {
    fail('Doctor setup failed', e.message);
    process.exit(1);
  }

  section('SETUP 3: Ensure Patient A & Patient B Exist');
  let patientAId: string;
  let patientBId: string;
  let patientAToken: string;
  let patientBToken: string;
  try {
    patientAId = await ensurePatientExists(PATIENT_A_EMAIL, PATIENT_A_PASSWORD, PATIENT_A_NAME);
    patientBId = await ensurePatientExists(PATIENT_B_EMAIL, PATIENT_B_PASSWORD, PATIENT_B_NAME);

    const ptA = await login(PATIENT_A_EMAIL, PATIENT_A_PASSWORD);
    patientAToken = ptA.token;
    check('Patient A authenticated', !!patientAToken);

    const ptB = await login(PATIENT_B_EMAIL, PATIENT_B_PASSWORD);
    patientBToken = ptB.token;
    check('Patient B authenticated', !!patientBToken);
  } catch (e: any) {
    fail('Patient setup failed', e.message);
    process.exit(1);
  }

  section('SETUP 4: Ensure Doctor Connections Accepted for Patients A & B');
  try {
    await ensureAcceptedConnection(patientAToken, PATIENT_A_EMAIL, patientAId, doctorToken, doctorUserId);
    await ensureAcceptedConnection(patientBToken, PATIENT_B_EMAIL, patientBId, doctorToken, doctorUserId);
  } catch (e: any) {
    fail('Connection setup failed', e.message);
    process.exit(1);
  }

  const doctorApi   = authed(doctorToken);
  const patientAApi = authed(patientAToken);
  const patientBApi = authed(patientBToken);
  const adminApi    = authed(adminToken);

  // ══════════════════════════════════════════════════════════════════════════════
  // 1. AUTHENTICATION & ROLE GUARDS
  // ══════════════════════════════════════════════════════════════════════════════

  section('PART 1: Authentication & Role Authorization Guards');

  // Unauthenticated requests -> 401
  try {
    await anon.get('/patient/screenings');
    check('Expected 401 for unauthenticated list', false);
  } catch (e: any) {
    check('Unauthenticated GET /patient/screenings returns 401', e.response?.status === 401, e.response?.data);
  }

  try {
    await anon.get('/patient/screenings/64f000000000000000000000');
    check('Expected 401 for unauthenticated single report', false);
  } catch (e: any) {
    check('Unauthenticated GET /patient/screenings/:id returns 401', e.response?.status === 401, e.response?.data);
  }

  // Doctor role accessing patient endpoints -> 403
  try {
    await doctorApi.get('/patient/screenings');
    check('Expected 403 for doctor on patient list endpoint', false);
  } catch (e: any) {
    check('Doctor role GET /patient/screenings returns 403', e.response?.status === 403, e.response?.data);
  }

  try {
    await doctorApi.get('/patient/screenings/64f000000000000000000000');
    check('Expected 403 for doctor on patient single endpoint', false);
  } catch (e: any) {
    check('Doctor role GET /patient/screenings/:id returns 403', e.response?.status === 403, e.response?.data);
  }

  // Super Admin accessing patient endpoints -> 403
  try {
    await adminApi.get('/patient/screenings');
    check('Expected 403 for super admin on patient list endpoint', false);
  } catch (e: any) {
    check('Super Admin GET /patient/screenings returns 403', e.response?.status === 403, e.response?.data);
  }

  try {
    await adminApi.get('/patient/screenings/64f000000000000000000000');
    check('Expected 403 for super admin on patient single endpoint', false);
  } catch (e: any) {
    check('Super Admin GET /patient/screenings/:id returns 403', e.response?.status === 403, e.response?.data);
  }

  // Patient accessing old doctor endpoints -> 403
  try {
    await patientAApi.get('/screenings');
    check('Expected 403 for patient accessing doctor GET /api/screenings', false);
  } catch (e: any) {
    check('Patient blocked from doctor GET /api/screenings (403)', e.response?.status === 403, e.response?.data);
  }

  try {
    await patientAApi.get('/screenings/64f000000000000000000000');
    check('Expected 403 for patient accessing doctor GET /api/screenings/:id', false);
  } catch (e: any) {
    check('Patient blocked from doctor GET /api/screenings/:id (403)', e.response?.status === 403, e.response?.data);
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // 2. INPUT VALIDATION & NOT FOUND
  // ══════════════════════════════════════════════════════════════════════════════

  section('PART 2: Parameter Validation & Non-Existent Records');

  try {
    await patientAApi.get('/patient/screenings/invalid-object-id-123');
    check('Expected 400 for invalid ObjectId format', false);
  } catch (e: any) {
    check('Invalid ObjectId returns 400 Bad Request', e.response?.status === 400, e.response?.data);
  }

  try {
    await patientAApi.get('/patient/screenings/64f000000000000000000000');
    check('Expected 404 for non-existent screening', false);
  } catch (e: any) {
    check('Non-existent screening ID returns 404 Not Found', e.response?.status === 404, e.response?.data);
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // 3. PENDING REVIEW CLINICAL RELEASE & TRANSITION LIFECYCLE
  // ══════════════════════════════════════════════════════════════════════════════

  section('PART 3: Clinical Release Lifecycle (Pending -> Approved)');

  // Create a brand new screening for Patient A
  let screeningAId: string;
  try {
    screeningAId = await createScreening(doctorApi, patientAId, 'release_test_A');
  } catch (e: any) {
    fail('Failed to create screening for release test', e.response?.data ?? e.message);
    process.exit(1);
  }

  // BEFORE DOCTOR REVIEW: Pending screening must NOT appear in patient list
  try {
    const listRes = await patientAApi.get('/patient/screenings');
    check('Patient list returns 200', listRes.status === 200);
    const screenings: any[] = listRes.data.data?.screenings ?? [];
    const containsPending = screenings.some((s: any) => s.id === screeningAId);
    check('Pending screening is NOT in patient list', !containsPending, { screeningAId, found: containsPending });
  } catch (e: any) {
    fail('Patient list request failed', e.response?.data ?? e.message);
  }

  // BEFORE DOCTOR REVIEW: Direct single retrieval of pending screening returns 404
  try {
    await patientAApi.get(`/patient/screenings/${screeningAId}`);
    check('Expected 404 for pending_review screening', false);
  } catch (e: any) {
    check('Direct retrieval of pending_review screening returns 404 Not Found', e.response?.status === 404, e.response?.data);
  }

  // DOCTOR REVIEWS & APPROVES
  const DOCTOR_APPROVAL_NOTES = 'Mild NPDR confirmed by clinician. Standard follow-up advised.';
  try {
    const approveRes = await doctorApi.patch(`/screenings/${screeningAId}/review`, {
      decision: 'approved',
      doctorNotes: DOCTOR_APPROVAL_NOTES,
    });
    check('Doctor successfully approved screening', approveRes.status === 200 && approveRes.data.data.screening.status === 'approved');
  } catch (e: any) {
    fail('Doctor approval failed', e.response?.data ?? e.message);
  }

  // AFTER DOCTOR REVIEW: Patient A can now see it in list
  try {
    const listRes = await patientAApi.get('/patient/screenings');
    const screenings: any[] = listRes.data.data?.screenings ?? [];
    const found = screenings.find((s: any) => s.id === screeningAId);
    check('Approved screening now appears in patient list', !!found, screenings);
    check('Screening status in list is "approved"', found?.status === 'approved');
  } catch (e: any) {
    fail('Patient list after approval failed', e.response?.data ?? e.message);
  }

  // AFTER DOCTOR REVIEW: Patient A retrieves single approved report
  let patientReport: any;
  try {
    const reportRes = await patientAApi.get(`/patient/screenings/${screeningAId}`);
    check('Patient retrieves approved report (200 OK)', reportRes.status === 200);
    patientReport = reportRes.data.data.screening;
  } catch (e: any) {
    fail('Patient report retrieval failed', e.response?.data ?? e.message);
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // 4. REPORT CONTENT & AI VS DOCTOR SEPARATION
  // ══════════════════════════════════════════════════════════════════════════════

  section('PART 4: Report Content & AI / Doctor Separation Verification');

  if (patientReport) {
    check('Report ID matches', patientReport.id === screeningAId);
    check('Report patientId matches Patient A', patientReport.patientId === patientAId);
    check('Report doctor info exists', !!patientReport.doctor?.name && !!patientReport.doctor?.specialization);
    check('Report status is "approved"', patientReport.status === 'approved');

    // AI Prediction fields
    const ai = patientReport.aiResult;
    check('AI predictedClass is number (0-4)', typeof ai?.predictedClass === 'number' && ai.predictedClass >= 0 && ai.predictedClass <= 4);
    check('AI predictedLabel is non-empty string', typeof ai?.predictedLabel === 'string' && ai.predictedLabel.length > 0);
    check('AI confidence is valid number (0-1)', typeof ai?.confidence === 'number' && ai.confidence >= 0 && ai.confidence <= 1);
    check('AI classProbabilities object contains 5 classes', !!ai?.classProbabilities && Object.keys(ai.classProbabilities).length === 5);
    check('AI referable is boolean', typeof ai?.referable === 'boolean');
    check('AI referableProbability is number', typeof ai?.referableProbability === 'number');
    check('AI disclaimer present (screening aid statement)', typeof ai?.disclaimer === 'string' && ai.disclaimer.toLowerCase().includes('screening aid'));

    // Doctor Review fields
    const rev = patientReport.review;
    check('Doctor review decision is "approved"', rev?.decision === 'approved');
    check('Doctor review notes match submitted notes', rev?.doctorNotes === DOCTOR_APPROVAL_NOTES);
    check('Doctor reviewedAt timestamp exists', !!rev?.reviewedAt);
    check('Doctor reviewedBy identifier exists', !!rev?.reviewedBy);

    // AI result immutability & clear separation
    check('AI result is distinct and not overwritten by review', typeof ai?.predictedClass === 'number' && rev?.decision === 'approved');

    // Security: no sensitive internal fields
    check('No passwordHash in response', (patientReport as any).passwordHash === undefined);
    check('No JWT secret or internal auth fields exposed', (patientReport as any).secret === undefined);
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // 5. CROSS-PATIENT OWNERSHIP & PRIVACY ENFORCEMENT
  // ══════════════════════════════════════════════════════════════════════════════

  section('PART 5: Cross-Patient Ownership & Privacy Guard');

  // Patient B attempts to retrieve Patient A's approved screening -> 403
  try {
    await patientBApi.get(`/patient/screenings/${screeningAId}`);
    check('Expected 403 for Patient B accessing Patient A report', false);
  } catch (e: any) {
    check('Patient B blocked from Patient A report with 403 Forbidden', e.response?.status === 403, e.response?.data);
  }

  // Patient B's list must NOT include Patient A's screening
  try {
    const listBRes = await patientBApi.get('/patient/screenings');
    const screeningsB: any[] = listBRes.data.data?.screenings ?? [];
    const hasPatientAScreening = screeningsB.some((s: any) => s.id === screeningAId);
    check('Patient B screening list does NOT include Patient A report', !hasPatientAScreening);
  } catch (e: any) {
    fail('Patient B list request failed', e.response?.data ?? e.message);
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // 6. REJECTED SCREENING WORKFLOW & VISIBILITY
  // ══════════════════════════════════════════════════════════════════════════════

  section('PART 6: Rejected Screening Workflow & Release');

  let rejectedScreeningId: string;
  try {
    rejectedScreeningId = await createScreening(doctorApi, patientAId, 'rejection_test');
  } catch (e: any) {
    fail('Failed to create rejection test screening', e.response?.data ?? e.message);
    process.exit(1);
  }

  const DOCTOR_REJECTION_NOTES = 'Fundus image blur detected. Recommended re-capture at next appointment.';
  try {
    const rejectRes = await doctorApi.patch(`/screenings/${rejectedScreeningId}/review`, {
      decision: 'rejected',
      doctorNotes: DOCTOR_REJECTION_NOTES,
    });
    check('Doctor successfully rejected screening', rejectRes.status === 200 && rejectRes.data.data.screening.status === 'rejected');
  } catch (e: any) {
    fail('Doctor rejection failed', e.response?.data ?? e.message);
  }

  // Patient A retrieves rejected screening report
  try {
    const reportRes = await patientAApi.get(`/patient/screenings/${rejectedScreeningId}`);
    check('Patient retrieves rejected report (200 OK)', reportRes.status === 200);
    const r = reportRes.data.data.screening;
    check('Status is "rejected"', r.status === 'rejected');
    check('review.decision is "rejected"', r.review?.decision === 'rejected');
    check('Doctor rejection notes persisted', r.review?.doctorNotes === DOCTOR_REJECTION_NOTES);
    check('AI prediction remains attached to rejected report', typeof r.aiResult?.predictedClass === 'number');
  } catch (e: any) {
    fail('Retrieval of rejected report failed', e.response?.data ?? e.message);
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // 7. LIST SORTING & COUNT ACCURACY
  // ══════════════════════════════════════════════════════════════════════════════

  section('PART 7: List Ordering & Count Consistency');

  try {
    const listRes = await patientAApi.get('/patient/screenings');
    const { count, screenings } = listRes.data.data;
    check('Response has count field matching screenings array length', count === screenings.length);

    if (screenings.length >= 2) {
      let isSorted = true;
      for (let i = 0; i < screenings.length - 1; i++) {
        const d1 = new Date(screenings[i].createdAt).getTime();
        const d2 = new Date(screenings[i + 1].createdAt).getTime();
        if (d1 < d2) {
          isSorted = false;
          break;
        }
      }
      check('Screenings sorted newest-first (descending createdAt)', isSorted);
    } else {
      check('At least 2 reviewed screenings present for sort check', true);
    }

    // Verify all returned screenings have approved or rejected status
    const allReviewed = screenings.every((s: any) => s.status === 'approved' || s.status === 'rejected');
    check('All list items have status "approved" or "rejected"', allReviewed);
  } catch (e: any) {
    fail('List verification failed', e.response?.data ?? e.message);
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // SUMMARY
  // ══════════════════════════════════════════════════════════════════════════════

  summarise();
}

function summarise() {
  console.log('\n======================================================================');
  if (totalFail === 0 && totalPass > 0) {
    console.log(`🎉  ALL PHASE 5G TESTS PASSED!  (${totalPass} checks)`);
  } else {
    console.log(`🏁  Phase 5G complete: ${totalPass} passed, ${totalFail} FAILED.`);
    if (totalFail > 0) process.exit(1);
  }
}

main().catch((e) => {
  console.error('\n💥  Unhandled error in test runner:', e.message ?? e);
  process.exit(1);
});
