/**
 * Shared types for handover feature
 */

import type { Deliverable, Milestone, FeeStructureItem, ChecklistItem, SignOff, ExternalContact, TeamMember } from '../../../lib/projectWorkflowTypes';

export type SectionId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export const ALL_SECTIONS: SectionId[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

export const TOTAL_SECTIONS = 11;

/** Form draft state (UI-only, matches form fields) */
export interface HandoverDraft {
  documentCode: string;
  projectName: string;
  clientName: string;
  companyGroup: string;
  serviceLine: string;
  projectStartDate: string;
  projectEndDate: string;
  clientPic: string;
  clientEmail: string;
  clientPhone: string;
  engagementLetterStatus: string;
  proposalReference: string;
  background: string;
  scopeIncluded: string[];
  scopeExclusions: string[];
  deliverables: Partial<Deliverable>[];
  milestones: Partial<Milestone>[];
  feeStructure: Partial<FeeStructureItem>[];
  paymentTermsText: string;
  documentsReceived: Array<{
    fileName: string;
    file?: File;
    fileUrl?: string;
    uploadedAt?: string;
    uploadedBy?: string;
    uploadDate?: string;
  }>;
  storageLocation: string;
  dataRequirements: string[];
  risks: string[];
  communicationInternal: string;
  communicationExternal: string;
  externalContacts: Partial<ExternalContact>[];
  preliminaryTeam: Partial<TeamMember>[];
  handoverChecklist: Partial<ChecklistItem>[];
  signOffs: Partial<SignOff>[];
}
