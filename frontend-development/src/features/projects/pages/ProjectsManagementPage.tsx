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
import type { Project } from '../../../lib/mock-data';

interface ProjectsManagementPageProps {
  userRole?: UserRole;
}

export function ProjectsManagementPage({ userRole }: ProjectsManagementPageProps) {
  const [projects, setProjects] = useState<Project[]>(() => projectApi.getAll());
  const [isAssignPMOpen, setIsAssignPMOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedPM, setSelectedPM] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const manageableServices = getCOOManageableServicesForProject(userRole);
  const isCOO = isCOOUser(userRole);
  const isPM = isPMUser(userRole);

  const baseProjects =
    isCOO
      ? projects.filter(
          (p) => canAssignPM(userRole, p.serviceName) || p.assignedPM
        )
      : projects;

  const searchFiltered = filterProjectsBySearch(baseProjects, searchTerm);
  const filteredProjects = filterProjectsByStatus(
    searchFiltered,
    filterStatus,
    getProjectDisplayStatus
  );
  const sortedProjects = sortProjectsByPriority(filteredProjects);

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

  const projectsWaitingPM = projects.filter(
    (p) => p.status === 'waiting-assignment' || p.status === 'waiting-pm'
  );
  const projectsWaitingPayment = projects.filter(
    (p) => p.status === 'waiting-first-payment'
  );
  const projectsInProgress = projects.filter((p) => p.status === 'in-progress');
  const projectsWaitingFinal = projects.filter(
    (p) => p.status === 'waiting-final-payment'
  );

  const projectsAtRisk = projects.filter((p) => {
    if (p.status !== 'in-progress') return false;
    const daysUntilDue = getDaysUntilDue(p.dueDate);
    const progress = p.progressPercentage ?? 0;
    return daysUntilDue <= 15 && daysUntilDue >= 0 && progress < 100;
  });

  const projectsOverdue = projects.filter((p) => {
    if (p.status !== 'in-progress') return false;
    return getDaysUntilDue(p.dueDate) < 0;
  });

  const getAlertTitle = () => 'Perhatian COO!';
  const getAlertDescription = () => {
    const services =
      manageableServices && manageableServices.length > 0
        ? manageableServices.join(', ')
        : 'tidak ada layanan yang dapat dikelola';
    return `Ada ${projectsWaitingPM.length} project yang belum di-assign PM. COO ${userRole} hanya bisa assign PM untuk layanan: ${services}.`;
  };
  const getCardDescription = () => {
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
