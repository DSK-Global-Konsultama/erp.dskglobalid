import type { Lead, Proposal, EngagementLetter, Handover, Meeting, Notulensi } from '../../../lib/mock-data';

// Pipeline status baru dikemas dalam 1 status saja: Commercial Stage
export type CommercialStage =
  // Meeting
  | 'MEETING_NOT_STARTED'
  | 'MEETING_SCHEDULED'
  // Notulen
  | 'NOTULEN_NOT_STARTED'
  | 'NOTULEN_DRAFT'
  | 'NOTULEN_WAITING_CEO_APPROVAL'
  | 'NOTULEN_REVISION'
  | 'NOTULEN_APPROVED'
  // Proposal
  | 'PROPOSAL_NOT_STARTED'
  | 'PROPOSAL_DRAFT'
  | 'PROPOSAL_WAITING_CEO_APPROVAL'
  | 'PROPOSAL_REVISION'
  | 'PROPOSAL_APPROVED'
  | 'PROPOSAL_SENT_TO_CLIENT'
  | 'PROPOSAL_ACCEPTED'
  // Engagement Letter
  | 'EL_NOT_UPLOADED'
  | 'EL_WAITING_CEO_APPROVAL'
  | 'EL_REVISION'
  | 'EL_APPROVED'
  | 'EL_SENT_TO_CLIENT'
  | 'EL_SIGNED'
  // Handover
  | 'HANDOVER_LOCKED'
  | 'HANDOVER_NOT_STARTED'
  | 'HANDOVER_DRAFT'
  | 'HANDOVER_WAITING_CEO_APPROVAL'
  | 'HANDOVER_REVISION'
  | 'HANDOVER_APPROVED';

export interface LeadTrackerRowMeta {
  commercialStage: CommercialStage;
  activeDocumentLabel: string;
}

/**
 * Derive commercial stage and active document from lead data
 */
