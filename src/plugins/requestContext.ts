import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

export interface RequestContext {
  userId?: string;
  organizationId?: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    ctx: RequestContext;
  }
}

/**
 * Request context plugin - stores request-scoped data
 */
const requestContextPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorateRequest('ctx', null);

  fastify.addHook('onRequest', async (request) => {
    request.ctx = {
      userId: request.userId,
      organizationId: request.headers['x-organization-id'] as string | undefined,
    };
  });
};

export default fp(requestContextPlugin, {
  name: 'requestContext',
  dependencies: ['auth'],
});
