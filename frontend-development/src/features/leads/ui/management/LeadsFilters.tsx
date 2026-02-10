import { Search, Filter } from 'lucide-react';
import { Card, CardContent } from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import { Button } from '../../../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';

export interface LeadsFiltersProps {
  mode: 'view' | 'tracker';
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  filterSource: string;
  onFilterSourceChange: (value: string) => void;
  filterStatus: string;
  onFilterStatusChange: (value: string) => void;
  filterCommercialStage: string;
  onFilterCommercialStageChange: (value: string) => void;
  filterHandoverStatus: string;
  onFilterHandoverStatusChange: (value: string) => void;
  serviceFilter: string;
  onServiceFilterChange: (value: string) => void;
  onReset: () => void;
  leadSources: string[];
  services: string[];
}

export function LeadsFilters({
  mode,
  searchTerm,
  onSearchTermChange,
  filterSource,
  onFilterSourceChange,
  filterStatus,
  onFilterStatusChange,
  filterCommercialStage,
  onFilterCommercialStageChange,
  filterHandoverStatus,
  onFilterHandoverStatusChange,
  serviceFilter,
  onServiceFilterChange,
  onReset,
  leadSources,
  services,
}: LeadsFiltersProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className={mode === 'tracker' ? 'grid grid-cols-1 md:grid-cols-4 gap-4' : 'flex gap-4'}>
          <div className={mode === 'tracker' ? 'relative' : 'flex-1 relative'}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder={mode === 'tracker' ? 'Search by client or PIC...' : 'Search by client or PIC name...'}
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              className="pl-10"
            />
          </div>
          {mode === 'tracker' ? (
            <>
              <Select value={filterCommercialStage} onValueChange={onFilterCommercialStageChange}>
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
              <Select value={filterHandoverStatus} onValueChange={onFilterHandoverStatusChange}>
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
                  <SelectItem value="CONVERTED">Converted</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Select value={serviceFilter} onValueChange={onServiceFilterChange}>
                  <SelectTrigger className="flex-1 focus:border-black focus:ring-1 focus:ring-black">
                    <SelectValue placeholder="All Services" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service} value={service}>
                        {service === 'all' ? 'All Services' : service}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" className="flex items-center gap-2" onClick={onReset}>
                  <Filter className="w-4 h-4" />
                  Reset
                </Button>
              </div>
            </>
          ) : (
            <>
              <Select value={filterSource} onValueChange={onFilterSourceChange}>
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
              <Select value={filterStatus} onValueChange={onFilterStatusChange}>
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
              <Button variant="outline" className="flex items-center gap-2" onClick={onReset}>
                <Filter className="w-4 h-4" />
                Reset
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
