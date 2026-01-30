/**
 * CEO: Lead Inbox for Follow-Up Review
 * Shows leads that need CEO attention (promoted from Bank Data)
 */

import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Clock, Eye, Inbox } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../../../components/ui/alert';
import { LeadInboxFilters } from '../ui/management/LeadInboxFilters';
import { LeadInboxTable } from '../ui/management/LeadInboxTable';
import { LeadInboxPagination } from '../ui/management/LeadInboxPagination';
import type { CEOFollowUpStatus } from '../../../lib/leadManagementTypes';
import { mockCEOLeads, type CEOLead } from '../../../lib/leadManagementMockData';
import { authService } from '../../../services/authService';

export function LeadInboxPage() {
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

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.picName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || lead.ceoFollowUpStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus]);

  useEffect(() => {
    const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [filteredLeads.length, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLeads = filteredLeads.slice(startIndex, startIndex + itemsPerPage);

  const newLeads = leads.filter((lead) => lead.ceoFollowUpStatus === 'FOLLOWUP_PENDING');

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
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === leadId
          ? {
              ...lead,
              ceoFollowUpStatus: 'FOLLOWED_UP' as CEOFollowUpStatus,
              ceoFollowUpDate: new Date().toISOString(),
            }
          : lead
      )
    );
    setOpenMenuId(null);
    setMenuPosition(null);
    toast.success('Lead marked as Followed Up');
  };

  const handleDrop = (leadId: string) => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === leadId
          ? {
              ...lead,
              ceoFollowUpStatus: 'DROP' as CEOFollowUpStatus,
              ceoFollowUpDate: new Date().toISOString(),
            }
          : lead
      )
    );
    setOpenMenuId(null);
    setMenuPosition(null);
    toast.success('Lead dropped');
  };

  const handleSeeDetail = (leadId: string) => {
    setOpenMenuId(null);
    setMenuPosition(null);
    toast.info(`Viewing details for lead ${leadId}`);
  };

  const handleMenuToggle = (leadId: string, button: HTMLButtonElement | null) => {
    if (!button) return;
    if (openMenuId === leadId) {
      setOpenMenuId(null);
      setMenuPosition(null);
    } else {
      const rect = button.getBoundingClientRect();
      const menuWidth = 192;
      setMenuPosition({
        top: rect.bottom + 4,
        left: rect.left - menuWidth,
      });
      setOpenMenuId(leadId);
    }
  };

  const handleActionButtonRef = (leadId: string, el: HTMLButtonElement | null) => {
    if (el) buttonRefs.current[leadId] = el;
  };

  const handleActionClick = (leadId: string) => {
    handleMenuToggle(leadId, buttonRefs.current[leadId] ?? null);
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

      <LeadInboxFilters
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        filterStatus={filterStatus}
        onFilterStatusChange={setFilterStatus}
        onReset={() => {
          setSearchQuery('');
          setFilterStatus('ALL');
          setCurrentPage(1);
        }}
      />

      <LeadInboxTable
        title="Lead Follow-Up Inbox"
        leads={paginatedLeads}
        renderStatusBadge={getStatusBadge}
        onActionButtonRef={handleActionButtonRef}
        onActionClick={handleActionClick}
        pagination={
          filteredLeads.length > 0 ? (
            <LeadInboxPagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={filteredLeads.length}
              paginatedItemsCount={paginatedLeads.length}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          ) : undefined
        }
      />

      {openMenuId && menuPosition && (
        <>
          <div
            className="fixed inset-0 z-[100]"
            aria-hidden
            onClick={() => {
              setOpenMenuId(null);
              setMenuPosition(null);
            }}
          />
          <div
            className="fixed w-48 bg-white rounded-md shadow-lg border border-gray-200 z-[101]"
            style={{ top: `${menuPosition.top}px`, left: `${menuPosition.left}px` }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="py-1">
              <button
                type="button"
                onClick={() => handleFollowUp(openMenuId)}
                className="w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50 flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4 text-green-600" />
                Followed-up
              </button>
              <button
                type="button"
                onClick={() => handleDrop(openMenuId)}
                className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 flex items-center gap-2"
              >
                <XCircle className="w-4 h-4 text-red-600" />
                Drop
              </button>
              <button
                type="button"
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
    </div>
  );
}
