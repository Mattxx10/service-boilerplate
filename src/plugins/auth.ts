import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { UnauthorizedError } from '../shared/errors';

declare module 'fastify' {
  interface FastifyRequest {
    userId?: string;
    organizationId?: string;
  }
  
  interface FastifyInstance {
    requireUserId: (request: FastifyRequest) => string;
  }
}

/**
 * Auth plugin that resolves user identity from BFF authentication
 * Depends on bffAuth plugin for signature verification
 */
const authPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorateRequest('userId', null);
  fastify.decorateRequest('organizationId', null);

  // Hook to extract userId and organizationId from BFF auth
  fastify.addHook('onRequest', async (request) => {
    // Extract from verified BFF authentication
    if (request.bffAuth) {
      request.userId = request.bffAuth.userId;
      request.organizationId = request.bffAuth.organizationId;
    }
  });

  // Helper to get userId or throw
  fastify.decorate('requireUserId', function (request: FastifyRequest): string {
    if (!request.userId) {
      throw new UnauthorizedError('Authentication required');
    }
    return request.userId;
  });
};

export default fp(authPlugin, {
  name: 'auth',
  dependencies: ['bffAuth'],
});
