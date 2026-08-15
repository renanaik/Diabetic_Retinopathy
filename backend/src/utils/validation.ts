/**
 * validation.ts — Inline request body validation helpers
 *
 * No external validation framework.
 * Returns typed error messages for consistent API responses.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ValidationError {
  field: string;
  message: string;
}

// ─── Field validators ─────────────────────────────────────────────────────────

export function validateName(name: unknown): ValidationError | null {
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return { field: 'name', message: 'Name must be at least 2 characters' };
  }
  if (name.trim().length > 100) {
    return { field: 'name', message: 'Name must be at most 100 characters' };
  }
  return null;
}

export function validateEmail(email: unknown): ValidationError | null {
  if (!email || typeof email !== 'string' || email.trim() === '') {
    return { field: 'email', message: 'Email is required' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { field: 'email', message: 'Email is not valid' };
  }
  return null;
}

/**
 * Password policy:
 *   - 8–72 chars (bcrypt processes max 72 bytes)
 *   - at least 1 uppercase letter
 *   - at least 1 digit
 *   - at least 1 special character
 */
export function validatePassword(password: unknown): ValidationError | null {
  if (!password || typeof password !== 'string') {
    return { field: 'password', message: 'Password is required' };
  }
  if (password.length < 8) {
    return { field: 'password', message: 'Password must be at least 8 characters' };
  }
  if (password.length > 72) {
    return { field: 'password', message: 'Password must be at most 72 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { field: 'password', message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { field: 'password', message: 'Password must contain at least one number' };
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return { field: 'password', message: 'Password must contain at least one special character' };
  }
  return null;
}

export function validateRole(role: unknown): ValidationError | null {
  const allowed = ['patient', 'doctor'];
  if (!role || typeof role !== 'string' || !allowed.includes(role)) {
    return { field: 'role', message: 'Role must be either "patient" or "doctor"' };
  }
  return null;
}

export function validatePositiveNumber(
  value: unknown,
  field: string,
  label: string
): ValidationError | null {
  const n = Number(value);
  if (value === undefined || value === null || value === '' || isNaN(n)) {
    return { field, message: `${label} is required and must be a number` };
  }
  if (n < 0) {
    return { field, message: `${label} cannot be negative` };
  }
  return null;
}

export function validateRequiredString(
  value: unknown,
  field: string,
  label: string
): ValidationError | null {
  if (!value || typeof value !== 'string' || value.trim() === '') {
    return { field, message: `${label} is required` };
  }
  return null;
}

export function validateObjectId(
  id: unknown,
  field: string,
  label: string = 'ID'
): ValidationError | null {
  if (!id || typeof id !== 'string' || id.trim() === '') {
    return { field, message: `${label} is required` };
  }
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  if (!objectIdRegex.test(id.trim())) {
    return { field, message: `${label} must be a valid 24-character hexadecimal ID` };
  }
  return null;
}

// ─── Aggregate validators ─────────────────────────────────────────────────────

/**
 * Collects all validation errors from an array of checks.
 * Returns null if all pass, or the array of errors.
 */
export function collectErrors(
  checks: Array<ValidationError | null>
): ValidationError[] | null {
  const errors = checks.filter((e): e is ValidationError => e !== null);
  return errors.length > 0 ? errors : null;
}
