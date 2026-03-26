import type { Invoice, PaymentTerm } from '../../../lib/mock-data';
import type { InvoiceOverallStatus } from './types';

/**
 * Derive overall invoice status from payment terms.
 */
export function getInvoiceOverallStatus(invoice: Invoice): InvoiceOverallStatus {
  const allPaid = invoice.paymentTerms.every((t) => t.status === 'paid');
  const anyRevision = invoice.paymentTerms.some((t) => t.status === 'revision');
  if (allPaid) return 'Lunas';
  if (anyRevision) return 'Ada Overdue';
  return 'Dalam Proses';
}

export interface InvoiceStats {
  totalPending: number;
  totalOverdue: number;
  totalPaid: number;
  amountPending: number;
  amountOverdue: number;
  amountPaid: number;
}

/**
 * Compute stats from a list of invoices (all payment terms).
 */
export function getInvoiceStats(invoices: Invoice[]): InvoiceStats {
  const allTerms = invoices.flatMap((inv) => inv.paymentTerms);
  return {
    totalPending: allTerms.filter((t) => t.status !== 'paid').length,
    totalOverdue: allTerms.filter((t) => t.status === 'revision').length,
    totalPaid: allTerms.filter((t) => t.status === 'paid').length,
    amountPending: allTerms
      .filter((t) => t.status !== 'paid')
      .reduce((sum, t) => sum + t.amount, 0),
    amountOverdue: allTerms
      .filter((t) => t.status === 'revision')
      .reduce((sum, t) => sum + t.amount, 0),
    amountPaid: allTerms
      .filter((t) => t.status === 'paid')
      .reduce((sum, t) => sum + t.amount, 0),
  };
}

export type { PaymentTerm };
