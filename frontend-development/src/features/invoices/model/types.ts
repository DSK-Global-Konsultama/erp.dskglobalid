/**
 * Payment term status used in invoice management.
 */
export type PaymentTermStatus = 'pending' | 'paid' | 'overdue';

/**
 * Overall invoice status derived from payment terms.
 */
export type InvoiceOverallStatus = 'Lunas' | 'Ada Overdue' | 'Dalam Proses';

/**
 * Status invoice per klien (untuk Staf Admin invoice list).
 */
export type ClientInvoiceStatus =
  | 'DRAFT'
  | 'PENDING_CEO_APPROVAL'
  | 'CEO_APPROVED'
  | 'CEO_REJECTED'
  | 'SENT_TO_CLIENT'
  | 'PARTIALLY_PAID'
  | 'FULLY_PAID'
  | 'OVERDUE';

/**
 * Ringkasan invoice per klien/proyek (untuk daftar Kelola Invoice Staf Admin).
 */
export interface ClientInvoiceSummary {
  clientId: string;
  clientName: string;
  projectName: string;
  service?: string;
  totalInvoices: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: ClientInvoiceStatus;
  paymentProgress: number;
  issueDate: string;
}
