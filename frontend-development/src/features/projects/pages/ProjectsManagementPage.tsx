import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Table as TableIcon, LayoutGrid } from 'lucide-react';
import { toast } from 'sonner';
import type { UserRole } from '../../../services/authService';
import { projectApi } from '../api/projectApi';
import {
  getProjectDisplayStatus,
  getDaysUntilDue,
  filterProjectsBySearch,
  filterProjectsByStatus,
  sortProjectsByPriority,
} from '../model/selectors';
import { useProjectPagination } from '../hooks/useProjectPagination';
import {
  canAssignPM,
  getCOOManageableServicesForProject,
  isCOOUser,
  isPMUser,
} from '../ui/guards/canProject';
import { ProjectsTableView } from '../ui/management/ProjectsTableView';
import { ProjectsCardView } from '../ui/management/ProjectsCardView';
import { ProjectAlerts } from '../ui/management/ProjectAlerts';
import { ProjectStatsCards } from '../ui/management/ProjectStatsCards';
import { AssignPMDialog } from '../ui/management/AssignPMDialog';
import { ProjectsFilters } from '../ui/management/ProjectsFilters';
import { ProjectDetailPage } from './ProjectDetailPage';
import type { Project } from '../api/projectApi';

interface ProjectsManagementPageProps {
  userRole?: UserRole;
  /** For PM: filter to projects assigned to this user. Ignored for COO/CEO. */
  currentUserName?: string;
  /** When showing project detail, call with { onBack }; when showing list, call with null. Used for global header. */
  onProjectDetailChange?: (detail: { onBack: () => void } | null) => void;
}

