import type {
  Lead,
  Meeting,
  Notulensi,
  Proposal,
  EngagementLetter,
  Handover,
} from '../../../lib/mock-data';
import {
  mockLeads,
  generateDummyLeadsBDMEO,
  mockMeetings,
  mockNotulensi,
  mockProposals,
  mockEngagementLetters,
  mockHandovers,
  leadSources,
} from '../../../lib/mock-data';

export { leadSources };

/**
 * Single entry point for lead-related data (mock for now).
 * Use this instead of importing directly from lib/mock-data.
 */
export const leadApi = {
  /** All leads (legacy list) */
  getAll: (): Lead[] => mockLeads,

  /** Tracker leads + related documents for BD-MEO / Lead Tracker views */
  getTrackerData: (userName: string) => {
    const defaultLeads = generateDummyLeadsBDMEO(userName);
    return {
      leads: defaultLeads,
      meetings: mockMeetings,
      notulensi: mockNotulensi,
      proposals: mockProposals,
      engagementLetters: mockEngagementLetters,
      handovers: mockHandovers,
      leadSources,
    };
  },

  getByStatus: (status: Lead['status'], leads: Lead[]): Lead[] =>
    leads.filter(lead => lead.status === status),

  getByUser: (userName: string, leads: Lead[]): Lead[] =>
    leads.filter(lead => lead.createdBy === userName || lead.claimedBy === userName),

  updateStatus: (leadId: string, status: Lead['status'], leads: Lead[]): Lead[] =>
    leads.map(lead => (lead.id === leadId ? { ...lead, status } : lead)),

  claimLead: (leadId: string, userName: string, leads: Lead[]): Lead[] =>
    leads.map(lead =>
      lead.id === leadId
        ? {
            ...lead,
            status: 'claimed' as const,
            claimedBy: userName,
            claimedDate: new Date().toISOString().split('T')[0],
          }
        : lead
    ),

  getAvailableLeads: (leads: Lead[]): Lead[] =>
    leads.filter(lead => lead.status === 'available'),

  getClaimedLeads: (userName: string, leads: Lead[]): Lead[] =>
    leads.filter(lead => lead.claimedBy === userName && lead.status !== 'available'),
};

export type {
  Lead,
  Meeting,
  Notulensi,
  Proposal,
  EngagementLetter,
  Handover,
};
