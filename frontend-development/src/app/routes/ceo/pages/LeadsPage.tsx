import { useState, useEffect } from 'react';
import { LeadsManagementPage, LeadTrackerDetailPage, leadApi } from '../../../../features/leads';
import type { Lead } from '../../../../lib/mock-data';

const noop = (..._args: unknown[]) => {};

interface CEOLeadsPageProps {
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

export function LeadsPage({ onLeadDetailChange, onBackFromDetail, onResetDetail }: CEOLeadsPageProps) {
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const { leads: defaultLeads, meetings, notulensi, proposals, engagementLetters, handovers } = leadApi.getTrackerData('Sarah Wijaya');
  const relevantStatuses: string[] = ['TO_BE_MEET', 'MEETING_SCHEDULED', 'NEED_NOTULEN', 'NOTULEN_SUBMITTED', 'NOTULEN_APPROVED', 'NEED_PROPOSAL', 'IN_PROPOSAL', 'PROPOSAL_APPROVED', 'PROPOSAL_SENT', 'PROPOSAL_ACCEPTED', 'PROPOSAL_EXPIRED', 'NEED_EL', 'EL_SUBMITTED', 'EL_APPROVED', 'EL_SENT', 'EL_SIGNED', 'NEED_HANDOVER', 'IN_HANDOVER', 'HANDOVER_SUBMITTED', 'HANDOVER_APPROVED', 'HANDOVER_SENT_TO_PM', 'DONE', 'DEAL_WON'];
  const leads = defaultLeads.filter(lead => relevantStatuses.includes((lead as any).status)) as Lead[];

  useEffect(() => {
    if (onResetDetail) {
      onResetDetail(() => {
        setSelectedLeadId(null);
        onLeadDetailChange?.(null);
      });
    }
  }, [onResetDetail, onLeadDetailChange]);

  useEffect(() => {
    if (selectedLeadId && onLeadDetailChange) {
      const lead = leads.find(l => l.id === selectedLeadId);
      if (lead) {
        const leadProposal = proposals.find(p => p.leadId === selectedLeadId);
        const service = (lead as Lead & { service?: string }).service ?? leadProposal?.service;
        onLeadDetailChange({
          clientName: lead.clientName,
          company: lead.company,
          status: (lead as any).status ?? lead.status,
          service,
          source: lead.source,
          picEmail: lead.email,
          picPhone: lead.phone,
        });
      }
    } else if (onLeadDetailChange) {
      onLeadDetailChange(null);
    }
  }, [selectedLeadId, leads, proposals, onLeadDetailChange]);

  const handleBack = () => {
    setSelectedLeadId(null);
    onBackFromDetail?.();
    onLeadDetailChange?.(null);
  };

  if (selectedLeadId) {
    return (
      <LeadTrackerDetailPage
        leadId={selectedLeadId}
        onBack={handleBack}
        leads={leads}
        meetings={meetings}
        notulensi={notulensi}
        proposals={proposals}
        engagementLetters={engagementLetters}
        handovers={handovers}
        readOnly
        onAddMeeting={noop}
        onAddNotulensi={noop}
        onAddProposal={noop}
        onAddEngagementLetter={noop}
        onAddHandover={noop}
        onUpdateNotulensi={noop}
        onUpdateProposal={noop}
        onUpdateEngagementLetter={noop}
        onUpdateHandover={noop}
        onUpdateLeadStatus={noop}
      />
    );
  }

  return (
    <LeadsManagementPage
      userName="Sarah Wijaya"
      mode="tracker"
      title="Semua Lead"
      onLeadClick={setSelectedLeadId}
    />
  );
}