export function ProjectsManagementPage({ userRole, currentUserName, onProjectDetailChange }: ProjectsManagementPageProps) {
  const [projects, setProjects] = useState<Project[]>(() => projectApi.getAll());
  const [isAssignPMOpen, setIsAssignPMOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedPM, setSelectedPM] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedHandoverId, setSelectedHandoverId] = useState<string | null>(null);

  const handleSeeDetails = (project: Project) => {
    const handoverId = projectApi.getHandoverIdByProjectId(project.id);
    if (!handoverId) {
      toast.info('Detail handover tidak tersedia untuk project ini.');
      return;
    }
    setSelectedHandoverId(handoverId);
  };

  const manageableServices = getCOOManageableServicesForProject(userRole);
  const isCOO = isCOOUser(userRole);
  const isPM = isPMUser(userRole);

  const baseProjects =
    isCOO
      ? projects.filter(
          (p) => canAssignPM(userRole, p.serviceName) || p.assignedPM
        )
      : isPM && currentUserName
        ? projects.filter((p) => p.assignedPM === currentUserName)
        : projects;

  const searchFiltered = filterProjectsBySearch(baseProjects, searchTerm);
  const filteredProjects = filterProjectsByStatus(
    searchFiltered,
    filterStatus,
    getProjectDisplayStatus
  );
  const sortedProjects = sortProjectsByPriority(filteredProjects);

  // Stats & alerts based on the list the user sees (baseProjects)
  const projectsWaitingPM = baseProjects.filter(
    (p) => p.status === 'waiting-assignment' || p.status === 'waiting-pm'
  );
  const projectsWaitingPayment = baseProjects.filter(
    (p) => p.status === 'waiting-first-payment'
  );
  const projectsInProgress = baseProjects.filter(
    (p) => p.status === 'in-progress'
  );
  const projectsWaitingFinal = baseProjects.filter(
    (p) => p.status === 'waiting-final-payment'
  );
  const projectsAtRisk = baseProjects.filter((p) => {
    if (p.status !== 'in-progress') return false;
    const daysUntilDue = getDaysUntilDue(p.dueDate);
    const progress = p.progressPercentage ?? 0;
    return daysUntilDue <= 15 && daysUntilDue >= 0 && progress < 100;
  });
  const projectsOverdue = baseProjects.filter((p) => {
    if (p.status !== 'in-progress') return false;
    return getDaysUntilDue(p.dueDate) < 0;
  });

  const handleAssignPM = () => {
    if (!selectedProject || !selectedPM) return;

    if (!canAssignPM(userRole, selectedProject.serviceName)) {
      toast.error(
        `Anda tidak memiliki wewenang untuk assign PM pada layanan ini. COO ${userRole} hanya bisa assign PM untuk: ${manageableServices.join(', ')}`
      );
      return;
    }

    const updatedProjects = projects.map((p) => {
      if (p.id === selectedProject.id) {
        return {
          ...p,
          assignedPM: selectedPM,
          status: 'waiting-first-payment' as const,
          pmNotified: true,
        };
      }
      return p;
    });

    setProjects(updatedProjects);
    setIsAssignPMOpen(false);
    setSelectedProject(null);
    setSelectedPM('');
    toast.success(
      `PM ${selectedPM} berhasil di-assign! Project menunggu pembayaran 50%.`
    );
  };

  const completeProject = (id: string) => {
    const project = projects.find((p) => p.id === id);
    if (!project) return;

    if (project.progressPercentage !== 100) {
      toast.error(
        'Project hanya bisa diselesaikan jika progress sudah mencapai 100%'
      );
      return;
    }

    const updatedProjects = projects.map((p) => {
      if (p.id === id) {
        return {
          ...p,
          status: 'waiting-final-payment' as const,
          completionDate: new Date().toISOString().split('T')[0],
          progressPercentage: 100,
        };
      }
      return p;
    });

    setProjects(updatedProjects);
    toast.success(
      'Project selesai! Status berubah ke "Waiting Final Payment". Admin akan menagih pembayaran terakhir.'
    );
  };

  const getAlertTitle = () => (isCOO ? 'Perhatian COO!' : 'Ringkasan Project');
  const getAlertDescription = () => {
    if (!isCOO) return '';
    const services =
      manageableServices && manageableServices.length > 0
        ? manageableServices.join(', ')
        : 'tidak ada layanan yang dapat dikelola';
    return `Ada ${projectsWaitingPM.length} project yang belum di-assign PM. COO ${userRole} hanya bisa assign PM untuk layanan: ${services}.`;
  };
  const getCardDescription = () => {
    if (!isCOO) return undefined;
    const services =
      manageableServices && manageableServices.length > 0
        ? manageableServices.join(', ')
        : 'tidak ada layanan yang dapat dikelola';
    return `COO ${userRole} hanya bisa assign PM untuk layanan: ${services}`;
  };
  const getDialogDescription = () =>
    `COO ${userRole} memilih PM untuk project: ${selectedProject?.serviceName}`;

  const {
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    paginatedItems: paginatedProjects,
    totalItems: totalProjects,
    paginatedItemsCount: paginatedCount,
  } = useProjectPagination({ items: sortedProjects, initialItemsPerPage: 10 });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, setCurrentPage]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [filteredProjects.length, currentPage, itemsPerPage, totalPages, setCurrentPage]);

  useEffect(() => {
    onProjectDetailChange?.(selectedHandoverId ? { onBack: () => setSelectedHandoverId(null) } : null);
  }, [selectedHandoverId, onProjectDetailChange]);

  if (selectedHandoverId) {
    return (
      <ProjectDetailPage
        handoverId={selectedHandoverId}
        userRole={userRole ?? ''}
        onBack={() => setSelectedHandoverId(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <ProjectAlerts
        projectsWaitingPM={projectsWaitingPM.length}
        projectsWaitingPayment={projectsWaitingPayment.length}
        projectsOverdue={projectsOverdue.length}
        projectsAtRisk={projectsAtRisk.length}
        alertTitle={getAlertTitle()}
        alertDescription={getAlertDescription()}
      />

      <ProjectStatsCards
        projectsWaitingPM={projectsWaitingPM.length}
        projectsWaitingPayment={projectsWaitingPayment.length}
        projectsInProgress={projectsInProgress.length}
        projectsWaitingFinal={projectsWaitingFinal.length}
      />

      <ProjectsFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterStatus={filterStatus}
        onFilterStatusChange={setFilterStatus}
        onReset={() => {
          setSearchTerm('');
          setFilterStatus('all');
        }}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Daftar Projects ({filteredProjects.length})</CardTitle>
              {isCOO && (
                <CardDescription>{getCardDescription()}</CardDescription>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'table' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="flex items-center gap-2"
              >
                <TableIcon className="w-4 h-4" />
                Table
              </Button>
              <Button
                variant={viewMode === 'card' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('card')}
                className="flex items-center gap-2"
              >
                <LayoutGrid className="w-4 h-4" />
                Card
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-6">
          {viewMode === 'table' ? (
            <ProjectsTableView
              projects={paginatedProjects}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              itemsPerPage={itemsPerPage}
              setItemsPerPage={setItemsPerPage}
              totalPages={totalPages}
              totalItems={totalProjects}
              paginatedItemsCount={paginatedCount}
              userRole={userRole}
              isCOOUser={isCOO}
              isPMUser={isPM}
              onAssignPM={(project) => {
                setSelectedProject(project);
                setIsAssignPMOpen(true);
              }}
              onCompleteProject={completeProject}
              onSeeDetails={handleSeeDetails}
            />
          ) : (
            <ProjectsCardView
              projects={paginatedProjects}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              itemsPerPage={itemsPerPage}
              setItemsPerPage={setItemsPerPage}
              totalPages={totalPages}
              totalItems={totalProjects}
              paginatedItemsCount={paginatedCount}
              userRole={userRole}
              isCOOUser={isCOO}
              isPMUser={isPM}
              onAssignPM={(project) => {
                setSelectedProject(project);
                setIsAssignPMOpen(true);
              }}
              onCompleteProject={completeProject}
              onSeeDetails={handleSeeDetails}
            />
          )}
        </CardContent>
      </Card>

      <AssignPMDialog
        open={isAssignPMOpen}
        onOpenChange={setIsAssignPMOpen}
        selectedPM={selectedPM}
        onPMChange={setSelectedPM}
        onAssign={handleAssignPM}
        dialogDescription={getDialogDescription()}
      />
    </div>
  );
}
