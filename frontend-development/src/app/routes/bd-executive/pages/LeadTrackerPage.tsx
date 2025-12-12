import { LeadsManagement } from '../../../../features/leads/components/LeadsManagement';

interface LeadTrackerPageProps {
  userName: string;
}

export function LeadTrackerPage({ userName }: LeadTrackerPageProps) {
  return <LeadsManagement userName={userName} mode="tracker" />;
}

