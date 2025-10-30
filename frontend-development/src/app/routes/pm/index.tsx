import { useState } from 'react';
import { mockProjects, consultants, type Project } from '../../../lib/mock-data';
import { NewAssignmentAlert } from './components/NewAssignmentAlert';
import { PMStats } from './components/PMStats';
import { ProjectsTable } from './components/ProjectsTable';

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">PM Dashboard - {pmName}</h2>
        <p className="text-gray-500">Projects yang di-assign ke saya</p>
      </div>

      <NewAssignmentAlert myProjects={myProjects} />

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

