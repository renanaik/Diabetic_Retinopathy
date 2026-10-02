/**
 * testValidation.ts — Automated Verification for Login & Signup Validation Messaging
 */

import 'dotenv/config';
import { validatePassword, validateEmail } from '../utils/validation';

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
  console.log('RetinaCare AI — Authentication Validation Test Suite');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('━━━ STEP 1: Unit Validation Helper Tests ━━━');

  // Case 1: Missing uppercase
  const err1 = validatePassword('password123!');
  assert(err1 !== null && err1.message.includes('one uppercase letter'), 'Password missing uppercase: ' + err1?.message);

  // Case 2: Missing lowercase
  const err2 = validatePassword('PASSWORD123!');
  assert(err2 !== null && err2.message.includes('one lowercase letter'), 'Password missing lowercase: ' + err2?.message);

  // Case 3: Missing number
  const err3 = validatePassword('Password!');
  assert(err3 !== null && err3.message === 'Password must contain at least one number', 'Password missing number: ' + err3?.message);

  // Case 4: Missing special character
  const err4 = validatePassword('Password123');
  assert(err4 !== null && err4.message === 'Password must contain at least one special character', 'Password missing special char: ' + err4?.message);

  // Case 5: Multiple missing requirements (uppercase + special character)
  const err5 = validatePassword('password123');
  assert(
    err5 !== null && err5.message === 'Password must contain at least one uppercase letter and one special character',
    'Password missing uppercase and special char: ' + err5?.message
  );

  // Case 6: Password below minimum length (length 6, all other criteria met)
  const err6 = validatePassword('Pass1!');
  assert(err6 !== null && err6.message === 'Password must be at least 8 characters', 'Password below min length: ' + err6?.message);

  // Case 7: Below min length and missing uppercase
  const err7 = validatePassword('pass1!');
  assert(
    err7 !== null && err7.message === 'Password must be at least 8 characters and contain at least one uppercase letter',
    'Password below min length and missing uppercase: ' + err7?.message
  );

  // Case 8: Invalid email format
  const emailErr = validateEmail('invalid-email-string');
  assert(emailErr !== null && emailErr.message.toLowerCase().includes('email'), 'Invalid email format caught: ' + emailErr?.message);

  // Case 9: Fully valid password
  const validErr = validatePassword('Valid@Password123!');
  assert(validErr === null, 'Valid password passes with no errors');

  console.log('\n━━━ STEP 2: Backend API Integration Tests ━━━');

  // Case 10: Valid format but incorrect credentials (authentication failure)
  console.log('Testing incorrect credentials (valid format)...');
  const wrongCreds = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: emails.admin, password: 'WrongPassword123!' }),
  });
  assert(wrongCreds.status === 401, 'Wrong credentials return 401 Unauthorized');
  assert(wrongCreds.body?.message === 'Invalid email or password.', 'Generic authentication error message maintained: ' + wrongCreds.body?.message);

  // Case 11: Valid format with correct credentials
  console.log('Testing valid login credentials...');
  const correctCreds = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: emails.admin, password: emails.adminPassword }),
  });
  assert(correctCreds.status === 200 && correctCreds.body?.success, 'Correct credentials login successfully (200 OK)');
  assert(Boolean(correctCreds.body?.data?.token), 'JWT token issued successfully');

  // Case 12: Signup with invalid password format
  console.log('Testing signup with invalid password format...');
  const badSignup = await request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Bad Password User',
      email: `test.badpass.${Date.now()}@test.com`,
      password: 'hello',
      role: 'patient',
      dateOfBirth: '1990-01-01',
      gender: 'other',
      phone: '1234567890',
    }),
  });
  assert(badSignup.status === 400, 'Signup with bad password returns 400 Bad Request');
  assert(badSignup.body?.errors?.some((e: any) => e.field === 'password'), 'Signup returns detailed password validation error');

  // Case 13: Signup with valid credentials
  console.log('Testing signup with valid credentials...');
  const goodSignup = await request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Valid Password User',
      email: `test.goodpass.${Date.now()}@test.com`,
      password: 'Secure@Password123!',
      role: 'patient',
      dateOfBirth: '1990-01-01',
      gender: 'other',
      phone: '1234567890',
    }),
  });
  assert(goodSignup.status === 201 && goodSignup.body?.success, 'Signup with valid credentials succeeds (201 Created)');

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ ALL VALIDATION & AUTHENTICATION TESTS PASSED!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
