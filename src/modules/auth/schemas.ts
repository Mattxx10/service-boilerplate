import { z } from 'zod';
import { commonSchemas } from '../../shared/zod';

export const getUserByCognitoIdSchema = z.object({
  cognitoId: z.string().min(1).max(255),
});

export const createAuthUserSchema = z.object({
  email: commonSchemas.email,
  cognitoId: z.string().min(1).max(255),
  name: z.string().min(1).max(255).optional(),
});

export const updateAuthUserSchema = z.object({
  email: commonSchemas.email.optional(),
  name: z.string().min(1).max(255).optional(),
});

export const authUserParamsSchema = z.object({
  cognitoId: z.string().min(1).max(255),
});

export const authUserResponseSchema = z.object({
  id: commonSchemas.id,
  email: z.string().email(),
  cognitoId: z.string(),
  name: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type GetUserByCognitoIdInput = z.infer<typeof getUserByCognitoIdSchema>;
export type CreateAuthUserInput = z.infer<typeof createAuthUserSchema>;
export type UpdateAuthUserInput = z.infer<typeof updateAuthUserSchema>;
export type AuthUserParams = z.infer<typeof authUserParamsSchema>;
export type AuthUserResponse = z.infer<typeof authUserResponseSchema>;
