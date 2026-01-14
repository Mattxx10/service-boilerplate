import { FastifyRequest, FastifyReply } from 'fastify';
import { ForbiddenError } from '../../../shared/errors';

/**
 * Guard: Validate path parameter matches authenticated user
 * Prevents users from accessing other users' resources
 * 
 * @param paramName - The name of the route parameter to validate (default: 'userId')
 * 
 * @example
 * // Route: /api/v1/users/:userId/profile
 * app.get('/users/:userId/profile', { 
 *   preHandler: [requireAuth, requireOwnResource()] 
 * }, handler);
 */
export function requireOwnResource(paramName: string = 'userId') {
  return async (request: FastifyRequest, _reply: FastifyReply) => {
    const params = request.params as Record<string, string>;
    const pathUserId = params[paramName];

    if (!pathUserId) {
      throw new ForbiddenError(`Missing ${paramName} in route parameters`);
    }

    if (pathUserId !== request.userId) {
      request.log.warn(
        {
          authenticatedUserId: request.userId,
          requestedUserId: pathUserId,
          path: request.url,
        },
        'Attempted access to another user\'s resource'
      );

      throw new ForbiddenError('Cannot access other users\' resources');
    }
  };
}

/**
 * Guard: Validate organization ID parameter matches authenticated user's organization
 * Ensures multi-tenancy isolation
 * 
 * @param paramName - The name of the route parameter to validate (default: 'orgId')
 * 
 * @example
 * // Route: /api/v1/organizations/:orgId/data
 * app.get('/organizations/:orgId/data', { 
 *   preHandler: [requireAuth, requireOwnOrganization()] 
 * }, handler);
 */
export function requireOwnOrganization(paramName: string = 'orgId') {
  return async (request: FastifyRequest, _reply: FastifyReply) => {
    const params = request.params as Record<string, string>;
    const pathOrgId = params[paramName];

    if (!pathOrgId) {
      throw new ForbiddenError(`Missing ${paramName} in route parameters`);
    }

    if (!request.organizationId) {
      throw new ForbiddenError('No organization context available');
    }

    if (pathOrgId !== request.organizationId) {
      request.log.warn(
        {
          authenticatedOrgId: request.organizationId,
          requestedOrgId: pathOrgId,
          userId: request.userId,
          path: request.url,
        },
        'Attempted access to another organization\'s resource'
      );

      throw new ForbiddenError('Cannot access other organizations\' resources');
    }
  };
}
