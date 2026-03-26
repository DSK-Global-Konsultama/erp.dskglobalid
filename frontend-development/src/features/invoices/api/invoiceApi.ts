import type { Invoice, PaymentTerm } from '../../../lib/mock-data';
import { mockInvoices } from '../../../lib/mock-data';

function termMatchesLegacyStatus(
  term: PaymentTerm,
  status: PaymentTerm['status'] | undefined
): boolean {
  if (!status) return false;
  switch (status) {
    case 'paid':
      return term.paymentStatus === 'PAID';
    case 'draft':
      return term.processStatus === 'DRAFT';
    case 'sent':
      return term.processStatus === 'SENT_TO_CLIENT';
    case 'approve':
      return term.processStatus === 'CEO_APPROVED';
    case 'waiting approval':
      return (
        term.processStatus === 'READY_FOR_APPROVAL' ||
        term.processStatus === 'PENDING_CEO_APPROVAL'
      );
    case 'revision':
      return term.processStatus === 'CEO_REJECTED' || term.paymentStatus === 'OVERDUE';
    default:
      return term.status === status;
  }
}

/**
 * Single entry point for invoice-related data (mock for now).
 * Use this instead of importing directly from lib/mock-data.
 */
export const invoiceApi = {
  /** All invoices */
  getAll: (): Invoice[] => mockInvoices,

  getByStatus: (
    status: NonNullable<PaymentTerm['status']>,
    invoices: Invoice[]
  ): Invoice[] =>
    invoices.filter((inv) =>
      inv.paymentTerms.some((term) => termMatchesLegacyStatus(term, status))
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
                    paymentStatus: 'PAID' as const,
                    paidDate: new Date().toISOString().split('T')[0],
                    paidAmount: term.amount,
                  }
                : term
            ),
          }
        : inv
    ),
};

export type { Invoice, PaymentTerm };
