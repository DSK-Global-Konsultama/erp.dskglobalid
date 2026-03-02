import { useState, useEffect, useMemo } from 'react';
import { mockInvoices, mockProjects, type Invoice, type Project } from '../../../lib/mock-data';
import {
  ActionRequiredAlert,
  AdminStats,
  InvoicesManagementPage,
  InvoiceDetailPage,
  invoiceApi,
  getInvoiceOverallStatus,
} from '../../../features/invoices';
import type { InvoiceDetailInfo } from '../../../components/layout/Header';
import { toast } from 'sonner';

interface AdminDashboardProps {
  onInvoiceDetailChange?: (detail: InvoiceDetailInfo | null) => void;
}

export function AdminDashboard({ onInvoiceDetailChange }: AdminDashboardProps) {
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  const formatCurrency = useMemo(
    () => (amount: number) =>
      new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(amount),
    []
  );

  // Auto-update project status ke "completed" jika semua payment term sudah paid
  useEffect(() => {
    setProjects((prevProjects) => {
      return prevProjects.map((project) => {
        if (project.status !== 'waiting-final-payment') return project;
        const invoice = invoices.find((inv) => inv.projectId === project.id);
        if (!invoice) return project;
        const allPaid = invoice.paymentTerms.every((term) => term.status === 'paid');
        if (allPaid) {
          return { ...project, status: 'completed' as const };
        }
        return project;
      });
    });
  }, [invoices]);

  const allTerms = invoices.flatMap((inv) => inv.paymentTerms);
  const totalPending = allTerms.filter((t) => t.status === 'pending').length;
  const totalOverdue = allTerms.filter((t) => t.status === 'overdue').length;
  const totalPaid = allTerms.filter((t) => t.status === 'paid').length;
  const amountPending = allTerms
    .filter((t) => t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);
  const amountOverdue = allTerms
    .filter((t) => t.status === 'overdue')
    .reduce((sum, t) => sum + t.amount, 0);
  const amountPaid = allTerms
    .filter((t) => t.status === 'paid')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalReceivables = amountPending + amountOverdue;
  const completedProjects = projects.filter((p) => p.status === 'waiting-final-payment');

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleMarkTermAsPaid = (invoiceId: string, termId: string) => {
    const updated = invoiceApi.markTermAsPaid(invoiceId, termId, invoices);
    setInvoices(updated);
    toast.success('Payment berhasil dikonfirmasi!');
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
        canMarkAsPaid
      />
    );
  }

  return (
    <div className="space-y-6">
      <ActionRequiredAlert completedProjects={completedProjects} />

      <AdminStats
        totalReceivables={totalReceivables}
        totalPending={totalPending}
        totalOverdue={totalOverdue}
        amountOverdue={amountOverdue}
        amountPaid={amountPaid}
        totalPaid={totalPaid}
        completedProjectsCount={completedProjects.length}
        formatCurrency={formatCurrency}
      />

      <InvoicesManagementPage
        mode="payment"
        showStatistics={false}
        invoices={invoices}
        onUpdateInvoices={setInvoices}
        filterStatus={filterStatus}
        onFilterChange={setFilterStatus}
        onInvoiceClick={setSelectedInvoiceId}
      />
    </div>
  );
}

