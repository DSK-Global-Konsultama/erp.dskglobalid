import { Plus, Copy, ExternalLink, Edit, Trash2 } from 'lucide-react';
import { Pause, Play, Square } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import type { Form } from '../../../../lib/leadManagementTypes';
import { toast } from 'sonner';
import { formatIndonesianLongDateTime } from '../../../../utils/dateFormat';
import { campaignsService } from '../../services/campaignsService';

import { useState } from 'react';

interface FormsTabProps {
  campaignId: string;
  forms: Form[];
  onCreateForm: (campaignId: string) => void;
  onEditForm?: (formId: string) => void;
  onDeleteForm?: (form: Form) => void;
  onUpdateFormStatus?: (formId: string, status: Form['status']) => Promise<void> | void;
}

export function FormsTab({ campaignId, forms, onCreateForm, onEditForm, onDeleteForm, onUpdateFormStatus }: FormsTabProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Link copied to clipboard');
  };

  const slugify = (input: string): string => {
    const base = String(input || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-]/g, '')
      .replace(/\-+/g, '-')
      .replace(/^\-+|\-+$/g, '');
    return base || 'form';
  };

  const buildPublicLinkFromSlug = (slug: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
    return `${origin}/${slugify(slug)}`;
  };

  const buildQrUrl = (publicUrl: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(publicUrl)}`;
  };

  const getEffectivePublicLink = (form: Form) => {
    // Prefer stored publicLink (published), otherwise compute from publicSlug/title.
    if (form.publicLink) return form.publicLink;
    const maybeSlug = (form.publicSlug || slugify(form.title)).trim();
    return buildPublicLinkFromSlug(maybeSlug);
  };

  const getAllPublicLinks = (form: Form): Array<{ label: string; url: string; qrUrl: string }> => {
    // For Event forms: show ONLY channel links (instagram/linkedin). No base url.
    // We infer this by presence of channel_links/channelLinks from backend.
    const channelLinks = (form as any).channelLinks || (form as any).channel_links;
    const hasChannelLinks = Array.isArray(channelLinks) && channelLinks.length > 0;

    if (hasChannelLinks) {
      const items: Array<{ label: string; url: string; qrUrl: string }> = [];
      for (const l of channelLinks) {
        const url = l?.publicLink || l?.public_link;
        if (!url) continue;
        const channel = String(l?.channel || '').toUpperCase();
        items.push({
          label: channel || 'Channel',
          url,
          qrUrl: (String(l?.publicQrUrl || l?.public_qr_url || '').trim()) ? (l.publicQrUrl || l.public_qr_url) : buildQrUrl(url),
        });
      }

      const seen = new Set<string>();
      return items.filter((i) => {
        if (!i.url) return false;
        if (seen.has(i.url)) return false;
        seen.add(i.url);
        return true;
      });
    }

    // Non-event: base url only
    const baseUrl = getEffectivePublicLink(form);
    if (!baseUrl) return [];
    return [
      {
        label: 'Base',
        url: baseUrl,
        qrUrl: (form.publicQrUrl && form.publicQrUrl.trim()) ? form.publicQrUrl : buildQrUrl(baseUrl),
      },
    ];
  };

  const [editingSlugForFormId, setEditingSlugForFormId] = useState<string | null>(null);
  const [slugDraft, setSlugDraft] = useState<string>('');
  const [savingSlug, setSavingSlug] = useState(false);

  const [qrOpenForFormId, setQrOpenForFormId] = useState<string | null>(null);

  const getStatusBadgeClass = (status: Form['status']) => {
    if (status === 'PUBLISHED') return 'bg-green-100 text-green-700 border-green-200';
    if (status === 'PAUSED') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (status === 'ENDED') return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const canPause = (status: Form['status']) => status === 'PUBLISHED';
  const canResume = (status: Form['status']) => status === 'PAUSED';
  const canEnd = (status: Form['status']) => status === 'PUBLISHED' || status === 'PAUSED';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3>Campaign Forms</h3>
        <Button
          onClick={() => onCreateForm(campaignId)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Form
        </Button>
      </div>

      {forms.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-600 mb-4">No forms created yet</p>
          <Button
            onClick={() => onCreateForm(campaignId)}
            className="inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create First Form
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {forms.map(form => {
            const links = getAllPublicLinks(form);
            const isEvent = Array.isArray((form as any).channelLinks) && (form as any).channelLinks.length > 0;

            const isEditingSlug = editingSlugForFormId === form.id;
            const slugPreview = slugDraft.trim() ? buildPublicLinkFromSlug(slugDraft) : getEffectivePublicLink(form);

            return (
              <div key={form.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">{form.title}</h4>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${getStatusBadgeClass(
                    form.status
                  )}`}>
                    {form.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <span>{form.fields.length} fields</span>
                  <span>•</span>
                  <span>Created: {formatIndonesianLongDateTime(form.createdAt)}</span>
                  {form.publishedAt && (
                    <>
                      <span>•</span>
                      <span>Published: {formatIndonesianLongDateTime(form.publishedAt)}</span>
                    </>
                  )}
                </div>

                {/* Shortlink/slug customizer */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-xs font-medium text-gray-700">Shortlink (Custom Path)</div>
                    {isEditingSlug ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={savingSlug}
                          onClick={async () => {
                            const nextSlug = slugDraft.trim() ? slugify(slugDraft) : null;
                            setSavingSlug(true);
                            try {
                              await campaignsService.updateForm(form.id, {
                                public_slug: nextSlug,
                                // keep public_link in sync when published
                                public_link: form.status === 'PUBLISHED' ? buildPublicLinkFromSlug(nextSlug || slugify(form.title)) : null,
                                // let BE regenerate if needed; FE sends a best-effort value
                                public_qr_url: form.status === 'PUBLISHED' ? buildQrUrl(buildPublicLinkFromSlug(nextSlug || slugify(form.title))) : null,
                              } as any);
                              toast.success('Shortlink updated');
                              // refresh from parent
                              if (onUpdateFormStatus) {
                                // no-op (parent will refetch on status update). We'll just force a hard reload of forms by triggering status update to same value is risky.
                              }
                              // simplest: reload page state by calling status update to same status if available
                              try {
                                await onUpdateFormStatus?.(form.id, form.status);
                              } catch {
                                // ignore
                              }
                            } catch (e: any) {
                              toast.error(e?.message || 'Gagal update shortlink');
                            } finally {
                              setSavingSlug(false);
                              setEditingSlugForFormId(null);
                            }
                          }}
                          className="px-3 py-1.5 text-xs rounded-md bg-black text-white disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          disabled={savingSlug}
                          onClick={() => {
                            setEditingSlugForFormId(null);
                            setSlugDraft('');
                          }}
                          className="px-3 py-1.5 text-xs rounded-md border border-gray-300 text-gray-700 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSlugForFormId(form.id);
                          setSlugDraft(form.publicSlug || '');
                        }}
                        className="text-xs text-blue-700 hover:underline"
                      >
                        Custom
                      </button>
                    )}
                  </div>

                  {isEditingSlug ? (
                    <>
                      <input
                        type="text"
                        value={slugDraft}
                        onChange={(e) => setSlugDraft(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                        placeholder="contoh: form-webinar-feb-2026"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        Preview: <a className="text-blue-700 hover:underline" href={slugPreview} target="_blank" rel="noopener noreferrer">{slugPreview}</a>
                      </div>
                    </>
                  ) : (
                    <div className="text-xs text-gray-500">
                      {form.publicSlug ? `/${form.publicSlug}` : '(auto from title)'}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  {links.length > 0 ? (
                    links.map((l) => (
                      <div key={`${form.id}-${l.label}-${l.url}`} className="flex items-center gap-2">
                        <div className="w-24 shrink-0 text-xs font-medium text-gray-700">{l.label}</div>
                        <input
                          type="text"
                          value={l.url}
                          readOnly
                          className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                        />
                        <button
                          onClick={() => copyToClipboard(l.url)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Copy link"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        {isEvent ? null : (
                          <button
                            type="button"
                            onClick={() => {
                              (window as any).__qrUrlOverride = { formId: form.id, label: l.label, qrUrl: l.qrUrl, url: l.url };
                              setQrOpenForFormId(form.id);
                            }}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="QR code"
                            aria-label="QR code"
                          >
                            QR
                          </button>
                        )}

                        <a
                          href={l.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Open form"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    ))
                  ) : (
                    <div className="flex-1 text-sm text-gray-400">Form masih draft (belum ada public link)</div>
                  )}
                </div>

                {isEvent && links.length > 0 ? (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {links.map((l) => (
                      <div key={`${form.id}-qr-${l.label}-${l.url}`} className="p-3 rounded-lg border border-gray-200 bg-gray-50">
                        <div className="text-xs font-medium text-gray-700 mb-2">QR {l.label}</div>
                        <div className="flex items-start gap-3">
                          <img
                            src={l.qrUrl}
                            alt={`QR ${l.label}`}
                            className="w-[140px] h-[140px] rounded bg-white border border-gray-200"
                          />
                          <div className="text-xs text-gray-700">
                            <a
                              href={l.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-700 hover:underline break-all"
                            >
                              {l.url}
                            </a>
                            <div className="mt-2 flex items-center gap-2">
                              <button
                                type="button"
                                className="px-2 py-1 text-xs rounded-md bg-white border border-gray-300 hover:bg-gray-100"
                                onClick={() => copyToClipboard(l.url)}
                              >
                                Copy Link
                              </button>
                              <button
                                type="button"
                                className="px-2 py-1 text-xs rounded-md bg-white border border-gray-300 hover:bg-gray-100"
                                onClick={() => copyToClipboard(l.qrUrl)}
                              >
                                Copy QR URL
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className="flex items-center gap-2">
                  {onUpdateFormStatus && (
                    <>
                      <button
                        type="button"
                        disabled={!(canPause(form.status) || canResume(form.status))}
                        onClick={async () => {
                          const nextStatus = form.status === 'PAUSED' ? 'PUBLISHED' : 'PAUSED';
                          try {
                            await onUpdateFormStatus(form.id, nextStatus);
                            toast.success(nextStatus === 'PAUSED' ? 'Form paused' : 'Form resumed');
                          } catch (e: any) {
                            toast.error(e?.message || 'Gagal update status form');
                          }
                        }}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        title={form.status === 'PAUSED' ? 'Resume (aktifkan lagi)' : 'Pause (hentikan sementara)'}
                        aria-label={form.status === 'PAUSED' ? 'Resume' : 'Pause'}
                      >
                        {form.status === 'PAUSED' ? (
                          <Play className="w-4 h-4" />
                        ) : (
                          <Pause className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        type="button"
                        disabled={!canEnd(form.status)}
                        onClick={async () => {
                          const ok = window.confirm(
                            'End form? Setelah di-end, form tidak bisa diisi lagi.'
                          );
                          if (!ok) return;
                          try {
                            await onUpdateFormStatus(form.id, 'ENDED');
                            toast.success('Form ended');
                          } catch (e: any) {
                            toast.error(e?.message || 'Gagal end form');
                          }
                        }}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        title="End (tutup permanen)"
                        aria-label="End"
                      >
                        <Square className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {onEditForm && (
                    <button
                      onClick={() => onEditForm(form.id)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Edit form"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}

                  {onDeleteForm && (
                    <button
                      onClick={() => onDeleteForm(form)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete form"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {(!isEvent && qrOpenForFormId === form.id) ? (
                  <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-medium text-gray-800">QR Code</div>
                      <button
                        type="button"
                        className="text-sm text-gray-600 hover:underline"
                        onClick={() => setQrOpenForFormId(null)}
                      >
                        Close
                      </button>
                    </div>
                    <div className="flex items-start gap-4">
                      <img src={(window as any).__qrUrlOverride?.formId === form.id ? (window as any).__qrUrlOverride.qrUrl : links[0]?.qrUrl} alt="QR" className="w-[160px] h-[160px] rounded bg-white border border-gray-200" />
                      <div className="text-sm text-gray-700">
                        <div className="mb-2">Link:</div>
                        <a href={(window as any).__qrUrlOverride?.formId === form.id ? (window as any).__qrUrlOverride.url : links[0]?.url} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline break-all">
                          {(window as any).__qrUrlOverride?.formId === form.id ? (window as any).__qrUrlOverride.url : links[0]?.url}
                        </a>
                        <div className="mt-3">
                          <button
                            type="button"
                            className="px-3 py-2 text-sm rounded-md bg-white border border-gray-300 hover:bg-gray-100"
                            onClick={() => copyToClipboard((window as any).__qrUrlOverride?.formId === form.id ? (window as any).__qrUrlOverride.qrUrl : links[0]?.qrUrl)}
                          >
                            Copy QR Image URL
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

