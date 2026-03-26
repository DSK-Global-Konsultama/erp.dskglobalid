import api from '../../../services/api';
import type { CEOFollowUpStatus } from '../../../lib/leadManagementTypes';
import type { CEOLead } from '../../../lib/leadManagementMockData';
import type { Channel } from '../../../lib/leadManagementTypes';
import type { Lead, Meeting, Notulensi, Proposal, EngagementLetter, Handover } from '../../../lib/mock-data';

type BackendLead = {
  id: number | string;
  bank_data_id?: number | string | null;
  source_type: 'CAMPAIGN_FORM' | 'MANUAL';
  campaign_id?: number | string | null;
  campaign_name?: string | null;
  topic_tag?: string | null;
  client_name: string;
  pic_name: string;
  email: string;
  phone: string;
  source_channel?: string | null;
  extra_answers?: any;
  ceo_followup_status: CEOFollowUpStatus;
  ceo_followup_notes?: string | null;
  ceo_followup_date?: string | null;
  pipeline_status: string;
  promoted_by?: string | null;
  promoted_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  commercial_stage?: string | null;
  active_document_label?: string | null;
  // handover_status removed (status handover is part of commercial stage)
  last_activity?: string | null;
};

type BackendTrackerDetail = {
  lead: BackendLead;
  meetings: Array<any>;
  notulensi: Array<any>;
  proposals: Array<any>;
  engagementLetters: Array<any>;
  handovers: Array<any>;
};

const mapChannelFromBackend = (channel?: string | null): Channel | undefined => {
  if (!channel) return undefined;
  const normalized = String(channel).toUpperCase();
  const allowed: Channel[] = ['INSTAGRAM', 'LINKEDIN', 'WEBSITE', 'SEMINAR', 'WEBINAR', 'BREVET', 'IG', 'EVENT'];
  return allowed.includes(normalized as Channel) ? (normalized as Channel) : undefined;
};

const mapLeadFromBackend = (data: BackendLead): CEOLead => {
  let extraData: Record<string, any> | undefined;
  if (data.extra_answers) {
    if (typeof data.extra_answers === 'string') {
      try {
        extraData = JSON.parse(data.extra_answers) || {};
      } catch {
        extraData = {};
      }
    } else {
      extraData = data.extra_answers || {};
    }
  }

  return {
    id: String(data.id),
    clientName: data.client_name,
    picName: data.pic_name,
    email: data.email,
    phone: data.phone,
    sourceType: data.source_type,
    sourceCampaignName: data.campaign_name || undefined,
    topicTag: data.topic_tag || undefined,
    ceoFollowUpStatus: data.ceo_followup_status,
    promotedAt: data.promoted_at || '',
    promotedBy: data.promoted_by || '',
    ceoFollowUpDate: data.ceo_followup_date || undefined,
    ceoFollowUpNotes: data.ceo_followup_notes || undefined,
    pipelineStatus: data.pipeline_status,
    sourceChannel: mapChannelFromBackend(data.source_channel),
    // Backend-derived tracker meta (mirrors FE deriveLeadTrackerRowMeta)
    commercialStage: data.commercial_stage || undefined,
    activeDocumentLabel: data.active_document_label || undefined,
    lastActivity: data.last_activity || undefined,
    extraData,
    bankDataNotes: undefined,
    bankDataId: data.bank_data_id ? String(data.bank_data_id) : undefined,
  };
};

const mapMeetingFromBackend = (m: any): Meeting => ({
  id: String(m.id),
  leadId: String(m.lead_id),
  name: m.name || undefined,
  dateTime: m.date_time ? new Date(m.date_time).toISOString() : new Date(m.created_at).toISOString(),
  location: m.location || '',
  status: m.status,
  notes: m.notes || undefined,
});

const mapNotulensiFromBackend = (n: any): Notulensi => {
  // Best-effort mapping. Keep full structure in payload if needed.
  const payload = n.payload && typeof n.payload === 'string' ? (() => {
    try { return JSON.parse(n.payload); } catch { return {}; }
  })() : (n.payload || {});

  return {
    id: String(n.id),
    leadId: String(n.lead_id),
    meetingId: String(n.meeting_id || ''),
    clientName: n.client_name || '',
    meetingInfo: payload.meetingInfo || { date: '', time: '', location: '' },
    participants: payload.participants || { internal: [], client: [] },
    objectives: n.objectives || payload.objectives || '',
    discussionSummary: payload.discussionSummary || {
      background: '',
      issuesDiscussed: '',
      clientInfo: '',
      firmInfo: '',
      risks: '',
    },
    agreements: payload.agreements || [],
    actionItems: payload.actionItems || [],
    nextSteps: n.next_steps || payload.nextSteps || '',
    notes: n.notes || payload.notes || '',
    status: n.status,
    createdBy: n.created_by || payload.createdBy || 'system',
    createdAt: n.created_at ? new Date(n.created_at).toISOString() : new Date().toISOString(),
    revisionNotes: payload.revisionNotes || undefined,
  };
};

