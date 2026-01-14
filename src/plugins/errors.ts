import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { AppError } from '../shared/errors';

const errorsPlugin: FastifyPluginAsync = async (fastify) => {
  // Error handler
  fastify.setErrorHandler((error, request, reply) => {
    // Log error
    fastify.log.error({
      err: error,
      url: request.url,
      method: request.method,
    });

    // Handle AppError instances
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        success: false,
        error: error.message,
        code: error.code,
      });
    }

    // Handle Zod validation errors
    if (error.validation) {
      return reply.status(400).send({
        success: false,
        error: 'Validation Error',
        details: error.validation,
      });
    }

    // Handle Prisma errors
    if (error.name === 'PrismaClientKnownRequestError') {
      const prismaError = error as any;
      
      if (prismaError.code === 'P2002') {
        return reply.status(409).send({
          success: false,
          error: 'Resource already exists',
          code: 'CONFLICT',
        });
      }
      
      if (prismaError.code === 'P2025') {
        return reply.status(404).send({
          success: false,
          error: 'Resource not found',
          code: 'NOT_FOUND',
        });
      }
    }

    // Default error response
    const statusCode = error.statusCode || 500;
    const message = statusCode === 500 ? 'Internal Server Error' : error.message;

    return reply.status(statusCode).send({
      success: false,
      error: message,
    });
  });

  // Not found handler
  fastify.setNotFoundHandler((_request, reply) => {
    reply.status(404).send({
      success: false,
      error: 'Route not found',
      code: 'NOT_FOUND',
    });
  });
};

export default fp(errorsPlugin, {
  name: 'errors',
});
