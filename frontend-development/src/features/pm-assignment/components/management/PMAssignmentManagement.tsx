/**
 * COO PM Assignment Management
 * Review and assign PM to projects after BD converts to project
 */

import { useState } from 'react';
import { Card, CardContent } from '../../../../components/ui/card';
import { mockProjects, projectManagers, type Project } from '../../../../lib/mock-data';
import { authService } from '../../../../services/authService';
import { canAssignPM, getCOOManageableServices } from '../../../../utils/rolePermissions';
import { ProjectsTab } from '../tabs/ProjectsTab';

export function PMAssignmentManagement() {
  // Check if user is COO
  const currentUser = authService.getCurrentUser();
  if (!currentUser || !currentUser.role?.startsWith('COO-')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900">Access Denied</p>
          <p className="text-sm text-gray-600 mt-1">Only COO can access this page</p>
        </div>
      </div>
    );
  }

  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [activeTab, setActiveTab] = useState<string>('all');

  // Get manageable services for this COO
  const manageableServices = getCOOManageableServices(currentUser.role);

  // Filter projects that need PM assignment and COO can manage
  const allWaitingProjects = projects.filter(p => {
    const needsAssignment = (p.status === 'waiting-assignment' || p.status === 'waiting-pm') && !p.assignedPM;
    return needsAssignment && canAssignPM(currentUser.role, p.serviceName);
  });

  // Filter by active tab
  const waitingProjects = activeTab === 'all'
    ? allWaitingProjects
    : allWaitingProjects.filter(p => {
        const serviceLower = p.serviceName.toLowerCase();
        const tabLower = activeTab.toLowerCase();
        
        // Match service names more flexibly
        if (tabLower === 'tax') {
          return serviceLower.includes('tax');
        } else if (tabLower === 'audit') {
          return serviceLower.includes('audit');
        } else if (tabLower === 'legal') {
          return serviceLower.includes('legal');
        } else if (tabLower === 'transfer pricing') {
          return serviceLower.includes('transfer pricing') || serviceLower.includes('tp');
        } else if (tabLower === 'sustainability report') {
          return serviceLower.includes('sustainability') || serviceLower.includes('sr');
        }
        
        return serviceLower.includes(tabLower);
      });

  const handleUpdateProject = (id: string, updates: Partial<Project>) => {
    setProjects(projects.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  // Create tabs based on manageable services
  const tabs = [
    { id: 'all', label: 'All Projects' },
    ...manageableServices.map(service => ({
      id: service.toLowerCase(),
      label: service
    }))
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <Card>
        <div className="border-b border-gray-200">
          <nav className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 border-b-2 transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-600 hover:text-red-600 hover:border-red-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <CardContent className="px-6">
          <ProjectsTab
            projects={waitingProjects}
            availablePMs={projectManagers}
            onUpdateProject={handleUpdateProject}
          />
        </CardContent>
      </Card>
    </div>
  );
}

