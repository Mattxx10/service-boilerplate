import { z } from 'zod';
import { commonSchemas } from '../../shared/zod';

// Role schemas
export const createRoleSchema = z.object({
  organizationId: commonSchemas.id,
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

export const updateRoleSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
});

export const roleParamsSchema = z.object({
  id: commonSchemas.id,
});

export const organizationRolesParamsSchema = z.object({
  organizationId: commonSchemas.id,
});

// Permission schemas
export const attachPermissionsSchema = z.object({
  permissionIds: z.array(commonSchemas.id).min(1),
});

export const detachPermissionsSchema = z.object({
  permissionIds: z.array(commonSchemas.id).min(1),
});

export const syncPermissionsSchema = z.object({
  permissionIds: z.array(commonSchemas.id),
});

// Membership permission schemas
export const membershipParamsSchema = z.object({
  membershipId: commonSchemas.id,
});

export const attachMembershipPermissionsSchema = z.object({
  permissionIds: z.array(commonSchemas.id).min(1),
});

export const detachMembershipPermissionsSchema = z.object({
  permissionIds: z.array(commonSchemas.id).min(1),
});

export const syncMembershipPermissionsSchema = z.object({
  permissionIds: z.array(commonSchemas.id),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type RoleParams = z.infer<typeof roleParamsSchema>;
export type OrganizationRolesParams = z.infer<typeof organizationRolesParamsSchema>;
export type AttachPermissionsInput = z.infer<typeof attachPermissionsSchema>;
export type DetachPermissionsInput = z.infer<typeof detachPermissionsSchema>;
export type SyncPermissionsInput = z.infer<typeof syncPermissionsSchema>;
export type MembershipParams = z.infer<typeof membershipParamsSchema>;
export type AttachMembershipPermissionsInput = z.infer<typeof attachMembershipPermissionsSchema>;
export type DetachMembershipPermissionsInput = z.infer<typeof detachMembershipPermissionsSchema>;
export type SyncMembershipPermissionsInput = z.infer<typeof syncMembershipPermissionsSchema>;
