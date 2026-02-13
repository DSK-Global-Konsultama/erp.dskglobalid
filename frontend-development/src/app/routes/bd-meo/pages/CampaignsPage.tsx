import { useEffect, useState } from 'react';
import { CampaignsManagement } from '../../../../features/campaigns/components/management/CampaignsManagement';
import { CampaignDetail } from '../../../../features/campaigns/components/management/CampaignDetail';
import { FormBuilder } from '../../../../features/campaigns/components/FormBuilder';
import type { Campaign, Form } from '../../../../lib/leadManagementTypes';
import { campaignsService } from '../../../../features/campaigns/services/campaignsService';
import { toast } from 'sonner';

interface CampaignsPageProps {
  userName: string;
  activeNav?: string;
  onCampaignDetailChange?: (campaignDetail: {
    name: string;
    type: string;
    status: string;
    channel: string;
    topicTag?: string;
  } | null) => void;
  onFormBuilderDetailChange?: (formBuilderDetail: {
    campaignName: string;
  } | null) => void;
  onResetDetail?: (resetFn: () => void) => void;
  onResetFormBuilderDetail?: (resetFn: () => void) => void;
}

export function CampaignsPage({ activeNav, onCampaignDetailChange, onFormBuilderDetailChange, onResetDetail, onResetFormBuilderDetail }: CampaignsPageProps) {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [formBuilderState, setFormBuilderState] = useState<{
    campaignId: string;
    campaignName: string;
    formId?: string;
  } | null>(null);
  
  // Expose reset function to parent
  useEffect(() => {
    if (onResetDetail) {
      const resetDetail = () => {
        setSelectedCampaignId(null);
        if (onCampaignDetailChange) {
          onCampaignDetailChange(null);
        }
      };
      onResetDetail(resetDetail);
    }
  }, [onResetDetail, onCampaignDetailChange]);

  // Expose reset form builder function to parent
  useEffect(() => {
    if (onResetFormBuilderDetail) {
      const resetFormBuilderDetail = () => {
        setFormBuilderState(null);
        if (onFormBuilderDetailChange) {
          onFormBuilderDetailChange(null);
        }
      };
      onResetFormBuilderDetail(resetFormBuilderDetail);
    }
  }, [onResetFormBuilderDetail, onFormBuilderDetailChange]);
  
  // Reset selected campaign when navigating away from campaigns or when campaigns is clicked again
  useEffect(() => {
    if (activeNav !== 'campaigns') {
      setSelectedCampaignId(null);
      setFormBuilderState(null);
      if (onCampaignDetailChange) {
        onCampaignDetailChange(null);
      }
      if (onFormBuilderDetailChange) {
        onFormBuilderDetailChange(null);
      }
    }
  }, [activeNav, onCampaignDetailChange, onFormBuilderDetailChange]);

  const handleViewDetail = (campaignId: string) => {
    setSelectedCampaignId(campaignId);
  };

  const handleBack = () => {
    setSelectedCampaignId(null);
    // Immediately reset campaign detail in header
    if (onCampaignDetailChange) {
      onCampaignDetailChange(null);
    }
  };

  // Update campaign detail in header when selected campaign changes
  useEffect(() => {
    if (selectedCampaignId && onCampaignDetailChange) {
      campaignsService
        .getById(selectedCampaignId)
        .then((campaign) => {
          setSelectedCampaign(campaign);
          onCampaignDetailChange({
            name: campaign.name,
            type: campaign.type,
            status: campaign.status,
            channel: campaign.channel,
            topicTag: campaign.topicTag
          });
        })
        .catch(() => {
          setSelectedCampaign(null);
          onCampaignDetailChange(null);
        });
    } else if (onCampaignDetailChange) {
      setSelectedCampaign(null);
      onCampaignDetailChange(null);
    }
  }, [selectedCampaignId, onCampaignDetailChange]);

  const handleCreateForm = (campaignId: string) => {
    const campaign = selectedCampaign && selectedCampaign.id === campaignId ? selectedCampaign : null;
    const campaignName = campaign?.name || 'Campaign';
    setFormBuilderState({
      campaignId,
      campaignName
    });
    if (onFormBuilderDetailChange) {
      onFormBuilderDetailChange({
        campaignName
      });
    }
  };

  const handleEditForm = (formId: string) => {
    campaignsService
      .getFormById(formId)
      .then((form) => {
        const campaignId = form.primaryCampaignId || form.campaignId || '';
        const campaignName =
          form.campaignId === selectedCampaign?.id
            ? (selectedCampaign?.name ?? form.title)
            : form.title;
        setFormBuilderState({
          campaignId,
          campaignName,
          formId: form.id
        });
        if (onFormBuilderDetailChange) {
          onFormBuilderDetailChange({
            campaignName
          });
        }
      })
      .catch(() => {
        setFormBuilderState(null);
      });
  };

  const handleFormSave = async (formData: Partial<Form>) => {
    if (!formBuilderState) return;
    try {
      const basePayload = {
        title: formData.title || `Form: ${formBuilderState.campaignName}`,
        description: formData.description || '',
        success_message: formData.successMessage || null,
        status: formData.status || 'DRAFT',
        public_link: formData.publicLink || null,
        published_at: formData.publishedAt || null,
        primary_campaign_id: formBuilderState.campaignId
      };

      const savedForm = formBuilderState.formId
        ? await campaignsService.updateForm(formBuilderState.formId, basePayload)
        : await campaignsService.createForm(basePayload);

      if (formData.fields && formData.fields.length > 0) {
        // Clear old fields when updating
        if (formBuilderState.formId) {
          const existing = await campaignsService.getFormFields(savedForm.id);
          await Promise.all(existing.map((f) => campaignsService.deleteFormField(f.id)));
        }

        await Promise.all(
          formData.fields.map((field, index) =>
            campaignsService.createFormField({
              form_id: savedForm.id,
              field_key: field.label.toLowerCase().replace(/\s+/g, '_'),
              type: field.type,
              label: field.label,
              required: field.required,
              is_core: field.isCore ?? false,
              placeholder: field.placeholder || null,
              sort_order: index,
              options: (field.options || []).map((opt) => ({ opt_value: opt }))
            })
          )
        );
      }

      toast.success(
        formData.status === 'PUBLISHED'
          ? 'Form berhasil dipublish'
          : 'Form berhasil disimpan'
      );

      // FormBuilder onSave expects void
      return;
    } catch (error: any) {
      const status = error?.status ?? error?.response?.status;
      if (status === 409) {
        toast.error('Judul form sudah digunakan pada campaign ini. Silakan gunakan judul lain.');
        return;
      }
      toast.error(error?.message || 'Gagal menyimpan form');
      throw error;
    }
  };

  const handleFormBuilderBack = () => {
    setFormBuilderState(null);
    // Reset form builder detail in header
    if (onFormBuilderDetailChange) {
      onFormBuilderDetailChange(null);
    }
    // Return to campaign detail
    if (formBuilderState) {
      setSelectedCampaignId(formBuilderState.campaignId);
    }
  };

  // Show Form Builder if active
  if (formBuilderState) {
    return (
      <FormBuilder
        campaignId={formBuilderState.campaignId}
        campaignName={formBuilderState.campaignName}
        formId={formBuilderState.formId}
        onBack={handleFormBuilderBack}
        onSave={handleFormSave}
      />
    );
  }

  // Show Campaign Detail if selected
  if (selectedCampaignId) {
    return (
      <CampaignDetail
        campaignId={selectedCampaignId}
        onBack={handleBack}
        onCreateForm={handleCreateForm}
        onEditForm={handleEditForm}
      />
    );
  }

  return (
    <div>
      <CampaignsManagement onViewDetail={handleViewDetail} />
    </div>
  );
}

