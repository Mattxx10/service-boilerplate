import { RbacRepository } from './repo';
import { RoleEntity, PermissionEntity } from './types';
import { NotFoundError, ConflictError } from '../../shared/errors';

export class RbacService {
  constructor(private rbacRepo: RbacRepository) {}

  // Role methods
  async getRoleById(id: string): Promise<RoleEntity> {
    const role = await this.rbacRepo.findRoleById(id);
    
    if (!role) {
      throw new NotFoundError('Role not found');
    }
    
    return role;
  }

  async getRolesByOrganization(organizationId: string): Promise<RoleEntity[]> {
    return this.rbacRepo.findRolesByOrganization(organizationId);
  }

  async createRole(data: { organizationId: string; name: string; description?: string }): Promise<RoleEntity> {
    // Check if role with same name exists in org
    const existing = await this.rbacRepo.findRoleByName(data.organizationId, data.name);
    
    if (existing) {
      throw new ConflictError('Role with this name already exists in the organization');
    }

    return this.rbacRepo.createRole(data);
  }

  async updateRole(id: string, data: { name?: string; description?: string }): Promise<RoleEntity> {
    const role = await this.getRoleById(id);

    // If name is being updated, check for conflicts
    if (data.name && data.name !== role.name) {
      const existing = await this.rbacRepo.findRoleByName(role.organizationId, data.name);
      if (existing) {
        throw new ConflictError('Role with this name already exists in the organization');
      }
    }

    return this.rbacRepo.updateRole(id, data);
  }

  async deleteRole(id: string): Promise<void> {
    await this.getRoleById(id);
    await this.rbacRepo.deleteRole(id);
  }

  // Permission methods
  async getAllPermissions(): Promise<PermissionEntity[]> {
    return this.rbacRepo.findAllPermissions();
  }

  async getPermissionsByRole(roleId: string): Promise<PermissionEntity[]> {
    await this.getRoleById(roleId);
    return this.rbacRepo.findPermissionsByRole(roleId);
  }

  async attachPermissions(roleId: string, permissionIds: string[]): Promise<void> {
    await this.getRoleById(roleId);
    await this.rbacRepo.attachPermissions(roleId, permissionIds);
  }

  async detachPermissions(roleId: string, permissionIds: string[]): Promise<void> {
    await this.getRoleById(roleId);
    await this.rbacRepo.detachPermissions(roleId, permissionIds);
  }

  async syncPermissions(roleId: string, permissionIds: string[]): Promise<void> {
    await this.getRoleById(roleId);
    await this.rbacRepo.syncPermissions(roleId, permissionIds);
  }

  // ===== Membership Permission methods =====

  async getPermissionsByMembership(membershipId: string): Promise<PermissionEntity[]> {
    return this.rbacRepo.findPermissionsByMembership(membershipId);
  }

  async attachMembershipPermissions(membershipId: string, permissionIds: string[]): Promise<void> {
    await this.rbacRepo.attachMembershipPermissions(membershipId, permissionIds);
  }

  async detachMembershipPermissions(membershipId: string, permissionIds: string[]): Promise<void> {
    await this.rbacRepo.detachMembershipPermissions(membershipId, permissionIds);
  }

  async syncMembershipPermissions(membershipId: string, permissionIds: string[]): Promise<void> {
    await this.rbacRepo.syncMembershipPermissions(membershipId, permissionIds);
  }
}
