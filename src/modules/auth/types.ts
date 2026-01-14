import { User } from '@prisma/client';

export type AuthUserEntity = User;

export interface CreateAuthUserData {
  email: string;
  cognitoId: string;
  name?: string;
}

export interface UpdateAuthUserData {
  email?: string;
  name?: string;
}

export interface AuthUserResponse {
  id: string;
  email: string;
  cognitoId: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
}
