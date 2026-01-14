import { FastifyPluginAsync } from 'fastify';
import { MembershipRepository } from './membership.repo';
import { membershipRoutes } from './membership.routes';

declare module 'fastify' {
  interface FastifyInstance {
    membershipRepo: MembershipRepository;
  }
}

const membershipsPlugin: FastifyPluginAsync = async (fastify) => {
  // Initialize repository
  const membershipRepo = new MembershipRepository(fastify.prisma);
  fastify.decorate('membershipRepo', membershipRepo);

  // Register routes
  await fastify.register(membershipRoutes, { prefix: '/memberships' });
};

export default membershipsPlugin;
