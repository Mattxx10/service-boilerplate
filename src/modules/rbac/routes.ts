import { FastifyInstance } from 'fastify';
import { RbacService } from './service';
import {
  createRoleSchema,
  updateRoleSchema,
  roleParamsSchema,
  organizationRolesParamsSchema,
  attachPermissionsSchema,
  detachPermissionsSchema,
  syncPermissionsSchema,
  membershipParamsSchema,
  attachMembershipPermissionsSchema,
  detachMembershipPermissionsSchema,
  syncMembershipPermissionsSchema,
} from './schemas';
import { success } from '../../shared/http';

export async function rbacRoutes(fastify: FastifyInstance) {
  const rbacService = new RbacService(fastify.rbacRepo);

  // ===== Permissions =====
  
  // List all permissions
  fastify.get('/permissions', async (_request, reply) => {
    const permissions = await rbacService.getAllPermissions();
    return reply.send(success(permissions));
  });

  // Get permissions for a role
  fastify.get('/roles/:id/permissions', async (request, reply) => {
    const { id } = roleParamsSchema.parse(request.params);
    const permissions = await rbacService.getPermissionsByRole(id);
    return reply.send(success(permissions));
  });

  // Attach permissions to role
  fastify.post('/roles/:id/permissions', async (request, reply) => {
    const { id } = roleParamsSchema.parse(request.params);
    const { permissionIds } = attachPermissionsSchema.parse(request.body);
    await rbacService.attachPermissions(id, permissionIds);
    return reply.send(success({ message: 'Permissions attached successfully' }));
  });

  // Detach permissions from role
  fastify.delete('/roles/:id/permissions', async (request, reply) => {
    const { id } = roleParamsSchema.parse(request.params);
    const { permissionIds } = detachPermissionsSchema.parse(request.body);
    await rbacService.detachPermissions(id, permissionIds);
    return reply.send(success({ message: 'Permissions detached successfully' }));
  });

  // Sync permissions for role (replace all)
  fastify.put('/roles/:id/permissions', async (request, reply) => {
    const { id } = roleParamsSchema.parse(request.params);
    const { permissionIds } = syncPermissionsSchema.parse(request.body);
    await rbacService.syncPermissions(id, permissionIds);
    return reply.send(success({ message: 'Permissions synchronized successfully' }));
  });

  // ===== Roles =====
  
  // List roles for organization
  fastify.get('/organizations/:organizationId/roles', async (request, reply) => {
    const { organizationId } = organizationRolesParamsSchema.parse(request.params);
    const roles = await rbacService.getRolesByOrganization(organizationId);
    return reply.send(success(roles));
  });

  // Get role by ID
  fastify.get('/roles/:id', async (request, reply) => {
    const { id } = roleParamsSchema.parse(request.params);
    const role = await rbacService.getRoleById(id);
    return reply.send(success(role));
  });

  // Create role
  fastify.post('/roles', async (request, reply) => {
    const data = createRoleSchema.parse(request.body);
    const role = await rbacService.createRole(data);
    return reply.status(201).send(success(role));
  });

  // Update role
  fastify.patch('/roles/:id', async (request, reply) => {
    const { id } = roleParamsSchema.parse(request.params);
    const data = updateRoleSchema.parse(request.body);
    const role = await rbacService.updateRole(id, data);
    return reply.send(success(role));
  });

  // Delete role
  fastify.delete('/roles/:id', async (request, reply) => {
    const { id } = roleParamsSchema.parse(request.params);
    await rbacService.deleteRole(id);
    return reply.status(204).send();
  });

  // ===== Membership Permissions =====

  // Get permissions for a membership
  fastify.get('/memberships/:membershipId/permissions', async (request, reply) => {
    const { membershipId } = membershipParamsSchema.parse(request.params);
    const permissions = await rbacService.getPermissionsByMembership(membershipId);
    return reply.send(success(permissions));
  });

  // Attach direct permissions to membership
  fastify.post('/memberships/:membershipId/permissions', async (request, reply) => {
    const { membershipId } = membershipParamsSchema.parse(request.params);
    const { permissionIds } = attachMembershipPermissionsSchema.parse(request.body);
    await rbacService.attachMembershipPermissions(membershipId, permissionIds);
    return reply.send(success({ message: 'Permissions attached to membership successfully' }));
  });

  // Detach direct permissions from membership
  fastify.delete('/memberships/:membershipId/permissions', async (request, reply) => {
    const { membershipId } = membershipParamsSchema.parse(request.params);
    const { permissionIds } = detachMembershipPermissionsSchema.parse(request.body);
    await rbacService.detachMembershipPermissions(membershipId, permissionIds);
    return reply.send(success({ message: 'Permissions detached from membership successfully' }));
  });

  // Sync direct permissions for membership (replace all)
  fastify.put('/memberships/:membershipId/permissions', async (request, reply) => {
    const { membershipId } = membershipParamsSchema.parse(request.params);
    const { permissionIds } = syncMembershipPermissionsSchema.parse(request.body);
    await rbacService.syncMembershipPermissions(membershipId, permissionIds);
    return reply.send(success({ message: 'Permissions synchronized for membership successfully' }));
  });
}
