import type {
  ExtendedHandover,
  Requirement,
  ProjectDocument,
  RequirementStatus,
  DocumentCategory,
  ProgressLog,
  ActivityLog,
  ProjectPhase,
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
  progressLogs: ProgressLog[];
  activityLogs: ActivityLog[];
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
    const progressLogs = getDummyProgressLogs(handoverId, project?.assignedPM);
    const activityLogs = getDummyActivityLogs(
      handoverId,
      progressLogs,
      requirements,
      documents,
      project?.assignedPM
    );
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
      progressLogs,
      activityLogs,
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

/** Dummy progress logs for project detail (newest first). Sinkron dengan activity: setiap entry punya PROGRESS_UPDATED di activity. */
function getDummyProgressLogs(handoverId: string, pmName?: string): ProgressLog[] {
  const createdBy = pmName ?? 'PM';
  const base = new Date();
  const entries: { daysAgo: number; phase: ProjectPhase; pct: number; note: string; blockers?: string; nextSteps?: string }[] = [
    { daysAgo: 0, phase: 'Drafting', pct: 45, note: 'Draft section 2–3 selesai; menunggu data tambahan dari client.', nextSteps: 'Finalisasi section 4 dan kirim draft ke review internal.' },
    { daysAgo: 7, phase: 'Analysis', pct: 30, note: 'Analisis data utama selesai. Sedang validasi dengan tim client.', blockers: 'Menunggu konfirmasi jadwal meeting review.', nextSteps: 'Mulai drafting laporan.' },
    { daysAgo: 14, phase: 'Data Collection', pct: 15, note: 'Kick-off selesai. Kebutuhan data sudah dikirim ke client.', nextSteps: 'Follow-up dokumen pendukung dan jadwal wawancara.' },
  ];
  return entries.map((e, i) => {
    const d = new Date(base);
    d.setDate(d.getDate() - e.daysAgo);
    d.setHours(10, 30, 0, 0);
    return {
      id: `${handoverId}-progress-${i + 1}`,
      handoverId,
      progressPercentage: e.pct,
      phase: e.phase,
      updateNote: e.note,
      blockers: e.blockers,
      nextSteps: e.nextSteps,
      createdBy,
      createdAt: d.toISOString(),
    };
  });
}

/** Dummy activity logs (newest first). Konsisten dengan documents/requirements; PROGRESS_UPDATED sinkron dengan progressLogs. */
function getDummyActivityLogs(
  handoverId: string,
  progressLogs: ProgressLog[],
  requirements: Requirement[],
  documents: ProjectDocument[],
  pmName?: string
): ActivityLog[] {
  const pm = pmName ?? 'PM';
  const base = new Date();
  const ts = (daysAgo: number, hour = 9) => {
    const d = new Date(base);
    d.setDate(d.getDate() - daysAgo);
    d.setHours(hour, 0, 0, 0);
    return d.toISOString();
  };

  const activities: ActivityLog[] = [];

  // Workflow & lifecycle (oldest first, we reverse at end)
  activities.push({
    id: `${handoverId}-act-handover-created`,
    activityType: 'HANDOVER_CREATED',
    description: 'Handover project dibuat oleh BD.',
    actorName: 'Budi Santoso',
    actorRole: 'BD',
    createdAt: ts(45),
  });
  activities.push({
    id: `${handoverId}-act-handover-submitted`,
    activityType: 'HANDOVER_SUBMITTED',
    description: 'Handover diserahkan ke CEO untuk persetujuan.',
    actorName: 'Budi Santoso',
    actorRole: 'BD',
    createdAt: ts(42),
  });
  activities.push({
    id: `${handoverId}-act-ceo-approved`,
    activityType: 'CEO_APPROVED',
    description: 'CEO menyetujui handover dan mengalokasikan ke PM.',
    actorName: 'Ahmad Wijaya',
    actorRole: 'CEO',
    createdAt: ts(40),
  });
  activities.push({
    id: `${handoverId}-act-pm-assigned`,
    activityType: 'PM_ASSIGNED',
    description: `Project ditugaskan ke ${pm}.`,
    metadata: { assignedTo: pm },
    actorName: 'Ahmad Wijaya',
    actorRole: 'CEO',
    createdAt: ts(38),
  });
  activities.push({
    id: `${handoverId}-act-pm-accepted`,
    activityType: 'PM_ACCEPTED',
    description: `${pm} menerima penugasan dan memulai project.`,
    actorName: pm,
    actorRole: 'PM',
    createdAt: ts(37),
  });

  // Document uploads (satu atau dua, mengikuti jumlah documents)
  documents.slice(0, 2).forEach((doc, i) => {
    activities.push({
      id: `${handoverId}-act-doc-${doc.id}`,
      activityType: 'DOCUMENT_UPLOADED',
      description: `Dokumen "${doc.fileName}" diunggah ke Document Center.`,
      metadata: { category: doc.category, fileType: doc.fileType },
      actorName: doc.uploadedBy || pm,
      actorRole: 'PM',
      createdAt: doc.uploadedAt || ts(30 - i),
    });
  });

  // Requirement updated (jika ada yang RECEIVED)
  const receivedReqs = requirements.filter((r) => r.status === 'RECEIVED');
  if (receivedReqs.length > 0) {
    activities.push({
      id: `${handoverId}-act-req-updated`,
      activityType: 'REQUIREMENT_UPDATED',
      description: `${receivedReqs.length} item requirement ditandai Received.`,
      metadata: { count: receivedReqs.length },
      actorName: pm,
      actorRole: 'PM',
      createdAt: ts(25),
    });
  }

  // PROGRESS_UPDATED: satu per progress log (sinkron dengan tab Progress)
  progressLogs.forEach((pl) => {
    activities.push({
      id: `${handoverId}-act-progress-${pl.id}`,
      activityType: 'PROGRESS_UPDATED',
      description: `Progress diperbarui: ${pl.progressPercentage}% – ${pl.phase}. ${pl.updateNote}`,
      metadata: { progressPercentage: pl.progressPercentage, phase: pl.phase },
      actorName: pl.createdBy,
      actorRole: 'PM',
      createdAt: pl.createdAt,
    });
  });

  // STATUS_CHANGED (umum)
  activities.push({
    id: `${handoverId}-act-status`,
    activityType: 'STATUS_CHANGED',
    description: 'Status project diperbarui menjadi Active.',
    metadata: { status: 'PROJECT_ACTIVE' },
    actorName: pm,
    actorRole: 'PM',
    createdAt: ts(35),
  });

  // Newest first (sama seperti progressLogs)
  return activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export type { Project };
