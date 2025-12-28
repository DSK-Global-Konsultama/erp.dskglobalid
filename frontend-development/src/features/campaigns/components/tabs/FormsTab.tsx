import { Plus, Copy, ExternalLink, Edit } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import type { Form } from '../../../../lib/leadManagementTypes';

interface FormsTabProps {
  campaignId: string;
  forms: Form[];
  onCreateForm: (campaignId: string) => void;
  onEditForm?: (formId: string) => void;
}

export function FormsTab({ campaignId, forms, onCreateForm, onEditForm }: FormsTabProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

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
          {forms.map(form => (
            <div key={form.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">{form.title}</h4>
                  {form.description && (
                    <p className="text-sm text-gray-600">{form.description}</p>
                  )}
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${
                  form.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {form.status}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                <span>{form.fields.length} fields</span>
                <span>•</span>
                <span>Created: {form.createdAt}</span>
                {form.publishedAt && (
                  <>
                    <span>•</span>
                    <span>Published: {form.publishedAt}</span>
                  </>
                )}
              </div>
              {form.publicLink && (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={form.publicLink}
                    readOnly
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(form.publicLink!)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Copy link"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <a
                    href={form.publicLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Open form"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  {onEditForm && (
                    <button
                      onClick={() => onEditForm(form.id)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Edit form"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

