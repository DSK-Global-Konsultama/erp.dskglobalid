import { useState, useEffect } from 'react';
import { leadApi } from '../api/leadApi';
import { deriveLeadTrackerRowMeta } from '../model/selectors';
import { LeadsFilters } from '../ui/management/LeadsFilters';
import { LeadsTable } from '../ui/management/LeadsTable';
import { LeadsPagination } from '../ui/management/LeadsPagination';
import type { Lead } from '../../../lib/mock-data';
import type { CEOLead } from '../../../lib/leadManagementMockData';

interface LeadsManagementPageProps {
  userName: string;
  mode: 'view' | 'tracker';
  title?: string;
  onLeadClick?: (leadId: string) => void;
  /** Optional override lead list (e.g. from backend). When provided, component won't use mock generator. */
  leadsOverride?: CEOLead[];
}

const RELEVANT_STATUSES = [
  // meeting
  'MEETING_NOT_STARTED',
  'MEETING_SCHEDULED',
  // notulen
  'NOTULEN_NOT_STARTED',
  'NOTULEN_DRAFT',
  'NOTULEN_WAITING_CEO_APPROVAL',
  'NOTULEN_REVISION',
  'NOTULEN_APPROVED',
  // proposal
  'PROPOSAL_NOT_STARTED',
  'PROPOSAL_DRAFT',
  'PROPOSAL_WAITING_CEO_APPROVAL',
  'PROPOSAL_REVISION',
  'PROPOSAL_APPROVED',
  'PROPOSAL_SENT_TO_CLIENT',
  'PROPOSAL_ACCEPTED',
  // EL
  'EL_NOT_UPLOADED',
  'EL_WAITING_CEO_APPROVAL',
  'EL_REVISION',
  'EL_APPROVED',
  'EL_SENT_TO_CLIENT',
  'EL_SIGNED',
  // handover
  'HANDOVER_LOCKED',
  'HANDOVER_NOT_STARTED',
  'HANDOVER_DRAFT',
  'HANDOVER_WAITING_CEO_APPROVAL',
  'HANDOVER_REVISION',
  'HANDOVER_APPROVED',
];

export function LeadsManagementPage({ userName: _userName, mode, title, onLeadClick, leadsOverride }: LeadsManagementPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCommercialStage, setFilterCommercialStage] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const { leads: defaultLeads, meetings, notulensi, proposals, engagementLetters, handovers, leadSources } =
    leadApi.getTrackerData('Sarah Wijaya');

  const [leads] = useState<Lead[]>(() =>
    defaultLeads.filter((lead) => RELEVANT_STATUSES.includes((lead as Lead & { status?: string }).status))
  );
  const useBackendTracker = mode === 'tracker' && Array.isArray(leadsOverride);
  const myLeads: Array<Lead | CEOLead> = useBackendTracker ? (leadsOverride as CEOLead[]) : leads;

  const filteredLeads = (myLeads as Array<Lead | CEOLead>).filter((lead: Lead | CEOLead) => {
    const matchesSearch =
      String((lead as any).company || (lead as any).sourceCampaignName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String((lead as any).clientName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSource =
      mode === 'tracker' ? true : filterSource === 'all' || (lead as any).source === filterSource;
    const matchesStatus = filterStatus === 'all' || (lead as Lead & { status?: string }).status === filterStatus;
    const matchesService =
      mode === 'tracker' ? (serviceFilter === 'all' || (lead as Lead & { service?: string }).service === serviceFilter) : true;

    // Backend tracker list belum memiliki data meeting/notulen/proposal/EL/handover,
    // jadi filter stage hanya aktif untuk mock tracker.
    let matchesCommercialStage = true;
    if (mode === 'tracker' && !useBackendTracker) {
      const meta = deriveLeadTrackerRowMeta(
        lead as any,
        meetings,
        notulensi,
        proposals,
        engagementLetters,
        handovers
      );
      matchesCommercialStage = filterCommercialStage === 'all' || meta.commercialStage === filterCommercialStage;
    }

    return (
      matchesSearch &&
      matchesSource &&
      matchesStatus &&
      matchesService &&
      matchesCommercialStage
    );
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterSource, filterStatus, serviceFilter, filterCommercialStage]);

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
      ? (['all', ...Array.from(
          new Set(
            (myLeads as Array<Lead | CEOLead>)
              .map((l: Lead | CEOLead) => (l as any).service)
              .filter((s: unknown): s is string => typeof s === 'string' && Boolean(s))
          )
        )] as string[])
      : [];
  const leadSourcesList: string[] = Array.isArray(leadSources) ? [...leadSources] : [];

  const handleReset = () => {
    setSearchTerm('');
    setFilterSource('all');
    setFilterStatus('all');
    setFilterCommercialStage('all');
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
        serviceFilter={serviceFilter}
        onServiceFilterChange={setServiceFilter}
        onReset={handleReset}
        leadSources={leadSourcesList}
        services={services}
      />

      <LeadsTable
        mode={mode}
        title={displayTitle}
        leads={paginatedLeads as any}
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
