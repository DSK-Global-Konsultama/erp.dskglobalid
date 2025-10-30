import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { mockProjects, projectManagers } from '../../../lib/mock-data';
import { toast } from 'sonner';
import { FolderKanban, UserCheck, Calendar } from 'lucide-react';

export function ProjectManagement() {
  const [projects, setProjects] = useState(mockProjects);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'waiting-pm': 'outline',
      'waiting-first-payment': 'secondary',
      'in-progress': 'default',
      'waiting-final-payment': 'secondary',
      completed: 'default',
    };
    return <Badge variant={variants[status] || 'default'}>{status.replace('-', ' ').toUpperCase()}</Badge>;
  };

  const handleAssignPM = (projectId: string, pmName: string) => {
    setProjects(prev => prev.map(p => 
      p.id === projectId ? { ...p, assignedPM: pmName, status: 'waiting-first-payment' as const } : p
    ));
    toast.success('Project Manager assigned successfully');
  };

  const waitingPM = projects.filter(p => p.status === 'waiting-pm');
  const assignedProjects = projects.filter(p => p.status !== 'waiting-pm');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Project Management</h2>
        <p className="text-gray-500">Assign PM and track project progress</p>
      </div>

      {waitingPM.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Waiting for PM Assignment</CardTitle>
            <CardDescription>Total: {waitingPM.length} projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {waitingPM.map(project => (
                <Card key={project.id} className="bg-gray-50">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{project.projectName}</CardTitle>
                        <CardDescription>{project.clientName}</CardDescription>
                      </div>
                      {getStatusBadge(project.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <FolderKanban className="w-4 h-4 text-gray-400" />
                      <p className="text-sm text-gray-700">Service: {project.serviceName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <p className="text-sm text-gray-700">Due Date: {formatDate(project.dueDate)}</p>
                    </div>
                    <div className="flex items-center gap-3 pt-2 border-t">
                      <p className="text-sm font-medium text-gray-700">Assign PM:</p>
                      <Select 
                        value={project.assignedPM || ''} 
                        onValueChange={(value) => handleAssignPM(project.id, value)}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Pilih PM" />
                        </SelectTrigger>
                        <SelectContent>
                          {projectManagers.map(pm => (
                            <SelectItem key={pm} value={pm}>{pm}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {assignedProjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Assigned Projects</CardTitle>
            <CardDescription>Total: {assignedProjects.length} projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assignedProjects.map(project => (
                <div key={project.id} className="flex items-start justify-between border-b pb-4 last:border-0">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <FolderKanban className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{project.projectName}</p>
                        <p className="text-xs text-gray-500">{project.clientName}</p>
                        <p className="text-xs text-gray-400 mt-1">Service: {project.serviceName}</p>
                        <div className="flex gap-3 mt-1 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <UserCheck className="w-3 h-3" />
                            PM: {project.assignedPM || 'Belum assign'}
                          </span>
                          {project.assignedConsultant && (
                            <span className="flex items-center gap-1">
                              <UserCheck className="w-3 h-3" />
                              Consultant: {project.assignedConsultant}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(project.status)}
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                      <Calendar className="w-3 h-3" />
                      Due: {formatDate(project.dueDate)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

