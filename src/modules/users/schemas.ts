import { z } from 'zod';
import { commonSchemas } from '../../shared/zod';

export const createUserSchema = z.object({
  email: commonSchemas.email,
  name: z.string().min(1).max(255).optional(),
});

export const updateUserSchema = z.object({
  email: commonSchemas.email.optional(),
  name: z.string().min(1).max(255).optional(),
});

export const userParamsSchema = z.object({
  id: commonSchemas.id,
});

export const userResponseSchema = z.object({
  id: commonSchemas.id,
  email: z.string().email(),
  name: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserParams = z.infer<typeof userParamsSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
