/**
 * CEO: Lead Inbox for Follow-Up Review
 * Shows leads that need CEO attention (promoted from Bank Data)
 */

import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { MoreVertical, CheckCircle, XCircle, Clock, Eye, Search, Filter, Inbox } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../../../../components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Button } from '../../../../components/ui/button';
import type { CEOFollowUpStatus } from '../../../../lib/leadManagementTypes';
import { mockCEOLeads, type CEOLead } from '../../../../lib/leadManagementMockData';
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

  const [leads, setLeads] = useState<CEOLead[]>(mockCEOLeads);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<CEOFollowUpStatus | 'ALL'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Filter leads
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.picName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'ALL' || lead.ceoFollowUpStatus === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus, itemsPerPage]);

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

  const newLeads = leads.filter(lead => lead.ceoFollowUpStatus === 'FOLLOWUP_PENDING');

  const getStatusBadge = (status: CEOFollowUpStatus) => {
    switch (status) {
      case 'FOLLOWUP_PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs border bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case 'FOLLOWED_UP':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs border bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="w-3 h-3" />
            Followed Up
          </span>
        );
      case 'DROP':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs border bg-red-100 text-red-800 border-red-200">
            <XCircle className="w-3 h-3" />
            Dropped
          </span>
        );
    }
  };

  const handleFollowUp = (leadId: string) => {
    const updatedLeads = leads.map(lead => {
      if (lead.id === leadId) {
        return {
          ...lead,
          ceoFollowUpStatus: 'FOLLOWED_UP' as CEOFollowUpStatus,
          ceoFollowUpDate: new Date().toISOString(),
        };
      }
      return lead;
    });
    setLeads(updatedLeads);
    setOpenMenuId(null);
    setMenuPosition(null);
    toast.success('Lead marked as Followed Up');
  };

  const handleDrop = (leadId: string) => {
    const updatedLeads = leads.map(lead => {
      if (lead.id === leadId) {
        return {
          ...lead,
          ceoFollowUpStatus: 'DROP' as CEOFollowUpStatus,
          ceoFollowUpDate: new Date().toISOString(),
        };
      }
      return lead;
    });
    setLeads(updatedLeads);
    setOpenMenuId(null);
    setMenuPosition(null);
    toast.success('Lead dropped');
  };

  const handleSeeDetail = (leadId: string) => {
    setOpenMenuId(null);
    setMenuPosition(null);
    toast.info(`Viewing details for lead ${leadId}`);
  };

  const handleMenuToggle = (leadId: string, button: HTMLButtonElement) => {
    if (openMenuId === leadId) {
      setOpenMenuId(null);
      setMenuPosition(null);
    } else {
      const rect = button.getBoundingClientRect();
      const menuWidth = 192; // w-48 = 192px
      setMenuPosition({
        top: rect.bottom + 4, // Position below the button
        left: rect.left - menuWidth, // Position to the left of button
      });
      setOpenMenuId(leadId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert for new leads */}
      {newLeads.length > 0 && (
        <Alert className="border-blue-500 bg-blue-50">
          <Inbox className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-900">Lead Baru!</AlertTitle>
          <AlertDescription className="text-blue-800">
            Ada {newLeads.length} lead baru menunggu review dari Anda. Segera review untuk mempercepat proses follow-up.
          </AlertDescription>
        </Alert>
      )}

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
              onValueChange={(value) => setFilterStatus(value === 'all' ? 'ALL' : value as CEOFollowUpStatus)}
            >
              <SelectTrigger className="w-[180px] focus:border-black focus:ring-1 focus:ring-black">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="FOLLOWUP_PENDING">Pending</SelectItem>
                <SelectItem value="FOLLOWED_UP">Followed Up</SelectItem>
                <SelectItem value="DROP">Dropped</SelectItem>
              </SelectContent>
            </Select>

            {/* Reset Button */}
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => {
                setSearchQuery('');
                setFilterStatus('ALL');
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
          <CardTitle>Lead Follow-Up Inbox</CardTitle>
        </CardHeader>
        <CardContent className="px-6">
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-sm text-gray-600 font-medium">Client</th>
                  <th className="text-left px-6 py-3 text-sm text-gray-600 font-medium">Contact</th>
                  <th className="text-left px-6 py-3 text-sm text-gray-600 font-medium">Source</th>
                  <th className="text-left px-6 py-3 text-sm text-gray-600 font-medium">Promoted</th>
                  <th className="text-left px-6 py-3 text-sm text-gray-600 font-medium">Status</th>
                  <th className="text-left px-6 py-3 text-sm text-gray-600 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedLeads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No leads found
                    </td>
                  </tr>
                ) : (
                  paginatedLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                      {/* Client: nama perusahaan */}
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{lead.clientName}</div>
                      </td>
                      
                      {/* Contact: nama pic, email, nomor */}
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{lead.picName}</div>
                        <div className="text-xs text-gray-500">{lead.email}</div>
                        <div className="text-xs text-gray-500">{lead.phone}</div>
                      </td>
                      
                      {/* Source */}
                      <td className="px-6 py-4">
                        {lead.sourceType === 'CAMPAIGN_FORM' ? (
                          <div>
                            <div className="text-sm text-gray-900 max-w-xs truncate">
                              {lead.sourceCampaignName}
                            </div>
                            {lead.topicTag && (
                              <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded text-xs">
                                {lead.topicTag}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-600 italic">Manual Entry</span>
                        )}
                      </td>
                      
                      {/* Promoted */}
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {new Date(lead.promotedAt).toLocaleDateString('id-ID')}
                        </div>
                        <div className="text-xs text-gray-500">by {lead.promotedBy}</div>
                      </td>
                      
                      {/* Status */}
                      <td className="px-6 py-4">
                        {getStatusBadge(lead.ceoFollowUpStatus)}
                      </td>
                      
                      {/* Action: menu dropdown 3 titik */}
                      <td className="px-6 py-4">
                        <div className="relative">
                          <button
                            ref={(el) => {
                              if (el) buttonRefs.current[lead.id] = el;
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (buttonRefs.current[lead.id]) {
                                handleMenuToggle(lead.id, buttonRefs.current[lead.id]);
                              }
                            }}
                            className="p-1.5 hover:bg-red-50 rounded transition-colors group"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-600 group-hover:text-red-600 transition-colors" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Dropdown Menu - rendered outside table for proper z-index */}
          {openMenuId && menuPosition && (
            <>
              {/* Backdrop to close menu */}
              <div
                className="fixed inset-0 z-[100]"
                onClick={() => {
                  setOpenMenuId(null);
                  setMenuPosition(null);
                }}
              />
              
              {/* Dropdown Menu - positioned to the right and above */}
              <div 
                className="fixed w-48 bg-white rounded-md shadow-lg border border-gray-200 z-[101]"
                style={{
                  top: `${menuPosition.top}px`,
                  left: `${menuPosition.left}px`,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="py-1">
                  <button
                    onClick={() => handleFollowUp(openMenuId)}
                    className="w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50 flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Followed-up
                  </button>
                  <button
                    onClick={() => handleDrop(openMenuId)}
                    className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4 text-red-600" />
                    Drop
                  </button>
                  <button
                    onClick={() => handleSeeDetail(openMenuId)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    See Detail
                  </button>
                </div>
              </div>
            </>
          )}
          
          {/* Pagination */}
          {filteredLeads.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-white">
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  Showing {paginatedLeads.length} of {filteredLeads.length} entries
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
    </div>
  );
}

