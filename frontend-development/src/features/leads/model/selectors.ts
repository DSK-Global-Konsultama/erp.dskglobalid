import type { Lead, Proposal, EngagementLetter, Handover, Meeting, Notulensi } from '../../../lib/mock-data';

export type CommercialStage =
  | 'TO_BE_MEET'
  | 'MEETING_SCHEDULED'
  | 'NEED_NOTULEN'
  | 'IN_NOTULEN'
  | 'NEED_PROPOSAL'
  | 'IN_PROPOSAL'
  | 'IN_EL'
  | 'EL_SIGNED'
  | 'ON_HOLD'
  | 'DROP';

export type HandoverStatus =
  | 'LOCKED'
  | 'NOT_STARTED'
  | 'DRAFT'
  | 'WAITING_CEO'
  | 'CEO_APPROVED';

export interface LeadTrackerRowMeta {
  commercialStage: CommercialStage;
  activeDocumentLabel: string;
  handoverStatus: HandoverStatus;
}

/**
 * Derive commercial stage, active document, and handover status from lead data
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

  const signedEL = leadELs.find(el => el.status === 'SIGNED');

  if (signedEL) {
    const commercialStage: CommercialStage = 'EL_SIGNED';

    let handoverStatus: HandoverStatus;
    if (leadHandovers.length === 0) {
      handoverStatus = 'NOT_STARTED';
    } else {
      const latestHandover = leadHandovers[leadHandovers.length - 1];
      switch (latestHandover.status) {
        case 'DRAFT':
          handoverStatus = 'DRAFT';
          break;
        case 'WAITING_CEO_APPROVAL':
          handoverStatus = 'WAITING_CEO';
          break;
        case 'APPROVED':
          handoverStatus = 'CEO_APPROVED';
          break;
        case 'REJECTED':
          handoverStatus = 'DRAFT';
          break;
        case 'SENT_TO_PM':
          handoverStatus = 'CEO_APPROVED';
          break;
        default:
          handoverStatus = 'NOT_STARTED';
      }
    }

    let activeDocumentLabel: string;
    if (leadHandovers.length === 0) {
      activeDocumentLabel = 'Handover • Not Started (Required)';
    } else {
      const latestHandover = leadHandovers[leadHandovers.length - 1];
      const substatus = getHandoverSubstatusLabel(latestHandover.status);
      activeDocumentLabel = `Handover • ${substatus}`;
    }

    return {
      commercialStage,
      activeDocumentLabel,
      handoverStatus,
    };
  }

  let commercialStage: CommercialStage;
  let activeDocumentLabel: string;

  const latestEL = leadELs.length > 0 ? leadELs[leadELs.length - 1] : null;
  if (latestEL && latestEL.status !== 'SIGNED') {
    commercialStage = 'IN_EL';
    const substatus = getELSubstatusLabel(latestEL.status);
    activeDocumentLabel = `EL • ${substatus}`;
  } else {
    const latestProposal = leadProposals.length > 0 ? leadProposals[leadProposals.length - 1] : null;
    if (latestProposal) {
      commercialStage = 'IN_PROPOSAL';
      const substatus = getProposalSubstatusLabel(latestProposal.status);
      activeDocumentLabel = `Proposal • ${substatus}`;
    } else {
      const latestNotulen = leadNotulensi.length > 0 ? leadNotulensi[leadNotulensi.length - 1] : null;
      if (latestNotulen) {
        commercialStage = 'IN_NOTULEN';
        const substatus = getNotulenSubstatusLabel(latestNotulen.status);
        activeDocumentLabel = `Notulen • ${substatus}`;
      } else {
        const latestMeeting = leadMeetings.length > 0 ? leadMeetings[leadMeetings.length - 1] : null;
        if (latestMeeting) {
          if (latestMeeting.status === 'SCHEDULED') {
            commercialStage = 'MEETING_SCHEDULED';
            activeDocumentLabel = 'Meeting • Scheduled';
          } else if (latestMeeting.status === 'DONE') {
            commercialStage = 'NEED_NOTULEN';
            activeDocumentLabel = 'Notulen • Not Started';
          } else {
            commercialStage = 'MEETING_SCHEDULED';
            activeDocumentLabel = 'Meeting • Scheduled';
          }
        } else {
          commercialStage = 'TO_BE_MEET';
          activeDocumentLabel = 'Meeting • Not Scheduled';
        }
      }
    }
  }

  const handoverStatus: HandoverStatus = 'LOCKED';

  return {
    commercialStage,
    activeDocumentLabel,
    handoverStatus,
  };
}

function getHandoverSubstatusLabel(status: Handover['status']): string {
  switch (status) {
    case 'DRAFT':
      return 'Draft';
    case 'WAITING_CEO_APPROVAL':
      return 'Waiting CEO Approval';
    case 'APPROVED':
      return 'CEO Approved';
    case 'REJECTED':
      return 'Revision Requested';
    case 'SENT_TO_PM':
      return 'CEO Approved';
    default:
      return 'Not Started (Required)';
  }
}

function getELSubstatusLabel(status: EngagementLetter['status']): string {
  switch (status) {
    case 'DRAFT':
      return 'Draft';
    case 'WAITING_APPROVAL':
      return 'Waiting CEO Approval';
    case 'APPROVED':
      return 'Approved';
    case 'SENT':
      return 'Sent to Client';
    case 'SIGNED':
      return 'Signed';
    case 'REJECTED':
      return 'Revision Requested';
    default:
      return 'Draft';
  }
}

function getProposalSubstatusLabel(status: Proposal['status']): string {
  switch (status) {
    case 'DRAFT':
      return 'Draft';
    case 'WAITING_APPROVAL':
      return 'Waiting CEO Approval';
    case 'WAITING_CEO_APPROVAL':
      return 'Waiting CEO Approval';
    case 'APPROVED':
      return 'Approved';
    case 'SENT':
      return 'Sent to Client';
    case 'ACCEPTED':
      return 'Accepted';
    case 'PROPOSAL_EXPIRED':
      return 'Expired';
    case 'REJECTED':
      return 'Revision Requested';
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
    case 'REJECTED':
      return 'Revision Requested';
    default:
      return 'Not Started';
  }
}
