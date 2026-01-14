import { z } from 'zod';
import { commonSchemas } from '../../shared/zod';

export const createInvoiceSchema = z.object({
  organizationId: commonSchemas.id,
  amount: z.number().positive(),
  currency: z.string().length(3).default('USD'),
});

export const invoiceParamsSchema = z.object({
  id: commonSchemas.id,
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type InvoiceParams = z.infer<typeof invoiceParamsSchema>;
