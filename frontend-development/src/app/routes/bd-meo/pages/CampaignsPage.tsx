import { useState, useEffect } from 'react';
import { CampaignsManagement } from '../../../../features/campaigns/components/management/CampaignsManagement';
import { CampaignDetail } from '../../../../features/campaigns/components/management/CampaignDetail';
import { mockCampaigns } from '../../../../lib/leadManagementMockData';

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
  onResetDetail?: (resetFn: () => void) => void;
}

export function CampaignsPage({ userName, activeNav, onCampaignDetailChange, onResetDetail }: CampaignsPageProps) {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  
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
  
  // Reset selected campaign when navigating away from campaigns or when campaigns is clicked again
  useEffect(() => {
    if (activeNav !== 'campaigns') {
      setSelectedCampaignId(null);
      if (onCampaignDetailChange) {
        onCampaignDetailChange(null);
      }
    }
  }, [activeNav, onCampaignDetailChange]);

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
    // TODO: Implement create form modal
    console.log('Create form for campaign:', campaignId);
    alert('Create form functionality coming soon!');
  };

  const handleEditForm = (formId: string) => {
    // TODO: Implement edit form modal
    console.log('Edit form:', formId);
    alert('Edit form functionality coming soon!');
  };

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

