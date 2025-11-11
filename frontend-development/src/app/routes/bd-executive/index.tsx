import { AvailableLeadsPage } from './pages/AvailableLeadsPage';
import { MyDealsPage } from './pages/MyDealsPage';

interface BDExecutiveProps {
  userName: string;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function BDExecutiveDashboard({ userName, activeTab: externalActiveTab }: BDExecutiveProps) {
  const activeTab = externalActiveTab || 'leads';

  // Render content directly based on activeTab without tabs
  if (activeTab === 'deals') {
    return <MyDealsPage userName={userName} />;
  }

  // Default to leads
  return <AvailableLeadsPage userName={userName} />;
}

