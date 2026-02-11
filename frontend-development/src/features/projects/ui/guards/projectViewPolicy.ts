/**
 * Single source of truth for project detail view: which handover sections are hidden per role.
 * PM: sections 4 (Fee), 5 (Client Documents), 6 (Data Requirements) hidden (will move to Documents/Requirements tabs later).
 * COO: sees all sections (1–11).
 * No banners or notices — hidden sections are simply not rendered.
 */
import type { SectionId } from '../../../handover/model/types';

export function getHandoverHiddenSections(userRole: string): SectionId[] {
  const isPM = userRole === 'PM';
  if (isPM) return [4, 5, 6];
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
