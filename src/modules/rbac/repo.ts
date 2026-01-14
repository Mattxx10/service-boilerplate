import { PrismaClient } from '@prisma/client';
import { MembershipWithRole, RoleEntity, PermissionEntity } from './types';

export class RbacRepository {
  constructor(private prisma: PrismaClient) {}

  async findMembership(userId: string, organizationId: string): Promise<MembershipWithRole | null> {
    return this.prisma.membership.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
        directPermissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  async findRoleById(id: string): Promise<RoleEntity | null> {
    return this.prisma.role.findUnique({
      where: { id },
    });
  }

  async findRoleByName(organizationId: string, name: string): Promise<RoleEntity | null> {
    return this.prisma.role.findUnique({
      where: {
        organizationId_name: {
          organizationId,
          name,
        },
      },
    });
  }

  async findRolesByOrganization(organizationId: string): Promise<RoleEntity[]> {
    return this.prisma.role.findMany({
      where: { organizationId },
      orderBy: { name: 'asc' },
    });
  }

  async findAllPermissions(): Promise<PermissionEntity[]> {
    return this.prisma.permission.findMany({
      orderBy: { key: 'asc' },
    });
  }

  async findPermissionsByRole(roleId: string): Promise<PermissionEntity[]> {
    const rolePermissions = await this.prisma.rolePermission.findMany({
      where: { roleId },
      include: { permission: true },
    });
    
    return rolePermissions.map(rp => rp.permission);
  }

  async createRole(data: { organizationId: string; name: string; description?: string }): Promise<RoleEntity> {
    return this.prisma.role.create({
      data,
    });
  }

  async updateRole(id: string, data: { name?: string; description?: string }): Promise<RoleEntity> {
    return this.prisma.role.update({
      where: { id },
      data,
    });
  }

  async deleteRole(id: string): Promise<void> {
    await this.prisma.role.delete({
      where: { id },
    });
  }

  async attachPermissions(roleId: string, permissionIds: string[]): Promise<void> {
    await this.prisma.rolePermission.createMany({
      data: permissionIds.map(permissionId => ({ roleId, permissionId })),
      skipDuplicates: true,
    });
  }

  async detachPermissions(roleId: string, permissionIds: string[]): Promise<void> {
    await this.prisma.rolePermission.deleteMany({
      where: {
        roleId,
        permissionId: { in: permissionIds },
      },
    });
  }

  async syncPermissions(roleId: string, permissionIds: string[]): Promise<void> {
    // Delete all existing permissions for this role
    await this.prisma.rolePermission.deleteMany({
      where: { roleId },
    });

    // Add new permissions
    if (permissionIds.length > 0) {
      await this.attachPermissions(roleId, permissionIds);
    }
  }

  // ===== Membership Permissions =====

  async findPermissionsByMembership(membershipId: string): Promise<PermissionEntity[]> {
    const membershipPermissions = await this.prisma.membershipPermission.findMany({
      where: { membershipId },
      include: { permission: true },
    });
    
    return membershipPermissions.map(mp => mp.permission);
  }

  async attachMembershipPermissions(membershipId: string, permissionIds: string[]): Promise<void> {
    await this.prisma.membershipPermission.createMany({
      data: permissionIds.map(permissionId => ({ membershipId, permissionId })),
      skipDuplicates: true,
    });
  }

  async detachMembershipPermissions(membershipId: string, permissionIds: string[]): Promise<void> {
    await this.prisma.membershipPermission.deleteMany({
      where: {
        membershipId,
        permissionId: { in: permissionIds },
      },
    });
  }

  async syncMembershipPermissions(membershipId: string, permissionIds: string[]): Promise<void> {
    // Delete all existing direct permissions for this membership
    await this.prisma.membershipPermission.deleteMany({
      where: { membershipId },
    });

    // Add new permissions
    if (permissionIds.length > 0) {
      await this.attachMembershipPermissions(membershipId, permissionIds);
    }
  }
}
