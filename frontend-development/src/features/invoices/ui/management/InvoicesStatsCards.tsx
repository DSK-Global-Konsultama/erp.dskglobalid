import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import type { InvoiceStats } from '../../model/selectors';

interface InvoicesStatsCardsProps {
  stats: InvoiceStats;
  formatCurrency: (amount: number) => string;
}

export function InvoicesStatsCards({ stats, formatCurrency }: InvoicesStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm">Pending Payments</CardTitle>
          <Clock className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">{stats.totalPending}</div>
          <p className="text-xs text-gray-500 mt-1">{formatCurrency(stats.amountPending)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm">Overdue Payments</CardTitle>
          <AlertCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold text-red-600">{stats.totalOverdue}</div>
          <p className="text-xs text-gray-500 mt-1">{formatCurrency(stats.amountOverdue)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm">Paid</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold text-green-600">{stats.totalPaid}</div>
          <p className="text-xs text-gray-500 mt-1">{formatCurrency(stats.amountPaid)}</p>
        </CardContent>
      </Card>
    </div>
  );
}
