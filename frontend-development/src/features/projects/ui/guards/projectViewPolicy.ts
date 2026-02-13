/**
 * Single source of truth for project detail view: which handover sections are hidden per role.
 * PM: sections 4 (Fee), 5 (Client Documents), 6 (Data Requirements) hidden (moved to Documents/Requirements tabs).
 * COO: sections 5 (Client Documents), 6 (Data Requirements) hidden — same content in Document and Requirement tabs.
 * No banners or notices — hidden sections are simply not rendered.
 */
import type { SectionId } from '../../../handover/model/types';

export function getHandoverHiddenSections(userRole: string): SectionId[] {
  const isPM = userRole === 'PM';
  const isCOO = userRole === 'COO' || userRole.startsWith('COO');
  if (isPM) return [4, 5, 6];
  if (isCOO) return [5, 6]; // Client Provide Document → Documents tab; Data Requirement → Requirements tab
  return [];
}

/** Only PM can update requirement status (Validate / Need Revision / Not Needed). COO read-only. */
export function canUpdateRequirementStatus(role: string): boolean {
  return role === 'PM';
}

/** PM can upload project documents. COO view only (set to false for COO; change here to allow COO upload). */
export function canUploadProjectDocument(role: string): boolean {
  return role === 'PM';
}

/** Both COO and PM can view project documents. */
export function canViewProjectDocument(role: string): boolean {
  return role === 'PM' || role === 'COO' || role.startsWith('COO');
}
