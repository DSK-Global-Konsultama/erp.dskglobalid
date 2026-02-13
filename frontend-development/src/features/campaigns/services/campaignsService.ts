import api from '../../../services/api';
import { formatIndonesianLongDateTime } from '../../../utils/dateFormat';
import type {
  BankDataEntry,
  Campaign,
  CampaignStatus,
  CampaignType,
  Channel,
  Form,
  FormField,
  FormFieldType
} from '../../../lib/leadManagementTypes';

type BackendCampaign = {
  id: string | number;
  name: string;
  type: CampaignType | string;
  channel: Channel | string;
  topic_tag?: string | null;
  date_start?: string | null;
  date_end?: string | null;
  notes?: string | null;
  status: CampaignStatus | string;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
};

type BackendForm = {
  id: string | number;
  title: string;
  description?: string | null;
  header_image_path?: string | null;
  success_message?: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'PAUSED' | 'ENDED';
  public_link?: string | null;
  public_slug?: string | null;
  public_qr_url?: string | null;
  published_at?: string | null;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
  primary_campaign_id?: string | null;
};

type BackendFormFieldOption = {
  id?: number | string;
  form_field_id?: number | string;
  opt_order?: number;
  opt_value: string;
};

type BackendFormField = {
  id: number | string;
  form_id: string | number;
  field_key: string;
  type: FormFieldType | string;
  label: string;
  required: boolean | number;
  is_core: boolean | number;
  placeholder?: string | null;
  note?: string | null;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
  options?: BackendFormFieldOption[];
};

type BackendBankDataEntry = {
  id: string | number;
  campaign_id: string | number;
  form_id: string | number;
  client_name: string;
  pic_name: string;
  email: string;
  phone: string;
  source_channel: Channel | string;
  campaign_name: string;
  topic_tag?: string | null;
  triage_status: BankDataEntry['triageStatus'] | string;
  extra_answers?: Record<string, any> | string | null;
  notes?: string | null;
  cleaned_by?: string | null;
  cleaned_at?: string | null;
  rejected_by?: string | null;
  rejected_at?: string | null;
  rejected_reason?: string | null;
  promoted_to_lead_id?: string | null;
  promoted_by?: string | null;
  promoted_at?: string | null;
  submitted_at: string;
  created_at: string;
  updated_at: string;
};

const mapChannelFromBackend = (channel: Channel | string): Channel => {
  const normalized = String(channel || '').toUpperCase();
  const allowed: Channel[] = ['INSTAGRAM', 'LINKEDIN', 'WEBSITE', 'SEMINAR', 'WEBINAR', 'BREVET'];
  if (allowed.includes(normalized as Channel)) {
    return normalized as Channel;
  }
  return 'WEBSITE';
};

