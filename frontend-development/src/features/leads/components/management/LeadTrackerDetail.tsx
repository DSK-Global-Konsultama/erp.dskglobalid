import { useState } from 'react';
import { LeadInfoTab } from '../tabs/LeadInfoTab';
import { MeetingNotulensiTab } from '../tabs/MeetingNotulensiTab';
import { ProposalTab } from '../tabs/ProposalTab';
import { EngagementLetterTab } from '../tabs/EngagementLetterTab';
import type { Lead, Meeting, Notulensi, Proposal, EngagementLetter } from '../../../../lib/mock-data';

export type LeadStatus = 'NEW' | 'TO_BE_MEET' | 'MEETING_SCHEDULED' | 'NEED_NOTULEN' | 'NEED_PROPOSAL' | 'IN_PROPOSAL' | 'PROPOSAL_EXPIRED' | 'DEAL_WON' | 'ON_HOLD' | 'DROP';

interface LeadTrackerDetailProps {
  leadId: string;
  onBack: () => void;
  leads: Lead[];
  meetings: Meeting[];
  notulensi: Notulensi[];
  proposals: Proposal[];
  engagementLetters: EngagementLetter[];
  onAddMeeting: (meeting: Meeting) => void;
  onUpdateMeeting?: (id: string, updates: Partial<Meeting>) => void;
  onDeleteMeeting?: (id: string) => void;
  onAddNotulensi: (notulensi: Notulensi) => void;
  onUpdateNotulensi: (id: string, updates: Partial<Notulensi>) => void;
  onAddProposal: (proposal: Proposal) => void;
  onUpdateProposal: (id: string, updates: Partial<Proposal>) => void;
  onAddEngagementLetter: (el: EngagementLetter) => void;
  onUpdateEngagementLetter: (id: string, updates: Partial<EngagementLetter>) => void;
  onUpdateLeadStatus: (leadId: string, status: LeadStatus) => void;
}

export function LeadTrackerDetail({ 
  leadId, 
  onBack: _onBack,
  leads,
  meetings,
  notulensi,
  proposals,
  engagementLetters,
  onAddMeeting,
  onUpdateMeeting,
  onDeleteMeeting,
  onAddNotulensi,
  onUpdateNotulensi,
  onAddProposal,
  onUpdateProposal,
  onAddEngagementLetter,
  onUpdateEngagementLetter,
  onUpdateLeadStatus
}: LeadTrackerDetailProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'meeting' | 'proposal' | 'engagement-letter'>('info');
  
  const lead = leads.find(l => l.id === leadId);
  
  if (!lead) {
    return <div>Lead not found</div>;
  }

  const tabs = [
    { id: 'info', label: 'Info Lead' },
    { id: 'meeting', label: 'Meeting & Notulensi' },
    { id: 'proposal', label: 'Proposal' },
    { id: 'engagement-letter', label: 'Engagement Letter' },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-4 border-b-2 transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-600 hover:text-red-600 hover:border-red-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'info' && <LeadInfoTab lead={lead} />}
          {activeTab === 'meeting' && (
            <MeetingNotulensiTab 
              leadId={leadId}
              meetings={meetings}
              notulensi={notulensi}
              leads={leads}
              onAddMeeting={onAddMeeting}
              onUpdateMeeting={onUpdateMeeting}
              onDeleteMeeting={onDeleteMeeting}
              onAddNotulensi={onAddNotulensi}
              onUpdateNotulensi={onUpdateNotulensi}
              onUpdateLeadStatus={onUpdateLeadStatus}
            />
          )}
          {activeTab === 'proposal' && (
            <ProposalTab 
              leadId={leadId}
              leads={leads}
              proposals={proposals}
              onAddProposal={onAddProposal}
              onUpdateProposal={onUpdateProposal}
              onUpdateLeadStatus={onUpdateLeadStatus}
            />
          )}
          {activeTab === 'engagement-letter' && (
            <EngagementLetterTab 
              leadId={leadId}
              leads={leads}
              proposals={proposals}
              engagementLetters={engagementLetters}
              onAddEngagementLetter={onAddEngagementLetter}
              onUpdateEngagementLetter={onUpdateEngagementLetter}
              onUpdateLeadStatus={onUpdateLeadStatus}
            />
          )}
        </div>
      </div>
    </div>
  );
}

