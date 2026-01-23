// Centralized validation utilities for all forms

// CNIC Validation (Pakistani format: 12345-1234567-1)
export const CNIC_PATTERN = /^[0-9]{5}-[0-9]{7}-[0-9]$/;
export const validateCnic = (cnic: string, required = true): string | undefined => {
  if (!cnic.trim()) {
    return required ? 'CNIC is required' : undefined;
  }
  if (!CNIC_PATTERN.test(cnic)) {
    return 'CNIC must be in format 12345-1234567-1';
  }
  return undefined;
};

// Phone Validation (Pakistani format: 0300-1234567)
export const PHONE_PATTERN = /^0[0-9]{3}-[0-9]{7}$/;
export const validatePhone = (phone: string, required = true): string | undefined => {
  if (!phone.trim()) {
    return required ? 'Phone number is required' : undefined;
  }
  if (!PHONE_PATTERN.test(phone)) {
    return 'Phone must be in format 0300-1234567';
  }
  return undefined;
};

// Required field validation
export const validateRequired = (value: string | number | undefined, fieldName: string): string | undefined => {
  if (value === undefined || value === null || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} is required`;
  }
  return undefined;
};

// Min length validation
export const validateMinLength = (value: string, minLength: number, fieldName: string): string | undefined => {
  if (value && value.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`;
  }
  return undefined;
};

// Positive number validation
export const validatePositiveNumber = (value: number, fieldName: string, required = true): string | undefined => {
  if (required && (value === undefined || value === null)) {
    return `${fieldName} is required`;
  }
  if (value !== undefined && value !== null && value <= 0) {
    return `${fieldName} must be greater than 0`;
  }
  return undefined;
};

// Non-negative number validation
export const validateNonNegative = (value: number, fieldName: string): string | undefined => {
  if (value !== undefined && value < 0) {
    return `${fieldName} cannot be negative`;
  }
  return undefined;
};

// Email validation
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const validateEmail = (email: string, required = false): string | undefined => {
  if (!email.trim()) {
    return required ? 'Email is required' : undefined;
  }
  if (!EMAIL_PATTERN.test(email)) {
    return 'Invalid email format';
  }
  return undefined;
};

// Date validation
export const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
export const validateDate = (date: string, required = true, fieldName = 'Date'): string | undefined => {
  if (!date.trim()) {
    return required ? `${fieldName} is required` : undefined;
  }
  if (!DATE_PATTERN.test(date)) {
    return `${fieldName} must be in format YYYY-MM-DD`;
  }
  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) {
    return `Invalid ${fieldName.toLowerCase()}`;
  }
  return undefined;
};

// B-Form validation (Pakistani format)
export const validateBForm = (bForm: string, required = true): string | undefined => {
  if (!bForm.trim()) {
    return required ? 'B-Form Number is required' : undefined;
  }
  if (bForm.length < 5) {
    return 'B-Form Number is too short';
  }
  return undefined;
};

// GR Number validation
export const GR_PATTERN = /^GR-\d{4}-\d{4}$/;
export const validateGrNumber = (gr: string, required = false): string | undefined => {
  if (!gr.trim()) {
    return required ? 'GR Number is required' : undefined;
  }
  // GR numbers are auto-generated, so just basic check
  return undefined;
};

// Combine multiple errors
export const combineErrors = (...errors: (string | undefined)[]): string | undefined => {
  return errors.find(e => e !== undefined);
};

// Generic form validation helper
export type ValidationErrors<T> = Partial<Record<keyof T, string>>;

export const hasErrors = <T extends object>(errors: ValidationErrors<T>): boolean => {
  return Object.values(errors).some(error => error !== undefined);
};
