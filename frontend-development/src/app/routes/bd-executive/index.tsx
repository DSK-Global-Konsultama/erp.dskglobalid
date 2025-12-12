import { LeadTrackerPage } from './pages/LeadTrackerPage';

interface BDExecutiveProps {
  userName: string;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function BDExecutiveDashboard({ userName, activeTab: externalActiveTab }: BDExecutiveProps) {
  const activeTab = externalActiveTab || 'deals';

  // Render Lead Tracker (previously My Deals)
  if (activeTab === 'deals') {
    return <LeadTrackerPage userName={userName} />;
  }

  // Default to Lead Tracker
  return <LeadTrackerPage userName={userName} />;
}

