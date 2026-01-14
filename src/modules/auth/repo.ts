import { PrismaClient } from '@prisma/client';
import { CreateAuthUserData, UpdateAuthUserData, AuthUserEntity } from './types';

export class AuthRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<AuthUserEntity | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByCognitoId(cognitoId: string): Promise<AuthUserEntity | null> {
    return this.prisma.user.findUnique({
      where: { cognitoId },
    });
  }

  async findByEmail(email: string): Promise<AuthUserEntity | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async create(data: CreateAuthUserData): Promise<AuthUserEntity> {
    return this.prisma.user.create({
      data,
    });
  }

  async updateByCognitoId(cognitoId: string, data: UpdateAuthUserData): Promise<AuthUserEntity> {
    return this.prisma.user.update({
      where: { cognitoId },
      data,
    });
  }

  async deleteByCognitoId(cognitoId: string): Promise<void> {
    await this.prisma.user.delete({
      where: { cognitoId },
    });
  }
}
