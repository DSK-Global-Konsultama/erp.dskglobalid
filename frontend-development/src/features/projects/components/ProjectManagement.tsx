import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { mockProjects, type Project } from '../../../lib/mock-data';
import { Table as TableIcon, LayoutGrid } from 'lucide-react';
import { toast } from 'sonner';
import type { UserRole } from '../../../services/authService';
import { canAssignPM, getCOOManageableServices, isCOO, isPM } from '../../../utils/rolePermissions';
import { getDaysUntilDue } from '../utils/projectHelpers';
import { useProjectPagination } from '../hooks/useProjectPagination';
import { ProjectTableView } from './views/ProjectTableView';
import { ProjectCardView } from './views/ProjectCardView';
import { ProjectAlerts } from './ProjectAlerts';
import { ProjectStatsCards } from './ProjectStatsCards';
import { AssignPMDialog } from './AssignPMDialog';
import { ProjectSearchFilter } from './ProjectSearchFilter';

interface ProjectManagementProps {
  userRole?: UserRole;
}

export function ProjectManagement({ userRole }: ProjectManagementProps) {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [isAssignPMOpen, setIsAssignPMOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedPM, setSelectedPM] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const manageableServices = getCOOManageableServices(userRole);
  const isCOOUser = isCOO(userRole);
  const isPMUser = isPM(userRole);

  // Helper function to get project display status (including overdue)
  const getProjectDisplayStatus = (project: Project): string => {
    const daysUntilDue = getDaysUntilDue(project.dueDate);
    const isOverdue = project.status === 'in-progress' && daysUntilDue < 0;
    
    if (isOverdue) {
      return 'overdue';
    }
    
    if (project.status === 'waiting-assignment' || project.status === 'waiting-pm') {
      return 'waiting-assignment';
    }
    
    if (project.status === 'in-progress') {
      return 'in-progress';
    }
    
    if (project.status === 'waiting-final-payment') {
      return 'waiting-final-payment';
    }
    
    if (project.status === 'completed') {
      return 'completed';
    }
    
    return project.status;
  };

  // Filter projects for COO (only show manageable projects)
  const baseProjects = isCOOUser 
    ? projects.filter(p => canAssignPM(userRole, p.serviceName) || p.assignedPM)
    : projects;

  // Apply search and status filter
  const filteredProjects = baseProjects.filter(project => {
    // Search filter
    const matchesSearch = 
      project.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.assignedPM && project.assignedPM.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Status filter
    const displayStatus = getProjectDisplayStatus(project);
    const matchesStatus = filterStatus === 'all' || displayStatus === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleAssignPM = () => {
    if (!selectedProject || !selectedPM) return;

    // Check permission
    if (!canAssignPM(userRole, selectedProject.serviceName)) {
      toast.error(`Anda tidak memiliki wewenang untuk assign PM pada layanan ini. COO ${userRole} hanya bisa assign PM untuk: ${manageableServices.join(', ')}`);
      return;
    }

    const updatedProjects = projects.map(p => {
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
    toast.success(`PM ${selectedPM} berhasil di-assign! Project menunggu pembayaran 50%.`);
  };

  const completeProject = (id: string) => {
    const project = projects.find(p => p.id === id);
    if (!project) return;
    
    // Hanya bisa complete jika progress sudah 100%
    if (project.progressPercentage !== 100) {
      toast.error('Project hanya bisa diselesaikan jika progress sudah mencapai 100%');
      return;
    }
    
    const updatedProjects = projects.map(p => {
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
    toast.success('Project selesai! Status berubah ke "Waiting Final Payment". Admin akan menagih pembayaran terakhir.');
  };


  const projectsWaitingPM = projects.filter(p => p.status === 'waiting-assignment' || p.status === 'waiting-pm');
  const projectsWaitingPayment = projects.filter(p => p.status === 'waiting-first-payment');
  const projectsInProgress = projects.filter(p => p.status === 'in-progress');
  const projectsWaitingFinal = projects.filter(p => p.status === 'waiting-final-payment');
  
  // Projects dengan deadline dekat tapi progress masih rendah
  const projectsAtRisk = projects.filter(p => {
    if (p.status !== 'in-progress') return false;
    const daysUntilDue = getDaysUntilDue(p.dueDate);
    const progress = p.progressPercentage ?? 0;
    // Deadline <= 15 hari tapi progress < 100%
    return daysUntilDue <= 15 && daysUntilDue >= 0 && progress < 100;
  });

  // Projects yang sudah overdue
  const projectsOverdue = projects.filter(p => {
    if (p.status !== 'in-progress') return false;
    const daysUntilDue = getDaysUntilDue(p.dueDate);
    return daysUntilDue < 0;
  });

  const getAlertTitle = () => {
    return 'Perhatian COO!';
  };

  const getAlertDescription = () => {
    const services = manageableServices && manageableServices.length > 0 
      ? manageableServices.join(', ') 
      : 'tidak ada layanan yang dapat dikelola';
    return `Ada ${projectsWaitingPM.length} project yang belum di-assign PM. COO ${userRole} hanya bisa assign PM untuk layanan: ${services}.`;
  };

  const getCardDescription = () => {
    const services = manageableServices && manageableServices.length > 0 
      ? manageableServices.join(', ') 
      : 'tidak ada layanan yang dapat dikelola';
    return `COO ${userRole} hanya bisa assign PM untuk layanan: ${services}`;
  };

  const getDialogDescription = () => {
    return `COO ${userRole} memilih PM untuk project: ${selectedProject?.serviceName}`;
  };

  // Sort projects with priority logic
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    // Priority 1: Project yang belum di-assign PM (paling atas)
    const aWaitingAssignment = (a.status === 'waiting-assignment' || a.status === 'waiting-pm') && !a.assignedPM;
    const bWaitingAssignment = (b.status === 'waiting-assignment' || b.status === 'waiting-pm') && !b.assignedPM;
    
    if (aWaitingAssignment && !bWaitingAssignment) return -1;
    if (!aWaitingAssignment && bWaitingAssignment) return 1;
    
    // Priority 2: Project yang overdue (setelah waiting-assignment)
    const daysA = getDaysUntilDue(a.dueDate);
    const daysB = getDaysUntilDue(b.dueDate);
    const aOverdue = a.status === 'in-progress' && daysA < 0;
    const bOverdue = b.status === 'in-progress' && daysB < 0;
    
    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;
    
    // Priority 3: Project yang dekat deadline (0-15 hari) - setelah overdue
    const aNearDeadline = a.status === 'in-progress' && daysA >= 0 && daysA <= 15;
    const bNearDeadline = b.status === 'in-progress' && daysB >= 0 && daysB <= 15;
    
    if (aNearDeadline && !bNearDeadline) return -1;
    if (!aNearDeadline && bNearDeadline) return 1;
    
    // Priority 4: Completed (paling bawah)
    const aCompleted = a.status === 'completed';
    const bCompleted = b.status === 'completed';
    
    if (aCompleted && !bCompleted) return 1; // aCompleted ke paling bawah
    if (!aCompleted && bCompleted) return -1; // bCompleted ke paling bawah
    
    // Priority 5: Waiting final payment (di atas completed)
    const aWaitingFinal = a.status === 'waiting-final-payment';
    const bWaitingFinal = b.status === 'waiting-final-payment';
    
    if (aWaitingFinal && !bWaitingFinal) return 1; // aWaitingFinal ke bawah (tapi di atas completed)
    if (!aWaitingFinal && bWaitingFinal) return -1; // bWaitingFinal ke bawah (tapi di atas completed)
    
    // Priority 6: Urutkan dari deadline terdekat hingga terlama
    return daysA - daysB;
  });

  // Use pagination hook
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

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, setCurrentPage]);

  // Ensure currentPage doesn't exceed totalPages when filters change
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

      <ProjectSearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterStatus={filterStatus}
        onFilterStatusChange={setFilterStatus}
        onReset={() => {
          setSearchTerm('');
          setFilterStatus('all');
        }}
      />

      {/* Projects Table/Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Daftar Projects ({filteredProjects.length})</CardTitle>
              {isCOOUser && (
                <CardDescription>
                  {getCardDescription()}
                </CardDescription>
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
            <ProjectTableView
              projects={paginatedProjects}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              itemsPerPage={itemsPerPage}
              setItemsPerPage={setItemsPerPage}
              totalPages={totalPages}
              totalItems={totalProjects}
              paginatedItemsCount={paginatedCount}
              userRole={userRole}
              isCOOUser={isCOOUser}
              isPMUser={isPMUser}
              onAssignPM={(project) => {
                setSelectedProject(project);
                setIsAssignPMOpen(true);
              }}
              onCompleteProject={completeProject}
            />
          ) : (
            <ProjectCardView
              projects={paginatedProjects}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              itemsPerPage={itemsPerPage}
              setItemsPerPage={setItemsPerPage}
              totalPages={totalPages}
              totalItems={totalProjects}
              paginatedItemsCount={paginatedCount}
              userRole={userRole}
              isCOOUser={isCOOUser}
              isPMUser={isPMUser}
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
