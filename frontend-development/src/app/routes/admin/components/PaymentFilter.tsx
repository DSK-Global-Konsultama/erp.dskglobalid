import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Label } from '../../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';

interface PaymentFilterProps {
  filterStatus: string;
  onFilterChange: (status: string) => void;
}

export function PaymentFilter({ filterStatus, onFilterChange }: PaymentFilterProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filter Payment</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-64">
          <Label>Status</Label>
          <Select value={filterStatus} onValueChange={onFilterChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

