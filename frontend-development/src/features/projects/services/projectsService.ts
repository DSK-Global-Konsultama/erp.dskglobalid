import type { Project } from '../../../lib/mock-data';
import { mockProjects } from '../../../lib/mock-data';

export const projectsService = {
  getAll: (): Project[] => {
    return mockProjects;
  },

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
};

