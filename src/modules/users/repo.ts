import { PrismaClient } from '@prisma/client';
import { CreateUserData, UpdateUserData, UserEntity } from './types';
import { PaginationParams, getPaginationOffset } from '../../shared/types';

export class UserRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<UserEntity | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findMany(pagination: PaginationParams): Promise<UserEntity[]> {
    const offset = getPaginationOffset(pagination.page, pagination.limit);
    
    return this.prisma.user.findMany({
      skip: offset,
      take: pagination.limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  async count(): Promise<number> {
    return this.prisma.user.count();
  }

  async create(data: CreateUserData): Promise<UserEntity> {
    return this.prisma.user.create({
      data,
    });
  }

  async update(id: string, data: UpdateUserData): Promise<UserEntity> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }
}
