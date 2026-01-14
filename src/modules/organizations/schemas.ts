import { z } from 'zod';
import { commonSchemas } from '../../shared/zod';

export const createOrganizationSchema = z.object({
  name: z.string().min(1).max(255),
});

export const updateOrganizationSchema = z.object({
  name: z.string().min(1).max(255).optional(),
});

export const organizationParamsSchema = z.object({
  id: commonSchemas.id,
});

export const organizationResponseSchema = z.object({
  id: commonSchemas.id,
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
export type OrganizationParams = z.infer<typeof organizationParamsSchema>;
export type OrganizationResponse = z.infer<typeof organizationResponseSchema>;
