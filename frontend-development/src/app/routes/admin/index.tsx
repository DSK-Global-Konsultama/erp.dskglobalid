import { useState } from 'react';
import { mockInvoices, mockProjects, type Invoice } from '../../../lib/mock-data';
import { ActionRequiredAlert } from './components/ActionRequiredAlert';
import { AdminStats } from './components/AdminStats';
import { PaymentFilter } from './components/PaymentFilter';
import { PaymentsTable } from './components/PaymentsTable';

export function AdminDashboard() {
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredInvoices = invoices.filter(invoice => {
    if (filterStatus === 'all') return true;
    return invoice.paymentTerms.some(term => term.status === filterStatus);
  });

  // Statistics calculations
  const allTerms = invoices.flatMap(inv => inv.paymentTerms);
  const totalPending = allTerms.filter(t => t.status === 'pending').length;
  const totalOverdue = allTerms.filter(t => t.status === 'overdue').length;
  const totalPaid = allTerms.filter(t => t.status === 'paid').length;
  
  const amountPending = allTerms
    .filter(t => t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const amountOverdue = allTerms
    .filter(t => t.status === 'overdue')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const amountPaid = allTerms
    .filter(t => t.status === 'paid')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalReceivables = amountPending + amountOverdue;
  const completedProjects = mockProjects.filter(p => p.status === 'waiting-final-payment');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Admin Dashboard</h2>
        <p className="text-gray-500">Monitor semua pembayaran dari awal sampai akhir</p>
      </div>

      <ActionRequiredAlert completedProjects={completedProjects} />

      <AdminStats
        totalReceivables={totalReceivables}
        totalPending={totalPending}
        totalOverdue={totalOverdue}
        amountOverdue={amountOverdue}
        amountPaid={amountPaid}
        totalPaid={totalPaid}
        completedProjectsCount={completedProjects.length}
      />

      <PaymentFilter filterStatus={filterStatus} onFilterChange={setFilterStatus} />

      <PaymentsTable invoices={filteredInvoices} onUpdateInvoices={setInvoices} />
    </div>
  );
}

