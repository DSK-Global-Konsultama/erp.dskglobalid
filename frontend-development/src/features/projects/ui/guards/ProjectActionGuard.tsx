import type { UserRole } from '../../../../services/authService';
import { canCompleteProject } from './canProject';

export type ProjectActionPermission = 'assign' | 'complete' | 'view';

export interface ProjectActionGuardProps {
  action: ProjectActionPermission;
  /** Optional: when true, render children but disabled. Default false = hide when no permission. */
  disabledOnly?: boolean;
  /** Role from parent (avoids coupling to authService) */
  userRole?: UserRole;
  children: React.ReactNode;
}

/**
 * Renders children only when the current user has permission for the given action.
 * - view: always render
 * - assign: only if canAssignPM(role, serviceName) - requires serviceName for assign, so parent passes role and checks service separately; for generic guard we only check role can be COO/CEO. Actually canAssignPM needs serviceName - so for "assign" action we can't fully check here. The task says "canAssignPM(role): bool" - wrap from rolePermissions. But canAssignPM(role, serviceName) needs serviceName. So we have two options:
 *   1) ProjectActionGuard receives serviceName as prop when action=assign
 *   2) canAssignPM(role) returns true if user is COO or CEO (can potentially assign)
 *
 * Looking at the task: "canAssignPM(role): bool (wrap dari utils/rolePermissions.canAssignPM/isCOO)" - so they want a simpler check. Let me check rolePermissions - canAssignPM(role, serviceName) needs both. For the guard, we could:
 * - Pass serviceName as optional prop for action=assign
 * - Or canAssignPM(role) = isCOO(role) || isCEO(role) for "can potentially assign"
 *
 * The task says: "canAssignPM(role): bool" - so I'll add to canProject a function that returns true if the role can assign PM for at least some services (i.e. is COO or CEO). Let me add canAssignPMForAnyService(role) = isCOO(role) || isCEO(role). The actual service-specific check remains in the parent/callback.
 *
 * Actually re-reading: "canAssignPM(role): bool (wrap dari utils/rolePermissions.canAssignPM/isCOO)" - maybe they mean we wrap it such that we check isCOO or similar. The simplest is: for "assign" action, show button if user is COO or CEO. The service-specific check happens in handleAssignPM. So:
 * canAssignPM(role) => isCOO(role) || isCEO(role) for the guard.
 *
 * I already have canAssignPM(role, serviceName) in canProject. For the guard without serviceName, I need canAssignPMForAnyService or similar. Let me add to canProject: canAssignPMForAnyService(role) = isCOO(role) || isCEO(role). And ProjectActionGuard action="assign" uses that.
 */
function canAssignPMForAnyService(role: UserRole | undefined): boolean {
  if (!role) return false;
  return role.startsWith('COO-') || role === 'CEO';
}

export function ProjectActionGuard({
  action,
  disabledOnly = false,
  userRole,
  children,
}: ProjectActionGuardProps) {
  if (action === 'view') {
    return <>{children}</>;
  }

  if (action === 'assign') {
    const allowed = canAssignPMForAnyService(userRole);
    if (allowed) return <>{children}</>;
    if (disabledOnly) return <span className="opacity-50 pointer-events-none">{children}</span>;
    return null;
  }

  if (action === 'complete') {
    const allowed = canCompleteProject(userRole);
    if (allowed) return <>{children}</>;
    if (disabledOnly) return <span className="opacity-50 pointer-events-none">{children}</span>;
    return null;
  }

  return null;
}
