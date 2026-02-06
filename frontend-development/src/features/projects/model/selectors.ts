import type { Project } from '../../../lib/mock-data';

/**
 * Format date to Indonesian locale
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Calculate days until due date
 */
export function getDaysUntilDue(dueDate: string): number {
  return Math.floor(
    (new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
}

export interface ProjectFlags {
  daysUntilDue: number;
  isOverdue: boolean;
  isAtRisk: boolean;
  isUrgent: boolean;
}

/**
 * Derive project flags for display (overdue, at risk, urgent)
 */
export function deriveProjectFlags(project: Project): ProjectFlags {
  const daysUntilDue = getDaysUntilDue(project.dueDate);
  const progress = project.progressPercentage ?? 0;
  const isOverdue = project.status === 'in-progress' && daysUntilDue < 0;
  const isAtRisk =
    project.status === 'in-progress' &&
    daysUntilDue <= 15 &&
    daysUntilDue >= 0 &&
    progress < 100;
  const isUrgent = daysUntilDue <= 7 && project.status === 'in-progress';

  return {
    daysUntilDue,
    isOverdue,
    isAtRisk,
    isUrgent,
  };
}

/**
 * Get project display status (including overdue derived from in-progress)
 */
export function getProjectDisplayStatus(project: Project): string {
  const daysUntilDue = getDaysUntilDue(project.dueDate);
  const isOverdue = project.status === 'in-progress' && daysUntilDue < 0;

  if (isOverdue) return 'overdue';
  if (project.status === 'waiting-assignment' || project.status === 'waiting-pm')
    return 'waiting-assignment';
  if (project.status === 'in-progress') return 'in-progress';
  if (project.status === 'waiting-final-payment') return 'waiting-final-payment';
  if (project.status === 'completed') return 'completed';
  return project.status;
}

/**
 * Filter projects by search term (projectName, clientName, id, assignedPM)
 */
export function filterProjectsBySearch(
  projects: Project[],
  searchTerm: string
): Project[] {
  if (!searchTerm.trim()) return projects;
  const term = searchTerm.toLowerCase();
  return projects.filter(
    (p) =>
      p.projectName.toLowerCase().includes(term) ||
      p.clientName.toLowerCase().includes(term) ||
      p.id.toLowerCase().includes(term) ||
      (p.assignedPM && p.assignedPM.toLowerCase().includes(term))
  );
}

/**
 * Filter projects by display status (all, waiting-assignment, in-progress, overdue, etc.)
 */
export function filterProjectsByStatus(
  projects: Project[],
  filterStatus: string,
  getDisplayStatus: (p: Project) => string
): Project[] {
  if (filterStatus === 'all') return projects;
  return projects.filter((p) => getDisplayStatus(p) === filterStatus);
}

/**
 * Sort projects by priority (same logic as original ProjectManagement):
 * 1. waiting-assignment (no PM) first
 * 2. overdue
 * 3. near deadline (0-15 days)
 * 4. completed last
 * 5. waiting-final-payment above completed
 * 6. by daysUntilDue ascending
 */
export function sortProjectsByPriority(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => {
    const aWaitingAssignment =
      (a.status === 'waiting-assignment' || a.status === 'waiting-pm') &&
      !a.assignedPM;
    const bWaitingAssignment =
      (b.status === 'waiting-assignment' || b.status === 'waiting-pm') &&
      !b.assignedPM;

    if (aWaitingAssignment && !bWaitingAssignment) return -1;
    if (!aWaitingAssignment && bWaitingAssignment) return 1;

    const daysA = getDaysUntilDue(a.dueDate);
    const daysB = getDaysUntilDue(b.dueDate);
    const aOverdue = a.status === 'in-progress' && daysA < 0;
    const bOverdue = b.status === 'in-progress' && daysB < 0;

    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;

    const aNearDeadline =
      a.status === 'in-progress' && daysA >= 0 && daysA <= 15;
    const bNearDeadline =
      b.status === 'in-progress' && daysB >= 0 && daysB <= 15;

    if (aNearDeadline && !bNearDeadline) return -1;
    if (!aNearDeadline && bNearDeadline) return 1;

    const aCompleted = a.status === 'completed';
    const bCompleted = b.status === 'completed';

    if (aCompleted && !bCompleted) return 1;
    if (!aCompleted && bCompleted) return -1;

    const aWaitingFinal = a.status === 'waiting-final-payment';
    const bWaitingFinal = b.status === 'waiting-final-payment';

    if (aWaitingFinal && !bWaitingFinal) return 1;
    if (!aWaitingFinal && bWaitingFinal) return -1;

    return daysA - daysB;
  });
}
