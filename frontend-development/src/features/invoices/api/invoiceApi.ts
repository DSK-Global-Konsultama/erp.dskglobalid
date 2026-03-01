import type { Invoice, PaymentTerm } from '../../../lib/mock-data';
import { mockInvoices } from '../../../lib/mock-data';

/**
 * Single entry point for invoice-related data (mock for now).
 * Use this instead of importing directly from lib/mock-data.
 */
export const invoiceApi = {
  /** All invoices */
  getAll: (): Invoice[] => mockInvoices,

  getByStatus: (
    status: PaymentTerm['status'],
    invoices: Invoice[]
  ): Invoice[] =>
    invoices.filter((inv) =>
      inv.paymentTerms.some((term) => term.status === status)
    ),

  markTermAsPaid: (
    invoiceId: string,
    termId: string,
    invoices: Invoice[]
  ): Invoice[] =>
    invoices.map((inv) =>
      inv.id === invoiceId
        ? {
            ...inv,
            paymentTerms: inv.paymentTerms.map((term) =>
              term.id === termId
                ? {
                    ...term,
                    status: 'paid' as const,
                    paidDate: new Date().toISOString().split('T')[0],
                  }
                : term
            ),
          }
        : inv
    ),
};

export type { Invoice, PaymentTerm };
