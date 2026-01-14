import { FastifyPluginAsync } from 'fastify';
import { OrganizationRepository } from './repo';
import { organizationRoutes } from './routes';

declare module 'fastify' {
  interface FastifyInstance {
    organizationRepo: OrganizationRepository;
  }
}

const organizationsPlugin: FastifyPluginAsync = async (fastify) => {
  // Initialize repository
  const organizationRepo = new OrganizationRepository(fastify.prisma);
  fastify.decorate('organizationRepo', organizationRepo);

  // Register routes
  await fastify.register(organizationRoutes, { prefix: '/organizations' });
};

export default organizationsPlugin;