const mapProposalFromBackend = (p: any): Proposal => ({
  id: String(p.id),
  leadId: String(p.lead_id),
  service: p.service || '',
  proposalFee: p.proposal_fee ? Number(p.proposal_fee) : 0,
  agreeFee: p.agree_fee != null ? Number(p.agree_fee) : undefined,
  paymentType: p.payment_type || '',
  paymentTypeFinal: p.payment_type_final || undefined,
  dealDate: p.deal_date ? String(p.deal_date) : undefined,
  hasSubcon: Boolean(p.has_subcon),
  sentAt: p.sent_at ? String(p.sent_at).slice(0, 10) : undefined,
  fileUrl: p.file_url || p.fileUrl || undefined,
  status: p.status,
  revisionNotes: p.revision_notes || p.revisionNotes || undefined,
  createdAt: p.created_at ? new Date(p.created_at).toISOString() : new Date().toISOString(),
  createdBy: p.created_by || undefined,
  clientName: p.client_name || undefined,
});

const mapEngagementLetterFromBackend = (e: any): EngagementLetter => ({
  id: String(e.id),
  leadId: String(e.lead_id),
  service: e.service || '',
  agreeFee: e.agree_fee != null ? Number(e.agree_fee) : undefined,
  hasSubcon: Boolean(e.has_subcon),
  paymentType: e.payment_type || '',
  paymentTypeFinal: e.payment_type_final || undefined,
  status: e.status,
  clientName: e.client_name || '',
  createdAt: e.created_at ? new Date(e.created_at).toISOString() : undefined,
  signedDate: e.signed_date ? new Date(e.signed_date).toISOString() : undefined,
  sentAt: e.sent_at ? new Date(e.sent_at).toISOString() : undefined,
  fileUrl: e.file_url || undefined,
  submittedDate: e.submitted_date ? new Date(e.submitted_date).toISOString() : undefined,
  approvedDate: e.approved_date ? new Date(e.approved_date).toISOString() : undefined,
});

const mapHandoverFromBackend = (h: any): Handover => ({
  id: String(h.id),
  leadId: String(h.lead_id),
  projectId: h.project_id != null ? String(h.project_id) : undefined,
  clientName: h.client_name || '',
  projectTitle: h.project_title || '',
  pm: h.pm || '',
  status: h.status,
  createdBy: h.created_by || 'system',
  createdAt: h.created_at ? new Date(h.created_at).toISOString() : new Date().toISOString(),
  summary: h.summary || undefined,
  deliverables: Array.isArray(h.deliverables)
    ? h.deliverables
    : (typeof h.deliverables === 'string'
      ? (() => { try { return JSON.parse(h.deliverables); } catch { return undefined; } })()
      : undefined),
  notes: h.notes || undefined,
});

const mapMockLeadFromBackendTrackerLead = (data: BackendLead): Lead => {
  // Map backend lead into mock-data Lead shape used by detail UI
  const createdDate = data.created_at ? String(data.created_at).slice(0, 10) : new Date().toISOString().slice(0, 10);

  return {
    id: String(data.id),
    clientName: data.client_name,
    company: data.campaign_name || data.client_name || '-',
    email: data.email,
    phone: data.phone,
    source: 'Other',
    status: 'follow-up',
    claimedBy: data.promoted_by || undefined,
    createdDate,
    claimedDate: data.promoted_at ? String(data.promoted_at).slice(0, 10) : undefined,
    lastFollowUp: data.ceo_followup_date ? String(data.ceo_followup_date).slice(0, 10) : undefined,
    lastActivity: data.last_activity || undefined,
    notes: data.ceo_followup_notes || '',
    createdBy: data.promoted_by || 'system',
  };
};

