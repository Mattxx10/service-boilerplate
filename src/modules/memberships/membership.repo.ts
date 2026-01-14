import { PrismaClient } from '@prisma/client';
import { CreateMembershipData, UpdateMembershipData, MembershipEntity, MembershipWithDetails } from './membership.types';
import { PaginationParams, getPaginationOffset } from '../../shared/types';

export class MembershipRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<MembershipEntity | null> {
    return this.prisma.membership.findUnique({
      where: { id },
    });
  }

  async findByIdWithDetails(id: string): Promise<MembershipWithDetails | null> {
    return this.prisma.membership.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });
  }

  async findByUserAndOrg(userId: string, organizationId: string): Promise<MembershipEntity | null> {
    return this.prisma.membership.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
    });
  }

  async findByOrganization(organizationId: string, pagination: PaginationParams): Promise<MembershipWithDetails[]> {
    const offset = getPaginationOffset(pagination.page, pagination.limit);
    
    return this.prisma.membership.findMany({
      where: { organizationId },
      skip: offset,
      take: pagination.limit,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByUser(userId: string, pagination: PaginationParams): Promise<MembershipWithDetails[]> {
    const offset = getPaginationOffset(pagination.page, pagination.limit);
    
    return this.prisma.membership.findMany({
      where: { userId },
      skip: offset,
      take: pagination.limit,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async countByOrganization(organizationId: string): Promise<number> {
    return this.prisma.membership.count({
      where: { organizationId },
    });
  }

  async countByUser(userId: string): Promise<number> {
    return this.prisma.membership.count({
      where: { userId },
    });
  }

  async create(data: CreateMembershipData): Promise<MembershipEntity> {
    return this.prisma.membership.create({
      data,
    });
  }

  async update(id: string, data: UpdateMembershipData): Promise<MembershipEntity> {
    return this.prisma.membership.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.membership.delete({
      where: { id },
    });
  }
}
