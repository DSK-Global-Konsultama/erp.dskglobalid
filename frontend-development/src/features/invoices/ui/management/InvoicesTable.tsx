import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../components/ui/table';
import type { Invoice } from '../../../../lib/mock-data';
import { getInvoiceOverallStatus } from '../../model/selectors';

/** Invoice dengan field opsional untuk tampilan (projectName, service) */
export type InvoiceRow = Invoice & { projectName?: string; service?: string };

export interface InvoicesTableProps {
  title: string;
  description?: string;
  invoices: InvoiceRow[];
  formatCurrency: (amount: number) => string;
  onViewDetail: (invoice: InvoiceRow) => void;
  /** Optional pagination UI to render below the table (same card) */
  pagination?: React.ReactNode;
}

export function InvoicesTable({
  title,
  description,
  invoices,
  formatCurrency,
  onViewDetail,
  pagination,
}: InvoicesTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </CardHeader>
      <CardContent className="px-6">
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No Invoice</TableHead>
                <TableHead>Nama perusahaan</TableHead>
                <TableHead>Nama proyek</TableHead>
                <TableHead>Layanan</TableHead>
                <TableHead className="text-center">Jumlah invoice</TableHead>
                <TableHead className="text-right">Total tagihan</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Progress</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <p className="text-sm font-medium">Belum ada data invoice</p>
                      <p className="text-xs mt-1">Tidak ada invoice di sistem</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice) => {
                  const paidTerms = invoice.paymentTerms.filter(
                    (t) => t.status === 'paid'
                  ).length;
                  const totalTerms = invoice.paymentTerms.length;
                  const paidAmount = invoice.paymentTerms
                    .filter((t) => t.status === 'paid')
                    .reduce((sum, t) => sum + t.amount, 0);
                  const progressPercentage =
                    (paidAmount / invoice.totalAmount) * 100;
                  const overallStatus = getInvoiceOverallStatus(invoice);

                  return (
                    <TableRow
                      key={invoice.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => onViewDetail(invoice)}
                    >
                      <TableCell className="font-medium">{invoice.id}</TableCell>
                      <TableCell>{invoice.clientName}</TableCell>
                      <TableCell>
                        {invoice.projectName ?? invoice.projectId}
                      </TableCell>
                      <TableCell>
                        {invoice.service ?? '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        {totalTerms}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(invoice.totalAmount)}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-sm">{overallStatus}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-full bg-gray-200 rounded-full h-2 min-w-[80px] max-w-[120px]">
                            <div
                              className="bg-green-600 h-2 rounded-full transition-[width]"
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {paidTerms}/{totalTerms} ({progressPercentage.toFixed(0)}%)
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
        {pagination}
      </CardContent>
    </Card>
  );
}
