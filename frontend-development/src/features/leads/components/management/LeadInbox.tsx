import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { CheckCircle, Clock, XCircle, Mail, Phone, Calendar, User, Briefcase, TrendingUp, Inbox, Search, Filter } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../../../../components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Button } from '../../../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/table';
import { StatusChip } from '../shared/StatusChip';
import { generateDummyLeadsBDMEO, type Lead } from '../../../../lib/mock-data';
import { authService } from '../../../../services/authService';

export function LeadInbox() {
  // Check if user is CEO
  const currentUser = authService.getCurrentUser();
  if (!currentUser || currentUser.role !== 'CEO') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900">Access Denied</p>
          <p className="text-sm text-gray-600 mt-1">Only CEO can access this page</p>
        </div>
      </div>
    );
  }
  // Get all leads and filter for NEW status - use same data source as MEO
  const allLeads = generateDummyLeadsBDMEO('Sarah Wijaya');
  const [leads, setLeads] = useState<Lead[]>(allLeads);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('NEW');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  // Filter leads based on status (NEW or ON_HOLD) and search term
  const filteredLeads = leads.filter(lead => {
    const status = (lead as any).status;
    const matchesStatus = status === filterStatus;
    const matchesSearch = 
      lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  // Ensure currentPage doesn't exceed totalPages
  useEffect(() => {
    const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [filteredLeads.length, currentPage, itemsPerPage]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLeads = filteredLeads.slice(startIndex, endIndex);
  
  const newLeads = leads.filter(lead => (lead as any).status === 'NEW');

  const handleAction = (leadId: string, action: 'TO_BE_MEET' | 'ON_HOLD' | 'DROP') => {
    const updatedLeads = leads.map(lead => {
      if (lead.id === leadId) {
        const updatedLead = {
          ...lead,
          status: action as any,
          lastActivity: action === 'TO_BE_MEET' 
            ? `CEO moved to To Be Meet - ${new Date().toISOString().split('T')[0]}`
            : action === 'ON_HOLD'
            ? `CEO put on hold - ${new Date().toISOString().split('T')[0]}`
            : `Lead dropped - ${new Date().toISOString().split('T')[0]}`,
        };
        return updatedLead;
      }
      return lead;
    });
    
    setLeads(updatedLeads);
    
    const actionText = action === 'TO_BE_MEET' ? 'To Be Meet' : action === 'ON_HOLD' ? 'On Hold' : 'Dropped';
    toast.success(`Lead berhasil dipindahkan ke ${actionText}`);
  };

  const getSourceBadgeColor = (source: string) => {
    const colors: Record<string, string> = {
      'Referral': 'bg-purple-100 text-purple-700 border-purple-200',
      'Website': 'bg-blue-100 text-blue-700 border-blue-200',
      'LinkedIn': 'bg-cyan-100 text-cyan-700 border-cyan-200',
      'Direct': 'bg-green-100 text-green-700 border-green-200',
      'Facebook': 'bg-blue-100 text-blue-700 border-blue-200',
      'Instagram': 'bg-pink-100 text-pink-700 border-pink-200',
      'Cold Call': 'bg-gray-100 text-gray-700 border-gray-200',
      'Event': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'Other': 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return colors[source] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {newLeads.length > 0 && (
        <Alert className="border-blue-500 bg-blue-50">
          <Inbox className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-900">Lead Baru!</AlertTitle>
          <AlertDescription className="text-blue-800">
            Ada {newLeads.length} lead baru menunggu review dari Anda. Segera review untuk mempercepat proses follow-up.
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by client, PIC name, or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px] focus:border-black focus:ring-1 focus:ring-black">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NEW">NEW</SelectItem>
                <SelectItem value="ON_HOLD">ON HOLD</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('NEW');
              }}
            >
              <Filter className="w-4 h-4" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Kotak Masuk Lead</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client & Notes</TableHead>
                  <TableHead>Contact Info</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Created Info</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                      <div className="flex flex-col items-center">
                        <Inbox className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="font-medium text-base">Tidak ada lead</p>
                        <p className="text-sm mt-1 text-gray-400">Coba ubah filter atau search term</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedLeads.map((lead) => (
                    <TableRow key={lead.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-900">{lead.company}</span>
                          </div>
                          {lead.notes && (
                            <p className="text-sm text-gray-600 pl-6 line-clamp-2">{lead.notes}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1.5 text-sm">
                          <div className="flex items-center gap-2 text-gray-900">
                            <User className="w-3.5 h-3.5 text-gray-400" />
                            <span>{lead.clientName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            <span>{lead.phone}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            <span className="truncate max-w-[200px]">{lead.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-900">
                          {(lead as any).service || '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs border ${getSourceBadgeColor(lead.source)}`}>
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {lead.source}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <div className="text-gray-900">{lead.createdBy}</div>
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{formatDate(lead.createdDate)}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusChip status={(lead as any).status || 'NEW'} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {(lead as any).status === 'NEW' ? (
                            <>
                              <button
                                onClick={() => handleAction(lead.id, 'TO_BE_MEET')}
                                className="inline-flex items-center gap-1.5 px-3 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 transition-colors shadow-sm hover:shadow"
                                title="Move to To Be Meet"
                              >
                                <CheckCircle className="w-4 h-4" />
                                <span>Meet</span>
                              </button>
                              <button
                                onClick={() => handleAction(lead.id, 'ON_HOLD')}
                                className="inline-flex items-center gap-1.5 px-3 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-900 transition-colors shadow-sm hover:shadow"
                                title="Put on Hold"
                              >
                                <Clock className="w-4 h-4" />
                                <span>Hold</span>
                              </button>
                              <button
                                onClick={() => handleAction(lead.id, 'DROP')}
                                className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors shadow-sm hover:shadow"
                                title="Drop Lead"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleAction(lead.id, 'TO_BE_MEET')}
                                className="inline-flex items-center gap-1.5 px-3 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 transition-colors shadow-sm hover:shadow"
                                title="Move to To Be Meet"
                              >
                                <CheckCircle className="w-4 h-4" />
                                <span>Meet</span>
                              </button>
                              <button
                                onClick={() => handleAction(lead.id, 'DROP')}
                                className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors shadow-sm hover:shadow"
                                title="Drop Lead"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {/* Pagination */}
          {filteredLeads.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {paginatedLeads.length} of {filteredLeads.length} leads
              </div>
              <div className="flex gap-2">
                <button 
                  className="h-8 px-3 rounded-md border bg-background text-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-all"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <button className="h-8 px-3 rounded-md bg-black text-white text-sm font-medium">
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
        </CardContent>
      </Card>
    </div>
  );
}

