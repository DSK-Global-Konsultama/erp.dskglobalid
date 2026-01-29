import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../../components/ui/dialog';
import { Label } from '../../../../components/ui/label';
import { Input } from '../../../../components/ui/input';
import { mockInvoices, mockHandovers, mockDeals, mockLeads } from '../../../../lib/mock-data';
import { Clock, CheckCircle, Users, Table as TableIcon, LayoutGrid, Briefcase, TrendingUp } from 'lucide-react';
import type { Project, Handover } from '../../../../lib/mock-data';
import { useState, useEffect } from 'react';
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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

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

  // Sort projects by due date
  const sortedProjects = [...myProjects].sort((a, b) => {
    const daysA = getDaysUntilDue(a.dueDate);
    const daysB = getDaysUntilDue(b.dueDate);
    return daysA - daysB; // Urutkan dari terdekat hingga paling lama
  });

  // Reset to page 1 when itemsPerPage changes
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  // Ensure currentPage doesn't exceed totalPages
  useEffect(() => {
    const totalPages = Math.ceil(sortedProjects.length / itemsPerPage);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [sortedProjects.length, currentPage, itemsPerPage]);

  // Calculate pagination
  const totalPages = Math.ceil(sortedProjects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProjects = sortedProjects.slice(startIndex, endIndex);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>My Projects ({myProjects.length})</CardTitle>
              <CardDescription>Daftar project yang saya handle</CardDescription>
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
            <div>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-sm text-gray-600 font-medium">Project</th>
                  <th className="text-left px-6 py-3 text-sm text-gray-600 font-medium">Client</th>
                  <th className="text-left px-6 py-3 text-sm text-gray-600 font-medium">Consultant</th>
                  <th className="text-left px-6 py-3 text-sm text-gray-600 font-medium">Status</th>
                  <th className="text-left px-6 py-3 text-sm text-gray-600 font-medium">Progress</th>
                  <th className="text-left px-6 py-3 text-sm text-gray-600 font-medium">Payment 50%</th>
                  <th className="text-left px-6 py-3 text-sm text-gray-600 font-medium">Due Date</th>
                  <th className="text-left px-6 py-3 text-sm text-gray-600 font-medium">Sisa Waktu</th>
                  <th className="text-left px-6 py-3 text-sm text-gray-600 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedProjects.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                      No projects found
                    </td>
                  </tr>
                ) : (
                  paginatedProjects.map(project => {
                  const daysUntilDue = getDaysUntilDue(project.dueDate);
                  const isUrgent = daysUntilDue <= 7 && project.status === 'in-progress';
                  const isOverdue = daysUntilDue < 0 && project.status === 'in-progress';
                  const progress = project.progressPercentage ?? 0;
                  const isAtRisk = project.status === 'in-progress' && 
                                   daysUntilDue <= 15 && 
                                   daysUntilDue >= 0 && 
                                   progress < 100;
                  const firstPaymentStatus = getFirstPaymentStatus(project.id);

                  // Get handover and lead information for better display
                  const deal = mockDeals.find(d => d.id === project.dealId);
                  const lead = deal ? mockLeads.find(l => l.id === deal.leadId) : null;
                  const handover = mockHandovers.find(h => h.projectId === project.id) as Handover & { 
                    projectName?: string;
                    serviceLine?: string;
                  } | undefined;
                  
                  const projectTitle = handover?.projectTitle || handover?.projectName || project.serviceName || project.projectName || 'Project';
                  const companyName = lead?.company || project.clientName;

                  return (
                    <tr 
                      key={project.id} 
                      className={`hover:bg-gray-50 transition-colors ${
                        isOverdue 
                          ? 'bg-red-50' 
                          : isAtRisk 
                          ? 'bg-orange-50' 
                          : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900 mb-1">{projectTitle}</div>
                          <div className="text-gray-500">{project.id}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900 mb-1">{companyName}</div>
                          <div className="text-gray-700">{project.clientName}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {project.assignedConsultant ? (
                          <span className="text-sm text-gray-700">{project.assignedConsultant}</span>
                        ) : (
                          <Badge variant="outline" className="bg-gray-50 text-gray-700">
                            Belum Assign
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(project.status)}</td>
                      <td className="px-6 py-4">
                        {project.status === 'in-progress' ? (
                          <div className="flex items-center gap-2 min-w-[120px]">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={project.progressPercentage ?? 0}
                              onChange={(e) => handleProgressChange(project.id, e.target.value)}
                              onBlur={(e) => handleProgressBlur(project.id, e.target.value)}
                              className="w-16 h-7 text-xs text-center"
                            />
                            <span className="text-xs text-gray-500">%</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 min-w-[100px]">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-900 w-8">{progress}%</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
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
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{formatDate(project.dueDate)}</span>
                      </td>
                      <td className="px-6 py-4">
                        {project.status === 'completed' || project.status === 'waiting-final-payment' ? (
                          <span className="text-sm text-gray-500">-</span>
                        ) : isOverdue ? (
                          <Badge variant="destructive">Overdue {Math.abs(daysUntilDue)} hari</Badge>
                        ) : isUrgent ? (
                          <Badge variant="destructive">{daysUntilDue} hari lagi</Badge>
                        ) : (
                          <span className="text-sm text-gray-600">{daysUntilDue} hari lagi</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          {!project.assignedConsultant && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedProject(project);
                                setIsAssignConsultantOpen(true);
                              }}
                              className="text-xs"
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
                              className="text-xs"
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
                              className="text-xs"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Selesai
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                  })
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          {sortedProjects.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-white">
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  Showing {paginatedProjects.length} of {sortedProjects.length} entries
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Rows per page:</span>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => {
                      setItemsPerPage(Number(value));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-[80px] h-8 text-sm focus:border-black focus:ring-1 focus:ring-black">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  className="h-8 px-3 rounded-md border bg-background text-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-all"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <button className="h-8 px-3 rounded-md bg-white text-black border border-black text-sm font-medium">
                  {currentPage}
                </button>
                <button 
                  className="h-8 px-3 rounded-md border bg-background text-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-all"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          )}
          </div>
          ) : (
            <div className="space-y-4">
              {paginatedProjects.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                  <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No projects found</p>
                </div>
              ) : (
                paginatedProjects.map(project => {
                  const daysUntilDue = getDaysUntilDue(project.dueDate);
                  const isUrgent = daysUntilDue <= 7 && project.status === 'in-progress';
                  const isOverdue = daysUntilDue < 0 && project.status === 'in-progress';
                  const progress = project.progressPercentage ?? 0;
                  const isAtRisk = project.status === 'in-progress' && 
                                   daysUntilDue <= 15 && 
                                   daysUntilDue >= 0 && 
                                   progress < 100;
                  const firstPaymentStatus = getFirstPaymentStatus(project.id);

                  const deal = mockDeals.find(d => d.id === project.dealId);
                  const lead = deal ? mockLeads.find(l => l.id === deal.leadId) : null;
                  const handover = mockHandovers.find(h => h.projectId === project.id) as Handover & { 
                    projectName?: string;
                    serviceLine?: string;
                  } | undefined;
                  
                  const projectTitle = handover?.projectTitle || handover?.projectName || project.serviceName || project.projectName || 'Project';
                  const companyName = lead?.company || project.clientName;

                  return (
                    <div
                      key={project.id}
                      className={`bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-300 transition-colors ${
                        isOverdue ? 'border-red-200 bg-red-50' : 
                        isAtRisk ? 'border-orange-200 bg-orange-50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{projectTitle}</h3>
                            {getStatusBadge(project.status)}
                            {isOverdue && (
                              <Badge variant="destructive">Overdue</Badge>
                            )}
                            {isUrgent && !isOverdue && (
                              <Badge variant="destructive">Urgent</Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 mb-1">{companyName}</div>
                          <div className="text-xs text-gray-500">ID: {project.id}</div>
                        </div>
                      </div>
                      
                      {/* Payment Status */}
                      <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                          {project.status === 'waiting-first-payment' ? (
                            firstPaymentStatus === 'paid' ? (
                              <>
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-sm text-green-600 font-medium">Payment 50% Received</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-4 h-4 text-orange-600" />
                                <span className="text-sm text-orange-600 font-medium">Waiting Payment 50%</span>
                              </>
                            )
                          ) : project.status === 'in-progress' ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-green-600 font-medium">Work Start Allowed</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-400 font-medium">Not Started</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      {project.status === 'in-progress' && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium text-gray-900">
                                Progress: {progress}%
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      {/* Quick Info */}
                      <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                        <div>
                          <div className="text-gray-500 mb-1">Consultant</div>
                          <div className="text-gray-900">
                            {project.assignedConsultant || <span className="text-gray-400">Belum Assign</span>}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500 mb-1">Due Date</div>
                          <div className="text-gray-900">
                            {formatDate(project.dueDate)}
                            {!project.status.includes('completed') && (
                              <div className={`text-xs mt-0.5 ${
                                isOverdue ? 'text-red-600 font-medium' : 
                                isUrgent ? 'text-orange-600' : 
                                'text-gray-500'
                              }`}>
                                {isOverdue 
                                  ? `Overdue ${Math.abs(daysUntilDue)}d`
                                  : `${daysUntilDue}d left`}
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500 mb-1">Client</div>
                          <div className="text-gray-900">{project.clientName}</div>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex gap-2 pt-4 border-t border-gray-200">
                        {!project.assignedConsultant && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedProject(project);
                              setIsAssignConsultantOpen(true);
                            }}
                            className="flex items-center gap-2"
                          >
                            <Users className="w-4 h-4" />
                            Assign Consultant
                          </Button>
                        )}
                        {project.status === 'waiting-first-payment' && 
                         firstPaymentStatus === 'paid' && 
                         project.assignedConsultant && (
                          <Button
                            size="sm"
                            onClick={() => startProject(project.id)}
                            className="flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Mulai Project
                          </Button>
                        )}
                        {project.status === 'in-progress' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => completeProject(project.id)}
                            className="flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Selesai
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              
              {/* Pagination for Card View */}
              {sortedProjects.length > 0 && (
                <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-600">
                      Showing {paginatedProjects.length} of {sortedProjects.length} entries
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Rows per page:</span>
                      <Select
                        value={itemsPerPage.toString()}
                        onValueChange={(value) => {
                          setItemsPerPage(Number(value));
                          setCurrentPage(1);
                        }}
                      >
                        <SelectTrigger className="w-[80px] h-8 text-sm focus:border-black focus:ring-1 focus:ring-black">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="20">20</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      className="h-8 px-3 rounded-md border bg-background text-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-all"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                    <button className="h-8 px-3 rounded-md bg-white text-black border border-black text-sm font-medium">
                      {currentPage}
                    </button>
                    <button 
                      className="h-8 px-3 rounded-md border bg-background text-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-all"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
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

