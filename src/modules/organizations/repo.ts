import { PrismaClient } from '@prisma/client';
import { CreateOrganizationData, UpdateOrganizationData, OrganizationEntity } from './types';
import { PaginationParams, getPaginationOffset } from '../../shared/types';

export class OrganizationRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<OrganizationEntity | null> {
    return this.prisma.organization.findUnique({
      where: { id },
    });
  }

  async findMany(pagination: PaginationParams): Promise<OrganizationEntity[]> {
    const offset = getPaginationOffset(pagination.page, pagination.limit);
    
    return this.prisma.organization.findMany({
      skip: offset,
      take: pagination.limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  async count(): Promise<number> {
    return this.prisma.organization.count();
  }

  async create(data: CreateOrganizationData): Promise<OrganizationEntity> {
    return this.prisma.organization.create({
      data,
    });
  }

  async update(id: string, data: UpdateOrganizationData): Promise<OrganizationEntity> {
    return this.prisma.organization.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.organization.delete({
      where: { id },
    });
  }
}
