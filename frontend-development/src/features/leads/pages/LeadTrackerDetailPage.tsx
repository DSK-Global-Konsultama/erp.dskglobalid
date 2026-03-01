import { useState } from 'react';
import { LeadTabs, type LeadDetailTabId } from '../ui/detail/LeadTabs';
import type { Lead, Meeting, Notulensi, Proposal, EngagementLetter, Handover } from '../../../lib/mock-data';
import type { LeadStatus } from '../model/types';

export type { LeadStatus };

interface LeadTrackerDetailPageProps {
  leadId: string;
  onBack?: () => void;
  leads: Lead[];
  meetings: Meeting[];
  notulensi: Notulensi[];
  proposals: Proposal[];
  engagementLetters: EngagementLetter[];
  handovers: Handover[];
  readOnly?: boolean;
  onAddMeeting: (meeting: Meeting) => void;
  onUpdateMeeting?: (id: string, updates: Partial<Meeting>) => void;
  onDeleteMeeting?: (id: string) => void;
  onAddNotulensi: (notulensi: Notulensi) => void;
  onUpdateNotulensi: (id: string, updates: Partial<Notulensi>) => void;
  onAddProposal: (proposal: Proposal & { file?: File }) => void;
  onUpdateProposal: (id: string, updates: Partial<Proposal> & { file?: File }) => void;
  onAddEngagementLetter: (el: EngagementLetter) => void;
  onUpdateEngagementLetter: (id: string, updates: Partial<EngagementLetter>) => void;
  onAddHandover: (handover: Handover) => void;
  onUpdateHandover: (id: string, updates: Partial<Handover>) => void;
  onUpdateLeadStatus: (leadId: string, status: LeadStatus) => void;
}

export function LeadTrackerDetailPage({
  leadId,
  leads,
  meetings,
  notulensi,
  proposals,
  engagementLetters,
  handovers,
  readOnly = false,
  onAddMeeting,
  onUpdateMeeting,
  onDeleteMeeting,
  onAddNotulensi,
  onUpdateNotulensi,
  onAddProposal,
  onUpdateProposal,
  onAddEngagementLetter,
  onUpdateEngagementLetter,
  onAddHandover,
  onUpdateHandover,
  onUpdateLeadStatus,
}: LeadTrackerDetailPageProps) {
  const [activeTab, setActiveTab] = useState<LeadDetailTabId>('info');
  const lead = leads.find((l) => l.id === leadId);

  if (!lead) {
    return <div>Lead not found</div>;
  }

  return (
    <div className="space-y-6">
      <LeadTabs
        leadId={leadId}
        lead={lead}
        leads={leads}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        readOnly={readOnly}
        meetings={meetings}
        notulensi={notulensi}
        proposals={proposals}
        engagementLetters={engagementLetters}
        handovers={handovers}
        onAddMeeting={onAddMeeting}
        onUpdateMeeting={onUpdateMeeting}
        onDeleteMeeting={onDeleteMeeting}
        onAddNotulensi={onAddNotulensi}
        onUpdateNotulensi={onUpdateNotulensi}
        onAddProposal={onAddProposal}
        onUpdateProposal={onUpdateProposal}
        onAddEngagementLetter={onAddEngagementLetter}
        onUpdateEngagementLetter={onUpdateEngagementLetter}
        onAddHandover={onAddHandover}
        onUpdateHandover={onUpdateHandover}
        onUpdateLeadStatus={onUpdateLeadStatus}
      />
    </div>
  );
}
