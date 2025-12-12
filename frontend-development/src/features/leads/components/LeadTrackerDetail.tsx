import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { StatusChip } from './StatusChip';
import { LeadInfoTab } from './LeadInfoTab';
import { MeetingNotulensiTab } from './MeetingNotulensiTab';
import { ProposalTab } from './ProposalTab';
import type { Lead, Meeting, Notulensi, Proposal } from '../../../lib/mock-data';

export type LeadStatus = 'NEW' | 'TO_BE_MEET' | 'MEETING_SCHEDULED' | 'NEED_PROPOSAL' | 'IN_PROPOSAL' | 'DEAL_WON' | 'ON_HOLD' | 'DROP';

interface LeadTrackerDetailProps {
  leadId: string;
  onBack: () => void;
  leads: Lead[];
  meetings: Meeting[];
  notulensi: Notulensi[];
  proposals: Proposal[];
  onAddMeeting: (meeting: Meeting) => void;
  onAddNotulensi: (notulensi: Notulensi) => void;
  onUpdateNotulensi: (id: string, updates: Partial<Notulensi>) => void;
  onAddProposal: (proposal: Proposal) => void;
  onUpdateProposal: (id: string, updates: Partial<Proposal>) => void;
  onUpdateLeadStatus: (leadId: string, status: LeadStatus) => void;
}

export function LeadTrackerDetail({ 
  leadId, 
  onBack,
  leads,
  meetings,
  notulensi,
  proposals,
  onAddMeeting,
  onAddNotulensi,
  onUpdateNotulensi,
  onAddProposal,
  onUpdateProposal,
  onUpdateLeadStatus
}: LeadTrackerDetailProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'meeting' | 'proposal'>('info');
  
  const lead = leads.find(l => l.id === leadId);
  
  if (!lead) {
    return <div>Lead not found</div>;
  }

  const tabs = [
    { id: 'info', label: 'Info Lead' },
    { id: 'meeting', label: 'Meeting & Notulensi' },
    { id: 'proposal', label: 'Proposal & Deals' },
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
                className={`px-6 py-4 border-b-2 transition-colors ${
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
              onAddNotulensi={onAddNotulensi}
              onUpdateLeadStatus={onUpdateLeadStatus}
            />
          )}
          {activeTab === 'proposal' && (
            <ProposalTab 
              leadId={leadId}
              proposals={proposals}
              onAddProposal={onAddProposal}
              onUpdateProposal={onUpdateProposal}
            />
          )}
        </div>
      </div>
    </div>
  );
}

