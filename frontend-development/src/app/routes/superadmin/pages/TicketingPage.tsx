import { TicketingManagement } from '../../../../features/ticketing/components/TicketingManagement';
import { authService } from '../../../../services/authService';

export function TicketingPage() {
  const currentUser = authService.getCurrentUser();
  const userRole = currentUser?.role === 'SuperAdmin' ? 'IT' : 'Other';
  const userName = currentUser?.name || 'User';

  return <TicketingManagement userRole={userRole} userName={userName} />;
}
