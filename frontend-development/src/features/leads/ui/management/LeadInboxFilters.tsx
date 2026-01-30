import { Search, Filter } from 'lucide-react';
import { Card, CardContent } from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import { Button } from '../../../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import type { CEOFollowUpStatus } from '../../../../lib/leadManagementTypes';

export interface LeadInboxFiltersProps {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  filterStatus: CEOFollowUpStatus | 'ALL';
  onFilterStatusChange: (value: CEOFollowUpStatus | 'ALL') => void;
  onReset: () => void;
}

export function LeadInboxFilters({
  searchQuery,
  onSearchQueryChange,
  filterStatus,
  onFilterStatusChange,
  onReset,
}: LeadInboxFiltersProps) {
  const selectValue = filterStatus === 'ALL' ? 'all' : filterStatus;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name, email..."
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select
            value={selectValue}
            onValueChange={(value) => onFilterStatusChange(value === 'all' ? 'ALL' : (value as CEOFollowUpStatus))}
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

          <Button variant="outline" className="flex items-center gap-2" onClick={onReset}>
            <Filter className="w-4 h-4" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