export function deriveLeadTrackerRowMeta(
  lead: Lead & { status?: string; service?: string },
  meetings: Meeting[],
  notulensi: Notulensi[],
  proposals: Proposal[],
  engagementLetters: EngagementLetter[],
  handovers: Handover[]
): LeadTrackerRowMeta {
  const leadId = lead.id;

  const leadMeetings = meetings.filter(m => m.leadId === leadId);
  const leadNotulensi = notulensi.filter(n => n.leadId === leadId);
  const leadProposals = proposals.filter(p => p.leadId === leadId);
  const leadELs = engagementLetters.filter(el => el.leadId === leadId);
  const leadHandovers = handovers.filter(h => h.leadId === leadId);

  // Handover stage is only reachable after EL Accepted
  const acceptedEL = leadELs.find(el => el.status === 'SIGNED');
  if (acceptedEL) {
    if (leadHandovers.length === 0) {
      return {
        commercialStage: 'HANDOVER_NOT_STARTED',
        activeDocumentLabel: 'Handover • Not Started',
      };
    }

    const latestHandover = leadHandovers[leadHandovers.length - 1];
    const substatus = getHandoverSubstatusLabel(latestHandover.status);

    const commercialStage: CommercialStage = (() => {
      switch (latestHandover.status) {
        case 'DRAFT':
          return 'HANDOVER_DRAFT';
        case 'WAITING_CEO_APPROVAL':
          return 'HANDOVER_WAITING_CEO_APPROVAL';
        case 'APPROVED':
        case 'SENT_TO_PM':
        case 'CONVERTED':
          return 'HANDOVER_APPROVED';
        case 'REVISION':
          return 'HANDOVER_REVISION';
        default:
          return 'HANDOVER_NOT_STARTED';
      }
    })();

    return {
      commercialStage,
      activeDocumentLabel: `Handover • ${substatus}`,
    };
  }

  // EL stage
  const latestEL = leadELs.length > 0 ? leadELs[leadELs.length - 1] : null;
  if (latestEL) {
    const substatus = getELSubstatusLabel(latestEL.status);
    const commercialStage: CommercialStage = (() => {
      switch (latestEL.status) {
        case 'WAITING_APPROVAL':
          return 'EL_WAITING_CEO_APPROVAL';
        case 'APPROVED':
          return 'EL_APPROVED';
        case 'SENT':
          return 'EL_SENT_TO_CLIENT';
        case 'SIGNED':
          return 'EL_SIGNED';
        case 'REVISION':
          return 'EL_REVISION';
        case 'DRAFT':
        default:
          return 'EL_NOT_UPLOADED';
      }
    })();

    return {
      commercialStage,
      activeDocumentLabel: `EL • ${substatus}`,
    };
  }

  // Proposal stage
  const latestProposal = leadProposals.length > 0 ? leadProposals[leadProposals.length - 1] : null;
  if (latestProposal) {
    const substatus = getProposalSubstatusLabel(latestProposal.status);
    const commercialStage: CommercialStage = (() => {
      switch (latestProposal.status) {
        case 'WAITING_APPROVAL':
        case 'WAITING_CEO_APPROVAL':
          return 'PROPOSAL_WAITING_CEO_APPROVAL';
        case 'APPROVED':
          return 'PROPOSAL_APPROVED';
        case 'SENT':
          return 'PROPOSAL_SENT_TO_CLIENT';
        case 'ACCEPTED':
          return 'PROPOSAL_ACCEPTED';
        case 'REVISION':
          return 'PROPOSAL_REVISION';
        case 'DRAFT':
          return 'PROPOSAL_DRAFT';
        default:
          return 'PROPOSAL_NOT_STARTED';
      }
    })();

    return {
      commercialStage,
      activeDocumentLabel: `Proposal • ${substatus}`,
    };
  }

  // Notulen stage
  const latestNotulen = leadNotulensi.length > 0 ? leadNotulensi[leadNotulensi.length - 1] : null;
  if (latestNotulen) {
    const substatus = getNotulenSubstatusLabel(latestNotulen.status);
    const commercialStage: CommercialStage = (() => {
      switch (latestNotulen.status) {
        case 'WAITING_CEO_APPROVAL':
          return 'NOTULEN_WAITING_CEO_APPROVAL';
        case 'APPROVED':
          return 'NOTULEN_APPROVED';
        case 'REVISION':
          return 'NOTULEN_REVISION';
        case 'DRAFT':
          return 'NOTULEN_DRAFT';
        default:
          return 'NOTULEN_NOT_STARTED';
      }
    })();

    return {
      commercialStage,
      activeDocumentLabel: `Notulen • ${substatus}`,
    };
  }

  // Meeting stage
  const latestMeeting = leadMeetings.length > 0 ? leadMeetings[leadMeetings.length - 1] : null;
  if (latestMeeting) {
    if (latestMeeting.status === 'SCHEDULED') {
      return {
        commercialStage: 'MEETING_SCHEDULED',
        activeDocumentLabel: 'Meeting • Scheduled',
      };
    }

    return {
      commercialStage: 'MEETING_NOT_STARTED',
      activeDocumentLabel: 'Meeting • Not Started',
    };
  }

  return {
    commercialStage: 'MEETING_NOT_STARTED',
    activeDocumentLabel: 'Meeting • Not Started',
  };
}

function getHandoverSubstatusLabel(status: Handover['status']): string {
  switch (status) {
    case 'DRAFT':
      return 'Draft';
    case 'WAITING_CEO_APPROVAL':
      return 'Waiting CEO Approval';
    case 'APPROVED':
    case 'SENT_TO_PM':
    case 'CONVERTED':
      return 'Approved';
    case 'REVISION':
      return 'Revision';
    default:
      return 'Not Started';
  }
}

function getELSubstatusLabel(status: EngagementLetter['status']): string {
  switch (status) {
    case 'WAITING_APPROVAL':
      return 'Waiting CEO Approval';
    case 'APPROVED':
      return 'Approved';
    case 'SENT':
      return 'Sent to Client';
    case 'SIGNED':
      return 'Signed';
    case 'REVISION':
      return 'Revision';
    case 'DRAFT':
    default:
      return 'Not Uploaded';
  }
}

function getProposalSubstatusLabel(status: Proposal['status']): string {
  switch (status) {
    case 'DRAFT':
      return 'Draft';
    case 'WAITING_APPROVAL':
    case 'WAITING_CEO_APPROVAL':
      return 'Waiting CEO Approval';
    case 'APPROVED':
      return 'Approved';
    case 'SENT':
      return 'Sent to Client';
    case 'ACCEPTED':
      return 'Accepted';
    case 'REVISION':
      return 'Revision';
    default:
      return 'Not Started';
  }
}

function getNotulenSubstatusLabel(status: Notulensi['status']): string {
  switch (status) {
    case 'DRAFT':
      return 'Draft';
    case 'WAITING_CEO_APPROVAL':
      return 'Waiting CEO Approval';
    case 'APPROVED':
      return 'Approved';
    case 'REVISION':
      return 'Revision';
    default:
      return 'Not Started';
  }
}
