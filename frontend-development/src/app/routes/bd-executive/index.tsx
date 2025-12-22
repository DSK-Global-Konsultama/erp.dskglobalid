import { LeadTrackerPage } from './pages/LeadTrackerPage';

interface BDExecutiveProps {
  userName: string;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onLeadDetailChange?: (leadDetail: { clientName: string; status: string } | null) => void;
  onBackFromDetail?: () => void;
  onResetDetail?: (resetFn: () => void) => void;
}

export function BDExecutiveDashboard({ userName, activeTab: externalActiveTab, onLeadDetailChange, onBackFromDetail, onResetDetail }: BDExecutiveProps) {
  const activeTab = externalActiveTab || 'deals';

  // Render Lead Tracker (previously My Deals)
  if (activeTab === 'deals') {
    return <LeadTrackerPage userName={userName} onLeadDetailChange={onLeadDetailChange} onBackFromDetail={onBackFromDetail} onResetDetail={onResetDetail} />;
  }

  // Default to Lead Tracker
  return <LeadTrackerPage userName={userName} onLeadDetailChange={onLeadDetailChange} onBackFromDetail={onBackFromDetail} onResetDetail={onResetDetail} />;
}

