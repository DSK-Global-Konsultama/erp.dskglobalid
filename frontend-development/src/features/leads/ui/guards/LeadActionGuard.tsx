import { authService } from '../../../../services/authService';
import { canEditLead, canApproveLead } from './canLead';

export type LeadActionPermission = 'edit' | 'view' | 'approve';

export interface LeadActionGuardProps {
  /** Action to guard: edit (create/update/delete), view (open detail modal), approve (CEO approve/reject) */
  action: LeadActionPermission;
  /**
   * When true (e.g. CEO view-only page), edit/approve actions are hidden; view action still shown.
   * Pass readOnly from parent so we don't show edit buttons for CEO.
   */
  readOnly?: boolean;
  children: React.ReactNode;
}

/**
 * Renders children only when the current user has permission for the given action.
 * Uses authService.getCurrentUser(); no React context required.
 * - edit: only BD-Executive (and not readOnly)
 * - view: always (View button for detail modal)
 * - approve: only CEO (for approve/reject in modals)
 */
export function LeadActionGuard({ action, readOnly = false, children }: LeadActionGuardProps) {
  const user = authService.getCurrentUser();
  const role = user?.role;

  if (action === 'view') {
    return <>{children}</>;
  }

  if (action === 'approve') {
    if (!canApproveLead(role)) return null;
    return <>{children}</>;
  }

  // action === 'edit'
  if (readOnly) return null;
  if (!canEditLead(role)) return null;
  return <>{children}</>;
}
