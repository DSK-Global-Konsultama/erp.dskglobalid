import { Search } from 'lucide-react';
import { Card, CardContent } from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import { Button } from '../../../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';

export interface InvoicesFiltersProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  filterStatus: string;
  onFilterStatusChange: (value: string) => void;
  filterService: string;
  onFilterServiceChange: (value: string) => void;
  onReset: () => void;
}

export function InvoicesFilters({
  searchTerm,
  onSearchTermChange,
  filterStatus,
  onFilterStatusChange,
  filterService,
  onFilterServiceChange,
  onReset,
}: InvoicesFiltersProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Cari invoice ID atau client..."
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterStatus} onValueChange={onFilterStatusChange}>
            <SelectTrigger className="w-full sm:w-[180px] focus:border-black focus:ring-1 focus:ring-black">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterService} onValueChange={onFilterServiceChange}>
            <SelectTrigger className="w-full sm:w-[200px] focus:border-black focus:ring-1 focus:ring-black">
              <SelectValue placeholder="Filter Layanan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Layanan</SelectItem>
              <SelectItem value="Web Dev">Web Dev</SelectItem>
              <SelectItem value="Audit and Assurance">Audit and Assurance</SelectItem>
              <SelectItem value="Tax Compliance">Tax Compliance</SelectItem>
              <SelectItem value="Tax Dispute">Tax Dispute</SelectItem>
              <SelectItem value="Transfer Pricing">Transfer Pricing</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={onReset}>
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
