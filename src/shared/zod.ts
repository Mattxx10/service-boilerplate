import { z } from 'zod';
import { FastifyReply } from 'fastify';

/**
 * Parse data with Zod schema and handle errors
 */
export function parseWithSchema<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Safe parse that returns result object
 */
export function safeParse<T>(schema: z.ZodSchema<T>, data: unknown) {
  return schema.safeParse(data);
}

/**
 * Validate and reply with errors if validation fails
 */
export async function validateOrReply<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  reply: FastifyReply
): Promise<T | null> {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    reply.status(400).send({
      error: 'Validation Error',
      details: result.error.format(),
    });
    return null;
  }
  
  return result.data;
}

/**
 * Common Zod schemas for reuse
 */
export const commonSchemas = {
  id: z.string().cuid(),
  email: z.string().email(),
  pagination: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
  }),
  timestamp: z.string().datetime(),
};

/**
 * Generic list response schema
 */
export function createListSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    data: z.array(itemSchema),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
    }),
  });
}
