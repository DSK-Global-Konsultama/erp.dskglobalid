import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import {
  CheckCircle,
  AlertCircle,
  FileText,
  Eye,
  Briefcase,
  TrendingUp,
} from 'lucide-react';
import { formatDate, getDaysUntilDue } from '../../model/selectors';
import { ProjectStatusBadge } from '../shared/ProjectStatusBadge';
import { ProjectsPagination } from './ProjectsPagination';
import { canAssignPM } from '../guards/canProject';
import { mockHandovers, mockDeals, mockLeads } from '../../../../lib/mock-data';
import type { Project, Handover } from '../../../../lib/mock-data';
import type { UserRole } from '../../../../services/authService';
import { toast } from 'sonner';

interface ProjectsCardViewProps {
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

type HandoverExtended = Handover & {
  serviceLine?: string;
  projectPeriod?: string;
  projectName?: string;
  internalPicBd?: string;
  clientPic?: string;
  priority?: 'Critical' | 'High' | 'Medium' | 'Low';
};

export function ProjectsCardView({
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
}: ProjectsCardViewProps) {
  return (
    <div className="space-y-4">
      {projects.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No projects found</p>
        </div>
      ) : (
        projects.map((project) => {
          const daysUntilDue = getDaysUntilDue(project.dueDate);
          const isUrgent =
            daysUntilDue <= 7 && project.status === 'in-progress';
          const isOverdue =
            daysUntilDue < 0 && project.status === 'in-progress';
          const progress = project.progressPercentage ?? 0;
          const isAtRisk =
            project.status === 'in-progress' &&
            daysUntilDue <= 15 &&
            daysUntilDue >= 0 &&
            progress < 100;
          const canAssign = canAssignPM(userRole, project.serviceName);

          let handover = mockHandovers.find(
            (h) => h.projectId === project.id
          ) as HandoverExtended | undefined;

          if (!handover) {
            const deal = mockDeals.find((d) => d.id === project.dealId);
            const lead = deal
              ? mockLeads.find((l) => l.id === deal.leadId)
              : null;

            if (lead) {
              const handoversForLead = mockHandovers.filter(
                (h) => h.leadId === lead.id
              );
              handover = handoversForLead.find((h) => {
                const serviceLine = (h as HandoverExtended).serviceLine || '';
                return (
                  serviceLine
                    .toLowerCase()
                    .includes(project.serviceName.toLowerCase()) ||
                  project.serviceName
                    .toLowerCase()
                    .includes(serviceLine.toLowerCase())
                );
              }) as HandoverExtended | undefined;

              if (!handover && handoversForLead.length > 0) {
                handover = handoversForLead[
                  handoversForLead.length - 1
                ] as HandoverExtended;
              }
            }
          }

          const deal = mockDeals.find((d) => d.id === project.dealId);
          const lead = deal
            ? mockLeads.find((l) => l.id === deal.leadId)
            : null;

          const projectTitle =
            handover?.projectTitle ||
            handover?.projectName ||
            project.projectName;
          const internalPicBd =
            (handover as HandoverExtended)?.internalPicBd ||
            lead?.claimedBy ||
            '-';
          const workStartAllowed =
            project.status === 'in-progress' ||
            project.status === 'waiting-final-payment';
          const paymentGateStatus =
            project.status === 'waiting-first-payment'
              ? 'Waiting First Payment'
              : project.status === 'waiting-final-payment'
              ? 'Waiting Final Payment'
              : project.status === 'in-progress'
              ? 'Payment Received'
              : 'Not Started';

          return (
            <div
              key={project.id}
              className={`bg-white rounded-lg border border-gray-200 p-6 hover:border-gray-300 hover:shadow-lg transition-all ${
                isOverdue
                  ? 'bg-red-50'
                  : isAtRisk
                  ? 'border-orange-200 bg-orange-50'
                  : ''
              }`}
            >
              <div
                className={`mb-4 pb-4 border-b border-gray-200 ${
                  isOverdue ? 'bg-red-50 -mx-6 -mt-6 px-6 pt-6 rounded-t-lg' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {projectTitle}
                      </h3>
                      <ProjectStatusBadge status={project.status} />
                      {isOverdue && (
                        <Badge variant="destructive">Overdue</Badge>
                      )}
                      {isUrgent && !isOverdue && (
                        <Badge variant="destructive">Urgent</Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mb-1">
                      {lead?.company || project.clientName}
                    </div>
                    <div className="text-xs text-gray-500">
                      ID: {project.id}
                      {(handover as HandoverExtended)?.projectPeriod &&
                        ` • Period: ${(handover as HandoverExtended).projectPeriod}`}
                    </div>
                  </div>

                  {(handover as HandoverExtended)?.priority && (
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`px-2 py-1 rounded border text-xs font-medium ${
                          (handover as HandoverExtended).priority === 'Critical'
                            ? 'bg-red-100 text-red-800 border-red-300'
                            : (handover as HandoverExtended).priority === 'High'
                            ? 'bg-orange-100 text-orange-800 border-orange-300'
                            : (handover as HandoverExtended).priority ===
                              'Medium'
                            ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                            : 'bg-gray-100 text-gray-800 border-gray-300'
                        }`}
                      >
                        {(handover as HandoverExtended).priority}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {workStartAllowed ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-600 font-medium">
                          Work Start Allowed
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <span className="text-sm text-red-600 font-medium">
                          Waiting Payment
                        </span>
                      </>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    Payment Gate:{' '}
                    <span className="font-medium">{paymentGateStatus}</span>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-900">
                      Progress: {progress}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                <div>
                  <div className="text-gray-500 mb-1">PM</div>
                  <div className="text-gray-900">
                    {project.assignedPM || (
                      <span className="text-gray-400">Belum Assign</span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Internal PIC (BD)</div>
                  <div className="text-gray-900">{internalPicBd}</div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Due Date</div>
                  <div className="text-gray-900">
                    {formatDate(project.dueDate)}
                    {!project.status.includes('completed') && (
                      <div
                        className={`text-xs mt-0.5 ${
                          isOverdue
                            ? 'text-red-600 font-medium'
                            : isUrgent
                            ? 'text-orange-600'
                            : 'text-gray-500'
                        }`}
                      >
                        {isOverdue
                          ? `Overdue ${Math.abs(daysUntilDue)}d`
                          : `${daysUntilDue}d left`}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-200">
                {isCOOUser &&
                  (project.status === 'waiting-assignment' ||
                    project.status === 'waiting-pm') &&
                  !project.assignedPM &&
                  canAssign && (
                    <Button
                      size="sm"
                      onClick={() => onAssignPM(project)}
                      className="flex items-center gap-2 w-full"
                    >
                      <FileText className="w-4 h-4" />
                      Review and Assign PM
                    </Button>
                  )}
                {isCOOUser && project.assignedPM && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      toast.info('See details functionality coming soon');
                    }}
                    className="flex items-center gap-2 w-full"
                  >
                    <Eye className="w-4 h-4" />
                    See Details
                  </Button>
                )}
                {isPMUser &&
                  project.status === 'in-progress' &&
                  project.progressPercentage === 100 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onCompleteProject(project.id)}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Selesai
                    </Button>
                  )}
              </div>
            </div>
          );
        })
      )}

      <ProjectsPagination
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
