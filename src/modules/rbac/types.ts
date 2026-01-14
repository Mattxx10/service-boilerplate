import { Membership, Role, Permission } from '@prisma/client';

export type MembershipEntity = Membership;
export type RoleEntity = Role;
export type PermissionEntity = Permission;

export interface MembershipWithRole extends Membership {
  role: (Role & {
    permissions: { permission: Permission }[];
  }) | null;
  directPermissions: { permission: Permission }[];
}

export interface ResolvedMembership {
  membership: Membership;
  role: Role | null;
  permissions: string[];
  directPermissions: string[];
}
