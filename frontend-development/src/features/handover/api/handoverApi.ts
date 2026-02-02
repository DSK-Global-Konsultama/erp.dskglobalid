/**
 * Single entry point for handover data (stub/mock).
 * Centralize all handover API calls here.
 */

import type { ExtendedHandover } from '../../../lib/projectWorkflowTypes';

export const handoverApi = {
  /** Get handover by lead ID (stub – caller may pass data from parent) */
  getByLeadId: (_leadId: string): Promise<ExtendedHandover | undefined> => {
    return Promise.resolve(undefined);
  },

  /** Save draft (stub – caller uses onSaveDraft callback) */
  saveDraft: (_payload: Partial<ExtendedHandover>): Promise<void> => {
    return Promise.resolve();
  },

  /** Submit to CEO (stub – caller uses onSubmit callback) */
  submit: (_payload: Partial<ExtendedHandover>): Promise<void> => {
    return Promise.resolve();
  },

  /** Approve handover (stub – caller uses onApprove callback) */
  approve: (_handoverId: string): Promise<void> => {
    return Promise.resolve();
  },

  /** Request revision (stub – caller uses onReject/onRequestRevision callback) */
  requestRevision: (_handoverId: string, _revisions: Array<{ sectionName: string; comment: string }>): Promise<void> => {
    return Promise.resolve();
  },
};
