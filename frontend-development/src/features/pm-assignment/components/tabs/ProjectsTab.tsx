import { useState } from 'react';
import { Eye } from 'lucide-react';
import { Card, CardContent } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { StatusChip } from '../../../leads/components/shared/StatusChip';
import { CooProjectView } from '../views/CooProjectView';
import type { Project, Handover } from '../../../../lib/mock-data';
import { mockHandovers, mockDeals, mockLeads, mockProposals } from '../../../../lib/mock-data';

interface ProjectsTabProps {
  projects: Project[];
  availablePMs: string[];
  onUpdateProject: (id: string, updates: Partial<Project>) => void;
}

export function ProjectsTab({ projects, availablePMs, onUpdateProject }: ProjectsTabProps) {
  const [viewingProject, setViewingProject] = useState<Project | undefined>(undefined);

  // If viewing a project, show the COO view
  if (viewingProject) {
    return (
      <CooProjectView
        project={viewingProject}
        availablePMs={availablePMs}
        onAssignPM={(projectId, pmName) => {
          onUpdateProject(projectId, { 
            assignedPM: pmName,
            status: 'waiting-pm'
          });
          setViewingProject(undefined);
        }}
        onBack={() => setViewingProject(undefined)}
      />
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Projects Menunggu PM Assignment</h2>
        <p className="text-gray-600 text-sm mt-1">{projects.length} project menunggu review dan assign PM</p>
      </div>
      
      {projects.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
          Tidak ada project menunggu PM assignment
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => {
            // Get handover memo related to this project
            let handover = mockHandovers.find(h => h.projectId === project.id) as Handover & { 
              serviceLine?: string; 
              projectPeriod?: string;
              projectName?: string;
            } | undefined;
            
            // If not found by projectId, try to find by leadId and service match
            if (!handover) {
              const deal = mockDeals.find(d => d.id === project.dealId);
              const lead = deal ? mockLeads.find(l => l.id === deal.leadId) : null;
              
              if (lead) {
                const handoversForLead = mockHandovers.filter(h => h.leadId === lead.id);
                handover = handoversForLead.find(h => {
                  const serviceLine = (h as any).serviceLine || '';
                  return serviceLine.toLowerCase().includes(project.serviceName.toLowerCase()) ||
                         project.serviceName.toLowerCase().includes(serviceLine.toLowerCase());
                }) as Handover & { serviceLine?: string; projectPeriod?: string; projectName?: string; } | undefined;
                
                if (!handover && handoversForLead.length > 0) {
                  handover = handoversForLead[handoversForLead.length - 1] as Handover & { serviceLine?: string; projectPeriod?: string; projectName?: string; };
                }
              }
            }
            
            // Get deal and lead information
            const deal = mockDeals.find(d => d.id === project.dealId);
            const lead = deal ? mockLeads.find(l => l.id === deal.leadId) : null;
            const proposal = lead ? mockProposals.find(p => p.leadId === lead.id) : undefined;
            
            // Use handover data if available, otherwise use project data
            const projectTitle = handover?.projectTitle || handover?.projectName || project.projectName;
            const companyName = lead?.company || project.clientName;
            const serviceLine = handover?.serviceLine || proposal?.service || project.serviceName;
            const projectPeriod = handover?.projectPeriod || '';
            
            return (
              <Card key={project.id} className="hover:border-gray-300 hover:shadow-lg transition-all">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 mb-1">
                        {projectTitle}
                      </h3>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-gray-600">{companyName}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">{serviceLine}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        {projectPeriod && (
                          <>
                            <span>Project Period: <span className="font-medium text-gray-900">{projectPeriod}</span></span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusChip status={project.status} />
                      <Button
                        onClick={() => {
                          setViewingProject(project);
                        }}
                        className="px-5 py-2 bg-white text-gray-900 border border-gray-300 text-sm rounded-lg hover:bg-gray-50 transition-colors font-medium"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Review & Assign
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-8 pt-3 border-t border-gray-100">
                    <div>
                      <div className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">Created By</div>
                      <div className="text-sm font-medium text-gray-900">{handover?.createdBy || '-'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">Created</div>
                      <div className="text-sm font-medium text-gray-900">
                        {handover?.createdAt 
                          ? new Date(handover.createdAt).toLocaleDateString('id-ID', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          : '-'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

