import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/table';
import { Badge } from '../../../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../../components/ui/dialog';
import { Label } from '../../../../components/ui/label';
import { Input } from '../../../../components/ui/input';
import { mockInvoices } from '../../../../lib/mock-data';
import { Clock, CheckCircle, Users } from 'lucide-react';
import type { Project } from '../../../../lib/mock-data';
import { useState } from 'react';
import { toast } from 'sonner';

interface ProjectsTableProps {
  myProjects: Project[];
  consultants: string[];
  onUpdateProjects: (updatedProjects: Project[]) => void;
}

export function ProjectsTable({ myProjects, consultants, onUpdateProjects }: ProjectsTableProps) {
  const [isAssignConsultantOpen, setIsAssignConsultantOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedConsultant, setSelectedConsultant] = useState('');

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysUntilDue = (dueDate: string) => {
    return Math.floor(
      (new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
  };

  const getStatusBadge = (status: Project['status']) => {
    const config: Record<Project['status'], { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string; label: string }> = {
      'waiting-assignment': {
        variant: 'outline' as const,
        className: 'bg-gray-50 text-gray-700 border-gray-200',
        label: 'Waiting Assignment',
      },
      'waiting-pm': {
        variant: 'outline' as const,
        className: 'bg-gray-50 text-gray-700 border-gray-200',
        label: 'New Assignment',
      },
      'waiting-el': {
        variant: 'outline' as const,
        className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        label: 'Waiting EL Approval',
      },
      'waiting-first-payment': {
        variant: 'outline' as const,
        className: 'bg-orange-50 text-orange-700 border-orange-200',
        label: 'Waiting Payment 50%',
      },
      'in-progress': {
        variant: 'outline' as const,
        className: 'bg-blue-50 text-blue-700 border-blue-200',
        label: 'In Progress',
      },
      'waiting-final-payment': {
        variant: 'outline' as const,
        className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        label: 'Waiting Final Payment',
      },
      'completed': {
        variant: 'outline' as const,
        className: 'bg-green-50 text-green-700 border-green-200',
        label: 'Completed',
      },
    };

    const { variant, className, label } = config[status] || config['waiting-assignment'];
    return (
      <Badge variant={variant} className={className}>
        {label}
      </Badge>
    );
  };

  const getFirstPaymentStatus = (projectId: string): 'paid' | 'pending' => {
    const invoice = mockInvoices.find(inv => inv.projectId === projectId);
    if (!invoice) return 'pending';
    
    const firstTerm = invoice.paymentTerms[0];
    return firstTerm.status === 'paid' ? 'paid' : 'pending';
  };

  const handleAssignConsultant = () => {
    if (!selectedProject || !selectedConsultant) return;

    const updatedProjects = myProjects.map(p => {
      if (p.id === selectedProject.id) {
        return {
          ...p,
          assignedConsultant: selectedConsultant,
        };
      }
      return p;
    });
    
    onUpdateProjects(updatedProjects);
    setIsAssignConsultantOpen(false);
    setSelectedProject(null);
    setSelectedConsultant('');
    toast.success(`Consultant ${selectedConsultant} berhasil di-assign!`);
  };

  const startProject = (id: string) => {
    const updatedProjects = myProjects.map(p => {
      if (p.id === id) {
        return {
          ...p,
          status: 'in-progress' as const,
          startDate: new Date().toISOString().split('T')[0],
        };
      }
      return p;
    });
    
    onUpdateProjects(updatedProjects);
    toast.success('Project dimulai!');
  };

  const completeProject = (id: string) => {
    const updatedProjects = myProjects.map(p => {
      if (p.id === id) {
        return {
          ...p,
          status: 'waiting-final-payment' as const,
          completionDate: new Date().toISOString().split('T')[0],
        };
      }
      return p;
    });
    
    onUpdateProjects(updatedProjects);
    toast.success('Project selesai! Trigger ke Admin untuk tagih final payment.');
  };

  const handleProgressChange = (id: string, value: string) => {
    // Allow empty string for typing
    if (value === '') {
      const updatedProjects = myProjects.map(p => {
        if (p.id === id) {
          return {
            ...p,
            progressPercentage: undefined,
          };
        }
        return p;
      });
      onUpdateProjects(updatedProjects);
      return;
    }

    const progressValue = parseInt(value);
    if (isNaN(progressValue)) {
      return;
    }

    // Validate range
    if (progressValue < 0 || progressValue > 100) {
      return; // Don't update if out of range, but allow typing
    }

    const updatedProjects = myProjects.map(p => {
      if (p.id === id) {
        return {
          ...p,
          progressPercentage: progressValue,
        };
      }
      return p;
    });
    
    onUpdateProjects(updatedProjects);
  };

  const handleProgressBlur = (id: string, value: string) => {
    const progressValue = parseInt(value) || 0;
    if (progressValue < 0) {
      toast.error('Progress tidak boleh kurang dari 0%');
      const updatedProjects = myProjects.map(p => {
        if (p.id === id) {
          return {
            ...p,
            progressPercentage: 0,
          };
        }
        return p;
      });
      onUpdateProjects(updatedProjects);
      return;
    }
    if (progressValue > 100) {
      toast.error('Progress tidak boleh lebih dari 100%');
      const updatedProjects = myProjects.map(p => {
        if (p.id === id) {
          return {
            ...p,
            progressPercentage: 100,
          };
        }
        return p;
      });
      onUpdateProjects(updatedProjects);
      return;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>My Projects ({myProjects.length})</CardTitle>
          <CardDescription>Daftar project yang saya handle</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Consultant</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Payment 50%</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Sisa Waktu</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myProjects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <p className="text-sm font-medium">Belum ada data project</p>
                        <p className="text-xs mt-1">Tidak ada project yang di-assign ke Anda</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  myProjects.map(project => {
                  const daysUntilDue = getDaysUntilDue(project.dueDate);
                  const isUrgent = daysUntilDue <= 7 && project.status === 'in-progress';
                  const isOverdue = daysUntilDue < 0 && project.status === 'in-progress';
                  const firstPaymentStatus = getFirstPaymentStatus(project.id);

                  return (
                    <TableRow key={project.id} className={isOverdue ? 'bg-red-50' : ''}>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{project.serviceName}</p>
                          <p className="text-xs text-gray-500">{project.id}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{project.clientName}</p>
                      </TableCell>
                      <TableCell>
                        {project.assignedConsultant ? (
                          <span className="text-sm">{project.assignedConsultant}</span>
                        ) : (
                          <Badge variant="outline" className="bg-gray-50 text-gray-700">
                            Belum Assign
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(project.status)}</TableCell>
                      <TableCell>
                        {project.status === 'in-progress' ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={project.progressPercentage ?? 0}
                              onChange={(e) => handleProgressChange(project.id, e.target.value)}
                              onBlur={(e) => handleProgressBlur(project.id, e.target.value)}
                              className="w-20 h-8 text-sm"
                            />
                            <span className="text-sm text-gray-500">%</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">
                            {project.progressPercentage !== undefined ? `${project.progressPercentage}%` : '0%'}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {project.status === 'waiting-first-payment' ? (
                          firstPaymentStatus === 'paid' ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Paid
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                              <Clock className="w-3 h-3 mr-1" />
                              Pending
                            </Badge>
                          )
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(project.dueDate)}</TableCell>
                      <TableCell>
                        {project.status === 'completed' || project.status === 'waiting-final-payment' ? (
                          <span className="text-sm text-gray-500">-</span>
                        ) : isOverdue ? (
                          <Badge variant="destructive">Overdue {Math.abs(daysUntilDue)} hari</Badge>
                        ) : isUrgent ? (
                          <Badge variant="destructive">{daysUntilDue} hari lagi</Badge>
                        ) : (
                          <span className="text-sm">{daysUntilDue} hari lagi</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-2">
                          {!project.assignedConsultant && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedProject(project);
                                setIsAssignConsultantOpen(true);
                              }}
                            >
                              <Users className="w-3 h-3 mr-1" />
                              Assign
                            </Button>
                          )}

                          {project.status === 'waiting-first-payment' && 
                           firstPaymentStatus === 'paid' && 
                           project.assignedConsultant && (
                            <Button
                              size="sm"
                              onClick={() => startProject(project.id)}
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Mulai
                            </Button>
                          )}

                          {project.status === 'in-progress' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => completeProject(project.id)}
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Selesai
                            </Button>
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
        </CardContent>
      </Card>

      {/* Assign Consultant Dialog */}
      <Dialog open={isAssignConsultantOpen} onOpenChange={setIsAssignConsultantOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Consultant</DialogTitle>
            <DialogDescription>
              Pilih consultant untuk project: {selectedProject?.serviceName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Consultant</Label>
              <Select value={selectedConsultant} onValueChange={setSelectedConsultant}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Consultant" />
                </SelectTrigger>
                <SelectContent>
                  {consultants.map(consultant => (
                    <SelectItem key={consultant} value={consultant}>{consultant}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignConsultantOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleAssignConsultant}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

