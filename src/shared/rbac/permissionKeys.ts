/**
 * Canonical list of permission keys
 * Single source of truth for all permissions in the system
 */

export const PermissionKeys = {
  // Users
  USERS_READ: 'users.read',
  USERS_WRITE: 'users.write',
  USERS_DELETE: 'users.delete',

  // Organizations
  ORGANIZATIONS_READ: 'organizations.read',
  ORGANIZATIONS_WRITE: 'organizations.write',
  ORGANIZATIONS_DELETE: 'organizations.delete',

  // Memberships
  MEMBERSHIPS_READ: 'memberships.read',
  MEMBERSHIPS_WRITE: 'memberships.write',
  MEMBERSHIPS_DELETE: 'memberships.delete',

  // Roles
  ROLES_READ: 'roles.read',
  ROLES_WRITE: 'roles.write',
  ROLES_DELETE: 'roles.delete',

  // Billing
  BILLING_READ: 'billing.read',
  BILLING_WRITE: 'billing.write',
  BILLING_INVOICE_CREATE: 'billing.invoice.create',
} as const;

export type PermissionKey = (typeof PermissionKeys)[keyof typeof PermissionKeys];

/**
 * Get all permission keys as an array
 */
export function getAllPermissionKeys(): PermissionKey[] {
  return Object.values(PermissionKeys);
}
