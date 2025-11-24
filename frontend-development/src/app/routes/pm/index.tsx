import { useState } from 'react';
import { mockProjects, consultants, type Project } from '../../../lib/mock-data';
import { NewAssignmentAlert } from './components/NewAssignmentAlert';
import { PMStats } from './components/PMStats';
import { ProjectsTable } from './components/ProjectsTable';
import { Alert, AlertDescription, AlertTitle } from '../../../components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface PMDashboardProps {
  pmName: string;
}

export function PMDashboard({ pmName }: PMDashboardProps) {
  const [allProjects, setAllProjects] = useState<Project[]>(mockProjects);
  const myProjects = allProjects.filter(p => p.assignedPM === pmName);

  const handleUpdateProjects = (updatedProjects: Project[]) => {
    // Update the myProjects array by merging with allProjects
    const updatedAllProjects = allProjects.map(p => {
      const updatedProject = updatedProjects.find(up => up.id === p.id);
      return updatedProject || p;
    });
    setAllProjects(updatedAllProjects);
  };

  const waitingPayment = myProjects.filter(p => p.status === 'waiting-first-payment').length;
  const inProgress = myProjects.filter(p => p.status === 'in-progress').length;
  const waitingFinal = myProjects.filter(p => p.status === 'waiting-final-payment').length;

  // Fungsi untuk menghitung hari sampai deadline
  const getDaysUntilDue = (dueDate: string) => {
    return Math.floor(
      (new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
  };

  // Projects dengan deadline dekat tapi progress masih rendah
  const projectsAtRisk = myProjects.filter(p => {
    if (p.status !== 'in-progress') return false;
    const daysUntilDue = getDaysUntilDue(p.dueDate);
    const progress = p.progressPercentage ?? 0;
    // Deadline <= 15 hari tapi progress < 100%
    return daysUntilDue <= 15 && daysUntilDue >= 0 && progress < 100;
  });

  // Projects yang sudah overdue
  const projectsOverdue = myProjects.filter(p => {
    if (p.status !== 'in-progress') return false;
    const daysUntilDue = getDaysUntilDue(p.dueDate);
    return daysUntilDue < 0;
  });

  return (
    <div className="space-y-6">
      <NewAssignmentAlert myProjects={myProjects} />

      {/* Alert for projects overdue */}
      {projectsOverdue.length > 0 && (
        <Alert className="border-red-500 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-900">Peringatan Overdue!</AlertTitle>
          <AlertDescription className="text-red-800">
            Ada {projectsOverdue.length} project yang sudah melewati deadline. Segera selesaikan project ini!
          </AlertDescription>
        </Alert>
      )}

      {/* Alert for projects at risk */}
      {projectsAtRisk.length > 0 && (
        <Alert className="border-orange-500 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-900">Peringatan Deadline!</AlertTitle>
          <AlertDescription className="text-orange-800">
            Ada {projectsAtRisk.length} project yang sudah dekat deadline namun progress masih di bawah 100%.
            Perlu perhatian khusus untuk menyelesaikan project tepat waktu.
          </AlertDescription>
        </Alert>
      )}

      <PMStats
        totalProjects={myProjects.length}
        waitingPayment={waitingPayment}
        inProgress={inProgress}
        waitingFinal={waitingFinal}
      />

      <ProjectsTable
        myProjects={myProjects}
        consultants={consultants}
        onUpdateProjects={handleUpdateProjects}
      />
    </div>
  );
}

