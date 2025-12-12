import { LeadsManagement } from '../../../features/leads/components/LeadsManagement';

interface BDMEOProps {
  userName: string;
}

export function BDMEODashboard({ userName }: BDMEOProps) {
  return <LeadsManagement userName={userName} mode="edit" />;
}

