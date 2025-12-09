import { LeadsManagement } from '../../../../features/leads/components/LeadsManagement';
import { authService } from '../../../../services/authService';

export function LeadsPage() {
  const currentUser = authService.getCurrentUser();
  // Ensure role is one of the supported types for LeadsManagement
  const role = currentUser?.role;
  const validRole = (role === 'CEO' || role === 'COO-Tax-Audit' || role === 'COO-Legal-TP-SR' || role === 'BD-MEO' || role === 'BD-Executive')
    ? role
    : 'COO-Tax-Audit';
  return <LeadsManagement userRole={validRole as 'CEO' | 'COO-Tax-Audit' | 'COO-Legal-TP-SR' | 'BD-MEO' | 'BD-Executive'} userName="" />;
}

