/**
 * validation.ts — Authentication and Form Validation Utilities
 *
 * Enforces standardized validation rules across RetinaCare AI:
 *   - Email: standard RFC format validation
 *   - Password: 8–72 characters, >=1 uppercase, >=1 lowercase, >=1 digit, >=1 special character
 */

export interface PasswordValidationResult {
  isValid: boolean;
  message: string | null;
  checks: {
    minLength: boolean;
    hasLowercase: boolean;
    hasUppercase: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  };
}

/**
 * Validates an email address format.
 * Returns an error message string if invalid, or null if valid.
 */
export function validateEmail(email: string): string | null {
  if (!email || email.trim() === '') {
    return 'Email is required.';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'Please enter a valid email address.';
  }
  return null;
}

/**
 * Evaluates password constraints and generates a clear, natural language error message
 * detailing all missing requirements if the format is invalid.
 */
export function validatePassword(password: string): string | null {
  if (!password) {
    return 'Password is required.';
  }

  const isTooShort = password.length < 8;
  const isTooLong = password.length > 72;

  if (isTooLong) {
    return 'Password must be at most 72 characters.';
  }

  const missingCriteria: string[] = [];
  if (!/[A-Z]/.test(password)) {
    missingCriteria.push('one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    missingCriteria.push('one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    missingCriteria.push('one number');
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    missingCriteria.push('one special character');
  }

  if (isTooShort) {
    if (missingCriteria.length === 0) {
      return 'Password must be at least 8 characters.';
    }
    if (missingCriteria.length === 1) {
      return `Password must be at least 8 characters and contain at least ${missingCriteria[0]}.`;
    }
    if (missingCriteria.length === 2) {
      return `Password must be at least 8 characters and contain at least ${missingCriteria[0]} and ${missingCriteria[1]}.`;
    }
    const last = missingCriteria.pop();
    return `Password must be at least 8 characters and contain at least ${missingCriteria.join(', ')}, and ${last}.`;
  }

  if (missingCriteria.length > 0) {
    if (missingCriteria.length === 1) {
      return `Password must contain at least ${missingCriteria[0]}.`;
    }
    if (missingCriteria.length === 2) {
      return `Password must contain at least ${missingCriteria[0]} and ${missingCriteria[1]}.`;
    }
    const last = missingCriteria.pop();
    return `Password must contain at least ${missingCriteria.join(', ')}, and ${last}.`;
  }

  return null;
}
