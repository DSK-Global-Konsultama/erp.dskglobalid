import { useState, useEffect } from 'react';
import {
  InvoicesManagementPage,
  InvoiceDetailPage,
  invoiceApi,
  getInvoiceOverallStatus,
} from '../../../../features/invoices';
import type { InvoiceDetailInfo } from '../../../../components/layout/Header';
import { canApproveInvoices } from '../../../../utils/rolePermissions';
import { authService } from '../../../../services/authService';
import { toast } from 'sonner';

interface COOInvoicesPageProps {
  onInvoiceDetailChange?: (detail: InvoiceDetailInfo | null) => void;
}

export function InvoicesPage({ onInvoiceDetailChange }: COOInvoicesPageProps) {
  const currentUser = authService.getCurrentUser();
  const canApprove = canApproveInvoices(currentUser?.role);
  const [invoices, setInvoices] = useState(() => invoiceApi.getAll());
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

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
    if (!canApprove) {
      toast.error(
        'Anda tidak memiliki wewenang untuk approve invoice. Hanya CEO yang bisa approve.'
      );
      return;
    }
    const updated = invoiceApi.markTermAsPaid(invoiceId, termId, invoices);
    setInvoices(updated);
    toast.success('Payment term berhasil ditandai sebagai dibayar!');
  };

  const detailInvoice = selectedInvoiceId
    ? invoices.find((inv) => inv.id === selectedInvoiceId)
    : null;

  useEffect(() => {
    if (!onInvoiceDetailChange) return;
    if (detailInvoice) {
      const status = getInvoiceOverallStatus(detailInvoice);
      onInvoiceDetailChange({
        invoiceId: detailInvoice.id,
        clientName: detailInvoice.clientName,
        projectTitle: detailInvoice.projectTitle,
        status,
        onBack: () => {
          setSelectedInvoiceId(null);
          onInvoiceDetailChange?.(null);
        },
      });
    } else {
      onInvoiceDetailChange(null);
    }
  }, [detailInvoice, onInvoiceDetailChange]);

  if (detailInvoice) {
    return (
      <InvoiceDetailPage
        invoice={detailInvoice}
        onBack={() => {
          setSelectedInvoiceId(null);
          onInvoiceDetailChange?.(null);
        }}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
        onMarkTermAsPaid={handleMarkTermAsPaid}
        canMarkAsPaid={canApprove}
      />
    );
  }

  return (
    <InvoicesManagementPage
      canApprove={canApprove}
      userRole={currentUser?.role}
      invoices={invoices}
      onUpdateInvoices={setInvoices}
      onInvoiceClick={setSelectedInvoiceId}
    />
  );
}
