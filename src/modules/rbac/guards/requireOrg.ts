import { FastifyRequest, FastifyReply } from 'fastify';
import { UnauthorizedError, ForbiddenError, BadRequestError } from '../../../shared/errors';
import { MembershipResolver } from '../resolvers/resolveMembership';
import { PermissionCache } from '../cache/permissionCache';
import { ResolvedMembership } from '../types';

declare module 'fastify' {
  interface FastifyRequest {
    resolvedMembership?: ResolvedMembership;
    permissionCache?: PermissionCache;
  }
}

/**
 * Guard: Require organization membership
 * Ensures user belongs to the organization
 */
export function requireOrg(resolver: MembershipResolver) {
  return async (request: FastifyRequest, _reply: FastifyReply) => {
    if (!request.userId) {
      throw new UnauthorizedError('Authentication required');
    }

    // Get organizationId from params, query, or headers
    const organizationId = 
      (request.params as any).organizationId ||
      (request.query as any).organizationId ||
      request.headers['x-organization-id'] as string;

    if (!organizationId) {
      throw new BadRequestError('Organization ID is required');
    }

    // Initialize cache if not exists
    if (!request.permissionCache) {
      request.permissionCache = new PermissionCache();
    }

    // Check cache first
    let resolved = request.permissionCache.get(request.userId, organizationId);

    if (!resolved) {
      // Resolve membership
      const membershipResult = await resolver.resolveMembership(request.userId, organizationId);

      if (!membershipResult) {
        throw new ForbiddenError('You are not a member of this organization');
      }

      resolved = membershipResult;

      // Cache the result
      request.permissionCache.set(request.userId, organizationId, resolved);
    }

    // Attach to request for later use
    request.resolvedMembership = resolved;
  };
}
