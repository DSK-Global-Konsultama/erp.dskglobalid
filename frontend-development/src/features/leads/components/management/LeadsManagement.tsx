import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { StatusChip } from '../shared/StatusChip';
import { AddLeadModal } from '../modals/AddLeadModal';
import { mockLeads, type Lead, leadSources, generateDummyLeadsBDMEO, mockMeetings, mockNotulensi, mockProposals, mockEngagementLetters, mockHandovers } from '../../../../lib/mock-data';
import { deriveLeadTrackerRowMeta } from '../../utils/leadTrackerUtils';
import { toast } from 'sonner';

interface LeadsManagementProps {
  userName: string;
  mode: 'edit' | 'view' | 'tracker'; // 'edit' for BD-MEO, 'view' for CEO/COO, 'tracker' for BD-Executive
  title?: string; // Custom title, defaults based on mode
  onLeadClick?: (leadId: string) => void; // Callback when lead is clicked (for tracker mode)
}

export function LeadsManagement({ userName, mode, title, onLeadClick }: LeadsManagementProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCommercialStage, setFilterCommercialStage] = useState<string>('all');
  const [filterHandoverStatus, setFilterHandoverStatus] = useState<string>('all');
  // Use same data source for both MEO and CEO - always use 'Sarah Wijaya' to ensure consistency
  const defaultLeads = generateDummyLeadsBDMEO('Sarah Wijaya');
  
  // Status yang relevan mulai dari TO_BE_MEET
  const relevantStatuses = ['TO_BE_MEET', 'MEETING_SCHEDULED', 'NEED_NOTULEN', 'NOTULEN_SUBMITTED', 'NOTULEN_APPROVED', 'NEED_PROPOSAL', 'IN_PROPOSAL', 'PROPOSAL_APPROVED', 'PROPOSAL_SENT', 'PROPOSAL_ACCEPTED', 'PROPOSAL_EXPIRED', 'NEED_EL', 'EL_SUBMITTED', 'EL_APPROVED', 'EL_SENT', 'EL_SIGNED', 'NEED_HANDOVER', 'IN_HANDOVER', 'HANDOVER_SUBMITTED', 'HANDOVER_APPROVED', 'HANDOVER_SENT_TO_PM', 'DONE', 'DEAL_WON'];

  const [leads, setLeads] = useState<Lead[]>(() => {
    if (mode === 'edit') {
      return [...defaultLeads, ...mockLeads];
    } else {
      // For tracker and view mode, filter for statuses starting from TO_BE_MEET
      return defaultLeads.filter(lead => relevantStatuses.includes((lead as any).status));
    }
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // For tracker mode, also add service filter
  const [serviceFilter, setServiceFilter] = useState<string>('all');

  // For both modes, show all leads (no filtering by createdBy to ensure data consistency)
  const myLeads = leads;

  const filteredLeads = myLeads.filter(lead => {
    const matchesSearch = 
      lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSource = mode === 'tracker' 
      ? true 
      : (filterSource === 'all' || lead.source === filterSource);
    
    const matchesStatus = filterStatus === 'all' || (lead as any).status === filterStatus;
    
    const matchesService = mode === 'tracker' 
      ? (serviceFilter === 'all' || (lead as any).service === serviceFilter)
      : true;
    
    // Filter by commercial stage (for tracker mode)
    let matchesCommercialStage = true;
    let matchesHandoverStatus = true;
    if (mode === 'tracker') {
      const meta = deriveLeadTrackerRowMeta(
        lead,
        mockMeetings,
        mockNotulensi,
        mockProposals,
        mockEngagementLetters,
        mockHandovers
      );
      matchesCommercialStage = filterCommercialStage === 'all' || meta.commercialStage === filterCommercialStage;
      matchesHandoverStatus = filterHandoverStatus === 'all' || meta.handoverStatus === filterHandoverStatus;
    }
    
    return matchesSearch && matchesSource && matchesStatus && matchesService && matchesCommercialStage && matchesHandoverStatus;
  });

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterSource, filterStatus, serviceFilter, filterCommercialStage, filterHandoverStatus]);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleSaveLead = (leadData: Omit<Lead, 'id' | 'status' | 'createdDate' | 'createdBy'> & { service?: string }) => {
    if (editingLead) {
      // Update existing lead
      const updatedLeads = leads.map(l => 
        l.id === editingLead.id 
          ? { ...l, ...leadData }
          : l
      );
      setLeads(updatedLeads);
      toast.success('Lead berhasil diupdate!');
    } else {
      // Add new lead
      const newLead: Lead & { service?: string } = {
        id: `L${String(leads.length + 1).padStart(3, '0')}`,
        ...leadData,
        status: 'NEW' as any,
        createdDate: new Date().toISOString().split('T')[0],
        createdBy: userName,
      };
      setLeads([newLead, ...leads]);
      toast.success('Lead berhasil ditambahkan dengan status NEW');
    }
    setEditingLead(null);
    setShowAddModal(false);
  };

  const handleEdit = (lead: Lead) => {
    if (mode === 'edit') {
      setEditingLead(lead);
      setShowAddModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingLead(null);
  };

  const displayTitle = title || (
    mode === 'edit' ? 'Daftar Leads' : 
    mode === 'tracker' ? 'Lead Tracker' : 
    'Semua Lead'
  );
  // For edit mode, show total myLeads. For view/tracker mode, show filtered leads count
  const paginationTotal = mode === 'edit' ? myLeads.length : filteredLeads.length;

  // Get unique services for tracker mode
  const services = mode === 'tracker' 
    ? ['all', ...Array.from(new Set(myLeads.map(l => (l as any).service).filter(Boolean)))]
    : [];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className={mode === 'tracker' ? 'grid grid-cols-1 md:grid-cols-4 gap-4' : 'flex gap-4'}>
            <div className={mode === 'tracker' ? 'relative' : 'flex-1 relative'}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder={mode === 'tracker' ? 'Search by client or PIC...' : 'Search by client or PIC name...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {mode === 'tracker' ? (
              <>
                <Select value={filterCommercialStage} onValueChange={setFilterCommercialStage}>
                  <SelectTrigger className="focus:border-black focus:ring-1 focus:ring-black">
                    <SelectValue placeholder="Commercial Stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Commercial Stage</SelectItem>
                    <SelectItem value="TO_BE_MEET">TO BE MEET</SelectItem>
                    <SelectItem value="MEETING_SCHEDULED">MEETING SCHEDULED</SelectItem>
                    <SelectItem value="NEED_NOTULEN">NEED NOTULEN</SelectItem>
                    <SelectItem value="IN_NOTULEN">IN NOTULEN</SelectItem>
                    <SelectItem value="NEED_PROPOSAL">NEED PROPOSAL</SelectItem>
                    <SelectItem value="IN_PROPOSAL">IN PROPOSAL</SelectItem>
                    <SelectItem value="IN_EL">IN EL</SelectItem>
                    <SelectItem value="EL_SIGNED">EL SIGNED (Deal)</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterHandoverStatus} onValueChange={setFilterHandoverStatus}>
                  <SelectTrigger className="focus:border-black focus:ring-1 focus:ring-black">
                    <SelectValue placeholder="Handover Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Handover Status</SelectItem>
                    <SelectItem value="LOCKED">Locked</SelectItem>
                    <SelectItem value="NOT_STARTED">Not Started (Required)</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="WAITING_CEO">Waiting CEO Approval</SelectItem>
                    <SelectItem value="CEO_APPROVED">CEO Approved</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Select value={serviceFilter} onValueChange={setServiceFilter}>
                    <SelectTrigger className="flex-1 focus:border-black focus:ring-1 focus:ring-black">
                      <SelectValue placeholder="All Services" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map(service => (
                        <SelectItem key={service} value={service}>
                          {service === 'all' ? 'All Services' : service}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2"
                    onClick={() => {
                      setSearchTerm('');
                      setFilterCommercialStage('all');
                      setFilterHandoverStatus('all');
                      setServiceFilter('all');
                    }}
                  >
                    <Filter className="w-4 h-4" />
                    Reset
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Select value={filterSource} onValueChange={setFilterSource}>
                  <SelectTrigger className="w-[180px] focus:border-black focus:ring-1 focus:ring-black">
                    <SelectValue placeholder="All Sources" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    {leadSources.map((source) => (
                      <SelectItem key={source} value={source}>
                        {source}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[180px] focus:border-black focus:ring-1 focus:ring-black">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="TO_BE_MEET">TO BE MEET</SelectItem>
                    <SelectItem value="MEETING_SCHEDULED">MEETING SCHEDULED</SelectItem>
                    <SelectItem value="NEED_NOTULEN">NEED NOTULEN</SelectItem>
                    <SelectItem value="NOTULEN_SUBMITTED">NOTULEN SUBMITTED</SelectItem>
                    <SelectItem value="NOTULEN_APPROVED">NOTULEN APPROVED</SelectItem>
                    <SelectItem value="NEED_PROPOSAL">NEED PROPOSAL</SelectItem>
                    <SelectItem value="IN_PROPOSAL">IN PROPOSAL</SelectItem>
                    <SelectItem value="PROPOSAL_APPROVED">PROPOSAL APPROVED</SelectItem>
                    <SelectItem value="PROPOSAL_SENT">PROPOSAL SENT</SelectItem>
                    <SelectItem value="PROPOSAL_ACCEPTED">PROPOSAL ACCEPTED</SelectItem>
                    <SelectItem value="PROPOSAL_EXPIRED">PROPOSAL EXPIRED</SelectItem>
                    <SelectItem value="NEED_EL">NEED EL</SelectItem>
                    <SelectItem value="EL_SUBMITTED">EL SUBMITTED</SelectItem>
                    <SelectItem value="EL_APPROVED">EL APPROVED</SelectItem>
                    <SelectItem value="EL_SENT">EL SENT</SelectItem>
                    <SelectItem value="EL_SIGNED">EL SIGNED</SelectItem>
                    <SelectItem value="NEED_HANDOVER">NEED HANDOVER</SelectItem>
                    <SelectItem value="IN_HANDOVER">IN HANDOVER</SelectItem>
                    <SelectItem value="HANDOVER_SUBMITTED">HANDOVER SUBMITTED</SelectItem>
                    <SelectItem value="HANDOVER_APPROVED">HANDOVER APPROVED</SelectItem>
                    <SelectItem value="HANDOVER_SENT_TO_PM">HANDOVER SENT TO PM</SelectItem>
                    <SelectItem value="DONE">DONE</SelectItem>
                    <SelectItem value="DEAL_WON">DEAL WON</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterSource('all');
                    setFilterStatus('all');
                  }}
                >
                  <Filter className="w-4 h-4" />
                  Reset
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{displayTitle}</CardTitle>
            {mode === 'edit' && (
              <Button
                onClick={() => {
                  setEditingLead(null);
                  setShowAddModal(true);
                }}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Tambah Lead Baru
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="px-6">
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-sm text-gray-600 font-medium">ID</th>
                  <th className="text-left px-6 py-3 text-sm text-gray-600 font-medium">Client Info</th>
                  <th className="text-left px-6 py-3 text-sm text-gray-600 font-medium">Source</th>
                  {mode === 'tracker' && (
                    <>
                      <th className="text-left px-6 py-3 text-sm text-gray-600 font-medium">Commercial Stage</th>
                      <th className="text-left px-6 py-3 text-sm text-gray-600 font-medium">Active Document</th>
                      <th className="text-left px-6 py-3 text-sm text-gray-600 font-medium">Handover Status</th>
                    </>
                  )}
                  {mode !== 'tracker' && <th className="text-left px-6 py-3 text-sm text-gray-600 font-medium">Status</th>}
                  <th className="text-left px-6 py-3 text-sm text-gray-600 font-medium">Created At</th>
                  {mode === 'tracker' && <th className="text-left px-6 py-3 text-sm text-gray-600 font-medium">Last Activity</th>}
                  {mode === 'view' && <th className="text-left px-6 py-3 text-sm text-gray-600 font-medium">Last Activity</th>}
                  {mode === 'edit' && <th className="text-left px-6 py-3 text-sm text-gray-600 font-medium">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td 
                      colSpan={mode === 'tracker' ? 9 : mode === 'view' ? 6 : 6} 
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No leads found
                    </td>
                  </tr>
                ) : (
                  paginatedLeads.map((lead) => {
                    const meta = mode === 'tracker' 
                      ? deriveLeadTrackerRowMeta(
                          lead,
                          mockMeetings,
                          mockNotulensi,
                          mockProposals,
                          mockEngagementLetters,
                          mockHandovers
                        )
                      : null;
                    
                    return (
                      <tr 
                        key={lead.id} 
                        className={`hover:bg-gray-50 transition-colors ${mode === 'tracker' && onLeadClick ? 'cursor-pointer' : ''}`}
                        onClick={mode === 'tracker' && onLeadClick ? () => onLeadClick(lead.id) : undefined}
                      >
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-700">{lead.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="font-medium text-gray-900 mb-1">{lead.company}</div>
                            <div className="text-gray-700">{lead.clientName}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-700">{lead.source}</span>
                        </td>
                        {mode === 'tracker' && meta ? (
                          <>
                            <td className="px-6 py-4">
                              <StatusChip status={meta.commercialStage} />
                            </td>
                            <td className="px-6 py-4">
                              {(() => {
                                const parts = meta.activeDocumentLabel.split(' • ');
                                const document = parts[0];
                                const substatus = parts[1] || '';
                                
                                return (
                                  <div className="flex flex-col gap-1">
                                    <span className="text-sm font-medium text-gray-900">{document}</span>
                                    {substatus && (
                                      <span className="text-xs text-gray-600">
                                        {substatus}
                                      </span>
                                    )}
                                  </div>
                                );
                              })()}
                            </td>
                            <td className="px-6 py-4">
                              {meta.handoverStatus === 'LOCKED' ? (
                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                  <Lock className="w-3 h-3" />
                                  <span>LOCKED</span>
                                </div>
                              ) : (
                                <StatusChip status={meta.handoverStatus} />
                              )}
                            </td>
                          </>
                        ) : (
                          <td className="px-6 py-4">
                            <StatusChip status={(lead as any).status || lead.status} />
                          </td>
                        )}
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">{formatDate(lead.createdDate)}</span>
                        </td>
                        {mode === 'tracker' && (
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-600">
                              {(lead as any).lastActivity || '-'}
                            </span>
                          </td>
                        )}
                        {mode === 'view' && (
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-600">
                              {(lead as any).lastActivity || (lead.lastFollowUp ? formatDate(lead.lastFollowUp) : formatDate(lead.createdDate))}
                            </span>
                          </td>
                        )}
                        {mode === 'edit' && (
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleEdit(lead)}
                              className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          {filteredLeads.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-white">
              <div className="text-sm text-gray-600">
                Showing {paginatedLeads.length} of {paginationTotal} leads
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
        </CardContent>
      </Card>

      {mode === 'edit' && (
        <AddLeadModal
          open={showAddModal}
          onClose={handleCloseModal}
          onSave={handleSaveLead}
          editingLead={editingLead}
        />
      )}
    </div>
  );
}

