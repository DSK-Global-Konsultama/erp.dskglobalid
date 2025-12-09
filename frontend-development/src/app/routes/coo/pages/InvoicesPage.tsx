import { InvoiceManagement } from '../../../../features/invoices/components/InvoiceManagement';
import { canApproveInvoices } from '../../../../utils/rolePermissions';
import { authService } from '../../../../services/authService';

export function InvoicesPage() {
  const currentUser = authService.getCurrentUser();
  const canApprove = canApproveInvoices(currentUser?.role);

  return (
    <InvoiceManagement 
      canApprove={canApprove} 
      userRole={currentUser?.role}
    />
  );
}
