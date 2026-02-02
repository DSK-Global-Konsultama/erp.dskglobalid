/**
 * Handover selectors: section completion, revision mapping, etc.
 */

import type { RevisionComment } from '../../../lib/projectWorkflowTypes';
import { SECTION_NAMES } from './constants';
import { ALL_SECTIONS, type SectionId, type HandoverDraft } from './types';

export function getSectionCompletion(draft: HandoverDraft, sectionId: SectionId): boolean {
  switch (sectionId) {
    case 1:
      return !!(draft.projectName && draft.clientName && draft.clientPic && draft.clientEmail && draft.projectStartDate && draft.projectEndDate && draft.serviceLine);
    case 2:
      return !!(draft.background && draft.background.length > 20);
    case 3:
      return draft.scopeIncluded.filter(s => s.trim()).length > 0 &&
             draft.deliverables.filter(d => d.name).length > 0 &&
             draft.milestones.filter(m => m.name && m.targetDate).length > 0;
    case 4:
      return draft.feeStructure.filter(f => f.description && f.amount).length > 0;
    case 5:
      return draft.documentsReceived.filter(d => d.fileName.trim()).length > 0;
    case 6:
      return draft.dataRequirements.filter(d => d.trim()).length > 0;
    case 7:
      return draft.risks.filter(r => r.trim()).length > 0;
    case 8:
      return !!(draft.communicationInternal && draft.externalContacts.filter(c => c.name).length > 0);
    case 9:
      return draft.preliminaryTeam.filter(t => t.role && t.name).length > 0;
    case 10:
      return draft.handoverChecklist.filter(c => c.description).length > 0;
    case 11:
      return draft.signOffs.filter(s => s.role && s.name).length > 0;
    default:
      return false;
  }
}

/** Map section name (from revision comment) to section ID using SECTION_NAMES/ALL_SECTIONS */
export function findSectionIdFromRevision(sectionName: string): SectionId {
  const names = SECTION_NAMES as Record<SectionId, string>;
  for (const id of ALL_SECTIONS) {
    const name = names[id];
    if (name && (sectionName === name || sectionName.includes(name) || sectionName === `${id}. ${name}`)) {
      return id;
    }
  }
  return 1;
}

export function hasRevisionForSection(revisionComments: RevisionComment[], sectionId: SectionId): boolean {
  const sectionName = SECTION_NAMES[sectionId];
  return revisionComments.some(r =>
    r.sectionName === `${sectionId}. ${sectionName}` ||
    r.sectionName === sectionName ||
    r.sectionName.includes(sectionName)
  );
}
