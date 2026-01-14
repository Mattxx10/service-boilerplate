import { PermissionKey } from './permissionKeys';

/**
 * Check if user has any of the specified permissions
 */
export function hasAny(
  userPermissions: PermissionKey[],
  requiredPermissions: PermissionKey[]
): boolean {
  return requiredPermissions.some((perm) => userPermissions.includes(perm));
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAll(
  userPermissions: PermissionKey[],
  requiredPermissions: PermissionKey[]
): boolean {
  return requiredPermissions.every((perm) => userPermissions.includes(perm));
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(
  userPermissions: PermissionKey[],
  permission: PermissionKey
): boolean {
  return userPermissions.includes(permission);
}
