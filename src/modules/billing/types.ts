/**
 * Billing module types
 * Note: This is a placeholder module for demonstration
 * In production, you would integrate with a payment provider (Stripe, etc.)
 */

export interface Invoice {
  id: string;
  organizationId: string;
  amount: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'void';
  createdAt: Date;
}

export interface CreateInvoiceData {
  organizationId: string;
  amount: number;
  currency: string;
}
