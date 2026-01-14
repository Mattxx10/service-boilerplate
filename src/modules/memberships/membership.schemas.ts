import { z } from 'zod';
import { commonSchemas } from '../../shared/zod';

export const createMembershipSchema = z.object({
  userId: commonSchemas.id,
  organizationId: commonSchemas.id,
  roleId: commonSchemas.id.optional(),
});

export const updateMembershipSchema = z.object({
  roleId: commonSchemas.id.nullable().optional(),
});

export const membershipParamsSchema = z.object({
  id: commonSchemas.id,
});

export const organizationMembersParamsSchema = z.object({
  organizationId: commonSchemas.id,
});

export const userMembershipsParamsSchema = z.object({
  userId: commonSchemas.id,
});

export type CreateMembershipInput = z.infer<typeof createMembershipSchema>;
export type UpdateMembershipInput = z.infer<typeof updateMembershipSchema>;
export type MembershipParams = z.infer<typeof membershipParamsSchema>;
export type OrganizationMembersParams = z.infer<typeof organizationMembersParamsSchema>;
export type UserMembershipsParams = z.infer<typeof userMembershipsParamsSchema>;
