import { LeadsList } from '../../../features/leads/components/LeadsList';

interface BDMEOProps {
  userName: string;
}

export function BDMEODashboard({ userName }: BDMEOProps) {
  return <LeadsList userName={userName} mode="edit" />;
}

