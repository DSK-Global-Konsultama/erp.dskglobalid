import type { Lead } from '../../../lib/mock-data';
import { mockLeads } from '../../../lib/mock-data';

export const leadsService = {
  getAll: (): Lead[] => {
    // In real app, this would use axios: return await api.get('/leads').then(r => r.data);
    return mockLeads;
  },

  getByStatus: (status: Lead['status'], leads: Lead[]): Lead[] => {
    return leads.filter(lead => lead.status === status);
  },

  getByUser: (userName: string, leads: Lead[]): Lead[] => {
    return leads.filter(lead => lead.createdBy === userName || lead.claimedBy === userName);
  },

  updateStatus: (leadId: string, status: Lead['status'], leads: Lead[]): Lead[] => {
    return leads.map(lead =>
      lead.id === leadId ? { ...lead, status } : lead
    );
  },

  claimLead: (leadId: string, userName: string, leads: Lead[]): Lead[] => {
    return leads.map(lead =>
      lead.id === leadId
        ? {
            ...lead,
            status: 'claimed' as const,
            claimedBy: userName,
            claimedDate: new Date().toISOString().split('T')[0],
          }
        : lead
    );
  },

  getAvailableLeads: (leads: Lead[]): Lead[] => {
    return leads.filter(lead => lead.status === 'available');
  },

  getClaimedLeads: (userName: string, leads: Lead[]): Lead[] => {
    return leads.filter(
      lead => lead.claimedBy === userName && lead.status !== 'available'
    );
  },
};

