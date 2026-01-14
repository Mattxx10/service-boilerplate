import { FastifyPluginAsync } from 'fastify';
import { UserRepository } from './repo';
import { userRoutes } from './routes';

declare module 'fastify' {
  interface FastifyInstance {
    userRepo: UserRepository;
  }
}

const usersPlugin: FastifyPluginAsync = async (fastify) => {
  // Initialize repository
  const userRepo = new UserRepository(fastify.prisma);
  fastify.decorate('userRepo', userRepo);

  // Register routes
  await fastify.register(userRoutes, { prefix: '/users' });
};

export default usersPlugin;
