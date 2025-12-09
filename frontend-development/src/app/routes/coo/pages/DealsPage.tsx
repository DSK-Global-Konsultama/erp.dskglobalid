import { DealsManagement } from '../../../../features/deals/components/DealsManagement';
import { authService } from '../../../../services/authService';

export function DealsPage() {
  const currentUser = authService.getCurrentUser();
  // Ensure role is one of the supported types for DealsManagement
  const role = currentUser?.role;
  const validRole = (role === 'CEO' || role === 'COO-Tax-Audit' || role === 'COO-Legal-TP-SR' || role === 'BD-Executive')
    ? role
    : 'COO-Tax-Audit';
  return <DealsManagement userRole={validRole as 'CEO' | 'COO-Tax-Audit' | 'COO-Legal-TP-SR' | 'BD-Executive'} userName="" />;
}

