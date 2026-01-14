import { FastifyInstance } from 'fastify';
import { BillingService } from './service';
import { createInvoiceSchema, invoiceParamsSchema } from './schemas';
import { success } from '../../shared/http';
import { requirePermission } from '../rbac/guards/requirePermission';
import { requireOrg } from '../rbac/guards/requireOrg';
import { PermissionKeys } from '../../shared/rbac/permissionKeys';

export async function billingRoutes(fastify: FastifyInstance) {
  const billingService = new BillingService(fastify.billingRepo);

  // Get invoice by ID
  fastify.get('/:id', {
    preHandler: [
      requireOrg(fastify.membershipResolver),
      requirePermission(PermissionKeys.BILLING_READ),
    ],
  }, async (request, reply) => {
    const { id } = invoiceParamsSchema.parse(request.params);
    const invoice = await billingService.getInvoiceById(id);
    return reply.send(success(invoice));
  });

  // List invoices for organization
  fastify.get('/organizations/:organizationId/invoices', {
    preHandler: [
      requireOrg(fastify.membershipResolver),
      requirePermission(PermissionKeys.BILLING_READ),
    ],
  }, async (request, reply) => {
    const { organizationId } = request.params as { organizationId: string };
    const invoices = await billingService.getInvoicesByOrganization(organizationId);
    return reply.send(success(invoices));
  });

  // Create invoice
  fastify.post('/invoices', {
    preHandler: [
      requireOrg(fastify.membershipResolver),
      requirePermission(PermissionKeys.BILLING_INVOICE_CREATE),
    ],
  }, async (request, reply) => {
    const data = createInvoiceSchema.parse(request.body);
    const invoice = await billingService.createInvoice(data);
    return reply.status(201).send(success(invoice));
  });
}
