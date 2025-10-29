import { DealsManagement } from '../../../../features/deals/components/DealsManagement';

interface MyDealsPageProps {
  userName: string;
}

export function MyDealsPage({ userName }: MyDealsPageProps) {
  return <DealsManagement userRole="BD-Executive" userName={userName} />;
}

