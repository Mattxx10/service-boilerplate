import { FastifyInstance } from 'fastify';
import { AuthService } from './service';
import { 
  createAuthUserSchema, 
  updateAuthUserSchema, 
  authUserParamsSchema 
} from './schemas';
import { success } from '../../shared/http';

/**
 * Auth routes - Internal BFF authentication endpoints
 * These routes are used by the NestJS BFF during authentication flow
 * 
 * Security: All routes should use BFF authentication guard
 * These endpoints should NOT be exposed to public internet
 */
export async function authRoutes(fastify: FastifyInstance) {
  const authService = new AuthService(fastify.authRepo);

  /**
   * Get user by Cognito ID
   * Primary endpoint used by BFF to fetch user data after Cognito authentication
   * 
   * GET /auth/users/cognito/:cognitoId
   */
  fastify.get('/users/cognito/:cognitoId', async (request, reply) => {
    const { cognitoId } = authUserParamsSchema.parse(request.params);
    const user = await authService.getUserByCognitoId(cognitoId);
    
    return reply.send(success(user));
  });

  /**
   * Get user by email
   * Useful for checking if user exists before creating account
   * 
   * GET /auth/users/email/:email
   */
  fastify.get('/users/email/:email', async (request, reply) => {
    const { email } = request.params as { email: string };
    const user = await authService.getUserByEmail(email);
    
    return reply.send(success(user));
  });

  /**
   * Create user with Cognito ID
   * Called by BFF when a new user registers through Cognito
   * 
   * POST /auth/users
   */
  fastify.post('/users', async (request, reply) => {
    const data = createAuthUserSchema.parse(request.body);
    const user = await authService.createUser(data);
    
    return reply.status(201).send(success(user));
  });

  /**
   * Get or create user
   * Seamlessly provisions user if they don't exist
   * Useful for Just-In-Time (JIT) user provisioning
   * 
   * POST /auth/users/get-or-create
   */
  fastify.post('/users/get-or-create', async (request, reply) => {
    const data = createAuthUserSchema.parse(request.body);
    const result = await authService.getOrCreateUser(data);
    
    return reply.status(result.created ? 201 : 200).send(success({
      user: result.user,
      created: result.created,
    }));
  });

  /**
   * Update user by Cognito ID
   * Updates user profile information
   * 
   * PATCH /auth/users/cognito/:cognitoId
   */
  fastify.patch('/users/cognito/:cognitoId', async (request, reply) => {
    const { cognitoId } = authUserParamsSchema.parse(request.params);
    const data = updateAuthUserSchema.parse(request.body);
    const user = await authService.updateUserByCognitoId(cognitoId, data);
    
    return reply.send(success(user));
  });

  /**
   * Delete user by Cognito ID
   * Removes user from system
   * 
   * DELETE /auth/users/cognito/:cognitoId
   */
  fastify.delete('/users/cognito/:cognitoId', async (request, reply) => {
    const { cognitoId } = authUserParamsSchema.parse(request.params);
    await authService.deleteUserByCognitoId(cognitoId);
    
    return reply.status(204).send();
  });
}
