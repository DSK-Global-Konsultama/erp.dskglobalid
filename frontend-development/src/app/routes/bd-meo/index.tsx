import { LeadsManagementPage } from '../../../features/leads/pages/index';

interface BDMEOProps {
  userName: string;
}

export function BDMEODashboard({ userName }: BDMEOProps) {
  // BD-MEO can only view leads, cannot add new leads (per CEO policy)
  return <LeadsManagementPage userName={userName} mode="view" />;
}

