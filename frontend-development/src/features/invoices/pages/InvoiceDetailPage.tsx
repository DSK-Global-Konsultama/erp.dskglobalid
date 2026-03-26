import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import {
  Building,
  Mail,
  Phone,
  CheckCircle,
  FileText,
  Calendar,
} from 'lucide-react';
import type { Invoice, PaymentTerm } from '../../../lib/mock-data';
import { PaymentTermStatusBadge } from '../ui/shared/PaymentTermStatusBadge';
import { PaymentTermDetailModal } from '../ui/modals/PaymentTermDetailModal';

export interface InvoiceDetailPageProps {
  invoice: Invoice;
  /** Diperlukan untuk kompatibilitas; tombol Kembali ada di Header */
  onBack?: () => void;
  formatCurrency: (amount: number) => string;
  formatDate: (dateString?: string) => string;
  onMarkTermAsPaid?: (invoiceId: string, termId: string) => void;
  canMarkAsPaid?: boolean;
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function InvoiceDetailPage({
  invoice: invoiceProp,
  onBack: _onBack,
  formatCurrency,
  formatDate,
  onMarkTermAsPaid,
  canMarkAsPaid = false,
}: InvoiceDetailPageProps) {
  const [invoice, setInvoice] = useState<Invoice>(invoiceProp);
  const [selectedTerm, setSelectedTerm] = useState<PaymentTerm | null>(null);

  useEffect(() => {
    setInvoice(invoiceProp);
  }, [invoiceProp.id, invoiceProp]);

  const updateTerm = (termId: string, updater: (t: PaymentTerm) => PaymentTerm) => {
    setInvoice((prev) => ({
      ...prev,
      paymentTerms: prev.paymentTerms.map((t) =>
        t.id === termId ? updater(t) : t
      ),
    }));
    setSelectedTerm((prev) =>
      prev?.id === termId ? updater(prev) : prev
    );
  };

  const handleUpdateTermMeta = (
    _invoiceId: string,
    termId: string,
    patch: Partial<PaymentTerm>
  ) => {
    updateTerm(termId, (t) => ({ ...t, ...patch }));
  };

  const handleUploadInvoiceFile = (_invoiceId: string, termId: string, _file: File) => {
    updateTerm(termId, (t) => ({
      ...t,
      processStatus: 'READY_FOR_APPROVAL' as const,
      invoiceFileUrl: '/uploaded/invoice.pdf',
    }));
  };

  const handleSubmitTermToCeo = (_invoiceId: string, termId: string) => {
    updateTerm(termId, (t) => ({
      ...t,
      processStatus: 'PENDING_CEO_APPROVAL' as const,
    }));
  };

  const handleSendTermToClient = (_invoiceId: string, termId: string) => {
    const now = new Date().toISOString().slice(0, 10);
    updateTerm(termId, (t) => ({
      ...t,
      processStatus: 'SENT_TO_CLIENT' as const,
      sentAt: now,
      invoiceDate: t.invoiceDate ?? now,
      dueDate: t.dueDate ?? addDays(t.invoiceDate ?? now, 30),
    }));
  };

  const handleUploadPaymentProof = (
    _invoiceId: string,
    termId: string,
    payload: { amount: number; date: string; file: File; note?: string }
  ) => {
    updateTerm(termId, (t) => {
      const prevPaid = t.paidAmount ?? 0;
      const newPaid = prevPaid + payload.amount;
      const grossTotal = t.amount;
      const paymentStatus =
        newPaid >= grossTotal
          ? ('PAID' as const)
          : newPaid > 0
            ? ('PARTIAL' as const)
            : ('UNPAID' as const);
      const newPayment = {
        id: `pay-${Date.now()}`,
        amount: payload.amount,
        date: payload.date,
        proofUrl: URL.createObjectURL(payload.file),
        note: payload.note,
      };
      return {
        ...t,
        paidAmount: newPaid,
        paidDate: payload.date,
        payments: [...(t.payments ?? []), newPayment],
        paymentStatus,
      };
    });
  };

  const handleMarkTermAsPaid = (invId: string, termId: string) => {
    onMarkTermAsPaid?.(invId, termId);
    const term = invoice.paymentTerms.find((t) => t.id === termId);
    if (term) {
      const today = new Date().toISOString().slice(0, 10);
      updateTerm(termId, (t) => ({
        ...t,
        paidAmount: t.amount,
        paidDate: today,
        paymentStatus: 'PAID' as const,
        payments: [
          ...(t.payments ?? []),
          {
            id: `pay-${Date.now()}`,
            amount: t.amount,
            date: today,
            proofUrl: '',
          },
        ],
      }));
    }
  };

  const totalPaid = invoice.paymentTerms.reduce(
    (sum: number, t: PaymentTerm) => sum + (t.paidAmount ?? 0),
    0
  );
  const remainingAmount = invoice.totalAmount - totalPaid;
  const paymentProgress =
    invoice.totalAmount > 0
      ? (totalPaid / invoice.totalAmount) * 100
      : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informasi Klien */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building className="h-5 w-5" />
                Informasi Klien
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Nama Perusahaan</p>
                <p className="font-medium">{invoice.clientName}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    Email
                  </p>
                  <p className="text-sm">{invoice.clientEmail ?? '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    Telepon
                  </p>
                  <p className="text-sm">{invoice.clientPhone ?? '—'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Alamat</p>
                  <p className="text-sm">{invoice.clientAddress ?? '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Layanan</p>
                  <p className="text-sm">{invoice.service ?? '—'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ringkasan Invoice */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-5 w-5" />
                Ringkasan Invoice
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nomor Invoice</p>
                  <p className="font-medium font-mono text-sm">{invoice.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tanggal Terbit</p>
                  <p>{formatDate(invoice.createdDate)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Deskripsi</p>
                <p className="text-sm">
                  {invoice.projectTitle ?? invoice.service ?? '—'}
                </p>
              </div>
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="font-semibold">Total Tagihan</span>
                  <span className="font-bold text-lg">
                    {formatCurrency(invoice.totalAmount)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daftar Termin */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Daftar Termin & Invoice</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">No</TableHead>
                      <TableHead>No. Invoice</TableHead>
                      <TableHead>Nama Termin</TableHead>
                      <TableHead className="text-center">Persentase</TableHead>
                      <TableHead className="text-right">Nominal</TableHead>
                      <TableHead>Jatuh Tempo</TableHead>
                      <TableHead>Status Pembayaran</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice.paymentTerms.map((term: PaymentTerm, index: number) => {
                      const isOverdue =
                        term.dueDate &&
                        new Date(term.dueDate) < new Date() &&
                        term.paymentStatus !== 'PAID';
                      return (
                        <TableRow
                          key={term.id}
                          className="hover:bg-muted/50 cursor-pointer"
                          onClick={() => setSelectedTerm(term)}
                        >
                          <TableCell className="text-center">
                            {index + 1}
                          </TableCell>
                          <TableCell>
                            <div className="font-mono text-sm font-medium">
                              {term.invoiceNumber ?? '—'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                Termin {term.termNumber}
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {term.description}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline">{term.percentage}%</Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(term.amount)}
                          </TableCell>
                          <TableCell>
                            <span
                              className={
                                isOverdue ? 'text-red-600 font-medium' : ''
                              }
                            >
                              {term.dueDate
                                ? formatDate(term.dueDate)
                                : '—'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <PaymentTermStatusBadge term={term} />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                setSelectedTerm(term);
                              }}
                            >
                              Detail
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Termin Summary */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Total Termin
                    </p>
                    <p className="text-lg font-semibold">
                      {invoice.paymentTerms.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Termin Lunas
                    </p>
                    <p className="text-lg font-semibold text-green-600">
                      {
                        invoice.paymentTerms.filter(
                          (t: PaymentTerm) => t.paymentStatus === 'PAID'
                        ).length
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Termin Pending
                    </p>
                    <p className="text-lg font-semibold text-orange-600">
                      {
                        invoice.paymentTerms.filter(
                          (t: PaymentTerm) => t.paymentStatus !== 'PAID'
                        ).length
                      }
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Right Column (1/3) */}
        <div className="space-y-6">
          {/* Ringkasan Pembayaran */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Ringkasan Pembayaran
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Total Invoice
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(invoice.totalAmount)}
                </p>
              </div>
              <div className="border-t border-gray-200 pt-4" />
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Sudah Dibayar
                </p>
                    <p className="text-lg font-semibold text-green-600">
                      {formatCurrency(totalPaid)}
                    </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Sisa Tagihan
                </p>
                <p className="text-lg font-semibold text-orange-600">
                  {formatCurrency(remainingAmount)}
                </p>
              </div>
              <div className="pt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-[width]"
                    style={{ width: `${paymentProgress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  {paymentProgress.toFixed(1)}% terbayar
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Timeline Proses */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Timeline Proses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    {invoice.paymentTerms.some((t) => t.paymentStatus === 'PAID') && (
                      <div className="w-0.5 h-full min-h-[8px] bg-gray-200 mt-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="font-medium text-sm">Invoice Dibuat</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(invoice.createdDate)}
                    </p>
                  </div>
                </div>
                  {invoice.paymentTerms
                    .filter((t: PaymentTerm) => t.paymentStatus === 'PAID' && t.paidDate)
                    .map((term: PaymentTerm) => (
                    <div key={term.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <Calendar className="h-4 w-4 text-green-600" />
                        </div>
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-medium text-sm">
                          Pembayaran Termin {term.termNumber}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(term.paidDate ?? undefined)}
                        </p>
                        <p className="text-xs text-green-600 font-semibold">
                          {formatCurrency(term.paidAmount ?? term.amount)}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Termin Detail Modal */}
      {selectedTerm && (
        <PaymentTermDetailModal
          term={selectedTerm}
          invoice={invoice}
          open={!!selectedTerm}
          onOpenChange={(open) => !open && setSelectedTerm(null)}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          onMarkAsPaid={handleMarkTermAsPaid}
          canMarkAsPaid={canMarkAsPaid}
          onUploadInvoiceFile={handleUploadInvoiceFile}
          onSubmitTermToCeo={handleSubmitTermToCeo}
          onSendTermToClient={handleSendTermToClient}
          onUploadPaymentProof={handleUploadPaymentProof}
          onUpdateTermMeta={handleUpdateTermMeta}
        />
      )}
    </div>
  );
}
