import { FastifyInstance } from 'fastify';
import { UserService } from './service';
import { createUserSchema, updateUserSchema, userParamsSchema } from './schemas';
import { commonSchemas } from '../../shared/zod';
import { success, paginated } from '../../shared/http';
import { requireOwnResource } from '../rbac/guards';

export async function userRoutes(fastify: FastifyInstance) {
  const userService = new UserService(fastify.userRepo);

  // List users
  fastify.get('/', async (request, reply) => {
    const pagination = commonSchemas.pagination.parse(request.query);
    const { users, total } = await userService.listUsers(pagination);
    
    return reply.send(paginated(users, pagination.page, pagination.limit, total));
  });

  // Get user by ID
  fastify.get('/:id',{
    preHandler: [requireOwnResource('id')],
  }, async (request, reply) => {
    const { id } = userParamsSchema.parse(request.params);
    const user = await userService.getUserById(id);
    
    return reply.send(success(user));
  });

  // Create user
  fastify.post('/', async (request, reply) => {
    const data = createUserSchema.parse(request.body);
    const user = await userService.createUser(data);
    
    return reply.status(201).send(success(user));
  });

  // Update user
  fastify.patch('/:id', async (request, reply) => {
    const { id } = userParamsSchema.parse(request.params);
    const data = updateUserSchema.parse(request.body);
    const user = await userService.updateUser(id, data);
    
    return reply.send(success(user));
  });

  // Delete user
  fastify.delete('/:id', async (request, reply) => {
    const { id } = userParamsSchema.parse(request.params);
    await userService.deleteUser(id);
    
    return reply.status(204).send();
  });
}
