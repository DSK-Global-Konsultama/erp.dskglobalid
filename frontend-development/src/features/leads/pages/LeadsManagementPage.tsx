import { useState, useEffect } from 'react';
import { leadApi } from '../api/leadApi';
import { deriveLeadTrackerRowMeta } from '../model/selectors';
import { LeadsFilters } from '../ui/management/LeadsFilters';
import { LeadsTable } from '../ui/management/LeadsTable';
import { LeadsPagination } from '../ui/management/LeadsPagination';
import type { Lead } from '../../../lib/mock-data';

interface LeadsManagementPageProps {
  userName: string;
  mode: 'view' | 'tracker';
  title?: string;
  onLeadClick?: (leadId: string) => void;
}

const RELEVANT_STATUSES = [
  'TO_BE_MEET', 'MEETING_SCHEDULED', 'NEED_NOTULEN', 'NOTULEN_SUBMITTED', 'NOTULEN_APPROVED',
  'NEED_PROPOSAL', 'IN_PROPOSAL', 'PROPOSAL_APPROVED', 'PROPOSAL_SENT', 'PROPOSAL_ACCEPTED',
  'PROPOSAL_EXPIRED', 'NEED_EL', 'EL_SUBMITTED', 'EL_APPROVED', 'EL_SENT', 'EL_SIGNED',
  'NEED_HANDOVER', 'IN_HANDOVER', 'HANDOVER_SUBMITTED', 'HANDOVER_APPROVED', 'HANDOVER_SENT_TO_PM',
  'DONE', 'DEAL_WON',
];

export function LeadsManagementPage({ userName: _userName, mode, title, onLeadClick }: LeadsManagementPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCommercialStage, setFilterCommercialStage] = useState<string>('all');
  const [filterHandoverStatus, setFilterHandoverStatus] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const { leads: defaultLeads, meetings, notulensi, proposals, engagementLetters, handovers, leadSources } =
    leadApi.getTrackerData('Sarah Wijaya');

  const [leads] = useState<Lead[]>(() =>
    defaultLeads.filter((lead) => RELEVANT_STATUSES.includes((lead as Lead & { status?: string }).status))
  );
  const myLeads = leads;

  const filteredLeads = myLeads.filter((lead) => {
    const matchesSearch =
      lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSource =
      mode === 'tracker' ? true : filterSource === 'all' || lead.source === filterSource;
    const matchesStatus = filterStatus === 'all' || (lead as Lead & { status?: string }).status === filterStatus;
    const matchesService =
      mode === 'tracker' ? (serviceFilter === 'all' || (lead as Lead & { service?: string }).service === serviceFilter) : true;

    let matchesCommercialStage = true;
    let matchesHandoverStatus = true;
    if (mode === 'tracker') {
      const meta = deriveLeadTrackerRowMeta(
        lead,
        meetings,
        notulensi,
        proposals,
        engagementLetters,
        handovers
      );
      matchesCommercialStage = filterCommercialStage === 'all' || meta.commercialStage === filterCommercialStage;
      matchesHandoverStatus = filterHandoverStatus === 'all' || meta.handoverStatus === filterHandoverStatus;
    }

    return (
      matchesSearch &&
      matchesSource &&
      matchesStatus &&
      matchesService &&
      matchesCommercialStage &&
      matchesHandoverStatus
    );
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterSource, filterStatus, serviceFilter, filterCommercialStage, filterHandoverStatus]);

  useEffect(() => {
    const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(totalPages);
  }, [filteredLeads.length, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLeads = filteredLeads.slice(startIndex, startIndex + itemsPerPage);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const displayTitle = title ?? (mode === 'tracker' ? 'Lead Tracker' : 'Semua Lead');
  const services: string[] =
    mode === 'tracker'
      ? ['all', ...Array.from(new Set(myLeads.map((l) => (l as Lead & { service?: string }).service).filter((s): s is string => Boolean(s))))]
      : [];
  const leadSourcesList: string[] = Array.isArray(leadSources) ? [...leadSources] : [];

  const handleReset = () => {
    setSearchTerm('');
    setFilterSource('all');
    setFilterStatus('all');
    setFilterCommercialStage('all');
    setFilterHandoverStatus('all');
    setServiceFilter('all');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <LeadsFilters
        mode={mode}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        filterSource={filterSource}
        onFilterSourceChange={setFilterSource}
        filterStatus={filterStatus}
        onFilterStatusChange={setFilterStatus}
        filterCommercialStage={filterCommercialStage}
        onFilterCommercialStageChange={setFilterCommercialStage}
        filterHandoverStatus={filterHandoverStatus}
        onFilterHandoverStatusChange={setFilterHandoverStatus}
        serviceFilter={serviceFilter}
        onServiceFilterChange={setServiceFilter}
        onReset={handleReset}
        leadSources={leadSourcesList}
        services={services}
      />

      <LeadsTable
        mode={mode}
        title={displayTitle}
        leads={paginatedLeads}
        meetings={meetings}
        notulensi={notulensi}
        proposals={proposals}
        engagementLetters={engagementLetters}
        handovers={handovers}
        onLeadClick={onLeadClick}
        formatDate={formatDate}
        pagination={
          filteredLeads.length > 0 ? (
            <LeadsPagination
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
    </div>
  );
}
