import { ResolvedMembership } from '../types';

/**
 * Simple per-request cache for resolved memberships
 * Prevents multiple DB queries for the same membership within a single request
 */
export class PermissionCache {
  private cache: Map<string, ResolvedMembership> = new Map();

  getCacheKey(userId: string, organizationId: string): string {
    return `${userId}:${organizationId}`;
  }

  get(userId: string, organizationId: string): ResolvedMembership | undefined {
    const key = this.getCacheKey(userId, organizationId);
    return this.cache.get(key);
  }

  set(userId: string, organizationId: string, value: ResolvedMembership): void {
    const key = this.getCacheKey(userId, organizationId);
    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }
}
