import type { Invoice } from '../../../lib/mock-data';
import { mockInvoices } from '../../../lib/mock-data';

export const invoicesService = {
  getAll: (): Invoice[] => {
    return mockInvoices;
  },

  getByStatus: (status: 'pending' | 'paid' | 'overdue', invoices: Invoice[]): Invoice[] => {
    return invoices.filter(invoice =>
      invoice.paymentTerms.some(term => term.status === status)
    );
  },

  markAsPaid: (_invoiceId: string, termId: string, invoices: Invoice[]): Invoice[] => {
    return invoices.map(invoice => ({
      ...invoice,
      paymentTerms: invoice.paymentTerms.map(term =>
        term.id === termId
          ? {
              ...term,
              status: 'paid' as const,
              paidDate: new Date().toISOString().split('T')[0],
            }
          : term
      ),
    }));
  },
};

