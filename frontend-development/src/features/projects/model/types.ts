/**
 * Re-export Project type from mock-data for feature-internal use.
 */
export type { Project } from '../../../lib/mock-data';

/**
 * Display status for handover workflow step indicator only.
 * Do not use project.status or handover.workflowStatus for list filtering/badges.
 */
export type ProjectWorkflowDisplayStatus =
  | 'HANDOVER_DRAFT'
  | 'SUBMITTED_TO_CEO'
  | 'CEO_APPROVED'
  | 'PM_ASSIGNED'
  | 'PM_ACCEPTED'
  | 'PROJECT_ACTIVE';
