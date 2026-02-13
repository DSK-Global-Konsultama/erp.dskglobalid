/**
 * BD_MEO: Campaign Detail Page
 */
import { useEffect, useState } from 'react';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent } from '../../../../components/ui/card';
import type { BankDataEntry, Campaign, Form } from '../../../../lib/leadManagementTypes';
import { OverviewTab } from '../tabs/OverviewTab';
import { FormsTab } from '../tabs/FormsTab';
import { SubmissionsTab } from '../tabs/SubmissionsTab';
import { SubmissionDetailModal } from '../modals/SubmissionDetailModal';
import { campaignsService } from '../../services/campaignsService';
import { formatCampaignPeriod } from '../../../../utils/dateFormat';
import { toast } from 'sonner';
import { DeleteFormConfirmDialog } from '../modals/DeleteFormConfirmDialog';

interface CampaignDetailProps {
  campaignId: string;
  onBack: () => void;
  onCreateForm: (campaignId: string) => void;
  onEditForm?: (formId: string) => void;
}

type TabType = 'overview' | 'forms' | 'submissions';

export function CampaignDetail({ campaignId, onBack, onCreateForm, onEditForm }: CampaignDetailProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedSubmission, setSelectedSubmission] = useState<BankDataEntry | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [campaignForms, setCampaignForms] = useState<Form[]>([]);
  const [submissions, setSubmissions] = useState<BankDataEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingForm, setDeletingForm] = useState<Form | null>(null);

  const refetchForms = async () => {
    const forms = await campaignsService.getFormsByCampaign(campaignId);
    setCampaignForms(forms);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [camp, forms, bank] = await Promise.all([
          campaignsService.getById(campaignId),
          campaignsService.getFormsByCampaign(campaignId),
          campaignsService.getBankDataEntries({ campaign_id: campaignId })
        ]);
        setCampaign(camp);
        setCampaignForms(forms);
        setSubmissions(bank);
      } catch (err: any) {
        setError(err?.message || 'Gagal memuat detail campaign');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [campaignId]);

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-600">Memuat detail campaign...</p>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="p-8">
        <p className="text-gray-600">{error || 'Campaign not found'}</p>
        <Button onClick={onBack} variant="outline" className="mt-4">
          ← Back to campaigns
        </Button>
      </div>
    );
  }

  // Status colors - same style as StatusChip
  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-700';
      case 'PAUSED': return 'bg-yellow-100 text-yellow-700';
      case 'ENDED': return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeColor = (type: Campaign['type']) => {
    switch (type) {
      case 'SOCIAL_MEDIA': return 'bg-purple-100 text-purple-700';
      case 'FREEBIE': return 'bg-green-100 text-green-700';
      case 'EVENT': return 'bg-red-100 text-red-700';
    }
  };

  // Format channel display (capitalize first letter only)
  const formatChannel = (channel: Campaign['channel']) => {
    const labels: Partial<Record<Campaign['channel'], string>> = {
      INSTAGRAM: 'Instagram',
      LINKEDIN: 'LinkedIn',
      WEBSITE: 'Website',
      SEMINAR: 'Seminar',
      WEBINAR: 'Webinar',
      BREVET: 'Brevet'
    };
    return labels[channel] || channel;
  };

  // Calculate stats
  const promotedCount = submissions.filter(s => s.triageStatus === 'PROMOTED_TO_LEAD').length;
  const promotionRate = submissions.length > 0 
    ? Math.round((promotedCount / submissions.length) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h1 className="text-2xl font-semibold mb-2">{campaign.name}</h1>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${getTypeColor(campaign.type)}`}>
                {campaign.type}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${getStatusColor(campaign.status)}`}>
                {campaign.status}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border bg-gray-100 text-gray-700">
                {formatChannel(campaign.channel)}
              </span>
              {campaign.topicTag && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border bg-indigo-100 text-indigo-700">
                  {campaign.topicTag}
                </span>
              )}
            </div>
          </div>
        </div>
        {campaign.dateRange && (
          <div className="text-sm text-gray-600 mb-2">
            Period: {formatCampaignPeriod({ start: campaign.dateRange.start, end: campaign.dateRange.end })}
          </div>
        )}
        {campaign.notes && (
          <div className="text-sm text-gray-600 bg-gray-50 pt-3 rounded-lg">
            {campaign.notes}
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 mb-1">Total Submissions</div>
            <div className="text-2xl font-semibold text-gray-900">{submissions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 mb-1">Promoted to Lead</div>
            <div className="text-2xl font-semibold text-green-600">{promotedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 mb-1">Promotion Rate</div>
            <div className="text-2xl font-semibold text-blue-600">{promotionRate}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 mb-1">Forms Created</div>
            <div className="text-2xl font-semibold text-purple-600">{campaignForms.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Card>
        {/* Tab Headers */}
        <div className="border-b border-gray-200 px-6">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('forms')}
              className={`py-4 border-b-2 transition-colors ${
                activeTab === 'forms'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Forms ({campaignForms.length})
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`py-4 border-b-2 transition-colors ${
                activeTab === 'submissions'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Submissions ({submissions.length})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="pb-6 px-6">
          {activeTab === 'overview' && (
            <OverviewTab
              campaign={campaign}
              submissions={submissions}
              onViewSubmission={setSelectedSubmission}
            />
          )}

          {activeTab === 'forms' && (
            <FormsTab
              campaignId={campaignId}
              forms={campaignForms}
              onCreateForm={onCreateForm}
              onEditForm={onEditForm}
              onDeleteForm={(form) => setDeletingForm(form)}
              onUpdateFormStatus={async (formId, status) => {
                await campaignsService.updateForm(formId, { status });
                await refetchForms();
              }}
            />
          )}

          {activeTab === 'submissions' && (
            <SubmissionsTab
              submissions={submissions}
              forms={campaignForms}
              onViewSubmission={setSelectedSubmission}
            />
          )}
        </div>
      </Card>

      {/* Submission Detail Modal */}
      <SubmissionDetailModal
        submission={selectedSubmission}
        open={!!selectedSubmission}
        onClose={() => setSelectedSubmission(null)}
      />

      <DeleteFormConfirmDialog
        open={!!deletingForm}
        formTitle={deletingForm?.title || ''}
        onClose={() => setDeletingForm(null)}
        onConfirm={async () => {
          if (!deletingForm) return;
          try {
            await campaignsService.deleteForm(deletingForm.id);
            toast.success('Form berhasil dihapus');
            setDeletingForm(null);
            await refetchForms();
          } catch (err: any) {
            toast.error(err?.message || 'Gagal menghapus form');
          }
        }}
      />
    </div>
  );
}

