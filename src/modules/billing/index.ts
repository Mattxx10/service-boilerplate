import { FastifyPluginAsync } from 'fastify';
import { BillingRepository } from './repo';
import { billingRoutes } from './routes';

declare module 'fastify' {
  interface FastifyInstance {
    billingRepo: BillingRepository;
  }
}

const billingPlugin: FastifyPluginAsync = async (fastify) => {
  // Initialize repository
  const billingRepo = new BillingRepository();
  fastify.decorate('billingRepo', billingRepo);

  // Register routes
  await fastify.register(billingRoutes, { prefix: '/billing' });
};

export default billingPlugin;
