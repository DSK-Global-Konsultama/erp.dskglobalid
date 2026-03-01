import { InvoicesManagementPage } from '../../../../features/invoices';
import { canApproveInvoices } from '../../../../utils/rolePermissions';
import { authService } from '../../../../services/authService';

export function InvoicesPage() {
  const currentUser = authService.getCurrentUser();
  const canApprove = canApproveInvoices(currentUser?.role);

  return (
    <InvoicesManagementPage
      canApprove={canApprove}
      userRole={currentUser?.role}
    />
  );
}
