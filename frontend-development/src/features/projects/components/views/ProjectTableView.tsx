import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/table';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { CheckCircle, AlertCircle, FileText, Eye } from 'lucide-react';
import { formatDate, getDaysUntilDue, getStatusBadge } from '../../utils/projectHelpers';
import { ProjectPagination } from '../ProjectPagination';
import { canAssignPM } from '../../../../utils/rolePermissions';
import { mockHandovers, mockDeals, mockLeads } from '../../../../lib/mock-data';
import type { Project, Handover } from '../../../../lib/mock-data';
import type { UserRole } from '../../../../services/authService';
import { toast } from 'sonner';

interface ProjectTableViewProps {
  projects: Project[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
  setItemsPerPage: (items: number) => void;
  totalPages: number;
  totalItems: number;
  paginatedItemsCount: number;
  userRole?: UserRole;
  isCOOUser: boolean;
  isPMUser: boolean;
  onAssignPM: (project: Project) => void;
  onCompleteProject: (projectId: string) => void;
}

export function ProjectTableView({
  projects,
  currentPage,
  setCurrentPage,
  itemsPerPage,
  setItemsPerPage,
  totalPages,
  totalItems,
  paginatedItemsCount,
  userRole,
  isCOOUser,
  isPMUser,
  onAssignPM,
  onCompleteProject,
}: ProjectTableViewProps) {
  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project Name</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Work Start</TableHead>
              <TableHead>Payment Gate</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Internal PIC (BD)</TableHead>
              <TableHead>PM</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <p className="text-sm font-medium">Belum ada data project</p>
                    <p className="text-xs mt-1">Tidak ada project di sistem</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              projects.map(project => {
                const daysUntilDue = getDaysUntilDue(project.dueDate);
                const isUrgent = daysUntilDue <= 7 && project.status === 'in-progress';
                const isOverdue = daysUntilDue < 0 && project.status === 'in-progress';
                const progress = project.progressPercentage ?? 0;
                const isAtRisk = project.status === 'in-progress' && 
                                 daysUntilDue <= 15 && 
                                 daysUntilDue >= 0 && 
                                 progress < 100;
                const canAssign = canAssignPM(userRole, project.serviceName);

                // Get handover memo related to this project
                let handover = mockHandovers.find(h => h.projectId === project.id) as Handover & { 
                  serviceLine?: string; 
                  projectPeriod?: string;
                  projectName?: string;
                  internalPicBd?: string;
                  clientPic?: string;
                  priority?: 'Critical' | 'High' | 'Medium' | 'Low';
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
                    }) as Handover & { serviceLine?: string; projectPeriod?: string; projectName?: string; internalPicBd?: string; clientPic?: string; priority?: 'Critical' | 'High' | 'Medium' | 'Low'; } | undefined;
                    
                    if (!handover && handoversForLead.length > 0) {
                      handover = handoversForLead[handoversForLead.length - 1] as Handover & { serviceLine?: string; projectPeriod?: string; projectName?: string; internalPicBd?: string; clientPic?: string; priority?: 'Critical' | 'High' | 'Medium' | 'Low'; };
                    }
                  }
                }
                
                // Get deal and lead information
                const deal = mockDeals.find(d => d.id === project.dealId);
                const lead = deal ? mockLeads.find(l => l.id === deal.leadId) : null;
                
                // Use handover data if available, otherwise use project data
                const projectTitle = handover?.projectTitle || handover?.projectName || project.projectName;
                const internalPicBd = (handover as any)?.internalPicBd || lead?.claimedBy || '-';
                const clientPic = (handover as any)?.clientPic || lead?.clientName || '-';
                const workStartAllowed = project.status === 'in-progress' || project.status === 'waiting-final-payment';
                const paymentGateStatus = project.status === 'waiting-first-payment' ? 'Waiting First Payment' : 
                                         project.status === 'waiting-final-payment' ? 'Waiting Final Payment' :
                                         project.status === 'in-progress' ? 'Payment Received' : 'Not Started';

                return (
                  <TableRow 
                    key={project.id} 
                    className={
                      isOverdue 
                        ? 'bg-red-50' 
                        : isAtRisk 
                        ? 'bg-orange-50' 
                        : ''
                    }
                  >
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{projectTitle}</p>
                        <p className="text-xs text-gray-500 mt-0.5">ID: {project.id}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{lead?.company || project.clientName}</p>
                        <p className="text-xs text-gray-500 mt-0.5">PIC: {clientPic}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(project.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {workStartAllowed ? (
                          <>
                            <CheckCircle className="w-3 h-3 text-green-600" />
                            <span className="text-xs text-green-600">Allowed</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3 h-3 text-red-600" />
                            <span className="text-xs text-red-600">Waiting</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-gray-600">{paymentGateStatus}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 min-w-[100px]">
                        <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-900 w-8">{progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs">{internalPicBd}</span>
                    </TableCell>
                    <TableCell>
                      {project.assignedPM ? (
                        <span className="text-sm">{project.assignedPM}</span>
                      ) : (
                        <Badge variant="outline" className="bg-orange-50 text-orange-700">
                          Belum Assign
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs">
                        <p>{formatDate(project.dueDate)}</p>
                        {!project.status.includes('completed') && (
                          <p className={`mt-0.5 ${
                            isOverdue ? 'text-red-600 font-medium' : 
                            isUrgent ? 'text-orange-600' : 
                            'text-gray-500'
                          }`}>
                            {isOverdue 
                              ? `Overdue ${Math.abs(daysUntilDue)}d`
                              : `${daysUntilDue}d left`}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        {/* COO: Review and Assign PM jika belum assign, See Details jika sudah assign */}
                        {isCOOUser && (project.status === 'waiting-assignment' || project.status === 'waiting-pm') && !project.assignedPM && canAssign && (
                          <Button
                            size="sm"
                            onClick={() => onAssignPM(project)}
                          >
                            <FileText className="w-3 h-3 mr-1" />
                            Review and Assign PM
                          </Button>
                        )}
                        {isCOOUser && project.assignedPM && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              // TODO: Implement see details functionality
                              toast.info('See details functionality coming soon');
                            }}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            See Details
                          </Button>
                        )}

                        {/* PM: Start project when payment received */}
                        {isPMUser && project.status === 'waiting-first-payment' && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            Tunggu Payment
                          </Badge>
                        )}

                        {/* PM: Complete project - hanya muncul jika progress 100% */}
                        {isPMUser && project.status === 'in-progress' && project.progressPercentage === 100 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onCompleteProject(project.id)}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Selesai
                          </Button>
                        )}
                        
                        {/* PM: Info jika progress belum 100% - tombol Selesai tidak muncul */}
                        {isPMUser && project.status === 'in-progress' && project.progressPercentage !== 100 && (
                          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                            Progress: {project.progressPercentage ?? 0}%
                          </Badge>
                        )}

                        {/* PM: Waiting final payment */}
                        {isPMUser && project.status === 'waiting-final-payment' && (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            Menunggu Final Payment
                          </Badge>
                        )}

                        {/* PM: Completed */}
                        {isPMUser && project.status === 'completed' && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Selesai
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      <ProjectPagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        totalItems={totalItems}
        paginatedItemsCount={paginatedItemsCount}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />
    </div>
  );
}

