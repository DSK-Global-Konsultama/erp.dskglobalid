import { useState } from 'react';
import { Card, CardContent } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../components/ui/table';
import { Search } from 'lucide-react';
import type { ClientInvoiceSummary } from '../../model/types';

export interface StafAdminInvoiceListProps {
  clientInvoices: ClientInvoiceSummary[];
  onViewDetail: (clientId: string) => void;
}

export function StafAdminInvoiceList({
  clientInvoices,
  onViewDetail,
}: StafAdminInvoiceListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'secondary' | 'default' | 'outline' | 'destructive' }> = {
      DRAFT: { label: 'Draft', variant: 'secondary' },
      PENDING_CEO_APPROVAL: { label: 'Menunggu Approval CEO', variant: 'default' },
      CEO_APPROVED: { label: 'Disetujui CEO', variant: 'outline' },
      CEO_REJECTED: { label: 'Ditolak', variant: 'destructive' },
      SENT_TO_CLIENT: { label: 'Terkirim', variant: 'default' },
      PARTIALLY_PAID: { label: 'Dibayar Sebagian', variant: 'default' },
      FULLY_PAID: { label: 'Lunas', variant: 'default' },
      OVERDUE: { label: 'Jatuh Tempo', variant: 'destructive' },
    };

    const config = statusConfig[status] || { label: status, variant: 'secondary' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredClients = clientInvoices.filter((client) => {
    const matchesSearch =
      client.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.service?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

    const matchesStatus = statusFilter === 'ALL' || client.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const sortedClients = [...filteredClients].sort(
    (a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Kelola Invoice</h1>
          <p className="text-muted-foreground text-sm">
            Daftar perusahaan/klien yang sudah deal (EL signed) dan kelola invoice mereka
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama perusahaan, nama proyek, atau service..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[240px]">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Status</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="PENDING_CEO_APPROVAL">Menunggu Approval CEO</SelectItem>
                <SelectItem value="CEO_APPROVED">Disetujui CEO</SelectItem>
                <SelectItem value="CEO_REJECTED">Ditolak</SelectItem>
                <SelectItem value="SENT_TO_CLIENT">Terkirim ke Klien</SelectItem>
                <SelectItem value="PARTIALLY_PAID">Dibayar Sebagian</SelectItem>
                <SelectItem value="FULLY_PAID">Lunas</SelectItem>
                <SelectItem value="OVERDUE">Jatuh Tempo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">No</TableHead>
                  <TableHead>Nama Perusahaan</TableHead>
                  <TableHead>Nama Proyek</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead className="text-center">Jumlah Invoice</TableHead>
                  <TableHead className="text-right">Total Tagihan</TableHead>
                  <TableHead className="text-right">Sudah Dibayar</TableHead>
                  <TableHead className="text-right">Sisa Tagihan</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Progress</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                      {searchQuery || statusFilter !== 'ALL'
                        ? 'Tidak ada data yang sesuai dengan filter'
                        : 'Belum ada invoice'}
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedClients.map((client, index) => (
                    <TableRow
                      key={client.clientId}
                      className="hover:bg-accent cursor-pointer"
                      onClick={() => onViewDetail(client.clientId)}
                    >
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{client.clientName}</TableCell>
                      <TableCell>{client.projectName}</TableCell>
                      <TableCell>{client.service ?? '-'}</TableCell>
                      <TableCell className="text-center">{client.totalInvoices}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(client.totalAmount)}
                      </TableCell>
                      <TableCell className="text-right text-green-600">
                        {formatCurrency(client.paidAmount)}
                      </TableCell>
                      <TableCell className="text-right text-orange-600">
                        {formatCurrency(client.remainingAmount)}
                      </TableCell>
                      <TableCell className="text-center">{getStatusBadge(client.status)}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <div className="bg-secondary rounded-full h-2 w-20 overflow-hidden">
                            <div
                              className="bg-green-600 h-full"
                              style={{ width: `${client.paymentProgress}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {client.paymentProgress.toFixed(0)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewDetail(client.clientId);
                          }}
                        >
                          Detail
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {sortedClients.length === 0 && !searchQuery && statusFilter === 'ALL' && (
            <div className="text-center py-12">
              <div className="text-muted-foreground">
                <p className="mb-2">Belum ada proyek yang deal (EL signed)</p>
                <p className="text-sm">
                  Invoice akan otomatis muncul ketika proposal sudah ACCEPTED dan EL sudah SIGNED
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
