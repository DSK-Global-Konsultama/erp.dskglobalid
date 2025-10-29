import { LeadsManagement } from '../../../../features/leads/components/LeadsManagement';

interface AvailableLeadsPageProps {
  userName: string;
}

export function AvailableLeadsPage({ userName }: AvailableLeadsPageProps) {
  return <LeadsManagement userRole="BD-Executive" userName={userName} />;
}

