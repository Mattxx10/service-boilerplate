import { FastifyInstance } from 'fastify';
import { OrganizationService } from './service';
import { createOrganizationSchema, updateOrganizationSchema, organizationParamsSchema } from './schemas';
import { commonSchemas } from '../../shared/zod';
import { success, paginated } from '../../shared/http';

export async function organizationRoutes(fastify: FastifyInstance) {
  const orgService = new OrganizationService(fastify.organizationRepo);

  // List organizations
  fastify.get('/', async (request, reply) => {
    const pagination = commonSchemas.pagination.parse(request.query);
    const { organizations, total } = await orgService.listOrganizations(pagination);
    
    return reply.send(paginated(organizations, pagination.page, pagination.limit, total));
  });

  // Get organization by ID
  fastify.get('/:id', async (request, reply) => {
    const { id } = organizationParamsSchema.parse(request.params);
    const org = await orgService.getOrganizationById(id);
    
    return reply.send(success(org));
  });

  // Create organization
  fastify.post('/', async (request, reply) => {
    const data = createOrganizationSchema.parse(request.body);
    const org = await orgService.createOrganization(data);
    
    return reply.status(201).send(success(org));
  });

  // Update organization
  fastify.patch('/:id', async (request, reply) => {
    const { id } = organizationParamsSchema.parse(request.params);
    const data = updateOrganizationSchema.parse(request.body);
    const org = await orgService.updateOrganization(id, data);
    
    return reply.send(success(org));
  });

  // Delete organization
  fastify.delete('/:id', async (request, reply) => {
    const { id } = organizationParamsSchema.parse(request.params);
    await orgService.deleteOrganization(id);
    
    return reply.status(204).send();
  });
}
