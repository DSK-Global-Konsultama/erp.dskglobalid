import { useEffect, useMemo, useState } from 'react';
import type { Form, FormField } from '../../../lib/leadManagementTypes';
import { toast } from 'sonner';
import { publicFormsService } from '../../../features/campaigns/services/publicFormsService';
import { FormRenderer } from '../../../features/campaigns/components/FormRenderer'; // <- sesuaikan path

export function PublicFormPage({ slug }: { slug: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [, setCampaignChannel] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [entryChannel, setEntryChannel] = useState<string | null>(null);
  const [entrySlug, setEntrySlug] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      setValidationError(null);
      try {
        const publicForm = await publicFormsService.getFormBySlug(slug);

        setEntryChannel((publicForm as any).entry_channel || null);
        // Prefer backend-provided entry_slug (when available), otherwise fall back to current route slug.
        setEntrySlug((publicForm as any).entry_slug || slug || null);

        const baseForm: any = {
          id: String(publicForm.id),
          title: publicForm.title,
          description: publicForm.description ?? null,
          headerImagePath: publicForm.header_image_path ?? null,
          successMessage: publicForm.success_message ?? null,
          status: publicForm.status,
          fields: [],
          source_channel: publicForm.source_channel ?? null,
        };

        const fetchedFields = await publicFormsService.getFormFields(baseForm.id);
        baseForm.fields = fetchedFields;

        if (!Array.isArray(baseForm.fields) || baseForm.fields.length === 0) {
          baseForm.fields = [
            { id: 'core1', type: 'SHORT_TEXT', label: 'Nama Perusahaan / Client', required: true, isCore: true, placeholder: 'PT ABC Indonesia' },
            { id: 'core2', type: 'SHORT_TEXT', label: 'Nama PIC', required: true, isCore: true, placeholder: 'John Doe' },
            { id: 'core3', type: 'SHORT_TEXT', label: 'Email', required: true, isCore: true, placeholder: 'john@company.com' },
            { id: 'core4', type: 'SHORT_TEXT', label: 'Nomor Telepon / WhatsApp', required: true, isCore: true, placeholder: '+62 812-3456-7890' },
          ];
        }

        setForm(baseForm);
        setCampaignChannel(publicForm.source_channel || null);
      } catch (e: any) {
        setError(e?.message || 'Gagal memuat form');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [slug]);

  const fields = useMemo<FormField[]>(() => form?.fields || [], [form]);

  const onChange = (key: string, value: any) => setAnswers((prev) => ({ ...prev, [key]: value }));

  const handleClear = () => {
    setAnswers({});
    setValidationError(null);
  };

  const handleFileUpload = async (fieldId: string, files: File[] | null) => {
    if (!form) return;
    if (!files || files.length === 0) {
      setAnswers((prev) => ({ ...prev, [fieldId]: [] }));
      return;
    }

    // (logic upload kamu biarkan sama, tidak aku ulang panjang)
    try {
      setSubmitting(true);
      const uploadedPaths: string[] = [];
      for (const f of files) {
        const resp = await publicFormsService.uploadFile(form.id, f, undefined);
        uploadedPaths.push(resp.path);
      }
      setAnswers((prev) => ({ ...prev, [fieldId]: uploadedPaths }));
      toast.success('File berhasil diupload');
    } catch (e: any) {
      toast.error(e?.message || 'Gagal upload file');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!form) return;
    setValidationError(null);

    // Ambil nilai core fields dari jawaban berdasarkan label
    const getAnswerByLabel = (label: string): string => {
      const field = fields.find(
        (f) => String(f.label || '').trim().toLowerCase() === label.trim().toLowerCase()
      );
      if (!field) return '';
      const raw = answers[field.id];
      return typeof raw === 'string' ? raw.trim() : String(raw ?? '').trim();
    };

    const client_name = getAnswerByLabel('Nama Perusahaan / Client');
    const pic_name = getAnswerByLabel('Nama PIC');
    const email = getAnswerByLabel('Email');
    const phone = getAnswerByLabel('Nomor Telepon / WhatsApp');

    if (!client_name || !pic_name || !email || !phone) {
      setValidationError(
        'Harap lengkapi Nama Perusahaan/Client, Nama PIC, Email, dan Nomor Telepon/WhatsApp.'
      );
      toast.error('Data wajib masih kosong. Mohon lengkapi form terlebih dahulu.');
      return;
    }

    // Kumpulkan jawaban lain sebagai extra_answers (disimpan di kolom JSON)
    const extra_answers: Record<string, any> = {};
    const coreLabels = new Set([
      'nama perusahaan / client',
      'nama pic',
      'email',
      'nomor telepon / whatsapp',
    ]);

    fields.forEach((f) => {
      const labelNorm = String(f.label || '').trim().toLowerCase();
      if (coreLabels.has(labelNorm)) return;

      const value = answers[f.id];
      if (
        value === undefined ||
        value === null ||
        (typeof value === 'string' && value.trim().length === 0) ||
        (Array.isArray(value) && value.length === 0)
      ) {
        return;
      }

      // Pakai id field sebagai key di extra_answers
      extra_answers[f.id] = value;
    });

    setSubmitting(true);
    try {
      await publicFormsService.submit(String(form.id), {
        client_name,
        pic_name,
        email,
        phone,
        extra_answers,
        entry_channel: entryChannel,
        entry_slug: entrySlug || slug || null,
      });

      setAnswers({});
      setSubmitted(true);
      toast.success('Berhasil submit. Data sudah masuk database.');
    } catch (e: any) {
      toast.error(e?.message || 'Gagal submit form');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-gray-600">Loading form...</div>;
  if (error || !form) return <div className="p-8"><div className="text-gray-700">{error || 'Form tidak ditemukan'}</div></div>;
  if (form.status === 'PAUSED') return <div className="p-8"><div className="text-gray-700">Form sedang di-pause. Silakan coba lagi nanti.</div></div>;
  if (form.status === 'ENDED') return <div className="p-8"><div className="text-gray-700">Form sudah berakhir (ended). Terima kasih.</div></div>;

  return (
    <FormRenderer
      mode="public"
      form={{
        title: form.title,
        description: form.description,
        headerImagePath: (form as any).headerImagePath ?? (form as any).header_image_path ?? null,
        successMessage: (form as any).successMessage ?? (form as any).success_message ?? null,
        status: (form as any).status ?? null,
        fields,
      }}
      answers={answers}
      onChange={onChange}
      submitting={submitting}
      validationError={validationError}
      submitted={submitted}
      onSubmit={handleSubmit}
      onClear={handleClear}
      onSubmitAnother={() => {
        setSubmitted(false);
        setAnswers({});
      }}
      onFileUpload={handleFileUpload}
      footerHint={<div className="text-xs text-gray-500">Data akan disimpan ke database (bank_data_entries).</div>}
    />
  );
}
