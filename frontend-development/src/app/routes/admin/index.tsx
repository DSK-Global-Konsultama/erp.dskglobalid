import { useState, useEffect, useMemo } from 'react';
import { mockInvoices, mockProjects, type Invoice, type Project } from '../../../lib/mock-data';
import {
  ActionRequiredAlert,
  AdminStats,
  InvoicesManagementPage,
} from '../../../features/invoices';

export function AdminDashboard() {
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [filterStatus, setFilterStatus] = useState<string>('all');

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
      />
    </div>
  );
}

