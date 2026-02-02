/**
 * Handover mappers: handover <-> draft, draft -> payload
 */

import type { ExtendedHandover, Deliverable } from '../../../lib/projectWorkflowTypes';
import type { HandoverDraft } from './types';
import { HANDOVER_CONSTANTS } from './constants';

export interface DraftMeta {
  handoverId?: string;
  proposalId?: string;
  leadId?: string;
  existingHandover?: ExtendedHandover;
}

/** Build draft from existing handover + lead/engagement letter (for display/edit) */
export function handoverToDraft(
  existingHandover: ExtendedHandover | undefined,
  leadData?: { clientName?: string; companyName?: string; service?: string; picName?: string; picEmail?: string; picPhone?: string },
  engagementLetter?: { signedDate?: string; status?: string }
): HandoverDraft {
  const handoverAny = existingHandover as any;
  const projectPeriod = existingHandover?.projectPeriod?.split(' – ') || ['', ''];

  const initializeDeliverables = (): Partial<Deliverable>[] => {
    if (handoverAny?.deliverablesExtended?.length) return handoverAny.deliverablesExtended;
    if (handoverAny?.deliverables?.length) {
      const first = handoverAny.deliverables[0];
      if (typeof first === 'string') {
        return (handoverAny.deliverables as string[]).map((name: string, i: number) => ({ id: `DEL-${i + 1}`, name, description: '' }));
      }
      return handoverAny.deliverables;
    }
    return [{ name: '', description: '' }];
  };

  return {
    documentCode: existingHandover?.documentCode || '',
    projectName: existingHandover?.projectName || '',
    clientName: existingHandover?.clientName || leadData?.companyName || leadData?.clientName || '',
    companyGroup: existingHandover?.companyGroup || '',
    serviceLine: existingHandover?.serviceLine || leadData?.service || '',
    projectStartDate: projectPeriod[0] || '',
    projectEndDate: projectPeriod[1] || '',
    clientPic: existingHandover?.clientPic || leadData?.picName || '',
    clientEmail: existingHandover?.clientEmail || leadData?.picEmail || '',
    clientPhone: existingHandover?.clientPhone || leadData?.picPhone || '',
    engagementLetterStatus: existingHandover?.engagementLetterStatus ||
      (engagementLetter?.signedDate ? `Signed on ${new Date(engagementLetter.signedDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}` : ''),
    proposalReference: existingHandover?.proposalReference || '',
    background: existingHandover?.background || '',
    scopeIncluded: existingHandover?.scopeIncluded?.length ? existingHandover.scopeIncluded : [''],
    scopeExclusions: existingHandover?.scopeExclusions?.length ? existingHandover.scopeExclusions : [''],
    deliverables: initializeDeliverables(),
    milestones: existingHandover?.milestones?.length ? existingHandover.milestones : [{ name: '', targetDate: '', description: '' }],
    feeStructure: existingHandover?.feeStructure?.length ? existingHandover.feeStructure : [{ description: '', amount: 0 }],
    paymentTermsText: existingHandover?.paymentTermsText || '',
    documentsReceived: existingHandover?.documentsReceived?.map(d => ({
      fileName: d.fileName,
      fileUrl: d.fileUrl,
      uploadedAt: (d as any).uploadedAt || d.receivedDate,
      uploadedBy: d.uploadedBy,
      uploadDate: d.uploadDate || d.receivedDate
    })) || [{ fileName: '' }],
    storageLocation: existingHandover?.storageLocation || '',
    dataRequirements: existingHandover?.dataRequirements?.map(d => d.itemName) || [''],
    risks: existingHandover?.risks?.map(r => r.description) || [''],
    communicationInternal: existingHandover?.communicationInternal || '',
    communicationExternal: existingHandover?.communicationExternal || '',
    externalContacts: existingHandover?.externalContacts?.length ? existingHandover.externalContacts : [{ role: '', name: '', email: '', phone: '', company: '' }],
    preliminaryTeam: existingHandover?.preliminaryTeam?.length ? existingHandover.preliminaryTeam : [{ role: '', name: '', allocation: '' }],
    handoverChecklist: existingHandover?.handoverChecklist?.length ? existingHandover.handoverChecklist : [{ description: '', status: 'Pending' }],
    signOffs: existingHandover?.signOffs?.length ? existingHandover.signOffs : [{ role: '', name: '', signedAt: '', notes: '' }],
  };
}

