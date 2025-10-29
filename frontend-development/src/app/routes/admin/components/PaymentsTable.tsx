import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/table';
import { Badge } from '../../../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../../components/ui/dialog';
import { Label } from '../../../../components/ui/label';
import { type Invoice, type PaymentTerm } from '../../../../lib/mock-data';
import { AlertCircle, CheckCircle, Clock, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentsTableProps {
  invoices: Invoice[];
  onUpdateInvoices: (updatedInvoices: Invoice[]) => void;
}

export function PaymentsTable({ invoices, onUpdateInvoices }: PaymentsTableProps) {
  const [isViewDetailOpen, setIsViewDetailOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: PaymentTerm['status']) => {
    const config = {
      pending: {
        variant: 'outline' as const,
        className: 'bg-orange-50 text-orange-700 border-orange-200',
        icon: Clock,
        label: 'Pending',
      },
      paid: {
        variant: 'outline' as const,
        className: 'bg-green-50 text-green-700 border-green-200',
        icon: CheckCircle,
        label: 'Paid',
      },
      overdue: {
        variant: 'outline' as const,
        className: 'bg-red-50 text-red-700 border-red-200',
        icon: AlertCircle,
        label: 'Overdue',
      },
    };

    const { variant, className, icon: Icon, label } = config[status];
    return (
      <Badge variant={variant} className={className}>
        <Icon className="w-3 h-3 mr-1" />
        {label}
      </Badge>
    );
  };

  const getInvoiceOverallStatus = (invoice: Invoice) => {
    const allPaid = invoice.paymentTerms.every(t => t.status === 'paid');
    const anyOverdue = invoice.paymentTerms.some(t => t.status === 'overdue');
    
    if (allPaid) return 'Lunas';
    if (anyOverdue) return 'Ada Overdue';
    return 'Dalam Proses';
  };

  const markTermAsPaid = (invoiceId: string, termId: string) => {
    const updatedInvoices = invoices.map(inv => {
      if (inv.id === invoiceId) {
        return {
          ...inv,
          paymentTerms: inv.paymentTerms.map(term => {
            if (term.id === termId) {
              return {
                ...term,
                status: 'paid' as const,
                paidDate: new Date().toISOString().split('T')[0],
              };
            }
            return term;
          }),
        };
      }
      return inv;
    });
    
    onUpdateInvoices(updatedInvoices);
    toast.success('Payment berhasil dikonfirmasi!');
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Daftar Payment ({invoices.length})</CardTitle>
          <CardDescription>
            Monitor dan konfirmasi pembayaran dari client
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Terms</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map(invoice => {
                  const paidTerms = invoice.paymentTerms.filter(t => t.status === 'paid').length;
                  const totalTerms = invoice.paymentTerms.length;
                  const paidAmount = invoice.paymentTerms
                    .filter(t => t.status === 'paid')
                    .reduce((sum, t) => sum + t.amount, 0);
                  const progressPercentage = (paidAmount / invoice.totalAmount) * 100;

                  return (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <div>
                          <p className="text-sm">{invoice.id}</p>
                          <p className="text-xs text-gray-500">Project: {invoice.projectId}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{invoice.clientName}</p>
                      </TableCell>
                      <TableCell>{formatCurrency(invoice.totalAmount)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {totalTerms === 2 && <Badge variant="secondary">50% - 50%</Badge>}
                          {totalTerms === 3 && <Badge variant="secondary">50% - 35% - 15%</Badge>}
                          {totalTerms > 3 && <Badge variant="secondary">{totalTerms} Terms</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {getInvoiceOverallStatus(invoice)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm mb-1">
                            {paidTerms}/{totalTerms} termin
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {progressPercentage.toFixed(0)}%
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedInvoice(invoice);
                            setIsViewDetailOpen(true);
                          }}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Detail
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Detail Dialog */}
      <Dialog open={isViewDetailOpen} onOpenChange={setIsViewDetailOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detail Payment: {selectedInvoice?.id}</DialogTitle>
            <DialogDescription>{selectedInvoice?.clientName}</DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Total Invoice:</Label>
                  <p className="text-lg mt-1">{formatCurrency(selectedInvoice.totalAmount)}</p>
                </div>
                <div>
                  <Label>Project:</Label>
                  <p className="text-sm mt-1">{selectedInvoice.projectId}</p>
                </div>
              </div>

              <div>
                <Label>Payment Schedule:</Label>
                <div className="space-y-3 mt-2">
                  {selectedInvoice.paymentTerms.map((term) => (
                    <div key={term.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="text-gray-500">Termin {term.termNumber}:</span>{' '}
                            <span>{term.description}</span>
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {term.percentage}% dari total ({formatCurrency(term.amount)})
                          </p>
                        </div>
                        <div className="ml-4">
                          {getStatusBadge(term.status)}
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
                          onClick={() => markTermAsPaid(selectedInvoice.id, term.id)}
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Konfirmasi Pembayaran
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
                        selectedInvoice.paymentTerms
                          .filter(t => t.status === 'paid')
                          .reduce((sum, t) => sum + t.amount, 0)
                      )}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-700">Sisa Tagihan:</span>
                    <p className="text-lg">
                      {formatCurrency(
                        selectedInvoice.paymentTerms
                          .filter(t => t.status !== 'paid')
                          .reduce((sum, t) => sum + t.amount, 0)
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDetailOpen(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

