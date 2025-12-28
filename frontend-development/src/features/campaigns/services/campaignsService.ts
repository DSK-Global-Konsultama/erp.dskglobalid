import type { Campaign, Form, BankDataEntry, CampaignType, Channel, CampaignStatus } from '../../../lib/leadManagementTypes';
import { mockCampaigns, mockForms, mockBankData } from '../../../lib/leadManagementMockData';

export const campaignsService = {
  // ==================== CAMPAIGNS ====================
  
  getAll: (): Campaign[] => {
    // In real app, this would fetch from API: return await fetch('/api/campaigns').then(r => r.json());
    return mockCampaigns;
  },

  getById: (campaignId: string): Campaign | undefined => {
    // In real app: return await fetch(`/api/campaigns/${campaignId}`).then(r => r.json());
    return mockCampaigns.find(c => c.id === campaignId);
  },

  getByStatus: (status: CampaignStatus, campaigns: Campaign[]): Campaign[] => {
    return campaigns.filter(campaign => campaign.status === status);
  },

  getByType: (type: CampaignType, campaigns: Campaign[]): Campaign[] => {
    return campaigns.filter(campaign => campaign.type === type);
  },

  getByChannel: (channel: Channel, campaigns: Campaign[]): Campaign[] => {
    return campaigns.filter(campaign => campaign.channel === channel);
  },

  getByUser: (userName: string, campaigns: Campaign[]): Campaign[] => {
    return campaigns.filter(campaign => campaign.createdBy === userName);
  },

  create: (campaignData: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>): Campaign => {
    // In real app: return await fetch('/api/campaigns', { method: 'POST', body: JSON.stringify(campaignData) }).then(r => r.json());
    const newCampaign: Campaign = {
      ...campaignData,
      id: `camp${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    // In real app, this would be handled by backend
    return newCampaign;
  },

  update: (campaignId: string, updates: Partial<Campaign>, campaigns: Campaign[]): Campaign[] => {
    // In real app: return await fetch(`/api/campaigns/${campaignId}`, { method: 'PATCH', body: JSON.stringify(updates) }).then(r => r.json());
    return campaigns.map(campaign =>
      campaign.id === campaignId
        ? { ...campaign, ...updates, updatedAt: new Date().toISOString().split('T')[0] }
        : campaign
    );
  },

  updateStatus: (campaignId: string, status: CampaignStatus, campaigns: Campaign[]): Campaign[] => {
    // In real app: return await fetch(`/api/campaigns/${campaignId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }).then(r => r.json());
    return campaigns.map(campaign =>
      campaign.id === campaignId
        ? { ...campaign, status, updatedAt: new Date().toISOString().split('T')[0] }
        : campaign
    );
  },

  delete: (campaignId: string, campaigns: Campaign[]): Campaign[] => {
    // In real app: return await fetch(`/api/campaigns/${campaignId}`, { method: 'DELETE' }).then(() => campaigns.filter(c => c.id !== campaignId));
    return campaigns.filter(campaign => campaign.id !== campaignId);
  },

  // ==================== FORMS ====================

  getAllForms: (): Form[] => {
    // In real app: return await fetch('/api/forms').then(r => r.json());
    return mockForms;
  },

  getFormsByCampaign: (campaignId: string): Form[] => {
    // In real app: return await fetch(`/api/campaigns/${campaignId}/forms`).then(r => r.json());
    return mockForms.filter(form => form.campaignId === campaignId);
  },

  getFormById: (formId: string): Form | undefined => {
    // In real app: return await fetch(`/api/forms/${formId}`).then(r => r.json());
    return mockForms.find(form => form.id === formId);
  },

  createForm: (formData: Omit<Form, 'id' | 'createdAt' | 'updatedAt'>): Form => {
    // In real app: return await fetch('/api/forms', { method: 'POST', body: JSON.stringify(formData) }).then(r => r.json());
    const newForm: Form = {
      ...formData,
      id: `form${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    return newForm;
  },

  updateForm: (formId: string, updates: Partial<Form>, forms: Form[]): Form[] => {
    // In real app: return await fetch(`/api/forms/${formId}`, { method: 'PATCH', body: JSON.stringify(updates) }).then(r => r.json());
    return forms.map(form =>
      form.id === formId
        ? { ...form, ...updates, updatedAt: new Date().toISOString().split('T')[0] }
        : form
    );
  },

  publishForm: (formId: string, publicLink: string, forms: Form[]): Form[] => {
    // In real app: return await fetch(`/api/forms/${formId}/publish`, { method: 'POST', body: JSON.stringify({ publicLink }) }).then(r => r.json());
    return forms.map(form =>
      form.id === formId
        ? {
            ...form,
            status: 'PUBLISHED' as const,
            publicLink,
            publishedAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0],
          }
        : form
    );
  },

  deleteForm: (formId: string, forms: Form[]): Form[] => {
    // In real app: return await fetch(`/api/forms/${formId}`, { method: 'DELETE' }).then(() => forms.filter(f => f.id !== formId));
    return forms.filter(form => form.id !== formId);
  },

  // ==================== BANK DATA (SUBMISSIONS) ====================

  getAllSubmissions: (): BankDataEntry[] => {
    // In real app: return await fetch('/api/bank-data').then(r => r.json());
    return mockBankData;
  },

  getSubmissionsByCampaign: (campaignId: string): BankDataEntry[] => {
    // In real app: return await fetch(`/api/campaigns/${campaignId}/submissions`).then(r => r.json());
    return mockBankData.filter(submission => submission.campaignId === campaignId);
  },

  getSubmissionsByForm: (formId: string): BankDataEntry[] => {
    // In real app: return await fetch(`/api/forms/${formId}/submissions`).then(r => r.json());
    return mockBankData.filter(submission => submission.formId === formId);
  },

  getSubmissionById: (submissionId: string): BankDataEntry | undefined => {
    // In real app: return await fetch(`/api/bank-data/${submissionId}`).then(r => r.json());
    return mockBankData.find(submission => submission.id === submissionId);
  },

  getSubmissionsByStatus: (status: BankDataEntry['triageStatus'], submissions: BankDataEntry[]): BankDataEntry[] => {
    return submissions.filter(submission => submission.triageStatus === status);
  },

  updateSubmissionStatus: (
    submissionId: string,
    status: BankDataEntry['triageStatus'],
    submissions: BankDataEntry[]
  ): BankDataEntry[] => {
    // In real app: return await fetch(`/api/bank-data/${submissionId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }).then(r => r.json());
    return submissions.map(submission =>
      submission.id === submissionId
        ? { ...submission, triageStatus: status, updatedAt: new Date().toISOString() }
        : submission
    );
  },

  promoteToLead: (
    submissionId: string,
    leadId: string,
    promotedBy: string,
    submissions: BankDataEntry[]
  ): BankDataEntry[] => {
    // In real app: return await fetch(`/api/bank-data/${submissionId}/promote`, { method: 'POST', body: JSON.stringify({ leadId, promotedBy }) }).then(r => r.json());
    return submissions.map(submission =>
      submission.id === submissionId
        ? {
            ...submission,
            triageStatus: 'PROMOTED_TO_LEAD' as const,
            promotedToLeadId: leadId,
            promotedBy,
            promotedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        : submission
    );
  },

  rejectSubmission: (
    submissionId: string,
    reason: string,
    rejectedBy: string,
    submissions: BankDataEntry[]
  ): BankDataEntry[] => {
    // In real app: return await fetch(`/api/bank-data/${submissionId}/reject`, { method: 'POST', body: JSON.stringify({ reason, rejectedBy }) }).then(r => r.json());
    return submissions.map(submission =>
      submission.id === submissionId
        ? {
            ...submission,
            triageStatus: 'REJECTED' as const,
            rejectedReason: reason,
            rejectedBy,
            rejectedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        : submission
    );
  },
};

