import { useState, useEffect } from 'react';
import { LeadsManagement } from '../../../../features/leads/components/management/LeadsManagement';
import { LeadTrackerDetail, type LeadStatus } from '../../../../features/leads/components/management/LeadTrackerDetail';
import { generateDummyLeadsBDMEO, mockMeetings, mockNotulensi, mockProposals, type Lead, type Meeting, type Notulensi, type Proposal } from '../../../../lib/mock-data';

interface LeadTrackerPageProps {
  userName: string;
  onLeadDetailChange?: (leadDetail: { 
    clientName: string; 
    company?: string; 
    status: string;
    service?: string;
    source?: string;
    picEmail?: string;
    picPhone?: string;
  } | null) => void;
  onBackFromDetail?: () => void;
  onResetDetail?: (resetFn: () => void) => void;
}

export function LeadTrackerPage({ userName, onLeadDetailChange, onBackFromDetail, onResetDetail }: LeadTrackerPageProps) {
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  // Expose reset function to parent
  useEffect(() => {
    if (onResetDetail) {
      const resetDetail = () => {
        setSelectedLeadId(null);
        if (onLeadDetailChange) {
          onLeadDetailChange(null);
        }
      };
      onResetDetail(resetDetail);
    }
  }, [onResetDetail, onLeadDetailChange]);
  
  // Initialize data from mock-data.ts
  type ExtendedLead = Lead & { 
    service?: string;
    status: LeadStatus | Lead['status'];
  };
  
  const [leads] = useState<ExtendedLead[]>(() => {
    const defaultLeads = generateDummyLeadsBDMEO('Sarah Wijaya');
    const relevantStatuses: LeadStatus[] = ['TO_BE_MEET', 'MEETING_SCHEDULED', 'NEED_NOTULEN', 'NEED_PROPOSAL', 'IN_PROPOSAL', 'PROPOSAL_EXPIRED'];
    return defaultLeads.filter(lead => relevantStatuses.includes(lead.status as LeadStatus)) as ExtendedLead[];
  });
  const [meetings, setMeetings] = useState<Meeting[]>(mockMeetings);
  const [notulensi, setNotulensi] = useState<Notulensi[]>(mockNotulensi);
  const [proposals, setProposals] = useState<Proposal[]>(mockProposals);

  // Update lead detail in header when selected lead changes
  useEffect(() => {
    if (selectedLeadId && onLeadDetailChange) {
      const lead = leads.find(l => l.id === selectedLeadId);
      if (lead) {
        // Get service from lead (if available) or from proposal
        const leadService = lead.service;
        const leadProposal = proposals.find(p => p.leadId === selectedLeadId);
        const service = leadService || leadProposal?.service;
        
        onLeadDetailChange({
          clientName: lead.clientName,
          company: lead.company,
          status: lead.status,
          service: service,
          source: lead.source,
          picEmail: lead.email,
          picPhone: lead.phone
        });
      }
    } else if (onLeadDetailChange) {
      onLeadDetailChange(null);
    }
  }, [selectedLeadId, leads, proposals, onLeadDetailChange]);

  const handleAddMeeting = (meeting: Meeting) => {
    setMeetings([...meetings, meeting]);
  };

  const handleUpdateMeeting = (id: string, updates: Partial<Meeting>) => {
    setMeetings(meetings.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const handleDeleteMeeting = (id: string) => {
    setMeetings(meetings.filter(m => m.id !== id));
  };

  const handleAddNotulensi = (newNotulensi: Notulensi) => {
    setNotulensi([...notulensi, newNotulensi]);
  };

  const handleUpdateNotulensi = (id: string, updates: Partial<Notulensi>) => {
    setNotulensi(notulensi.map(n => n.id === id ? { ...n, ...updates } : n));
  };

  const handleAddProposal = (proposal: Proposal) => {
    setProposals([...proposals, proposal]);
  };

  const handleUpdateProposal = (id: string, updates: Partial<Proposal>) => {
    setProposals(proposals.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const handleUpdateLeadStatus = (leadId: string, status: LeadStatus) => {
    // Update lead status in leads array
    // Note: In a real app, this would update state properly
    // For now, this is handled by the parent component or API
    // Update header if this is the selected lead
    if (selectedLeadId === leadId && onLeadDetailChange) {
      const lead = leads.find(l => l.id === leadId);
      if (lead) {
        // Get service from lead (if available) or from proposal
        const leadService = lead.service;
        const leadProposal = proposals.find(p => p.leadId === leadId);
        const service = leadService || leadProposal?.service;
        
        onLeadDetailChange({
          clientName: lead.clientName,
          company: lead.company,
          status: status,
          service: service,
          source: lead.source,
          picEmail: lead.email,
          picPhone: lead.phone
        });
      }
    }
  };

  const handleBack = () => {
    // Reset selected lead first
    setSelectedLeadId(null);
    // Then notify parent to clear header
    if (onBackFromDetail) {
      onBackFromDetail();
    }
    // Also clear lead detail change
    if (onLeadDetailChange) {
      onLeadDetailChange(null);
    }
  };

  if (selectedLeadId) {
    return (
      <LeadTrackerDetail
        leadId={selectedLeadId}
        onBack={handleBack}
        leads={leads}
        meetings={meetings}
        notulensi={notulensi}
        proposals={proposals}
        onAddMeeting={handleAddMeeting}
        onUpdateMeeting={handleUpdateMeeting}
        onDeleteMeeting={handleDeleteMeeting}
        onAddNotulensi={handleAddNotulensi}
        onUpdateNotulensi={handleUpdateNotulensi}
        onAddProposal={handleAddProposal}
        onUpdateProposal={handleUpdateProposal}
        onUpdateLeadStatus={handleUpdateLeadStatus}
      />
    );
  }

  return <LeadsManagement userName={userName} mode="tracker" onLeadClick={setSelectedLeadId} />;
}