const toDateInputValue = (value?: string | null): string => {
  if (!value) return '';
  const s = String(value);
  // If already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  // If ISO-like, take date part
  const isoLike = s.match(/^(\d{4}-\d{2}-\d{2})/);
  if (isoLike?.[1]) return isoLike[1];
  // Fallback: try Date parse
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const mapCampaignFromBackend = (data: BackendCampaign): Campaign => ({
  id: String(data.id),
  name: data.name,
  type: (data.type as CampaignType) || 'SOCIAL_MEDIA',
  channel: mapChannelFromBackend(data.channel),
  topicTag: data.topic_tag || undefined,
  dateRange:
    data.date_start || data.date_end
      ? { start: toDateInputValue(data.date_start), end: toDateInputValue(data.date_end) }
      : undefined,
  notes: data.notes || undefined,
  status: (data.status as CampaignStatus) || 'ACTIVE',
  createdBy: data.created_by || '',
  createdAt: formatIndonesianLongDateTime(data.created_at || ''),
  updatedAt: formatIndonesianLongDateTime(data.updated_at || '')
});

const mapFormFromBackend = (data: BackendForm, fields: FormField[] = []): Form => ({
  id: String(data.id),
  campaignId: data.primary_campaign_id || null,
  primaryCampaignId: data.primary_campaign_id || null,
  title: data.title,
  description: data.description || undefined,
  headerImagePath: data.header_image_path || undefined,
  successMessage: data.success_message || undefined,
  fields,
  status: data.status,
  publicLink: data.public_link || undefined,
  publicSlug: data.public_slug || undefined,
  publicQrUrl: (data as any).public_qr_url || undefined,
  createdBy: data.created_by || '',
  createdAt: formatIndonesianLongDateTime(data.created_at || ''),
  updatedAt: formatIndonesianLongDateTime(data.updated_at || ''),
  publishedAt: data.published_at || undefined
});

const mapFormFieldFromBackend = (data: BackendFormField): FormField => ({
  id: String(data.id),
  type: data.type as FormFieldType,
  label: data.label,
  required: !!data.required,
  options: (data.options || []).map((opt) => opt.opt_value),
  isCore: !!data.is_core,
  placeholder: data.placeholder || undefined,
  note: (data as any).note || undefined,
  fileSettings: (() => {
    const v: any = (data as any).file_settings;
    if (!v) return undefined;
    if (typeof v === 'string') {
      try {
        return JSON.parse(v);
      } catch {
        return undefined;
      }
    }
    return v;
  })(),
});

const mapBankDataFromBackend = (data: BackendBankDataEntry): BankDataEntry => {
  let parsedAnswers: Record<string, any> = {};
  if (data.extra_answers) {
    if (typeof data.extra_answers === 'string') {
      try {
        parsedAnswers = JSON.parse(data.extra_answers);
      } catch {
        parsedAnswers = {};
      }
    } else {
      parsedAnswers = data.extra_answers || {};
    }
  }

  return {
    id: String(data.id),
    campaignId: String(data.campaign_id),
    formId: String(data.form_id),
    clientName: data.client_name,
    picName: data.pic_name,
    email: data.email,
    phone: data.phone,
    sourceChannel: mapChannelFromBackend(data.source_channel),
    campaignName: data.campaign_name,
    topicTag: data.topic_tag || undefined,
    triageStatus: data.triage_status as BankDataEntry['triageStatus'],
    extraAnswers: parsedAnswers,
    notes: data.notes || undefined,
    cleanedBy: data.cleaned_by || undefined,
    cleanedAt: data.cleaned_at || undefined,
    rejectedBy: data.rejected_by || undefined,
    rejectedAt: data.rejected_at || undefined,
    rejectedReason: data.rejected_reason || undefined,
    promotedToLeadId: data.promoted_to_lead_id || undefined,
    promotedBy: data.promoted_by || undefined,
    promotedAt: data.promoted_at || undefined,
    submittedAt: data.submitted_at,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};

const normalizeChannelForBackend = (channel: Channel): Channel => {
  const normalized = String(channel || '').toUpperCase() as Channel;
  const allowed: Channel[] = ['INSTAGRAM', 'LINKEDIN', 'WEBSITE', 'SEMINAR', 'WEBINAR', 'BREVET'];
  if (allowed.includes(normalized)) return normalized;
  if (normalized === 'IG') return 'INSTAGRAM';
  return 'WEBSITE';
};

export type CreateCampaignPayload = {
  name: string;
  type: CampaignType;
  channel: Channel;
  topic_tag?: string | null;
  date_start?: string | null;
  date_end?: string | null;
  notes?: string | null;
  status: CampaignStatus;
};

export type UpdateCampaignPayload = Partial<CreateCampaignPayload>;

export type CreateFormPayload = {
  title: string;
  description?: string | null;
  success_message?: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'PAUSED' | 'ENDED';
  public_link?: string | null;
  public_slug?: string | null;
  published_at?: string | null;
  primary_campaign_id?: string | null;
};

export type UpdateFormPayload = Partial<CreateFormPayload>;

export type CreateFormFieldPayload = {
  form_id: string;
  field_key: string;
  type: FormFieldType;
  label: string;
  required: boolean;
  is_core?: boolean;
  placeholder?: string | null;
  note?: string | null;
  file_settings?: any;
  sort_order: number;
  options?: Array<{ opt_value: string }>;
};

export type UpdateFormFieldPayload = Partial<Omit<CreateFormFieldPayload, 'form_id' | 'field_key'>>;

export type CreateBankDataPayload = {
  campaign_id: string;
  form_id: string;
  client_name: string;
  pic_name: string;
  email: string;
  phone: string;
  source_channel: Channel;
  campaign_name: string;
  topic_tag?: string | null;
  triage_status: BankDataEntry['triageStatus'];
  extra_answers?: Record<string, any>;
  notes?: string | null;
  submitted_at?: string;
};

export type UpdateBankDataPayload = Partial<CreateBankDataPayload> & {
  cleaned_by?: string | null;
  cleaned_at?: string | null;
  rejected_by?: string | null;
  rejected_at?: string | null;
  rejected_reason?: string | null;
  promoted_to_lead_id?: string | null;
  promoted_by?: string | null;
  promoted_at?: string | null;
};

export const campaignsService = {
  // ==================== CAMPAIGNS ====================
  async getAll(): Promise<Campaign[]> {
    const response = await api.get<{ data: BackendCampaign[] }>('/campaigns');
    return (response.data.data || []).map(mapCampaignFromBackend);
  },

  async getById(campaignId: string): Promise<Campaign> {
    const response = await api.get<{ data: BackendCampaign }>(`/campaigns/${campaignId}`);
    return mapCampaignFromBackend(response.data.data);
  },

  async create(payload: CreateCampaignPayload): Promise<Campaign> {
    const response = await api.post<{ data: BackendCampaign }>('/campaigns', {
      ...payload,
      channel: normalizeChannelForBackend(payload.channel)
    });
    return mapCampaignFromBackend(response.data.data);
  },

  async update(campaignId: string, updates: UpdateCampaignPayload): Promise<Campaign> {
    const response = await api.put<{ data: BackendCampaign }>(`/campaigns/${campaignId}`, {
      ...updates,
      channel: updates.channel ? normalizeChannelForBackend(updates.channel) : undefined
    });
    return mapCampaignFromBackend(response.data.data);
  },

  async delete(campaignId: string): Promise<void> {
    await api.delete(`/campaigns/${campaignId}`);
  },

  // ==================== FORMS ====================
  async getAllForms(): Promise<Form[]> {
    const response = await api.get<{ data: BackendForm[] }>('/forms');
    return (response.data.data || []).map((form) => mapFormFromBackend(form, []));
  },

  async getFormsByCampaign(campaignId: string): Promise<Form[]> {
    // IMPORTANT:
    // Backend menghubungkan campaign <-> form lewat tabel `campaign_forms`,
    // bukan lewat `forms.primary_campaign_id`.
    const pairs = await this.getCampaignForms({ campaign_id: campaignId });
    const formIds = (pairs || []).map((p) => String(p.form_id));

    if (formIds.length === 0) return [];

    // Load detail (incl. fields) for each form id
    const forms = await Promise.all(formIds.map((id) => this.getFormById(id)));
    return forms;
  },

  async getFormById(formId: string): Promise<Form> {
    const response = await api.get<{ data: BackendForm }>(`/forms/${formId}`);
    const fields = await this.getFormFields(formId);
    return mapFormFromBackend(response.data.data, fields);
  },

  async createForm(payload: CreateFormPayload): Promise<Form> {
    const response = await api.post<{ data: BackendForm }>('/forms', payload);
    return mapFormFromBackend(response.data.data, []);
  },

  async updateForm(formId: string, payload: UpdateFormPayload): Promise<Form> {
    const response = await api.put<{ data: BackendForm }>(`/forms/${formId}`, payload);
    const fields = await this.getFormFields(formId);
    return mapFormFromBackend(response.data.data, fields);
  },

  async deleteForm(formId: string): Promise<void> {
    await api.delete(`/forms/${formId}`);
  },

  // Header image upload
  async uploadFormHeaderImage(formId: string, file: File): Promise<{ header_image_path: string }> {
    const formData = new FormData();
    formData.append('header_image', file);

    const response = await api.put<{ data: { header_image_path: string } }>(
      `/forms/${formId}/header-image`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );

    return response.data.data;
  },

  async deleteFormHeaderImage(formId: string): Promise<void> {
    await api.delete(`/forms/${formId}/header-image`);
  },

  // ==================== FORM FIELDS ====================
  async getFormFields(formId: string): Promise<FormField[]> {
    const response = await api.get<{ data: BackendFormField[] }>('/form-fields', {
      params: { form_id: formId }
    });
    return (response.data.data || []).map(mapFormFieldFromBackend);
  },

  async getFormFieldById(fieldId: string): Promise<FormField> {
    const response = await api.get<{ data: BackendFormField }>(`/form-fields/${fieldId}`);
    return mapFormFieldFromBackend(response.data.data);
  },

  async createFormField(payload: CreateFormFieldPayload): Promise<FormField> {
    const response = await api.post<{ data: BackendFormField }>('/form-fields', payload);
    return mapFormFieldFromBackend(response.data.data);
  },

  async updateFormField(fieldId: string, payload: UpdateFormFieldPayload): Promise<FormField> {
    const response = await api.put<{ data: BackendFormField }>(`/form-fields/${fieldId}`, payload);
    return mapFormFieldFromBackend(response.data.data);
  },

  async deleteFormField(fieldId: string): Promise<void> {
    await api.delete(`/form-fields/${fieldId}`);
  },

  // ==================== CAMPAIGN FORMS ====================
  async getCampaignForms(params?: { campaign_id?: string; form_id?: string }): Promise<
    Array<{ campaign_id: string; form_id: string }>
  > {
    const response = await api.get<{ data: Array<{ campaign_id: string; form_id: string }> }>(
      '/campaign-forms',
      { params }
    );
    return response.data.data || [];
  },

  async createCampaignForm(campaign_id: string, form_id: string): Promise<void> {
    await api.post('/campaign-forms', { campaign_id, form_id });
  },

  async deleteCampaignForm(campaign_id: string, form_id: string): Promise<void> {
    await api.delete(`/campaign-forms/${campaign_id}/${form_id}`);
  },

  // ==================== BANK DATA (SUBMISSIONS) ====================
  async getBankDataEntries(params?: {
    campaign_id?: string;
    form_id?: string;
    triage_status?: BankDataEntry['triageStatus'];
    limit?: number;
    offset?: number;
  }): Promise<BankDataEntry[]> {
    const response = await api.get<{ data: BackendBankDataEntry[] }>('/bank-data-entries', {
      params
    });
    return (response.data.data || []).map(mapBankDataFromBackend);
  },

  async getBankDataEntryById(id: string): Promise<BankDataEntry> {
    const response = await api.get<{ data: BackendBankDataEntry }>(`/bank-data-entries/${id}`);
    return mapBankDataFromBackend(response.data.data);
  },

  async createBankDataEntry(payload: CreateBankDataPayload): Promise<BankDataEntry> {
    const response = await api.post<{ data: BackendBankDataEntry }>('/bank-data-entries', {
      ...payload,
      source_channel: normalizeChannelForBackend(payload.source_channel)
    });
    return mapBankDataFromBackend(response.data.data);
  },

  async updateBankDataEntry(id: string, payload: UpdateBankDataPayload): Promise<BankDataEntry> {
    const response = await api.put<{ data: BackendBankDataEntry }>(`/bank-data-entries/${id}`, {
      ...payload,
      source_channel: payload.source_channel
        ? normalizeChannelForBackend(payload.source_channel)
        : undefined
    });
    return mapBankDataFromBackend(response.data.data);
  },

  async deleteBankDataEntry(id: string): Promise<void> {
    await api.delete(`/bank-data-entries/${id}`);
  }
};
