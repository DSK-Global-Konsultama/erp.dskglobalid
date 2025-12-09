import { useState, useEffect } from 'react';
import { mockInvoices, mockProjects, type Invoice, type Project } from '../../../lib/mock-data';
import { ActionRequiredAlert } from './components/ActionRequiredAlert';
import { AdminStats } from './components/AdminStats';
import { PaymentsTable } from './components/PaymentsTable';

export function AdminDashboard() {
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Auto-update project status ke "completed" jika semua payment term sudah paid
  useEffect(() => {
    setProjects(prevProjects => {
      const updatedProjects = prevProjects.map(project => {
        // Hanya check project yang statusnya waiting-final-payment
        if (project.status !== 'waiting-final-payment') return project;
        
        // Cari invoice untuk project ini
        const invoice = invoices.find(inv => inv.projectId === project.id);
        if (!invoice) return project;
        
        // Check jika semua payment term sudah paid
        const allPaid = invoice.paymentTerms.every(term => term.status === 'paid');
        
        if (allPaid) {
          return {
            ...project,
            status: 'completed' as const,
          };
        }
        
        return project;
      });
      
      return updatedProjects;
    });
  }, [invoices]);

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
  const completedProjects = projects.filter(p => p.status === 'waiting-final-payment');

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
      />

      <PaymentsTable
        invoices={filteredInvoices}
        filterStatus={filterStatus}
        onFilterChange={setFilterStatus}
        onUpdateInvoices={setInvoices}
      />
    </div>
  );
}

