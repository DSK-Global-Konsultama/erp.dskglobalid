import { useState } from 'react';
import { CampaignsManagement } from '../../../../features/campaigns/components/management/CampaignsManagement';

interface CampaignsPageProps {
  userName: string;
}

export function CampaignsPage({ userName }: CampaignsPageProps) {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);

  const handleViewDetail = (campaignId: string) => {
    setSelectedCampaignId(campaignId);
    // TODO: Navigate to campaign detail page
    console.log('View campaign detail:', campaignId);
  };

  return (
    <div>
      <CampaignsManagement onViewDetail={handleViewDetail} />
    </div>
  );
}

