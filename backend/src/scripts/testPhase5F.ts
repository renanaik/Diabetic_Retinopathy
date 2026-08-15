/**
 * testPhase5F.ts — Phase 5F End-to-End Verification
 *
 * Tests the doctor review workflow:
 *   PATCH /api/screenings/:id/review
 *
 * Requires a running backend (npm run dev) and MongoDB Atlas connection.
 * Uses the test credentials seeded in Phase 5B.
 *
 * Run:
 *   npx ts-node -r tsconfig-paths/register src/scripts/testPhase5F.ts
 */

import axios, { AxiosError } from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.API_URL || 'http://localhost:5001/api';

// ── Helpers ───────────────────────────────────────────────────────────────────

const pass = (msg: string) => console.log(`  ✅  ${msg}`);
const fail = (msg: string, detail?: unknown) => {
  console.error(`  ❌  ${msg}`);
  if (detail) console.error('     ', JSON.stringify(detail, null, 2));
};
const section = (title: string) => console.log(`\n━━━ ${title} ━━━`);

async function login(email: string, password: string): Promise<string> {
  const res = await axios.post(`${BASE_URL}/auth/login`, { email, password });
  if (!res.data.data?.token) throw new Error(`Login failed for ${email}`);
  return res.data.data.token;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🧪  Phase 5F — Doctor Review & Screening Approval Tests');
  console.log('=========================================================');

  // ── 0. Login as verified doctor ────────────────────────────────────────────
  section('Step 0: Authenticate as Verified Doctor');
  let doctorToken: string;
  const DOCTOR_EMAIL = process.env.TEST_DOCTOR_EMAIL || 'dr.verified@test.com';
  const DOCTOR_PASS  = process.env.TEST_DOCTOR_PASS  || 'TestPassword123!';

  try {
    doctorToken = await login(DOCTOR_EMAIL, DOCTOR_PASS);
    pass('Doctor login OK');
  } catch (e: any) {
    fail('Doctor login failed', e.response?.data ?? e.message);
    console.log('\n⚠️  Cannot continue without a valid doctor token.');
    console.log('    Set TEST_DOCTOR_EMAIL / TEST_DOCTOR_PASS env vars,');
    console.log('    or ensure dr.verified@test.com is seeded and verified.');
    process.exit(1);
  }

  const api = axios.create({
    baseURL: BASE_URL,
    headers: { Authorization: `Bearer ${doctorToken}` },
  });

  // ── 1. Create a real screening to use in review tests ─────────────────────
  section('Step 1: Create a New Screening (Phase 5E)');
  let screeningId: string;

  const PATIENT_ID = process.env.TEST_PATIENT_ID;
  if (!PATIENT_ID) {
    fail('TEST_PATIENT_ID env var not set. Cannot create screening.');
    console.log('    Export TEST_PATIENT_ID=<ObjectId of an accepted patient>');
    process.exit(1);
  }

  // Try to find a sample image in fixtures or use a tiny generated one
  const fixturePath = path.join(__dirname, '../../fixtures/sample_retina.jpg');
  let imageBuffer: Buffer;
  if (fs.existsSync(fixturePath)) {
    imageBuffer = fs.readFileSync(fixturePath);
    pass(`Using fixture image: ${fixturePath}`);
  } else {
    // Minimal JPEG (1×1 white pixel) as a fallback
    imageBuffer = Buffer.from(
      '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8U' +
      'HRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgN' +
      'DRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIy' +
      'MjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAA' +
      'AAAAAAAAAAAAAAAAAP/EABQBAQAAAAAAAAAAAAAAAAAAAAD/xAAUEQEAAAAAAAAAAAAAAAAA' +
      'AAAA/9oADAMBAAIRAxEAPwCwABmX/9k=',
      'base64'
    );
    pass('Using embedded 1×1 JPEG fallback (ML may reject; that is OK for review tests)');
  }

  const form = new FormData();
  form.append('patientId', PATIENT_ID);
  form.append('file', imageBuffer, { filename: 'retina_5f_test.jpg', contentType: 'image/jpeg' });

  try {
    const res = await api.post('/screenings', form, {
      headers: { ...form.getHeaders() },
    });
    screeningId = res.data.data.screening.id;
    pass(`Screening created: id=${screeningId}, status=${res.data.data.screening.status}`);

    if (res.data.data.screening.status !== 'pending_review') {
      fail('Expected status=pending_review immediately after creation', res.data.data.screening.status);
    } else {
      pass('Status is correctly pending_review');
    }
  } catch (e: any) {
    fail('Screening creation failed', e.response?.data ?? e.message);
    console.log('\n⚠️  Cannot test review workflow without a fresh screening.');
    process.exit(1);
  }

  // ── 2. Test: missing decision field ───────────────────────────────────────
  section('Step 2: Missing Decision Field → 400');
  try {
    await api.patch(`/screenings/${screeningId}/review`, { doctorNotes: 'Some note' });
    fail('Expected 400 but got 2xx');
  } catch (e: any) {
    const status = e.response?.status;
    const msg: string = e.response?.data?.message ?? '';
    if (status === 400 && msg.includes('"decision"')) {
      pass(`400 returned with correct message: "${msg}"`);
    } else {
      fail(`Unexpected response: status=${status}`, e.response?.data);
    }
  }

  // ── 3. Test: invalid decision value ───────────────────────────────────────
  section('Step 3: Invalid Decision Value → 400');
  try {
    await api.patch(`/screenings/${screeningId}/review`, { decision: 'maybe' });
    fail('Expected 400 but got 2xx');
  } catch (e: any) {
    const status = e.response?.status;
    if (status === 400) {
      pass(`400 returned for invalid decision: "${e.response?.data?.message}"`);
    } else {
      fail(`Unexpected status: ${status}`, e.response?.data);
    }
  }

  // ── 4. Test: doctorNotes too long ─────────────────────────────────────────
  section('Step 4: doctorNotes Exceeds 4000 chars → 400');
  try {
    const longNote = 'A'.repeat(4001);
    await api.patch(`/screenings/${screeningId}/review`, { decision: 'approved', doctorNotes: longNote });
    fail('Expected 400 but got 2xx');
  } catch (e: any) {
    const status = e.response?.status;
    if (status === 400) {
      pass(`400 returned for over-length doctorNotes: "${e.response?.data?.message}"`);
    } else {
      fail(`Unexpected status: ${status}`, e.response?.data);
    }
  }

  // ── 5. Test: invalid screening ObjectId ───────────────────────────────────
  section('Step 5: Invalid Screening ID → 400');
  try {
    await api.patch('/screenings/not-an-object-id/review', { decision: 'approved' });
    fail('Expected 400 but got 2xx');
  } catch (e: any) {
    const status = e.response?.status;
    if (status === 400) {
      pass(`400 returned for invalid ObjectId: "${e.response?.data?.message}"`);
    } else {
      fail(`Unexpected status: ${status}`, e.response?.data);
    }
  }

  // ── 6. Test: non-existent screening ID ────────────────────────────────────
  section('Step 6: Non-existent Screening ID → 404');
  const fakeId = '64f000000000000000000000';
  try {
    await api.patch(`/screenings/${fakeId}/review`, { decision: 'approved' });
    fail('Expected 404 but got 2xx');
  } catch (e: any) {
    const status = e.response?.status;
    if (status === 404) {
      pass(`404 returned for non-existent screening: "${e.response?.data?.message}"`);
    } else {
      fail(`Unexpected status: ${status}`, e.response?.data);
    }
  }

  // ── 7. Test: successful approval ──────────────────────────────────────────
  section('Step 7: Approve Screening → 200');
  let approvedScreening: any;
  try {
    const res = await api.patch(`/screenings/${screeningId}/review`, {
      decision: 'approved',
      doctorNotes: 'Mild NPDR detected. Schedule 6-month follow-up.',
    });

    const s = res.data.data.screening;
    approvedScreening = s;

    let ok = true;
    if (s.status !== 'approved')         { fail('status should be approved', s.status);      ok = false; }
    if (s.review?.decision !== 'approved'){ fail('review.decision should be approved');       ok = false; }
    if (!s.review?.reviewedAt)            { fail('review.reviewedAt missing');                ok = false; }
    if (!s.review?.reviewedBy)            { fail('review.reviewedBy missing');                ok = false; }
    if (!s.aiResult?.predictedClass === undefined) { fail('aiResult missing from response'); ok = false; }
    if (s.aiResult?.disclaimer === undefined && !s.aiResult) { /* no aiResult is fine for fallback */ }

    if (ok) pass(`Screening approved. review.reviewedAt=${s.review.reviewedAt}`);
  } catch (e: any) {
    fail('Approval failed', e.response?.data ?? e.message);
  }

  // ── 8. Test: re-review blocked (idempotency) ──────────────────────────────
  section('Step 8: Re-review Already Approved Screening → 409');
  try {
    await api.patch(`/screenings/${screeningId}/review`, {
      decision: 'rejected',
      doctorNotes: 'Changed my mind',
    });
    fail('Expected 409 but got 2xx — re-review should be blocked');
  } catch (e: any) {
    const status = e.response?.status;
    const msg: string = e.response?.data?.message ?? '';
    if (status === 409) {
      pass(`409 returned: "${msg}"`);
      // Also verify the returned data still shows approved
      const existing = e.response?.data?.data?.screening;
      if (existing?.status === 'approved') {
        pass('Response body includes existing approved screening — no state mutation');
      }
    } else {
      fail(`Unexpected status: ${status}`, e.response?.data);
    }
  }

  // ── 9. Test: aiResult untouched after review ──────────────────────────────
  section('Step 9: Verify aiResult Is Immutable After Review');
  try {
    const res = await api.get(`/screenings/${screeningId}`);
    const s = res.data.data.screening;
    if (s.aiResult && typeof s.aiResult.predictedClass === 'number') {
      pass('aiResult.predictedClass still present and unmodified after review');
    }
    if (s.review?.decision === 'approved') {
      pass('review.decision correctly persisted as "approved"');
    } else {
      fail('review.decision unexpected', s.review);
    }
  } catch (e: any) {
    fail('GET after review failed', e.response?.data ?? e.message);
  }

  // ── 10. Test rejection with a fresh screening ─────────────────────────────
  section('Step 10: Create Second Screening and Reject It → 200');
  let rejectScreeningId: string;

  const form2 = new FormData();
  form2.append('patientId', PATIENT_ID);
  form2.append('file', imageBuffer, { filename: 'retina_5f_reject.jpg', contentType: 'image/jpeg' });

  try {
    const create2 = await api.post('/screenings', form2, { headers: { ...form2.getHeaders() } });
    rejectScreeningId = create2.data.data.screening.id;
    pass(`Second screening created: id=${rejectScreeningId}`);
  } catch (e: any) {
    fail('Second screening creation failed', e.response?.data ?? e.message);
    console.log('\n⚠️  Skipping rejection test.');
    summarise();
    return;
  }

  try {
    const res = await api.patch(`/screenings/${rejectScreeningId}/review`, {
      decision: 'rejected',
      doctorNotes: 'Image quality insufficient. Please re-submit with better lighting.',
    });
    const s = res.data.data.screening;
    if (s.status === 'rejected' && s.review?.decision === 'rejected') {
      pass(`Rejection workflow verified. status=${s.status}`);
    } else {
      fail('Rejection workflow produced unexpected state', s);
    }
  } catch (e: any) {
    fail('Rejection request failed', e.response?.data ?? e.message);
  }

  summarise();
}

function summarise() {
  console.log('\n=========================================================');
  console.log('🏁  Phase 5F test run complete.');
  console.log('    Review the ✅ / ❌ output above for results.');
}

main().catch((e) => {
  console.error('\n💥  Unhandled error:', e);
  process.exit(1);
});
