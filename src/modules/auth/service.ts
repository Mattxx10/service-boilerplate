import { AuthRepository } from './repo';
import { CreateAuthUserData, UpdateAuthUserData, AuthUserEntity } from './types';
import { NotFoundError, ConflictError } from '../../shared/errors';

export class AuthService {
  constructor(private authRepo: AuthRepository) {}

  /**
   * Get user by Cognito ID - Primary method for BFF authentication flow
   */
  async getUserByCognitoId(cognitoId: string): Promise<AuthUserEntity> {
    const user = await this.authRepo.findByCognitoId(cognitoId);
    
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    return user;
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<AuthUserEntity | null> {
    return this.authRepo.findByEmail(email);
  }

  /**
   * Create user with Cognito ID - Called during initial user registration
   */
  async createUser(data: CreateAuthUserData): Promise<AuthUserEntity> {
    // Check if cognitoId already exists
    const existingByCognito = await this.authRepo.findByCognitoId(data.cognitoId);
    if (existingByCognito) {
      throw new ConflictError('User with this Cognito ID already exists');
    }

    // Check if email already exists
    const existingByEmail = await this.authRepo.findByEmail(data.email);
    if (existingByEmail) {
      throw new ConflictError('Email already in use');
    }

    return this.authRepo.create(data);
  }

  /**
   * Update user by Cognito ID
   */
  async updateUserByCognitoId(cognitoId: string, data: UpdateAuthUserData): Promise<AuthUserEntity> {
    // Check if user exists
    await this.getUserByCognitoId(cognitoId);

    // If email is being updated, check for conflicts
    if (data.email) {
      const existing = await this.authRepo.findByEmail(data.email);
      if (existing && existing.cognitoId !== cognitoId) {
        throw new ConflictError('Email already in use');
      }
    }

    return this.authRepo.updateByCognitoId(cognitoId, data);
  }

  /**
   * Delete user by Cognito ID
   */
  async deleteUserByCognitoId(cognitoId: string): Promise<void> {
    // Check if user exists
    await this.getUserByCognitoId(cognitoId);
    
    await this.authRepo.deleteByCognitoId(cognitoId);
  }

  /**
   * Get or create user - Useful for seamless user provisioning during auth
   */
  async getOrCreateUser(data: CreateAuthUserData): Promise<{ user: AuthUserEntity; created: boolean }> {
    // Try to find existing user by Cognito ID
    let user = await this.authRepo.findByCognitoId(data.cognitoId);
    
    if (user) {
      return { user, created: false };
    }

    // Check by email
    user = await this.authRepo.findByEmail(data.email);
    
    if (user) {
      // User exists with same email but different cognitoId
      // This could happen if user was created manually before Cognito setup
      throw new ConflictError('User exists with this email but different authentication provider');
    }

    // Create new user
    user = await this.authRepo.create(data);
    return { user, created: true };
  }
}
