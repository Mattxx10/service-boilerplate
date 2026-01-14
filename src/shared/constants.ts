/**
 * Application-wide constants
 */

export const APP_NAME = 'Pozial API';
export const API_VERSION = 'v1';

/**
 * Default pagination
 */
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

/**
 * Default role names
 */
export const DEFAULT_ROLES = {
  ADMIN: 'admin',
  MEMBER: 'member',
  BILLING_MANAGER: 'billing_manager',
} as const;

/**
 * Cache TTL (in seconds)
 */
export const CACHE_TTL = {
  SHORT: 60,
  MEDIUM: 300,
  LONG: 3600,
} as const;
