import { useState, useEffect } from 'react';
import { invoiceApi } from '../api/invoiceApi';
import { getInvoiceStats } from '../model/selectors';
import { InvoicesFilters } from '../ui/management/InvoicesFilters';
import { InvoicesTable } from '../ui/management/InvoicesTable';
import { InvoicesPagination } from '../ui/management/InvoicesPagination';
import { InvoicesStatsCards } from '../ui/management/InvoicesStatsCards';
import type { Invoice } from '../../../lib/mock-data';

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
  /** Filter layanan (controlled) */
  filterService?: string;
  onFilterServiceChange?: (service: string) => void;
  /** Callback saat user klik baris invoice (untuk beralih ke halaman detail, seperti leads) */
  onInvoiceClick?: (invoiceId: string) => void;
}

export function InvoicesManagementPage({
  mode = 'invoice',
  showStatistics = true,
  title,
  description,
  canApprove = false,
  userRole,
  invoices: externalInvoices,
  onUpdateInvoices: _onUpdateInvoices,
  filterStatus: externalFilterStatus,
  onFilterChange,
  filterService: externalFilterService,
  onFilterServiceChange,
  onInvoiceClick,
}: InvoicesManagementPageProps) {
  const [internalInvoices] = useState<Invoice[]>(() => invoiceApi.getAll());
  const [internalFilterStatus, setInternalFilterStatus] = useState<string>('all');
  const [internalFilterService, setInternalFilterService] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const invoices = externalInvoices ?? internalInvoices;
  const filterStatus =
    externalFilterStatus !== undefined ? externalFilterStatus : internalFilterStatus;
  const setFilterStatus = onFilterChange ?? setInternalFilterStatus;
  const filterService =
    externalFilterService !== undefined ? externalFilterService : internalFilterService;
  const setFilterService = onFilterServiceChange ?? setInternalFilterService;

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' ||
      inv.paymentTerms.some((t) => t.status === filterStatus);
    const matchesService =
      filterService === 'all' || (inv.service && inv.service === filterService);
    return matchesSearch && matchesStatus && matchesService;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterService]);

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

  const handleReset = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterService('all');
    setCurrentPage(1);
  };

  const displayTitle =
    title ??
    (mode === 'payment'
      ? `Kelola Invoice (${filteredInvoices.length})`
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
        filterService={filterService}
        onFilterServiceChange={setFilterService}
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
        onViewDetail={(inv) => onInvoiceClick?.(inv.id)}
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
    </div>
  );
}
