import { LeadInfoTab } from '../tabs/LeadInfoTab';
import { MeetingNotulensiTab } from '../tabs/MeetingNotulensiTab';
import { ProposalTab } from '../tabs/ProposalTab';
import { EngagementLetterTab } from '../tabs/EngagementLetterTab';
import { HandoverMemoTab } from '../tabs/HandoverMemoTab';
import type { Lead, Meeting, Notulensi, Proposal, EngagementLetter, Handover } from '../../../../lib/mock-data';
import type { LeadStatus } from '../../model/types';

export type LeadDetailTabId = 'info' | 'meeting' | 'proposal' | 'engagement-letter' | 'handover-memo';

const TAB_CONFIG: { id: LeadDetailTabId; label: string }[] = [
  { id: 'info', label: 'Info Lead' },
  { id: 'meeting', label: 'Meeting & Notulensi' },
  { id: 'proposal', label: 'Proposal' },
  { id: 'engagement-letter', label: 'Engagement Letter' },
  { id: 'handover-memo', label: 'Handover Memo' },
];

export interface LeadTabsProps {
  leadId: string;
  lead: Lead;
  leads: Lead[];
  activeTab: LeadDetailTabId;
  onTabChange: (tab: LeadDetailTabId) => void;
  readOnly?: boolean;
  meetings: Meeting[];
  notulensi: Notulensi[];
  proposals: Proposal[];
  engagementLetters: EngagementLetter[];
  handovers: Handover[];
  onAddMeeting: (meeting: Meeting) => void;
  onUpdateMeeting?: (id: string, updates: Partial<Meeting>) => void;
  onDeleteMeeting?: (id: string) => void;
  onAddNotulensi: (notulensi: Notulensi) => void;
  onUpdateNotulensi: (id: string, updates: Partial<Notulensi>) => void;
  onAddProposal: (proposal: Proposal) => void;
  onUpdateProposal: (id: string, updates: Partial<Proposal>) => void;
  onAddEngagementLetter: (el: EngagementLetter) => void;
  onUpdateEngagementLetter: (id: string, updates: Partial<EngagementLetter>) => void;
  onAddHandover: (handover: Handover) => void;
  onUpdateHandover: (id: string, updates: Partial<Handover>) => void;
  onUpdateLeadStatus: (leadId: string, status: LeadStatus) => void;
}

export function LeadTabs({
  leadId,
  lead,
  leads,
  activeTab,
  onTabChange,
  readOnly = false,
  meetings,
  notulensi,
  proposals,
  engagementLetters,
  handovers,
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
}: LeadTabsProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="border-b border-gray-200">
        <nav className="flex">
          {TAB_CONFIG.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
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
            readOnly={readOnly}
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
            readOnly={readOnly}
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
            readOnly={readOnly}
            onAddEngagementLetter={onAddEngagementLetter}
            onUpdateEngagementLetter={onUpdateEngagementLetter}
            onUpdateLeadStatus={onUpdateLeadStatus}
          />
        )}
        {activeTab === 'handover-memo' && (
          <HandoverMemoTab
            leadId={leadId}
            leads={leads}
            handovers={handovers}
            proposals={proposals}
            engagementLetters={engagementLetters}
            readOnly={readOnly}
            onAddHandover={onAddHandover}
            onUpdateHandover={onUpdateHandover}
            onUpdateLeadStatus={onUpdateLeadStatus}
          />
        )}
      </div>
    </div>
  );
}
