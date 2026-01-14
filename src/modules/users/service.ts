import { UserRepository } from './repo';
import { CreateUserData, UpdateUserData, UserEntity } from './types';
import { NotFoundError, ConflictError } from '../../shared/errors';
import { PaginationParams } from '../../shared/types';

export class UserService {
  constructor(private userRepo: UserRepository) {}

  async getUserById(id: string): Promise<UserEntity> {
    const user = await this.userRepo.findById(id);
    
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    return user;
  }

  async getUserByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepo.findByEmail(email);
  }

  async listUsers(pagination: PaginationParams) {
    const [users, total] = await Promise.all([
      this.userRepo.findMany(pagination),
      this.userRepo.count(),
    ]);

    return { users, total };
  }

  async createUser(data: CreateUserData): Promise<UserEntity> {
    // Check if email already exists
    const existing = await this.userRepo.findByEmail(data.email);
    
    if (existing) {
      throw new ConflictError('Email already in use');
    }

    return this.userRepo.create(data);
  }

  async updateUser(id: string, data: UpdateUserData): Promise<UserEntity> {
    // Check if user exists
    await this.getUserById(id);

    // If email is being updated, check for conflicts
    if (data.email) {
      const existing = await this.userRepo.findByEmail(data.email);
      if (existing && existing.id !== id) {
        throw new ConflictError('Email already in use');
      }
    }

    return this.userRepo.update(id, data);
  }

  async deleteUser(id: string): Promise<void> {
    // Check if user exists
    await this.getUserById(id);
    
    await this.userRepo.delete(id);
  }
}
