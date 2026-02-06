import type { UserRole } from '../../../../services/authService';
import {
  canAssignPM as canAssignPMFromRolePermissions,
  getCOOManageableServices,
  isCOO,
  isPM,
} from '../../../../utils/rolePermissions';

/**
 * canProject.ts – Helper permission untuk fitur Projects (RBAC action-level).
 * Wraps rolePermissions for feature-internal use.
 */

/** Wrapper: can user assign PM to project based on service */
export function canAssignPM(
  role: UserRole | undefined,
  serviceName: string
): boolean {
  return canAssignPMFromRolePermissions(role, serviceName);
}

/** Can user complete project (mark as done) – only PM */
export function canCompleteProject(role: UserRole | undefined): boolean {
  return isPM(role);
}

/** Can user view projects – all roles that access projects page (CEO, COO, PM, etc.) */
export function canViewProject(role: UserRole | undefined): boolean {
  return role != null;
}

/** Get COO manageable services (for display) */
export function getCOOManageableServicesForProject(
  role: UserRole | undefined
): string[] {
  return getCOOManageableServices(role) ?? [];
}

/** Is user COO */
export function isCOOUser(role: UserRole | undefined): boolean {
  return isCOO(role) ?? false;
}

/** Is user PM */
export function isPMUser(role: UserRole | undefined): boolean {
  return isPM(role) ?? false;
}
