import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';
import { Label } from '../../../../components/ui/label';
import { CheckCircle } from 'lucide-react';
import type { Invoice } from '../../../../lib/mock-data';
import { PaymentTermStatusBadge } from '../shared/PaymentTermStatusBadge';

export interface InvoiceDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice | null;
  mode: 'invoice' | 'payment';
  canApprove: boolean;
  formatCurrency: (amount: number) => string;
  formatDate: (dateString?: string) => string;
  onMarkTermAsPaid: (invoiceId: string, termId: string) => void;
}

export function InvoiceDetailModal({
  open,
  onOpenChange,
  invoice,
  mode,
  canApprove,
  formatCurrency,
  formatDate,
  onMarkTermAsPaid,
}: InvoiceDetailModalProps) {
  if (!invoice) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            Detail {mode === 'payment' ? 'Payment' : 'Invoice'}: {invoice.id}
          </DialogTitle>
          <DialogDescription>{invoice.clientName}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Total Invoice:</Label>
              <p className="text-lg mt-1">{formatCurrency(invoice.totalAmount)}</p>
            </div>
            <div>
              <Label>Project ID:</Label>
              <p className="text-sm mt-1">{invoice.projectId}</p>
            </div>
          </div>

          <div>
            <Label>Payment Schedule:</Label>
            <div className="space-y-3 mt-2">
              {invoice.paymentTerms.map((term) => (
                <div
                  key={term.id}
                  className="border rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="text-gray-500">
                          Termin {term.termNumber}:
                        </span>{' '}
                        <span>{term.description}</span>
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {term.percentage}% dari total (
                        {formatCurrency(term.amount)})
                      </p>
                    </div>
                    <div className="ml-4">
                      <PaymentTermStatusBadge status={term.status} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Due Date:</span>{' '}
                      <span>{formatDate(term.dueDate)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Paid Date:</span>{' '}
                      <span>{formatDate(term.paidDate)}</span>
                    </div>
                  </div>

                  {term.status !== 'paid' && (
                    <Button
                      size="sm"
                      className="mt-3"
                      onClick={() => onMarkTermAsPaid(invoice.id, term.id)}
                      disabled={mode === 'invoice' && !canApprove}
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {mode === 'payment'
                        ? 'Konfirmasi Pembayaran'
                        : 'Approve & Tandai Dibayar'}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-700">Total Terbayar:</span>
                <p className="text-lg">
                  {formatCurrency(
                    invoice.paymentTerms
                      .filter((t) => t.status === 'paid')
                      .reduce((sum, t) => sum + t.amount, 0)
                  )}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-700">Sisa Tagihan:</span>
                <p className="text-lg">
                  {formatCurrency(
                    invoice.paymentTerms
                      .filter((t) => t.status !== 'paid')
                      .reduce((sum, t) => sum + t.amount, 0)
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Tutup</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
