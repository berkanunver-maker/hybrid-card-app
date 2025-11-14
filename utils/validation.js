// utils/validation.js

/**
 * Validates email address with comprehensive rules
 * - Checks for valid format
 * - Prevents common typos and issues
 * - Maximum length: 254 characters (RFC 5321)
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' };
  }

  const trimmedEmail = email.trim();

  // Check length
  if (trimmedEmail.length === 0) {
    return { valid: false, error: 'Email is required' };
  }

  if (trimmedEmail.length > 254) {
    return { valid: false, error: 'Email is too long (max 254 characters)' };
  }

  // Comprehensive email regex (RFC 5322 compliant)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!emailRegex.test(trimmedEmail)) {
    return { valid: false, error: 'Invalid email format' };
  }

  // Additional checks
  const parts = trimmedEmail.split('@');
  if (parts.length !== 2) {
    return { valid: false, error: 'Invalid email format' };
  }

  const [localPart, domain] = parts;

  // Check local part (before @)
  if (localPart.length === 0 || localPart.length > 64) {
    return { valid: false, error: 'Invalid email format' };
  }

  // Check domain part (after @)
  if (domain.length === 0 || !domain.includes('.')) {
    return { valid: false, error: 'Invalid email domain' };
  }

  // Check for consecutive dots
  if (trimmedEmail.includes('..')) {
    return { valid: false, error: 'Invalid email format' };
  }

  // Check for dots at the beginning or end
  if (localPart.startsWith('.') || localPart.endsWith('.') ||
      domain.startsWith('.') || domain.endsWith('.')) {
    return { valid: false, error: 'Invalid email format' };
  }

  return { valid: true, error: null };
};

/**
 * Validates password with security requirements
 * - Minimum 8 characters (increased from 6)
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - Maximum 128 characters
 */
export const validatePassword = (password, options = {}) => {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumber = true,
    requireSpecialChar = false,
    maxLength = 128
  } = options;

  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password is required' };
  }

  if (password.length === 0) {
    return { valid: false, error: 'Password is required' };
  }

  if (password.length < minLength) {
    return { valid: false, error: `Password must be at least ${minLength} characters` };
  }

  if (password.length > maxLength) {
    return { valid: false, error: `Password is too long (max ${maxLength} characters)` };
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one uppercase letter' };
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one lowercase letter' };
  }

  if (requireNumber && !/[0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number' };
  }

  if (requireSpecialChar && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one special character' };
  }

  // Check for common weak passwords
  const weakPasswords = [
    'password', 'password123', '12345678', 'qwerty123', 'abc123456',
    'letmein', 'welcome123', 'admin123', 'user12345'
  ];

  if (weakPasswords.includes(password.toLowerCase())) {
    return { valid: false, error: 'This password is too common. Please choose a stronger password' };
  }

  return { valid: true, error: null };
};

/**
 * Validates display name / full name
 * - Minimum 2 characters
 * - Maximum 100 characters
 * - Only letters, spaces, and common name characters
 */
export const validateDisplayName = (name) => {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Name is required' };
  }

  const trimmedName = name.trim();

  if (trimmedName.length === 0) {
    return { valid: false, error: 'Name is required' };
  }

  if (trimmedName.length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters' };
  }

  if (trimmedName.length > 100) {
    return { valid: false, error: 'Name is too long (max 100 characters)' };
  }

  // Allow letters (including unicode), spaces, hyphens, apostrophes
  const nameRegex = /^[\p{L}\s\-']+$/u;

  if (!nameRegex.test(trimmedName)) {
    return { valid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
  }

  return { valid: true, error: null };
};

/**
 * Sanitizes user input to prevent XSS
 * - Removes HTML tags
 * - Escapes special characters
 */
export const sanitizeInput = (input) => {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    .trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Validates phone number (basic international format)
 */
export const validatePhoneNumber = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, error: 'Phone number is required' };
  }

  const trimmedPhone = phone.trim();

  if (trimmedPhone.length === 0) {
    return { valid: false, error: 'Phone number is required' };
  }

  // Allow international format: +, digits, spaces, hyphens, parentheses
  const phoneRegex = /^\+?[\d\s\-()]{7,20}$/;

  if (!phoneRegex.test(trimmedPhone)) {
    return { valid: false, error: 'Invalid phone number format' };
  }

  // Count only digits
  const digitCount = (trimmedPhone.match(/\d/g) || []).length;

  if (digitCount < 7 || digitCount > 15) {
    return { valid: false, error: 'Phone number must contain 7-15 digits' };
  }

  return { valid: true, error: null };
};
