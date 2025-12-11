import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { StatusChip } from './StatusChip';
import { AddLeadModal } from './AddLeadModal';
import { mockLeads, type Lead, leadSources, generateDummyLeadsBDMEO } from '../../../lib/mock-data';
import { toast } from 'sonner';

interface LeadsListProps {
  userName: string;
  mode: 'edit' | 'view'; // 'edit' for BD-MEO, 'view' for CEO/COO
  title?: string; // Custom title, defaults to "Daftar Leads" for edit mode or "Semua Lead" for view mode
}

export function LeadsList({ userName, mode, title }: LeadsListProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [leads, setLeads] = useState<Lead[]>(() => {
    if (mode === 'edit') {
      return [...generateDummyLeadsBDMEO(userName), ...mockLeads];
    } else {
      // For view mode (CEO/COO), use same data as BD-MEO sees
      const bdMeoUserName = userName || 'Sarah Wijaya';
      return generateDummyLeadsBDMEO(bdMeoUserName);
    }
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // For edit mode, filter by createdBy. For view mode, show all leads
  const myLeads = mode === 'edit' 
    ? leads.filter(lead => lead.createdBy === userName)
    : leads;

  const filteredLeads = myLeads.filter(lead => {
    const matchesSearch = 
      lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSource = filterSource === 'all' || lead.source === filterSource;
    
    const matchesStatus = filterStatus === 'all' || (lead as any).status === filterStatus;
    
    return matchesSearch && matchesSource && matchesStatus;
  });

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterSource, filterStatus]);

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

  const displayTitle = title || (mode === 'edit' ? 'Daftar Leads' : 'Semua Lead');
  // For edit mode, show total myLeads. For view mode, show filtered leads count
  const paginationTotal = mode === 'edit' ? myLeads.length : filteredLeads.length;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by client or PIC name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
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
                <SelectItem value="NEW">NEW</SelectItem>
                <SelectItem value="TO_BE_MEET">TO BE MEET</SelectItem>
                <SelectItem value="MEETING_SCHEDULED">MEETING SCHEDULED</SelectItem>
                <SelectItem value="NEED_PROPOSAL">NEED PROPOSAL</SelectItem>
                <SelectItem value="IN_PROPOSAL">IN PROPOSAL</SelectItem>
                <SelectItem value="DEAL_WON">DEAL WON</SelectItem>
                <SelectItem value="ON_HOLD">ON HOLD</SelectItem>
                <SelectItem value="DROP">DROP</SelectItem>
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
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Client Name</TableHead>
                  <TableHead>PIC Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                  {mode === 'view' && <TableHead>Last Activity</TableHead>}
                  {mode === 'edit' && <TableHead>Aksi</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={mode === 'view' ? 8 : 9} className="text-center py-12 text-gray-500">
                      No leads found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedLeads.map((lead) => (
                    <TableRow key={lead.id} className="hover:bg-gray-50">
                      <TableCell>{lead.id}</TableCell>
                      <TableCell>{lead.company}</TableCell>
                      <TableCell>{lead.clientName}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{lead.phone}</div>
                          <div className="text-gray-600">{lead.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{(lead as any).service || '-'}</TableCell>
                      <TableCell>{lead.source}</TableCell>
                      <TableCell>
                        <StatusChip status={lead.status} />
                      </TableCell>
                      <TableCell className="text-gray-600">{formatDate(lead.createdDate)}</TableCell>
                      {mode === 'view' && (
                        <TableCell className="text-gray-600">
                          {(lead as any).lastActivity || (lead.lastFollowUp ? formatDate(lead.lastFollowUp) : formatDate(lead.createdDate))}
                        </TableCell>
                      )}
                      {mode === 'edit' && (
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(lead)}
                            className="flex items-center gap-2"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </Button>
                        </TableCell>
                      )}
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

