import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { mockProjects } from '../../../../lib/mock-data';

export function ProjectsSection() {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const projectsNearDueDate = [...mockProjects]
    .filter(p => p.status === 'in-progress')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Projects Due Date</CardTitle>
        <CardDescription>Project yang sedang berjalan</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {projectsNearDueDate.length > 0 ? (
            projectsNearDueDate.map(project => {
              const daysUntilDue = Math.floor(
                (new Date(project.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
              );
              const isUrgent = daysUntilDue <= 7;

              return (
                <div key={project.id} className="flex items-start justify-between border-b pb-3 last:border-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{project.projectName}</p>
                    <p className="text-xs text-gray-500">{project.clientName}</p>
                    <p className="text-xs text-gray-400 mt-1">PM: {project.assignedPM || 'Belum assign'}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={isUrgent ? 'destructive' : 'secondary'}>
                      {daysUntilDue > 0 ? `${daysUntilDue} hari lagi` : 'Overdue'}
                    </Badge>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(project.dueDate)}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-gray-500">Tidak ada project yang sedang berjalan</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

