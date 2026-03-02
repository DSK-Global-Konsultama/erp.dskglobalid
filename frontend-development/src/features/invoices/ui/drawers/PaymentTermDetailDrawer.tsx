import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';
import { CheckCircle } from 'lucide-react';
import type { Invoice, PaymentTerm } from '../../../../lib/mock-data';
import { PaymentTermStatusBadge } from '../shared/PaymentTermStatusBadge';

export interface PaymentTermDetailDrawerProps {
  term: PaymentTerm;
  invoice: Invoice;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formatCurrency: (amount: number) => string;
  formatDate: (dateString?: string) => string;
  onMarkAsPaid?: (invoiceId: string, termId: string) => void;
  canMarkAsPaid?: boolean;
}

export function PaymentTermDetailDrawer({
  term,
  invoice,
  open,
  onOpenChange,
  formatCurrency,
  formatDate,
  onMarkAsPaid,
  canMarkAsPaid = false,
}: PaymentTermDetailDrawerProps) {
  const isOverdue =
    term.dueDate &&
    new Date(term.dueDate) < new Date() &&
    term.status !== 'paid';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">
            Termin {term.termNumber} – {term.description}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <PaymentTermStatusBadge status={term.status} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Persentase</span>
            <span className="font-medium">{term.percentage}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Nominal</span>
            <span className="font-semibold">{formatCurrency(term.amount)}</span>
          </div>
          {term.dueDate && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Jatuh Tempo</span>
              <span
                className={
                  isOverdue ? 'font-medium text-red-600' : ''
                }
              >
                {formatDate(term.dueDate)}
              </span>
            </div>
          )}
          {term.paidDate && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tanggal Bayar</span>
              <span className="text-sm text-green-600">{formatDate(term.paidDate)}</span>
            </div>
          )}

          {term.status !== 'paid' && onMarkAsPaid && (
            <div className="pt-4 border-t border-gray-200">
              <Button
                className="w-full"
                onClick={() => {
                  onMarkAsPaid(invoice.id, term.id);
                  onOpenChange(false);
                }}
                disabled={!canMarkAsPaid}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Tandai Dibayar
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
