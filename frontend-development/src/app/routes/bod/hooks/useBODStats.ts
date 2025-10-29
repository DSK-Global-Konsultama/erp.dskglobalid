import { useState, useEffect } from 'react';
import type { Lead, Deal, Project, Invoice } from '../../../../lib/mock-data';
import { mockLeads, mockDeals, mockProjects, mockInvoices } from '../../../../lib/mock-data';

export function useBODStats() {
  const [stats, setStats] = useState({
    totalLeads: 0,
    availableLeads: 0,
    followUpLeads: 0,
    missedLeads: 0,
    totalDeals: 0,
    totalServices: 0,
    activeProjects: 0,
    waitingAssignment: 0,
    waitingPayment: 0,
    pendingPayments: 0,
    overduePayments: 0,
    totalPendingAmount: 0,
  });

  useEffect(() => {
    
    const totalLeads = mockLeads.length;
    const availableLeads = mockLeads.filter((l: Lead) => l.status === 'available').length;
    const followUpLeads = mockLeads.filter((l: Lead) => l.status === 'follow-up').length;
    const missedLeads = mockLeads.filter((l: Lead) => {
      if (l.status !== 'follow-up' || !l.lastFollowUp) return false;
      const daysSinceFollowUp = Math.floor(
        (new Date().getTime() - new Date(l.lastFollowUp).getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysSinceFollowUp > 90;
    }).length;

    const totalDeals = mockDeals.length;
    const totalServices = mockDeals.reduce((sum: number, d: Deal) => sum + d.services.length, 0);

    const activeProjects = mockProjects.filter((p: Project) => p.status === 'in-progress').length;
    const waitingAssignment = mockProjects.filter((p: Project) => p.status === 'waiting-pm').length;
    const waitingPayment = mockProjects.filter((p: Project) => p.status === 'waiting-first-payment').length;

    const allPaymentTerms = mockInvoices.flatMap((inv: Invoice) => inv.paymentTerms);
    const pendingPayments = allPaymentTerms.filter((t: any) => t.status === 'pending').length;
    const overduePayments = allPaymentTerms.filter((t: any) => t.status === 'overdue').length;
    const totalPendingAmount = allPaymentTerms
      .filter((t: any) => t.status === 'pending' || t.status === 'overdue')
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    setStats({
      totalLeads,
      availableLeads,
      followUpLeads,
      missedLeads,
      totalDeals,
      totalServices,
      activeProjects,
      waitingAssignment,
      waitingPayment,
      pendingPayments,
      overduePayments,
      totalPendingAmount,
    });
  }, []);

  return stats;
}

