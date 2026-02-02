/**
 * Handover draft validation (same rules as original validateForm)
 */

import { HANDOVER_CONSTANTS } from './constants';
import type { HandoverDraft } from './types';

export interface ValidateHandoverDraftResult {
  ok: boolean;
  errors: Record<string, string>;
}

export function validateHandoverDraft(draft: HandoverDraft): ValidateHandoverDraftResult {
  const errors: Record<string, string> = {};

  if (!draft.documentCode) errors.documentCode = 'Document code is required';
  if (!draft.projectName) errors.projectName = 'Project name is required';
  if (!draft.clientName) errors.clientName = 'Client name is required';
  if (!draft.serviceLine) errors.serviceLine = 'Service line is required';
  if (!draft.clientPic) errors.clientPic = 'Client PIC is required';
  if (!draft.clientEmail) errors.clientEmail = 'Client email is required';
  if (!draft.projectStartDate) errors.projectStartDate = 'Project start date is required';
  if (!draft.projectEndDate) errors.projectEndDate = 'Project end date is required';

  if (!draft.background || draft.background.length < HANDOVER_CONSTANTS.MIN_BACKGROUND_LENGTH) {
    errors.background = `Background summary is required (min ${HANDOVER_CONSTANTS.MIN_BACKGROUND_LENGTH} characters)`;
  }

  if (draft.scopeIncluded.filter(s => s.trim()).length === 0) {
    errors.scopeIncluded = 'At least one scope item is required';
  }
  if (draft.deliverables.filter(d => d.name).length === 0) {
    errors.deliverables = 'At least one deliverable is required';
  }
  if (draft.milestones.filter(m => m.name && m.targetDate).length === 0) {
    errors.milestones = 'At least one milestone is required';
  }

  if (draft.feeStructure.filter(f => f.description && f.amount).length === 0) {
    errors.feeStructure = 'Fee structure is required';
  }

  if (!draft.communicationInternal) errors.communicationInternal = 'Internal communication protocol is required';

  return {
    ok: Object.keys(errors).length === 0,
    errors,
  };
}
