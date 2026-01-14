import { MembershipRepository } from './membership.repo';
import { CreateMembershipData, UpdateMembershipData, MembershipEntity } from './membership.types';
import { NotFoundError, ConflictError } from '../../shared/errors';
import { PaginationParams } from '../../shared/types';

export class MembershipService {
  constructor(private membershipRepo: MembershipRepository) {}

  async getMembershipById(id: string) {
    const membership = await this.membershipRepo.findByIdWithDetails(id);
    
    if (!membership) {
      throw new NotFoundError('Membership not found');
    }
    
    return membership;
  }

  async getMembershipsByOrganization(organizationId: string, pagination: PaginationParams) {
    const [memberships, total] = await Promise.all([
      this.membershipRepo.findByOrganization(organizationId, pagination),
      this.membershipRepo.countByOrganization(organizationId),
    ]);

    return { memberships, total };
  }

  async getMembershipsByUser(userId: string, pagination: PaginationParams) {
    const [memberships, total] = await Promise.all([
      this.membershipRepo.findByUser(userId, pagination),
      this.membershipRepo.countByUser(userId),
    ]);

    return { memberships, total };
  }

  async createMembership(data: CreateMembershipData): Promise<MembershipEntity> {
    // Check if membership already exists
    const existing = await this.membershipRepo.findByUserAndOrg(data.userId, data.organizationId);
    
    if (existing) {
      throw new ConflictError('User is already a member of this organization');
    }

    return this.membershipRepo.create(data);
  }

  async updateMembership(id: string, data: UpdateMembershipData): Promise<MembershipEntity> {
    // Check if membership exists
    const membership = await this.membershipRepo.findById(id);
    
    if (!membership) {
      throw new NotFoundError('Membership not found');
    }

    return this.membershipRepo.update(id, data);
  }

  async deleteMembership(id: string): Promise<void> {
    // Check if membership exists
    const membership = await this.membershipRepo.findById(id);
    
    if (!membership) {
      throw new NotFoundError('Membership not found');
    }
    
    await this.membershipRepo.delete(id);
  }
}
