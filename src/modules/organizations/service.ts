import { OrganizationRepository } from './repo';
import { CreateOrganizationData, UpdateOrganizationData, OrganizationEntity } from './types';
import { NotFoundError } from '../../shared/errors';
import { PaginationParams } from '../../shared/types';

export class OrganizationService {
  constructor(private orgRepo: OrganizationRepository) {}

  async getOrganizationById(id: string): Promise<OrganizationEntity> {
    const org = await this.orgRepo.findById(id);
    
    if (!org) {
      throw new NotFoundError('Organization not found');
    }
    
    return org;
  }

  async listOrganizations(pagination: PaginationParams) {
    const [organizations, total] = await Promise.all([
      this.orgRepo.findMany(pagination),
      this.orgRepo.count(),
    ]);

    return { organizations, total };
  }

  async createOrganization(data: CreateOrganizationData): Promise<OrganizationEntity> {
    return this.orgRepo.create(data);
  }

  async updateOrganization(id: string, data: UpdateOrganizationData): Promise<OrganizationEntity> {
    // Check if organization exists
    await this.getOrganizationById(id);

    return this.orgRepo.update(id, data);
  }

  async deleteOrganization(id: string): Promise<void> {
    // Check if organization exists
    await this.getOrganizationById(id);
    
    await this.orgRepo.delete(id);
  }
}
