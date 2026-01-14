import { RbacRepository } from '../repo';
import { ResolvedMembership } from '../types';

export class MembershipResolver {
  constructor(private rbacRepo: RbacRepository) {}

  /**
   * Resolve membership with role and permissions
   * Used by guards to check authorization
   * 
   * Combines both role-based permissions and direct membership permissions
   */
  async resolveMembership(
    userId: string,
    organizationId: string
  ): Promise<ResolvedMembership | null> {
    const membership = await this.rbacRepo.findMembership(userId, organizationId);

    if (!membership) {
      return null;
    }

    // Get permissions from role
    const rolePermissions = membership.role
      ? membership.role.permissions.map((rp: { permission: { key: string } }) => rp.permission.key)
      : [];

    // Get direct permissions from membership
    const directPermissions = membership.directPermissions
      ? membership.directPermissions.map((mp: { permission: { key: string } }) => mp.permission.key)
      : [];

    // Combine and deduplicate permissions
    const allPermissions = Array.from(new Set([...rolePermissions, ...directPermissions]));

    return {
      membership: {
        id: membership.id,
        userId: membership.userId,
        organizationId: membership.organizationId,
        roleId: membership.roleId,
        createdAt: membership.createdAt,
        updatedAt: membership.updatedAt,
      },
      role: membership.role,
      permissions: allPermissions,
      directPermissions,
    };
  }
}
