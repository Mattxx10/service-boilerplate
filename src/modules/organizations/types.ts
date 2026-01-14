import { Organization } from '@prisma/client';

export type OrganizationEntity = Organization;

export interface CreateOrganizationData {
  name: string;
}

export interface UpdateOrganizationData {
  name?: string;
}
