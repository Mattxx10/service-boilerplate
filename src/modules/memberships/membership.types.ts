import { Membership } from '@prisma/client';

export type MembershipEntity = Membership;

export interface CreateMembershipData {
  userId: string;
  organizationId: string;
  roleId?: string;
}

export interface UpdateMembershipData {
  roleId?: string | null;
}

export interface MembershipWithDetails extends Membership {
  user: {
    id: string;
    email: string;
    name: string | null;
  };
  role: {
    id: string;
    name: string;
    description: string | null;
  } | null;
}
