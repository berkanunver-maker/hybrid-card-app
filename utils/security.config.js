// config/security.config.js
/**
 * 🔒 Security Configuration
 *
 * Centralized security settings for the application.
 * This file contains all security-related configurations.
 */

// Environment check
export const isDevelopment = __DEV__;
export const isProduction = !__DEV__;

// API Security
export const API_CONFIG = {
  // Timeout for API requests (milliseconds)
  REQUEST_TIMEOUT: 30000,

  // Maximum retry attempts
  MAX_RETRIES: 3,

  // Enable/disable detailed error logging
  VERBOSE_ERRORS: isDevelopment,
};

// Authentication Security
export const AUTH_CONFIG = {
  // Minimum password length (enforced in validation)
  MIN_PASSWORD_LENGTH: 8,

  // Password requirements
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBER: true,
  REQUIRE_SPECIAL_CHAR: false, // Optional for better UX

  // Session timeout (milliseconds) - Firebase handles this
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours

  // Maximum login attempts before lockout
  MAX_LOGIN_ATTEMPTS: 5,
};

// File Upload Security
export const UPLOAD_CONFIG = {
  // Maximum file sizes (bytes)
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_AUDIO_SIZE: 25 * 1024 * 1024, // 25MB

  // Allowed file types
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_AUDIO_TYPES: ['audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/m4a', 'audio/wav', 'audio/ogg'],

  // Allowed storage paths
  ALLOWED_PATHS: ['cards/', 'voice-notes/', 'profiles/'],
};

// Input Validation Security
export const VALIDATION_CONFIG = {
  // Email validation
  MAX_EMAIL_LENGTH: 254, // RFC 5321

  // Name validation
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,

  // Phone validation
  MIN_PHONE_DIGITS: 7,
  MAX_PHONE_DIGITS: 15,

  // Text field limits
  MAX_COMPANY_LENGTH: 200,
  MAX_TITLE_LENGTH: 200,
  MAX_ADDRESS_LENGTH: 500,
  MAX_NOTE_LENGTH: 1000,
};

// Rate Limiting (Client-side throttling)
export const RATE_LIMIT_CONFIG = {
  // Minimum time between requests (milliseconds)
  MIN_REQUEST_INTERVAL: 1000, // 1 second

  // Maximum requests per minute
  MAX_REQUESTS_PER_MINUTE: 60,

  // Enabled in production only
  ENABLED: isProduction,
};

// Logging Security
export const LOGGING_CONFIG = {
  // Enable console.log in development only
  ENABLE_CONSOLE_LOG: isDevelopment,

  // Enable error logging in production
  ENABLE_ERROR_LOG: true,

  // Sensitive fields to redact from logs
  REDACT_FIELDS: [
    'password',
    'token',
    'apiKey',
    'secret',
    'credential',
    'accessToken',
    'refreshToken',
    'idToken',
  ],
};

// SSL Pinning Configuration
// Note: SSL Pinning requires custom native builds (not supported in Expo Go)
export const SSL_CONFIG = {
  // Enable SSL Pinning (only works with development builds)
  ENABLED: false, // Set to true when using EAS Build or bare workflow

  // Certificate fingerprints (SHA-256)
  // Add your backend's SSL certificate fingerprints here
  CERTIFICATE_FINGERPRINTS: {
    // Example: 'firebasestorage.googleapis.com': 'SHA256_FINGERPRINT_HERE',
  },
};

// Network Security
export const NETWORK_CONFIG = {
  // Enforce HTTPS only
  ENFORCE_HTTPS: true,

  // Allow localhost in development
  ALLOW_LOCALHOST: isDevelopment,

  // Trusted domains
  TRUSTED_DOMAINS: [
    'firebasestorage.googleapis.com',
    'firestore.googleapis.com',
    'identitytoolkit.googleapis.com',
    'securetoken.googleapis.com',
  ],
};

// Data Encryption (for future implementation with expo-secure-store)
export const ENCRYPTION_CONFIG = {
  // Use expo-secure-store for sensitive data
  USE_SECURE_STORAGE: true,

  // Keys to store securely
  SECURE_KEYS: [
    'userToken',
    'refreshToken',
    'userId',
  ],
};

/**
 * Validate security configuration on app start
 */
export const validateSecurityConfig = () => {
  const requiredEnvVars = [
    'EXPO_PUBLIC_FIREBASE_API_KEY',
    'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
    'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'EXPO_PUBLIC_FIREBASE_APP_ID',
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please check your .env file.'
    );
  }

  if (isDevelopment) {
    console.log('✅ Security configuration validated');
  }
};

/**
 * Redact sensitive information from logs
 */
export const redactSensitiveData = (data) => {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const redacted = { ...data };

  LOGGING_CONFIG.REDACT_FIELDS.forEach((field) => {
    if (field in redacted) {
      redacted[field] = '***REDACTED***';
    }
  });

  return redacted;
};

/**
 * Secure logger that redacts sensitive information
 */
export const secureLog = {
  log: (...args) => {
    if (LOGGING_CONFIG.ENABLE_CONSOLE_LOG) {
      console.log(...args.map(redactSensitiveData));
    }
  },

  error: (...args) => {
    if (LOGGING_CONFIG.ENABLE_ERROR_LOG) {
      console.error(...args.map(redactSensitiveData));
    }
  },

  warn: (...args) => {
    if (LOGGING_CONFIG.ENABLE_CONSOLE_LOG) {
      console.warn(...args.map(redactSensitiveData));
    }
  },
};

export default {
  isDevelopment,
  isProduction,
  API_CONFIG,
  AUTH_CONFIG,
  UPLOAD_CONFIG,
  VALIDATION_CONFIG,
  RATE_LIMIT_CONFIG,
  LOGGING_CONFIG,
  SSL_CONFIG,
  NETWORK_CONFIG,
  ENCRYPTION_CONFIG,
  validateSecurityConfig,
  redactSensitiveData,
  secureLog,
};
