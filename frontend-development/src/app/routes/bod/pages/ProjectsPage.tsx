import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/table';
import { Badge } from '../../../../components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../../../../components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../../components/ui/dialog';
import { Label } from '../../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { mockProjects, projectManagers, type Project } from '../../../../lib/mock-data';
import { Clock, CheckCircle, AlertCircle, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [isAssignPMOpen, setIsAssignPMOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedPM, setSelectedPM] = useState('');

  const handleAssignPM = () => {
    if (!selectedProject || !selectedPM) return;

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
    const updatedProjects = projects.map(p => {
      if (p.id === id) {
        return {
          ...p,
          status: 'completed' as const,
          completionDate: new Date().toISOString().split('T')[0],
        };
      }
      return p;
    });
    
    setProjects(updatedProjects);
    toast.success('Project selesai! Admin harus menagih payment berikutnya.');
  };

  const formatDate = (dateString: string) => {
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
    const config: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string; icon: any; label: string }> = {
      'waiting-assignment': {
        variant: 'outline' as const,
        className: 'bg-gray-50 text-gray-700 border-gray-200',
        icon: UserPlus,
        label: 'Waiting Assignment',
      },
      'waiting-pm': {
        variant: 'outline' as const,
        className: 'bg-gray-50 text-gray-700 border-gray-200',
        icon: UserPlus,
        label: 'Waiting PM Assignment',
      },
      'waiting-el': {
        variant: 'outline' as const,
        className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        icon: AlertCircle,
        label: 'Waiting EL Approval',
      },
      'waiting-first-payment': {
        variant: 'outline' as const,
        className: 'bg-orange-50 text-orange-700 border-orange-200',
        icon: AlertCircle,
        label: 'Waiting Payment 50%',
      },
      'in-progress': {
        variant: 'outline' as const,
        className: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: Clock,
        label: 'In Progress',
      },
      'waiting-final-payment': {
        variant: 'outline' as const,
        className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        icon: AlertCircle,
        label: 'Waiting Final Payment',
      },
      'completed': {
        variant: 'outline' as const,
        className: 'bg-green-50 text-green-700 border-green-200',
        icon: CheckCircle,
        label: 'Completed',
      },
    };

    const { variant, className, icon: Icon, label } = config[status] || config['waiting-assignment'];
    return (
      <Badge variant={variant} className={className}>
        <Icon className="w-3 h-3 mr-1" />
        {label}
      </Badge>
    );
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

  return (
    <div className="space-y-6">
      {/* Alert for waiting PM assignment */}
      {projectsWaitingPM.length > 0 && (
        <Alert>
          <UserPlus className="h-4 w-4" />
          <AlertTitle>Perhatian BOD!</AlertTitle>
          <AlertDescription>
            Ada {projectsWaitingPM.length} project yang belum di-assign PM.
            Setiap layanan dari deal = 1 project terpisah yang perlu PM-nya masing-masing.
          </AlertDescription>
        </Alert>
      )}

      {/* Alert for waiting payment */}
      {projectsWaitingPayment.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Waiting First Payment</AlertTitle>
          <AlertDescription>
            Ada {projectsWaitingPayment.length} project menunggu pembayaran 50% sebelum bisa dimulai PM.
          </AlertDescription>
        </Alert>
      )}

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

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Waiting PM</CardTitle>
            <UserPlus className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{projectsWaitingPM.length}</div>
            <p className="text-xs text-gray-500 mt-1">Belum assign PM</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Waiting Payment</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-orange-600">{projectsWaitingPayment.length}</div>
            <p className="text-xs text-gray-500 mt-1">Belum bisa dimulai</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-blue-600">{projectsInProgress.length}</div>
            <p className="text-xs text-gray-500 mt-1">Sedang dikerjakan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Waiting Final</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-yellow-600">{projectsWaitingFinal.length}</div>
            <p className="text-xs text-gray-500 mt-1">Selesai, tagih final</p>
          </CardContent>
        </Card>
      </div>

      {/* Projects Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Projects ({projects.length})</CardTitle>
          <CardDescription>Setiap layanan = 1 project dengan PM & Consultant masing-masing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>PM</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Sisa Waktu</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <p className="text-sm font-medium">Belum ada data project</p>
                        <p className="text-xs mt-1">Tidak ada project di sistem</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  [...projects].sort((a, b) => {
                    const daysA = getDaysUntilDue(a.dueDate);
                    const daysB = getDaysUntilDue(b.dueDate);
                    return daysA - daysB; // Urutkan dari terdekat hingga paling lama
                  }).map(project => {
                    const daysUntilDue = getDaysUntilDue(project.dueDate);
                    const isUrgent = daysUntilDue <= 7 && project.status === 'in-progress';
                    const isOverdue = daysUntilDue < 0 && project.status === 'in-progress';
                    const progress = project.progressPercentage ?? 0;
                    const isAtRisk = project.status === 'in-progress' && 
                                     daysUntilDue <= 15 && 
                                     daysUntilDue >= 0 && 
                                     progress < 100;

                    return (
                      <TableRow 
                        key={project.id} 
                        className={
                          isOverdue 
                            ? 'bg-red-50' 
                            : isAtRisk 
                            ? 'bg-orange-50' 
                            : ''
                        }
                      >
                      <TableCell>{project.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{project.serviceName}</p>
                          <p className="text-xs text-gray-500">Deal: {project.dealId}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{project.clientName}</p>
                      </TableCell>
                      <TableCell>
                        {project.assignedPM ? (
                          <span className="text-sm">{project.assignedPM}</span>
                        ) : (
                          <Badge variant="outline" className="bg-orange-50 text-orange-700">
                            Belum Assign
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(project.status)}</TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-900">
                          {project.progressPercentage ?? 0}%
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(project.dueDate)}</TableCell>
                      <TableCell>
                        {project.status === 'completed' ? (
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
                          {/* BOD: Assign PM */}
                          {(project.status === 'waiting-assignment' || project.status === 'waiting-pm') && !project.assignedPM && (
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedProject(project);
                                setIsAssignPMOpen(true);
                              }}
                            >
                              <UserPlus className="w-3 h-3 mr-1" />
                              Assign PM
                            </Button>
                          )}

                          {/* Start project when payment received */}
                          {project.status === 'waiting-first-payment' && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              Tunggu Payment
                            </Badge>
                          )}

                          {/* Complete project */}
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

                          {/* Completed - reminder for payment */}
                          {project.status === 'completed' && (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                              Tagih Payment
                            </Badge>
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

      {/* Assign PM Dialog */}
      <Dialog open={isAssignPMOpen} onOpenChange={setIsAssignPMOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Project Manager</DialogTitle>
            <DialogDescription>
              BOD memilih PM untuk project: {selectedProject?.serviceName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Project Manager</Label>
              <Select value={selectedPM} onValueChange={setSelectedPM}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih PM" />
                </SelectTrigger>
                <SelectContent>
                  {projectManagers.map(pm => (
                    <SelectItem key={pm} value={pm}>{pm}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignPMOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleAssignPM}>Assign PM</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
