import { FastifyPluginAsync } from 'fastify';
import { AuthRepository } from './repo';
import { authRoutes } from './routes';

declare module 'fastify' {
  interface FastifyInstance {
    authRepo: AuthRepository;
  }
}

/**
 * Auth Module
 * Handles authentication-related operations for BFF integration
 * 
 * This module provides endpoints for the NestJS BFF to:
 * - Retrieve user data by Cognito user ID
 * - Create new users during registration
 * - Update user profile information
 * - Provision users just-in-time (JIT)
 * 
 * Security: These endpoints should be protected by BFF authentication
 * and not exposed directly to public internet.
 */
const authPlugin: FastifyPluginAsync = async (fastify) => {
  // Initialize repository
  const authRepo = new AuthRepository(fastify.prisma);
  fastify.decorate('authRepo', authRepo);

  // Register routes under /auth prefix
  await fastify.register(authRoutes, { prefix: '/auth' });
};

export default authPlugin;
