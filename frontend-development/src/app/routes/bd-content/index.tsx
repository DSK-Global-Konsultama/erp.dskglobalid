import { LeadsManagement } from '../../../features/leads/components/LeadsManagement';

interface BDContentProps {
  userName: string;
}

export function BDContentDashboard({ userName }: BDContentProps) {
  return <LeadsManagement userRole="BD-Content" userName={userName} />;
}