export const leadsService = {
  async promoteFromBank(bankDataId: string) {
    const res = await api.post<{ message: string; data: BackendLead }>(
      `/leads/promote-from-bank/${encodeURIComponent(bankDataId)}`
    );
    return mapLeadFromBackend(res.data.data);
  },

  async getTrackerLeads(params?: { limit?: number; offset?: number }): Promise<CEOLead[]> {
    const res = await api.get<{ data: BackendLead[] }>('/leads/tracker', {
      params: params || undefined,
    });
    return (res.data.data || []).map(mapLeadFromBackend);
  },

  async getCEOInbox(status: CEOFollowUpStatus | 'ALL' = 'ALL'): Promise<CEOLead[]> {
    const res = await api.get<{ data: BackendLead[] }>('/leads/ceo-inbox', {
      params: status && status !== 'ALL' ? { status } : undefined,
    });
    return (res.data.data || []).map(mapLeadFromBackend);
  },

  async getCEOApprovalLeads(params?: { types?: string }): Promise<CEOLead[]> {
    const res = await api.get<{ data: BackendLead[] }>('/leads/ceo-approvals', {
      params: params || undefined,
    });
    return (res.data.data || []).map(mapLeadFromBackend);
  },

  async updateCEOFollowUp(
    id: string,
    payload: { status: CEOFollowUpStatus; notes?: string | null }
  ): Promise<CEOLead> {
    const res = await api.put<{ message: string; data: BackendLead }>(
      `/leads/ceo-inbox/${encodeURIComponent(id)}/followup`,
      payload
    );
    return mapLeadFromBackend(res.data.data);
  },

  async getTrackerLeadDetail(leadId: string): Promise<{
    lead: Lead;
    meetings: Meeting[];
    notulensi: Notulensi[];
    proposals: Proposal[];
    engagementLetters: EngagementLetter[];
    handovers: Handover[];
  }> {
    const fetchDetail = async (path: string) => {
      const res = await api.get<{ data: BackendTrackerDetail }>(path);
      const detail = res.data.data;
      return {
        lead: mapMockLeadFromBackendTrackerLead(detail.lead),
        meetings: (detail.meetings || []).map(mapMeetingFromBackend),
        notulensi: (detail.notulensi || []).map(mapNotulensiFromBackend),
        proposals: (detail.proposals || []).map(mapProposalFromBackend),
        engagementLetters: (detail.engagementLetters || []).map(mapEngagementLetterFromBackend),
        handovers: (detail.handovers || []).map(mapHandoverFromBackend),
      };
    };

    try {
      return await fetchDetail(`/leads/tracker/${encodeURIComponent(leadId)}`);
    } catch {
      // Dev fallback: server.js exposes non-JWT route under /testing
      return await fetchDetail(`/testing/tracker/${encodeURIComponent(leadId)}`);
    }
  },

  async createMeeting(leadId: string, payload: { name?: string; dateTime: string; location: string; notes?: string; status?: 'SCHEDULED' | 'DONE' | 'CANCELLED' }) {
    const res = await api.post<{ data: any }>(`/leads/${encodeURIComponent(leadId)}/meetings`, payload);
    return mapMeetingFromBackend(res.data.data);
  },

  async updateMeeting(leadId: string, meetingId: string, payload: { name?: string; dateTime?: string; location?: string; notes?: string; status?: 'SCHEDULED' | 'DONE' | 'CANCELLED' }) {
    const res = await api.put<{ data: any }>(
      `/leads/${encodeURIComponent(leadId)}/meetings/${encodeURIComponent(meetingId)}`,
      payload
    );
    return mapMeetingFromBackend(res.data.data);
  },

  async deleteMeeting(leadId: string, meetingId: string) {
    await api.delete(`/leads/${encodeURIComponent(leadId)}/meetings/${encodeURIComponent(meetingId)}`);
    return true;
  },

  async createNotulensi(leadId: string, payload: {
    meetingId?: string;
    clientName?: string;
    title?: string;
    status?: 'DRAFT' | 'WAITING_CEO_APPROVAL' | 'REVISION' | 'APPROVED';
    objectives?: string;
    nextSteps?: string;
    notes?: string;
    payload?: any;
  }) {
    const res = await api.post<{ data: any }>(`/leads/${encodeURIComponent(leadId)}/notulensi`, payload);
    return mapNotulensiFromBackend(res.data.data);
  },

  async updateNotulensi(leadId: string, notulensiId: string, payload: any) {
    const doPut = async (path: string) => {
      const res = await api.put<{ data: any }>(path, payload);
      return mapNotulensiFromBackend(res.data.data);
    };

    try {
      return await doPut(`/leads/${encodeURIComponent(leadId)}/notulensi/${encodeURIComponent(notulensiId)}`);
    } catch {
      return await doPut(`/testing/leads/${encodeURIComponent(leadId)}/notulensi/${encodeURIComponent(notulensiId)}`);
    }
  },

  async createProposal(leadId: string, payload: {
    clientName?: string;
    service?: string;
    proposalFee?: number;
    agreeFee?: number;
    paymentType?: string;
    paymentTypeFinal?: string;
    dealDate?: string;
    hasSubcon?: boolean;
    status?: string;
    sentAt?: string;
    fileUrl?: string;
    file?: File;
    payload?: any;
  }) {
    let _payload: any = payload;
    let config = {};
    if (payload.file) {
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (key === 'file' && value instanceof File) {
          formData.append('file', value);
        } else if (value !== undefined && key !== 'file') {
          formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
        }
      });
      _payload = formData;
      config = { headers: { 'Content-Type': 'multipart/form-data' } };
    }
    const res = await api.post<{ data: any }>(`/leads/${encodeURIComponent(leadId)}/proposals`, _payload, config);
    return mapProposalFromBackend(res.data.data);
  },

  async updateProposal(leadId: string, proposalId: string, payload: any) {
    let _payload: any = payload;
    let config = {};
    if (payload && payload.file) {
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (key === 'file' && value instanceof File) {
          formData.append('file', value);
        } else if (value !== undefined && key !== 'file') {
          formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
        }
      });
      _payload = formData;
      config = { headers: { 'Content-Type': 'multipart/form-data' } };
    }

    const doPut = async (path: string) => {
      const res = await api.put<{ data: any }>(path, _payload, config);
      return mapProposalFromBackend(res.data.data);
    };

    try {
      return await doPut(`/leads/${encodeURIComponent(leadId)}/proposals/${encodeURIComponent(proposalId)}`);
    } catch {
      return await doPut(`/testing/leads/${encodeURIComponent(leadId)}/proposals/${encodeURIComponent(proposalId)}`);
    }
  },

  async createEngagementLetter(leadId: string, payload: {
    clientName?: string;
    service?: string;
    agreeFee?: number;
    hasSubcon?: boolean;
    paymentType?: string;
    paymentTypeFinal?: string;
    status?: string;
    submittedDate?: string;
    approvedDate?: string;
    sentAt?: string;
    signedDate?: string;
    fileUrl?: string;
    payload?: any;
  }) {
    const res = await api.post<{ data: any }>(`/leads/${encodeURIComponent(leadId)}/engagement-letters`, payload);
    return mapEngagementLetterFromBackend(res.data.data);
  },

  async updateEngagementLetter(leadId: string, elId: string, payload: any) {
    const doPut = async (path: string) => {
      const res = await api.put<{ data: any }>(path, payload);
      return mapEngagementLetterFromBackend(res.data.data);
    };

    try {
      return await doPut(`/leads/${encodeURIComponent(leadId)}/engagement-letters/${encodeURIComponent(elId)}`);
    } catch {
      return await doPut(`/testing/leads/${encodeURIComponent(leadId)}/engagement-letters/${encodeURIComponent(elId)}`);
    }
  },

  async createHandover(leadId: string, payload: {
    projectId?: string;
    clientName?: string;
    projectTitle?: string;
    pm?: string;
    status?: string;
    summary?: string;
    deliverables?: string[];
    notes?: string;
    sentAt?: string;
    convertedAt?: string;
    fileUrl?: string;
    payload?: any;
  }) {
    const res = await api.post<{ data: any }>(`/leads/${encodeURIComponent(leadId)}/handovers`, payload);
    return mapHandoverFromBackend(res.data.data);
  },

  async updateHandover(leadId: string, handoverId: string, payload: any) {
    const doPut = async (path: string) => {
      const res = await api.put<{ data: any }>(path, payload);
      return mapHandoverFromBackend(res.data.data);
    };

    try {
      return await doPut(`/leads/${encodeURIComponent(leadId)}/handovers/${encodeURIComponent(handoverId)}`);
    } catch {
      return await doPut(`/testing/leads/${encodeURIComponent(leadId)}/handovers/${encodeURIComponent(handoverId)}`);
    }
  },
};