import { FastifyInstance } from 'fastify';
import { MembershipService } from './membership.service';
import {
  createMembershipSchema,
  updateMembershipSchema,
  membershipParamsSchema,
  organizationMembersParamsSchema,
  userMembershipsParamsSchema,
} from './membership.schemas';
import { commonSchemas } from '../../shared/zod';
import { success, paginated } from '../../shared/http';

export async function membershipRoutes(fastify: FastifyInstance) {
  const membershipService = new MembershipService(fastify.membershipRepo);

  // Get membership by ID
  fastify.get('/:id', async (request, reply) => {
    const { id } = membershipParamsSchema.parse(request.params);
    const membership = await membershipService.getMembershipById(id);
    return reply.send(success(membership));
  });

  // List members of an organization
  fastify.get('/organizations/:organizationId/members', async (request, reply) => {
    const { organizationId } = organizationMembersParamsSchema.parse(request.params);
    const pagination = commonSchemas.pagination.parse(request.query);
    const { memberships, total } = await membershipService.getMembershipsByOrganization(
      organizationId,
      pagination
    );
    return reply.send(paginated(memberships, pagination.page, pagination.limit, total));
  });

  // List organizations a user belongs to
  fastify.get('/users/:userId/memberships', async (request, reply) => {
    const { userId } = userMembershipsParamsSchema.parse(request.params);
    const pagination = commonSchemas.pagination.parse(request.query);
    const { memberships, total } = await membershipService.getMembershipsByUser(userId, pagination);
    return reply.send(paginated(memberships, pagination.page, pagination.limit, total));
  });

  // Create membership (invite/join)
  fastify.post('/', async (request, reply) => {
    const data = createMembershipSchema.parse(request.body);
    const membership = await membershipService.createMembership(data);
    return reply.status(201).send(success(membership));
  });

  // Update membership (change role)
  fastify.patch('/:id', async (request, reply) => {
    const { id } = membershipParamsSchema.parse(request.params);
    const data = updateMembershipSchema.parse(request.body);
    const membership = await membershipService.updateMembership(id, data);
    return reply.send(success(membership));
  });

  // Delete membership (leave/remove)
  fastify.delete('/:id', async (request, reply) => {
    const { id } = membershipParamsSchema.parse(request.params);
    await membershipService.deleteMembership(id);
    return reply.status(204).send();
  });
}