/** Map draft to ExtendedHandover payload for 'draft' or 'submit' mode */
export function draftToPayload(
  draft: HandoverDraft,
  meta: DraftMeta,
  mode: 'draft' | 'submit'
): Partial<ExtendedHandover> {
  const ts = Date.now();
  const base: Partial<ExtendedHandover> = {
    id: meta.handoverId || (mode === 'submit' ? `HO-${ts}` : undefined),
    documentCode: draft.documentCode,
    classification: HANDOVER_CONSTANTS.CLASSIFICATION,
    projectName: draft.projectName,
    clientName: draft.clientName,
    companyGroup: draft.companyGroup,
    serviceLine: draft.serviceLine,
    projectPeriod: draft.projectStartDate && draft.projectEndDate ? `${draft.projectStartDate} – ${draft.projectEndDate}` : '',
    clientPic: draft.clientPic,
    clientEmail: draft.clientEmail,
    clientPhone: draft.clientPhone,
    engagementLetterStatus: draft.engagementLetterStatus,
    proposalReference: draft.proposalReference,
    background: draft.background,
    scopeIncluded: draft.scopeIncluded.filter(s => s.trim()),
    scopeExclusions: draft.scopeExclusions.filter(s => s.trim()),
    deliverables: draft.deliverables.filter(d => d.name).map((d, i) => ({
      id: d.id || `DEL-${ts}-${i}`,
      name: d.name!,
      description: d.description || '',
      quantity: d.quantity || 1,
      dueDate: d.dueDate,
      assignedTo: d.assignedTo
    })),
    milestones: draft.milestones.filter(m => m.name && m.targetDate).map((m, i) => ({
      id: m.id || `MS-${ts}-${i}`,
      name: m.name!,
      targetDate: m.targetDate!,
      description: m.description
    })),
    feeStructure: draft.feeStructure.filter(f => f.description && f.amount).map((f, i) => ({
      id: f.id || `FEE-${ts}-${i}`,
      description: f.description!,
      amount: f.amount!,
      percentage: f.percentage,
      dueDate: f.dueDate,
      status: (f.status as 'Pending' | 'Paid' | 'Overdue') || 'Pending'
    })),
    paymentTermsText: draft.paymentTermsText,
    documentsReceived: draft.documentsReceived.filter(d => d.fileName.trim() || d.file || d.fileUrl).map(d => ({
      fileName: d.fileName,
      fileUrl: d.fileUrl,
      receivedDate: d.uploadedAt || new Date().toISOString().split('T')[0],
      uploadedBy: d.uploadedBy || 'Current User',
      uploadDate: d.uploadDate || d.uploadedAt || new Date().toISOString()
    })),
    storageLocation: draft.storageLocation,
    dataRequirements: [],
    risks: draft.risks.filter(r => r.trim()).map((r, i) => ({
      id: `RISK-${ts}-${i}`,
      description: r,
      impact: 'Medium' as const,
      mitigation: ''
    })),
    communicationInternal: draft.communicationInternal,
    communicationExternal: draft.communicationExternal,
    externalContacts: draft.externalContacts.filter(c => c.name).map((c, i) => ({
      id: c.id || `CONT-${ts}-${i}`,
      role: c.role!,
      name: c.name!,
      email: c.email || '',
      phone: c.phone || '',
      company: c.company || ''
    })),
    preliminaryTeam: draft.preliminaryTeam.filter(t => t.role && t.name).map((t, i) => ({
      id: t.id || `TM-${ts}-${i}`,
      role: t.role!,
      name: t.name!,
      allocation: t.allocation
    })),
    handoverChecklist: draft.handoverChecklist.filter(c => c.description).map((c, i) => ({
      id: c.id || `CHK-${ts}-${i}`,
      description: c.description!,
      status: (c.status as 'Pending' | 'Completed') || 'Pending'
    })),
    signOffs: draft.signOffs.filter(s => s.role && s.name).map((s, i) => ({
      id: s.id || `SIGN-${ts}-${i}`,
      role: s.role!,
      name: s.name!,
      signedAt: s.signedAt,
      notes: s.notes
    })),
    leadId: meta.leadId,
  };

  if (mode === 'draft') {
    return {
      ...base,
      workflowStatus: 'HANDOVER_DRAFT',
      communicationProtocol: '',
      escalationPath: '',
    };
  }

  return {
    ...base,
    id: meta.handoverId || `HO-${ts}`,
    workflowStatus: 'SUBMITTED_TO_CEO',
    submittedToCeoAt: new Date().toISOString(),
    createdAt: meta.existingHandover?.createdAt || new Date().toISOString(),
    lastModifiedAt: new Date().toISOString(),
    communicationProtocol: draft.communicationInternal,
    escalationPath: draft.communicationExternal,
    proposalId: meta.proposalId,
  };
}
