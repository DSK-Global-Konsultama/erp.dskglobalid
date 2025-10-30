import type { Deal } from '../../../lib/mock-data';
import { mockDeals } from '../../../lib/mock-data';

export const dealsService = {
  getAll: (): Deal[] => {
    return mockDeals;
  },

  getByBdExecutive: (userName: string, deals: Deal[]): Deal[] => {
    return deals.filter(deal => deal.bdExecutive === userName);
  },

  getByStatus: (status: Deal['proposalStatus'], deals: Deal[]): Deal[] => {
    return deals.filter(deal => deal.proposalStatus === status);
  },

  approveProposal: (dealId: string, deals: Deal[]): Deal[] => {
    return deals.map(deal =>
      deal.id === dealId
        ? {
            ...deal,
            proposalStatus: 'approved' as const,
            proposalApprovedDate: new Date().toISOString().split('T')[0],
          }
        : deal
    );
  },
};

