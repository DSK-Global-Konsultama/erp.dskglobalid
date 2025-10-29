import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { mockProjects, consultants } from '../../../lib/mock-data';
import { toast } from 'sonner';
import { FolderKanban, Calendar, FileText } from 'lucide-react';

interface PMDashboardProps {
  pmName: string;
}

export function PMDashboard({ pmName }: PMDashboardProps) {
  const [projects, setProjects] = useState(mockProjects.filter(p => p.assignedPM === pmName));

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

  const handleAssignConsultant = (projectId: string, consultantName: string) => {
    setProjects(prev => prev.map(p => 
      p.id === projectId ? { ...p, assignedConsultant: consultantName } : p
    ));
    toast.success('Consultant assigned successfully');
  };

  const waitingPaymentProjects = projects.filter(p => p.status === 'waiting-first-payment');
  const activeProjects = projects.filter(p => p.status === 'in-progress');
  const completedProjects = projects.filter(p => p.status === 'completed');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">PM Dashboard</h2>
        <p className="text-gray-500">Welcome, {pmName}</p>
      </div>

      {/* Waiting for First Payment */}
      {waitingPaymentProjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Waiting for First Payment</CardTitle>
            <CardDescription>Total: {waitingPaymentProjects.length} projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {waitingPaymentProjects.map(project => (
                <div key={project.id} className="flex items-start justify-between border-b pb-4 last:border-0">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{project.projectName}</p>
                        <p className="text-xs text-gray-500">{project.clientName}</p>
                        <p className="text-xs text-gray-400 mt-1">Service: {project.serviceName}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <p className="text-xs text-gray-400">Due: {formatDate(project.dueDate)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(project.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Projects */}
      {activeProjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Active Projects</CardTitle>
            <CardDescription>Total: {activeProjects.length} projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeProjects.map(project => (
                <Card key={project.id} className="bg-blue-50 border-blue-200">
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
                      <FolderKanban className="w-4 h-4 text-gray-600" />
                      <p className="text-sm text-gray-700">Service: {project.serviceName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-600" />
                      <p className="text-sm text-gray-700">Due Date: {formatDate(project.dueDate)}</p>
                    </div>
                    {project.startDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-600" />
                        <p className="text-sm text-gray-700">Start Date: {formatDate(project.startDate)}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-3 pt-2 border-t border-blue-200">
                      <p className="text-sm font-medium text-gray-700">Assign Consultant:</p>
                      <Select 
                        value={project.assignedConsultant || ''} 
                        onValueChange={(value) => handleAssignConsultant(project.id, value)}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Pilih Consultant" />
                        </SelectTrigger>
                        <SelectContent>
                          {consultants.map(consultant => (
                            <SelectItem key={consultant} value={consultant}>{consultant}</SelectItem>
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

      {/* Completed Projects */}
      {completedProjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Completed Projects</CardTitle>
            <CardDescription>Total: {completedProjects.length} projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {completedProjects.map(project => (
                <div key={project.id} className="flex items-start justify-between border-b pb-4 last:border-0">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <FolderKanban className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{project.projectName}</p>
                        <p className="text-xs text-gray-500">{project.clientName}</p>
                        <p className="text-xs text-gray-400 mt-1">Service: {project.serviceName}</p>
                        {project.completionDate && (
                          <p className="text-xs text-green-600 mt-1">Completed: {formatDate(project.completionDate)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(project.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

