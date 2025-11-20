import type { Reimbursement } from '../../../lib/mock-data';
import { mockReimbursements } from '../../../lib/mock-data';

export const reimbursementService = {
  getAll: (): Reimbursement[] => {
    // In real app, this would fetch from API
    return mockReimbursements;
  },

  getByStatus: (status: Reimbursement['status'], reimbursements: Reimbursement[]): Reimbursement[] => {
    return reimbursements.filter(reimb => reimb.status === status);
  },

  getByUser: (userName: string, reimbursements: Reimbursement[]): Reimbursement[] => {
    return reimbursements.filter(reimb => reimb.submittedBy === userName);
  },

  createReimbursement: (
    title: string,
    description: string,
    category: Reimbursement['category'],
    amount: number,
    expenseDate: string,
    submittedBy: string,
    submittedByRole: string,
    existingReimbursements: Reimbursement[],
    notes?: string,
    receiptUrl?: string
  ): Reimbursement => {
    const newId = `R${String(existingReimbursements.length + 1).padStart(3, '0')}`;
    const reimbursement: Reimbursement = {
      id: newId,
      title,
      description,
      category,
      amount,
      requestDate: new Date().toISOString().split('T')[0],
      expenseDate,
      status: 'Pending',
      submittedBy,
      submittedByRole,
      notes,
      receiptUrl,
    };
    return reimbursement;
  },

  updateStatus: (
    reimbursementId: string,
    status: Reimbursement['status'],
    approvedBy: string,
    reimbursements: Reimbursement[],
    rejectedReason?: string
  ): Reimbursement[] => {
    return reimbursements.map(reimb =>
      reimb.id === reimbursementId
        ? {
            ...reimb,
            status,
            approvedDate: new Date().toISOString().split('T')[0],
            approvedBy,
            rejectedReason: status === 'Rejected' ? rejectedReason : undefined,
          }
        : reimb
    );
  },

  filterReimbursements: (
    reimbursements: Reimbursement[],
    filterStatus: string,
    userRole: 'Admin' | 'Other',
    userName: string
  ): Reimbursement[] => {
    if (userRole === 'Admin') {
      // Admin: filter berdasarkan status (lihat semua)
      return filterStatus === 'all'
        ? reimbursements
        : reimbursements.filter(r => r.status === filterStatus);
    } else {
      // Role lain: hanya lihat milik sendiri
      const userReimbursements = reimbursements.filter(r => r.submittedBy === userName);
      return filterStatus === 'all'
        ? userReimbursements
        : userReimbursements.filter(r => r.status === filterStatus);
    }
  },

  getCountByStatus: (status: Reimbursement['status'], reimbursements: Reimbursement[]): number => {
    return reimbursements.filter(r => r.status === status).length;
  },

  getMyReimbursementsCount: (userName: string, reimbursements: Reimbursement[]): number => {
    return reimbursements.filter(r => r.submittedBy === userName).length;
  },

  getTotalAmountByStatus: (status: Reimbursement['status'], reimbursements: Reimbursement[]): number => {
    return reimbursements
      .filter(r => r.status === status)
      .reduce((sum, r) => sum + r.amount, 0);
  },
};

