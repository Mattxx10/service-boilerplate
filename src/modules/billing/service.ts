import { BillingRepository } from './repo';
import { Invoice, CreateInvoiceData } from './types';
import { NotFoundError } from '../../shared/errors';

export class BillingService {
  constructor(private billingRepo: BillingRepository) {}

  async getInvoiceById(id: string): Promise<Invoice> {
    const invoice = await this.billingRepo.findById(id);
    
    if (!invoice) {
      throw new NotFoundError('Invoice not found');
    }
    
    return invoice;
  }

  async getInvoicesByOrganization(organizationId: string): Promise<Invoice[]> {
    return this.billingRepo.findByOrganization(organizationId);
  }

  async createInvoice(data: CreateInvoiceData): Promise<Invoice> {
    return this.billingRepo.create(data);
  }
}
