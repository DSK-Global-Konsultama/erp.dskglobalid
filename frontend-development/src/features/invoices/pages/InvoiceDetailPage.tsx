import { useState } from 'react';
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
import { PaymentTermDetailDrawer } from '../ui/drawers/PaymentTermDetailDrawer';

export interface InvoiceDetailPageProps {
  invoice: Invoice;
  /** Diperlukan untuk kompatibilitas; tombol Kembali ada di Header */
  onBack?: () => void;
  formatCurrency: (amount: number) => string;
  formatDate: (dateString?: string) => string;
  onMarkTermAsPaid?: (invoiceId: string, termId: string) => void;
  canMarkAsPaid?: boolean;
}

export function InvoiceDetailPage({
  invoice,
  onBack: _onBack,
  formatCurrency,
  formatDate,
  onMarkTermAsPaid,
  canMarkAsPaid = false,
}: InvoiceDetailPageProps) {
  const [selectedTerm, setSelectedTerm] = useState<PaymentTerm | null>(null);

  const paidAmount = invoice.paymentTerms
    .filter((t: PaymentTerm) => t.status === 'paid')
    .reduce((sum: number, t: PaymentTerm) => sum + t.amount, 0);
  const remainingAmount = invoice.totalAmount - paidAmount;
  const paymentProgress =
    invoice.totalAmount > 0
      ? (paidAmount / invoice.totalAmount) * 100
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
                        term.status !== 'paid';
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
                              {invoice.id}
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
                            <PaymentTermStatusBadge status={term.status} />
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
                          (t: PaymentTerm) => t.status === 'paid'
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
                          (t: PaymentTerm) => t.status !== 'paid'
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
                  {formatCurrency(paidAmount)}
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
                    {invoice.paymentTerms.some((t) => t.status === 'paid') && (
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
                    .filter((t: PaymentTerm) => t.status === 'paid' && t.paidDate)
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
                          {formatDate(term.paidDate)}
                        </p>
                        <p className="text-xs text-green-600 font-semibold">
                          {formatCurrency(term.amount)}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Termin Detail Drawer */}
      {selectedTerm && (
        <PaymentTermDetailDrawer
          term={selectedTerm}
          invoice={invoice}
          open={!!selectedTerm}
          onOpenChange={(open) => !open && setSelectedTerm(null)}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          onMarkAsPaid={onMarkTermAsPaid}
          canMarkAsPaid={canMarkAsPaid}
        />
      )}
    </div>
  );
}
