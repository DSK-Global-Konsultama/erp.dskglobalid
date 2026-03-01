import { useState, useEffect } from 'react';
import { invoiceApi } from '../api/invoiceApi';
import { getInvoiceStats } from '../model/selectors';
import { InvoicesFilters } from '../ui/management/InvoicesFilters';
import { InvoicesTable } from '../ui/management/InvoicesTable';
import { InvoicesPagination } from '../ui/management/InvoicesPagination';
import { InvoicesStatsCards } from '../ui/management/InvoicesStatsCards';
import { InvoiceDetailModal } from '../ui/modals/InvoiceDetailModal';
import type { Invoice } from '../../../lib/mock-data';
import { toast } from 'sonner';

export interface InvoicesManagementPageProps {
  /** Mode: 'invoice' untuk CEO/COO, 'payment' untuk Admin */
  mode?: 'invoice' | 'payment';
  /** Tampilkan statistics cards */
  showStatistics?: boolean;
  /** Custom title dan description */
  title?: string;
  description?: string;
  /** CEO can approve invoice (mode invoice only) */
  canApprove?: boolean;
  /** User role for description (mode invoice) */
  userRole?: string;
  /** Invoices dari props (controlled) */
  invoices?: Invoice[];
  onUpdateInvoices?: (updatedInvoices: Invoice[]) => void;
  /** Filter status (controlled) */
  filterStatus?: string;
  onFilterChange?: (status: string) => void;
}

export function InvoicesManagementPage({
  mode = 'invoice',
  showStatistics = true,
  title,
  description,
  canApprove = false,
  userRole,
  invoices: externalInvoices,
  onUpdateInvoices,
  filterStatus: externalFilterStatus,
  onFilterChange,
}: InvoicesManagementPageProps) {
  const [internalInvoices, setInternalInvoices] = useState<Invoice[]>(() =>
    invoiceApi.getAll()
  );
  const [internalFilterStatus, setInternalFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const invoices = externalInvoices ?? internalInvoices;
  const setInvoices = onUpdateInvoices ?? setInternalInvoices;
  const filterStatus =
    externalFilterStatus !== undefined ? externalFilterStatus : internalFilterStatus;
  const setFilterStatus = onFilterChange ?? setInternalFilterStatus;

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' ||
      inv.paymentTerms.some((t) => t.status === filterStatus);
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  useEffect(() => {
    const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage) || 1;
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(totalPages);
  }, [filteredInvoices.length, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInvoices = filteredInvoices.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const stats = getInvoiceStats(invoices);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleMarkTermAsPaid = (invoiceId: string, termId: string) => {
    if (mode === 'invoice' && !canApprove) {
      toast.error(
        'Anda tidak memiliki wewenang untuk approve invoice. Hanya CEO yang bisa approve.'
      );
      return;
    }
    const updated = invoiceApi.markTermAsPaid(invoiceId, termId, invoices);
    setInvoices(updated);
    toast.success(
      mode === 'payment'
        ? 'Payment berhasil dikonfirmasi!'
        : 'Payment term berhasil ditandai sebagai dibayar!'
    );
  };

  const handleReset = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setCurrentPage(1);
  };

  const displayTitle =
    title ??
    (mode === 'payment'
      ? `Daftar Payment (${filteredInvoices.length})`
      : `Daftar Invoice (${filteredInvoices.length})`);

  const displayDescription =
    description ??
    (mode === 'payment'
      ? 'Monitor dan konfirmasi pembayaran dari client'
      : canApprove
        ? 'CEO dapat approve invoice yang dikirim admin'
        : `COO ${userRole ?? ''} hanya dapat melihat invoice (tidak bisa approve)`);

  return (
    <div className="space-y-6">
      <InvoicesFilters
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        filterStatus={filterStatus}
        onFilterStatusChange={setFilterStatus}
        onReset={handleReset}
      />

      {showStatistics && (
        <InvoicesStatsCards stats={stats} formatCurrency={formatCurrency} />
      )}

      <InvoicesTable
        title={displayTitle}
        description={displayDescription}
        invoices={paginatedInvoices}
        formatCurrency={formatCurrency}
        onViewDetail={(inv) => {
          setSelectedInvoice(inv);
          setIsDetailOpen(true);
        }}
        pagination={
          filteredInvoices.length > 0 ? (
            <InvoicesPagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={filteredInvoices.length}
              paginatedItemsCount={paginatedInvoices.length}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          ) : undefined
        }
      />

      <InvoiceDetailModal
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        invoice={selectedInvoice}
        mode={mode}
        canApprove={canApprove}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
        onMarkTermAsPaid={handleMarkTermAsPaid}
      />
    </div>
  );
}
