import { FastifyRequest, FastifyReply } from 'fastify';
import { ForbiddenError, UnauthorizedError } from '../../../shared/errors';
import { PermissionKey } from '../../../shared/rbac/permissionKeys';
import { hasPermission } from '../../../shared/rbac/policy';

/**
 * Guard: Require specific permission
 * Checks if user has the required permission in the current organization
 */
export function requirePermission(permission: PermissionKey) {
  return async (request: FastifyRequest, _reply: FastifyReply) => {
    if (!request.userId) {
      throw new UnauthorizedError('Authentication required');
    }

    if (!request.resolvedMembership) {
      throw new ForbiddenError('Organization membership required');
    }

    const userPermissions = request.resolvedMembership.permissions as PermissionKey[];

    if (!hasPermission(userPermissions, permission)) {
      throw new ForbiddenError(`Missing required permission: ${permission}`);
    }
  };
}

/**
 * Guard: Require any of the specified permissions
 */
export function requireAnyPermission(permissions: PermissionKey[]) {
  return async (request: FastifyRequest, _reply: FastifyReply) => {
    if (!request.userId) {
      throw new UnauthorizedError('Authentication required');
    }

    if (!request.resolvedMembership) {
      throw new ForbiddenError('Organization membership required');
    }

    const userPermissions = request.resolvedMembership.permissions as PermissionKey[];
    const hasAny = permissions.some(perm => userPermissions.includes(perm));

    if (!hasAny) {
      throw new ForbiddenError(`Missing required permissions: ${permissions.join(', ')}`);
    }
  };
}

/**
 * Guard: Require all of the specified permissions
 */
export function requireAllPermissions(permissions: PermissionKey[]) {
  return async (request: FastifyRequest, _reply: FastifyReply) => {
    if (!request.userId) {
      throw new UnauthorizedError('Authentication required');
    }

    if (!request.resolvedMembership) {
      throw new ForbiddenError('Organization membership required');
    }

    const userPermissions = request.resolvedMembership.permissions as PermissionKey[];
    const hasAll = permissions.every(perm => userPermissions.includes(perm));

    if (!hasAll) {
      throw new ForbiddenError(`Missing required permissions: ${permissions.join(', ')}`);
    }
  };
}
