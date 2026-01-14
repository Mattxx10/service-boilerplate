import Fastify from 'fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';

// Plugins
import dbPlugin from './plugins/db';
import errorsPlugin from './plugins/errors';
import bffAuthPlugin from './plugins/bffAuth';
import authPlugin from './plugins/auth';
import requestContextPlugin from './plugins/requestContext';

// Modules
import authModulePlugin from './modules/auth';
import usersPlugin from './modules/users';
import organizationsPlugin from './modules/organizations';
import membershipsPlugin from './modules/memberships';
import rbacPlugin from './modules/rbac';
import billingPlugin from './modules/billing';

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

async function buildServer() {
  const fastify = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      transport:
        process.env.NODE_ENV === 'development'
          ? {
              target: 'pino-pretty',
              options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
              },
            }
          : undefined,
    },
  });

  // Security & CORS
  await fastify.register(helmet, {
    contentSecurityPolicy: false,
  });
  
  await fastify.register(cors, {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  // Core plugins
  await fastify.register(dbPlugin);
  await fastify.register(errorsPlugin);
  await fastify.register(bffAuthPlugin);
  await fastify.register(authPlugin);
  await fastify.register(requestContextPlugin);

  // Health check
  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // API routes
  await fastify.register(async (app) => {
    await app.register(authModulePlugin);
    await app.register(usersPlugin);
    await app.register(organizationsPlugin);
    await app.register(membershipsPlugin);
    await app.register(rbacPlugin);
    await app.register(billingPlugin);
  }, { prefix: '/api/v1' });

  return fastify;
}

async function start() {
  try {
    const fastify = await buildServer();

    await fastify.listen({ port: PORT, host: HOST });

    fastify.log.info(`
🚀 Server ready at http://${HOST}:${PORT}
📚 API routes available at http://${HOST}:${PORT}/api/v1
🏥 Health check at http://${HOST}:${PORT}/health
    `);

    // Graceful shutdown
    const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
    signals.forEach((signal) => {
      process.on(signal, async () => {
        fastify.log.info(`Received ${signal}, closing server...`);
        await fastify.close();
        process.exit(0);
      });
    });
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
}

// Only start if this file is run directly
if (require.main === module) {
  start();
}

export { buildServer, start };
