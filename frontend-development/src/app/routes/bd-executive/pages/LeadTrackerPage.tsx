import { useState, useEffect } from 'react';
import { LeadsManagement } from '../../../../features/leads/components/LeadsManagement';
import { LeadTrackerDetail } from '../../../../features/leads/components/LeadTrackerDetail';
import { generateDummyLeadsBDMEO, type Lead, type Meeting, type Notulensi, type Proposal } from '../../../../lib/mock-data';
import type { LeadStatus } from '../../../../features/leads/components/LeadTrackerDetail';

interface LeadTrackerPageProps {
  userName: string;
  onLeadDetailChange?: (leadDetail: { clientName: string; status: string } | null) => void;
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
  const [leads] = useState<Lead[]>(() => {
    const defaultLeads = generateDummyLeadsBDMEO('Sarah Wijaya');
    const relevantStatuses = ['TO_BE_MEET', 'MEETING_SCHEDULED', 'NEED_PROPOSAL', 'IN_PROPOSAL'];
    return defaultLeads.filter(lead => relevantStatuses.includes((lead as any).status));
  });

  // Update lead detail in header when selected lead changes
  useEffect(() => {
    if (selectedLeadId && onLeadDetailChange) {
      const lead = leads.find(l => l.id === selectedLeadId);
      if (lead) {
        onLeadDetailChange({
          clientName: lead.clientName,
          status: (lead as any).status || lead.status
        });
      }
    } else if (onLeadDetailChange) {
      onLeadDetailChange(null);
    }
  }, [selectedLeadId, leads, onLeadDetailChange]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [notulensi, setNotulensi] = useState<Notulensi[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);

  const handleAddMeeting = (meeting: Meeting) => {
    setMeetings([...meetings, meeting]);
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
    console.log(`Updating lead ${leadId} to status ${status}`);
    // Update header if this is the selected lead
    if (selectedLeadId === leadId && onLeadDetailChange) {
      const lead = leads.find(l => l.id === leadId);
      if (lead) {
        onLeadDetailChange({
          clientName: lead.clientName,
          status: status
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

