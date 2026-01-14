import { FastifyRequest, FastifyReply } from 'fastify';
import { UnauthorizedError } from '../../../shared/errors';

/**
 * Guard: Require authentication
 * Ensures userId is present in request
 */
export async function requireAuth(request: FastifyRequest, _reply: FastifyReply) {
  if (!request.userId) {
    throw new UnauthorizedError('Authentication required');
  }
}
