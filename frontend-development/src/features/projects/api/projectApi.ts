import type {
  ExtendedHandover,
  Requirement,
  ProjectDocument,
  RequirementStatus,
  DocumentCategory,
} from '../../../lib/projectWorkflowTypes';
import type { Project, Lead, Proposal, EngagementLetter } from '../../../lib/mock-data';
import {
  mockProjects,
  mockHandovers,
  mockLeads,
  mockProposals,
  mockEngagementLetters,
  mockDeals,
} from '../../../lib/mock-data';

/**
 * Result of getProjectDetailByHandoverId: handover + related lead, proposal, engagement letter.
 */
export interface ProjectDetailByHandover {
  handover: ExtendedHandover | null;
  lead?: Lead;
  proposal?: Proposal;
  engagementLetter?: EngagementLetter;
}

/**
 * Bundle when handover is found (handover required). Use after null-check.
 */
export interface ProjectDetailBundle {
  handover: ExtendedHandover;
  lead?: Lead;
  proposal?: Proposal;
  engagementLetter?: EngagementLetter;
  workStartAllowed: boolean;
  paymentGateStatus: string;
  /** For workflow step indicator: PM_ASSIGNED when project exists with assignedPM */
  workflowDisplayStatus?: string;
  projectId?: string;
  requirements: Requirement[];
  documents: ProjectDocument[];
}

/**
 * Single entry point for project-related data (mock for now).
 * Use this instead of importing directly from lib/mock-data.
 */
export const projectApi = {
  getAll: (): Project[] => mockProjects,

  getByPM: (pmName: string, projects: Project[]): Project[] => {
    return projects.filter(project => project.assignedPM === pmName);
  },

  getByStatus: (status: Project['status'], projects: Project[]): Project[] => {
    return projects.filter(project => project.status === status);
  },

  assignPM: (projectId: string, pmName: string, projects: Project[]): Project[] => {
    return projects.map(project =>
      project.id === projectId
        ? {
            ...project,
            assignedPM: pmName,
            status: 'waiting-first-payment' as const,
          }
        : project
    );
  },

  assignConsultant: (projectId: string, consultantName: string, projects: Project[]): Project[] => {
    return projects.map(project =>
      project.id === projectId ? { ...project, assignedConsultant: consultantName } : project
    );
  },

  /**
   * Get project id for a handover (handover already converted to project). Returns null if no project exists.
   */
  getProjectIdByHandoverId: (handoverId: string): string | null => {
    const handover = mockHandovers.find(h => h.id === handoverId);
    if (!handover) return null;
    const deal = mockDeals.find(d => d.leadId === handover.leadId);
    if (!deal) return null;
    const project = mockProjects.find(p => p.dealId === deal.id);
    return project?.id ?? null;
  },

  /**
   * Get handover id for a project (via deal.leadId). Returns null if no handover exists for that lead.
   */
  getHandoverIdByProjectId: (projectId: string): string | null => {
    const project = mockProjects.find(p => p.id === projectId);
    if (!project) return null;
    const deal = mockDeals.find(d => d.id === project.dealId);
    if (!deal) return null;
    const handover = mockHandovers.find(h => h.leadId === deal.leadId);
    return handover?.id ?? null;
  },

  /**
   * Get project detail by handover id (handover + lead, proposal, engagement letter).
   * Returns null when handover not found. workStartAllowed/paymentGateStatus derived from linked project if any.
   */
  getProjectDetailByHandoverId: (handoverId: string): ProjectDetailBundle | null => {
    const handoverRow = mockHandovers.find(h => h.id === handoverId);
    if (!handoverRow) return null;
    const handover = handoverRow as unknown as ExtendedHandover;
    const leadId = handoverRow.leadId;
    const lead = mockLeads.find(l => l.id === leadId);
    const proposal = mockProposals.find(p => p.leadId === leadId);
    const engagementLetter = mockEngagementLetters.find(el => el.leadId === leadId);
    const deal = mockDeals.find(d => d.leadId === leadId);
    const project = deal ? mockProjects.find(p => p.dealId === deal.id) : null;
    const workStartAllowed = project
      ? project.status === 'in-progress' || project.status === 'waiting-final-payment'
      : false;
    const paymentGateStatus = project
      ? project.status === 'waiting-first-payment'
        ? 'Waiting First Payment'
        : project.status === 'waiting-final-payment'
          ? 'Waiting Final Payment'
          : project.status === 'in-progress'
            ? 'Payment Received'
            : 'Not Started'
      : 'Not Started';
    const workflowDisplayStatus =
      project?.assignedPM ? 'PM_ASSIGNED' : (handover.workflowStatus ?? undefined);
    const requirements = mapHandoverDataRequirementsToRequirements(handover, handoverId);
    const documents = getDocumentsForHandover(handover);
    return {
      handover,
      lead,
      proposal,
      engagementLetter,
      workStartAllowed,
      paymentGateStatus,
      workflowDisplayStatus,
      projectId: project?.id,
      requirements,
      documents,
    };
  },
};

/** Map handover.dataRequirements (from handover form/section 6) to Requirement[] for Requirements tab. */
function mapHandoverDataRequirementsToRequirements(
  handover: ExtendedHandover,
  handoverId: string
): Requirement[] {
  const raw = handover.dataRequirements ?? [];
  return raw.map((item, index) => {
    const status = normalizeRequirementStatus(item.status);
    return {
      id: `${handoverId}-req-${index + 1}`,
      itemName: item.itemName ?? '',
      status,
      category: undefined,
      notes: undefined,
      evidenceFiles: [],
    };
  });
}

/** Hanya dua status: REQUESTED (awal) dan RECEIVED. */
function normalizeRequirementStatus(s?: string): RequirementStatus {
  if (!s) return 'REQUESTED';
  const u = s.toUpperCase().trim();
  if (u === 'RECEIVED') return 'RECEIVED';
  return 'REQUESTED';
}

/** Documents from handover.documentsReceived (section 5). Maps to Document Center shape with safe defaults. */
function getDocumentsForHandover(handover: ExtendedHandover): ProjectDocument[] {
  const raw = handover.documentsReceived ?? [];
  return raw.map((doc, index) => {
    const fileName = doc.fileName ?? 'Document';
    const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
    const fileType = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'png', 'jpg', 'jpeg'].includes(ext)
      ? ext
      : 'pdf';
    const uploadedAt = doc.receivedDate ?? doc.uploadDate ?? new Date().toISOString();
    return {
      id: `${handover.id ?? 'ho'}-doc-${index + 1}`,
      category: '02-Client Docs' as DocumentCategory,
      fileName,
      fileType,
      fileSize: '0 KB',
      uploadedBy: doc.uploadedBy ?? '',
      uploadedAt,
      version: 1,
      fileUrl: doc.fileUrl,
    };
  });
}

export type { Project };
