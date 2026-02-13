import { publicApi } from '../../../services/publicApi';
import type { FormField } from '../../../lib/leadManagementTypes';

export type PublicFormResponse = {
  id: string;
  title: string;
  description?: string | null;
  header_image_path?: string | null;
  success_message?: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'PAUSED' | 'ENDED';
  public_link?: string | null;
  public_slug?: string | null;
  published_at?: string | null;
  primary_campaign_id?: string | null;
  source_channel?: string | null;
};

export const publicFormsService = {
  async getFormBySlug(slug: string): Promise<PublicFormResponse> {
    const res = await publicApi.get(`/public/forms/${encodeURIComponent(slug)}`);
    return res.data?.data;
  },

  async getFormFields(formId: string): Promise<FormField[]> {
    const res = await publicApi.get(`/public/forms/${encodeURIComponent(formId)}/fields`);
    return (res.data?.data || []).map((f: any) => ({
      id: String(f.id),
      type: f.type,
      label: f.label,
      required: !!f.required,
      isCore: !!f.is_core,
      placeholder: f.placeholder || undefined,
      note: f.note || undefined,
      fileSettings: (() => {
        const v = f.file_settings;
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
      options: Array.isArray(f.options)
        ? f.options.map((o: any) => ({
            id: String(o.id),
            opt_order: o.opt_order,
            opt_value: o.opt_value,
          }))
        : [],
    }));
  },

  async submit(formId: string, payload: { client_name: string; pic_name: string; email: string; phone: string; extra_answers: any }): Promise<any> {
    const res = await publicApi.post(`/public/forms/${encodeURIComponent(formId)}/submit`, payload);
    return res.data?.data;
  },

  async uploadFile(
    formId: string,
    file: File,
    categories?: string[]
  ): Promise<{ path: string; filename: string; originalName: string; size: number; mimeType: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const qs = categories && categories.length > 0 ? `?categories=${encodeURIComponent(categories.join(','))}` : '';

    const resp = await publicApi.put<{ data: { path: string; filename: string; originalName: string; size: number; mimeType: string } }>(
      `/public/forms/${formId}/files${qs}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );

    return resp.data.data;
  },
};
