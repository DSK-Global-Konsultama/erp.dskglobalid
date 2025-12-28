/**
 * Bank Data Management Component
 * For BD-Admin: Full access with create manual lead and sortir
 * For BD-MEO: View only
 */
import { useState, useEffect } from 'react';
import { Search, Eye, Plus, ArrowUpDown, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { mockBankData } from '../../../../lib/leadManagementMockData';
import type { BankDataEntry, BankDataTriageStatus, Channel } from '../../../../lib/leadManagementTypes';
import { getTriageStatusBadge } from '../../../../lib/statusHelpers';
import { BankDataDetailModal } from '../modals/BankDataDetailModal';
import { CreateManualLeadModal } from '../modals/CreateManualLeadModal';

interface BankDataManagementProps {
  canEdit?: boolean; // false for BD-MEO, true for BD-Admin
  onPromoteToLead?: (bankDataId: string) => void;
}

export function BankDataManagement({ canEdit = true, onPromoteToLead }: BankDataManagementProps) {
  const [bankData] = useState<BankDataEntry[]>(mockBankData);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<BankDataTriageStatus | 'ALL'>('ALL');
  const [filterChannel, setFilterChannel] = useState<Channel | 'ALL'>('ALL');
  const [selectedEntry, setSelectedEntry] = useState<BankDataEntry | null>(null);
  const [showManualLeadModal, setShowManualLeadModal] = useState(false);
  
  // Sorting state
  const [sortBy, setSortBy] = useState<'date' | 'client' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Toggle sort
  const handleSort = (field: 'date' | 'client' | 'status') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Filter bank data
  const filteredData = bankData.filter(entry => {
    const matchesSearch = 
      entry.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.picName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'ALL' || entry.triageStatus === filterStatus;
    const matchesChannel = filterChannel === 'ALL' || entry.sourceChannel === filterChannel;
    
    return matchesSearch && matchesStatus && matchesChannel;
  });

  // Sort filtered data
  const sortedData = [...filteredData].sort((a, b) => {
    if (sortBy === 'date') {
      return sortOrder === 'asc'
        ? new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
        : new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    } else if (sortBy === 'client') {
      return sortOrder === 'asc'
        ? a.clientName.localeCompare(b.clientName)
        : b.clientName.localeCompare(a.clientName);
    } else if (sortBy === 'status') {
      return sortOrder === 'asc'
        ? a.triageStatus.localeCompare(b.triageStatus)
        : b.triageStatus.localeCompare(a.triageStatus);
    }
    return 0;
  });

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus, filterChannel, itemsPerPage]);

  // Ensure currentPage doesn't exceed totalPages
  useEffect(() => {
    const totalPages = Math.ceil(sortedData.length / itemsPerPage);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [sortedData.length, currentPage, itemsPerPage]);

  // Calculate pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  // Stats
  const stats = {
    total: bankData.length,
    rawNew: bankData.filter(bd => bd.triageStatus === 'RAW_NEW').length,
    promoted: bankData.filter(bd => bd.triageStatus === 'PROMOTED_TO_LEAD').length,
    rejected: bankData.filter(bd => bd.triageStatus === 'REJECTED').length,
  };

  // Format channel
  const formatChannel = (channel: string) => {
    if (channel === 'IG') {
      return 'Instagram';
    }
    return channel.charAt(0).toUpperCase() + channel.slice(1).toLowerCase();
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 mb-1">Total Entries</div>
            <div className="text-2xl font-semibold text-gray-900">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-blue-800 mb-1">New</div>
            <div className="text-2xl font-semibold text-blue-900">{stats.rawNew}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-green-800 mb-1">Promoted</div>
            <div className="text-2xl font-semibold text-green-900">{stats.promoted}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-red-800 mb-1">Rejected</div>
            <div className="text-2xl font-semibold text-red-900">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by name, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter: Status */}
            <Select
              value={filterStatus === 'ALL' ? 'all' : filterStatus}
              onValueChange={(value) => setFilterStatus(value === 'all' ? 'ALL' : value as BankDataTriageStatus)}
            >
              <SelectTrigger className="w-[180px] focus:border-black focus:ring-1 focus:ring-black">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="RAW_NEW">New</SelectItem>
                <SelectItem value="PROMOTED_TO_LEAD">Promoted</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>

            {/* Filter: Channel */}
            <Select
              value={filterChannel === 'ALL' ? 'all' : filterChannel}
              onValueChange={(value) => setFilterChannel(value === 'all' ? 'ALL' : value as Channel)}
            >
              <SelectTrigger className="w-[180px] focus:border-black focus:ring-1 focus:ring-black">
                <SelectValue placeholder="All Channels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Channels</SelectItem>
                <SelectItem value="IG">Instagram</SelectItem>
                <SelectItem value="LINKEDIN">LinkedIn</SelectItem>
                <SelectItem value="WEBSITE">Website</SelectItem>
                <SelectItem value="EVENT">Event</SelectItem>
              </SelectContent>
            </Select>

            {/* Reset Button */}
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => {
                setSearchQuery('');
                setFilterStatus('ALL');
                setFilterChannel('ALL');
              }}
            >
              <Filter className="w-4 h-4" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bank Data Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Bank Data List</CardTitle>
            {canEdit && (
              <Button
                onClick={() => setShowManualLeadModal(true)}
                className="flex items-center gap-2 bg-black text-white hover:bg-gray-800"
              >
                <Plus className="w-4 h-4" />
                Create Manual Lead
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="px-6">
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-sm text-gray-600 font-medium">
                    <button
                      onClick={() => handleSort('date')}
                      className="flex items-center gap-1 hover:text-gray-900"
                    >
                      Submitted
                      {sortBy === 'date' && (
                        <ArrowUpDown className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="text-left px-6 py-3 text-sm text-gray-600 font-medium">
                    <button
                      onClick={() => handleSort('client')}
                      className="flex items-center gap-1 hover:text-gray-900"
                    >
                      Client Name
                      {sortBy === 'client' && (
                        <ArrowUpDown className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="text-left px-6 py-3 text-sm text-gray-600 font-medium">PIC / Contact</th>
                  <th className="text-left px-6 py-3 text-sm text-gray-600 font-medium">Source</th>
                  <th className="text-left px-6 py-3 text-sm text-gray-600 font-medium">Campaign</th>
                  <th className="text-left px-6 py-3 text-sm text-gray-600 font-medium">
                    <button
                      onClick={() => handleSort('status')}
                      className="flex items-center gap-1 hover:text-gray-900"
                    >
                      Status
                      {sortBy === 'status' && (
                        <ArrowUpDown className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="text-left px-6 py-3 text-sm text-gray-600 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No entries found
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((entry) => {
                    const statusBadge = getTriageStatusBadge(entry.triageStatus);
                    return (
                      <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {new Date(entry.submittedAt).toLocaleDateString('id-ID')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(entry.submittedAt).toLocaleTimeString('id-ID', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{entry.clientName}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{entry.picName}</div>
                          <div className="text-xs text-gray-500">{entry.email}</div>
                          <div className="text-xs text-gray-500">{entry.phone}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-700">{formatChannel(entry.sourceChannel)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {entry.campaignName}
                          </div>
                          {entry.topicTag && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded text-xs">
                              {entry.topicTag}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${statusBadge.color}`}>
                            {statusBadge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setSelectedEntry(entry)}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          {sortedData.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-white">
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  Showing {paginatedData.length} of {sortedData.length} entries
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
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <BankDataDetailModal
        entry={selectedEntry}
        open={!!selectedEntry}
        onClose={() => setSelectedEntry(null)}
        onUpdate={(updates) => {
          console.log('Update entry:', updates);
          // In real app: update state via service
          setSelectedEntry(null);
        }}
        onReject={(reason) => {
          console.log('Reject entry:', reason);
          // In real app: update state via service
          setSelectedEntry(null);
        }}
        onPromote={() => {
          if (onPromoteToLead && selectedEntry) {
            onPromoteToLead(selectedEntry.id);
          }
          setSelectedEntry(null);
        }}
        canEdit={canEdit}
      />

      {/* Create Manual Lead Modal */}
      <CreateManualLeadModal
        open={showManualLeadModal}
        onClose={() => setShowManualLeadModal(false)}
        onSuccess={(leadData) => {
          console.log('Manual lead created:', leadData);
          // In real app: create lead via service
          setShowManualLeadModal(false);
          alert('Manual lead created successfully!');
        }}
      />
    </div>
  );
}

