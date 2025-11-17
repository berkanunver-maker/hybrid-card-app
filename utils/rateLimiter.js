// utils/rateLimiter.js
/**
 * Client-side Rate Limiter
 *
 * Prevents abuse by limiting the number of requests a client can make.
 * Note: This is client-side only. Server-side rate limiting (Firebase Functions)
 * is still required for real security.
 */

import { RATE_LIMIT_CONFIG } from './security.config';

class RateLimiter {
  constructor() {
    this.requests = new Map(); // Map of endpoint -> array of timestamps
  }

  /**
   * Check if request is allowed
   * @param {string} key - Unique key for the endpoint/action
   * @returns {boolean} - True if request is allowed
   */
  isAllowed(key) {
    if (!RATE_LIMIT_CONFIG.ENABLED) {
      return true; // Rate limiting disabled in development
    }

    const now = Date.now();
    const timestamps = this.requests.get(key) || [];

    // Remove timestamps older than 1 minute
    const recentTimestamps = timestamps.filter(
      (timestamp) => now - timestamp < 60000 // 60 seconds
    );

    // Check if limit exceeded
    if (recentTimestamps.length >= RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_MINUTE) {
      return false;
    }

    // Check minimum interval between requests
    if (recentTimestamps.length > 0) {
      const lastRequest = recentTimestamps[recentTimestamps.length - 1];
      if (now - lastRequest < RATE_LIMIT_CONFIG.MIN_REQUEST_INTERVAL) {
        return false;
      }
    }

    // Add current timestamp
    recentTimestamps.push(now);
    this.requests.set(key, recentTimestamps);

    return true;
  }

  /**
   * Wait until request is allowed (with exponential backoff)
   * @param {string} key - Unique key for the endpoint/action
   * @param {number} maxRetries - Maximum number of retries
   * @returns {Promise<boolean>} - Resolves when request is allowed
   */
  async waitUntilAllowed(key, maxRetries = 5) {
    let retries = 0;

    while (retries < maxRetries) {
      if (this.isAllowed(key)) {
        return true;
      }

      // Exponential backoff: 1s, 2s, 4s, 8s, 16s
      const delay = Math.min(1000 * Math.pow(2, retries), 16000);
      await new Promise((resolve) => setTimeout(resolve, delay));
      retries++;
    }

    return false;
  }

  /**
   * Reset rate limit for a specific key
   * @param {string} key - Unique key to reset
   */
  reset(key) {
    this.requests.delete(key);
  }

  /**
   * Clear all rate limits
   */
  clearAll() {
    this.requests.clear();
  }

  /**
   * Get remaining requests for a key
   * @param {string} key - Unique key
   * @returns {number} - Number of remaining requests
   */
  getRemaining(key) {
    const now = Date.now();
    const timestamps = this.requests.get(key) || [];

    const recentTimestamps = timestamps.filter(
      (timestamp) => now - timestamp < 60000
    );

    return Math.max(
      0,
      RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_MINUTE - recentTimestamps.length
    );
  }
}

// Singleton instance
const rateLimiter = new RateLimiter();

/**
 * Rate limit a function
 * @param {Function} fn - Function to rate limit
 * @param {string} key - Unique key for rate limiting
 * @returns {Function} - Rate limited function
 */
export const withRateLimit = (fn, key) => {
  return async (...args) => {
    if (!rateLimiter.isAllowed(key)) {
      throw new Error('Rate limit exceeded. Please try again in a moment.');
    }

    return await fn(...args);
  };
};

/**
 * Rate limit decorator for async functions with retry
 * @param {Function} fn - Async function to rate limit
 * @param {string} key - Unique key for rate limiting
 * @param {number} maxRetries - Maximum retries
 * @returns {Function} - Rate limited function with retry
 */
export const withRateLimitRetry = (fn, key, maxRetries = 3) => {
  return async (...args) => {
    const allowed = await rateLimiter.waitUntilAllowed(key, maxRetries);

    if (!allowed) {
      throw new Error('Rate limit exceeded. Maximum retries reached.');
    }

    return await fn(...args);
  };
};

export default rateLimiter;
