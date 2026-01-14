import { User } from '@prisma/client';

export type UserEntity = User;

export interface CreateUserData {
  email: string;
  name?: string;
}

export interface UpdateUserData {
  email?: string;
  name?: string;
}
