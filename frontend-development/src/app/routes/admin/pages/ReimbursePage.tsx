import { AdminReimbursementDashboard } from '../../../../features/reimburse/components/AdminReimbursementDashboard';
import { authService } from '../../../../services/authService';

export function ReimbursePage() {
  const currentUser = authService.getCurrentUser();
  const userName = currentUser?.name || 'Admin';

  return (
    <AdminReimbursementDashboard userName={userName} />
  );
}

