import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { PrismaClient } from '@prisma/client';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

const dbPlugin: FastifyPluginAsync = async (fastify) => {
  const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

  // Test connection
  await prisma.$connect();
  fastify.log.info('✅ Database connected');

  // Make Prisma available throughout the app
  fastify.decorate('prisma', prisma);

  // Close connection when app closes
  fastify.addHook('onClose', async (instance) => {
    await instance.prisma.$disconnect();
    fastify.log.info('Database disconnected');
  });
};

export default fp(dbPlugin, {
  name: 'prisma',
});
