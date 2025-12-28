import { useState, useEffect } from 'react';
import { CampaignsManagement } from '../../../../features/campaigns/components/management/CampaignsManagement';
import { CampaignDetail } from '../../../../features/campaigns/components/management/CampaignDetail';
import { FormBuilder } from '../../../../features/campaigns/components/FormBuilder';
import { mockCampaigns, mockForms } from '../../../../lib/leadManagementMockData';
import type { Form } from '../../../../lib/leadManagementTypes';

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

export function CampaignsPage({ userName, activeNav, onCampaignDetailChange, onFormBuilderDetailChange, onResetDetail, onResetFormBuilderDetail }: CampaignsPageProps) {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
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
      const campaign = mockCampaigns.find(c => c.id === selectedCampaignId);
      if (campaign) {
        onCampaignDetailChange({
          name: campaign.name,
          type: campaign.type,
          status: campaign.status,
          channel: campaign.channel,
          topicTag: campaign.topicTag
        });
      }
    } else if (onCampaignDetailChange) {
      onCampaignDetailChange(null);
    }
  }, [selectedCampaignId, onCampaignDetailChange]);

  const handleCreateForm = (campaignId: string) => {
    const campaign = mockCampaigns.find(c => c.id === campaignId);
    if (campaign) {
      setFormBuilderState({
        campaignId,
        campaignName: campaign.name
      });
      // Update form builder detail in header
      if (onFormBuilderDetailChange) {
        onFormBuilderDetailChange({
          campaignName: campaign.name
        });
      }
    }
  };

  const handleEditForm = (formId: string) => {
    const form = mockForms.find(f => f.id === formId);
    if (form) {
      const campaign = mockCampaigns.find(c => c.id === form.campaignId);
      if (campaign) {
        setFormBuilderState({
          campaignId: form.campaignId,
          campaignName: campaign.name,
          formId: form.id
        });
        // Update form builder detail in header
        if (onFormBuilderDetailChange) {
          onFormBuilderDetailChange({
            campaignName: campaign.name
          });
        }
      }
    }
  };

  const handleFormSave = (formData: Partial<Form>) => {
    // In real app: API call to save form
    console.log('Saving form:', formData);
    // For now, just show success message
    // In production, this would call campaignsService.createForm() or updateForm()
  };

  const handleFormBuilderBack = () => {
    setFormBuilderState(null);
    // Reset form builder detail in header
    if (onFormBuilderDetailChange) {
      onFormBuilderDetailChange(null);
    }
    // Return to campaign detail (set selectedCampaignId back)
    if (formBuilderState) {
      setSelectedCampaignId(formBuilderState.campaignId);
      // Update campaign detail in header
      const campaign = mockCampaigns.find(c => c.id === formBuilderState.campaignId);
      if (campaign && onCampaignDetailChange) {
        onCampaignDetailChange({
          name: campaign.name,
          type: campaign.type,
          status: campaign.status,
          channel: campaign.channel,
          topicTag: campaign.topicTag
        });
      }
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

