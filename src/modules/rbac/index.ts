import { FastifyPluginAsync } from 'fastify';
import { RbacRepository } from './repo';
import { MembershipResolver } from './resolvers/resolveMembership';
import { rbacRoutes } from './routes';

declare module 'fastify' {
  interface FastifyInstance {
    rbacRepo: RbacRepository;
    membershipResolver: MembershipResolver;
  }
}

const rbacPlugin: FastifyPluginAsync = async (fastify) => {
  // Initialize repository and resolver
  const rbacRepo = new RbacRepository(fastify.prisma);
  const membershipResolver = new MembershipResolver(rbacRepo);
  
  fastify.decorate('rbacRepo', rbacRepo);
  fastify.decorate('membershipResolver', membershipResolver);

  // Register routes
  await fastify.register(rbacRoutes, { prefix: '/rbac' });
};

export default rbacPlugin;
