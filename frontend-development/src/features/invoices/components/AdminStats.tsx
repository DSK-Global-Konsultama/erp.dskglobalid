import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { DollarSign, AlertCircle, CheckCircle, Bell } from 'lucide-react';

interface AdminStatsProps {
  totalReceivables: number;
  totalPending: number;
  totalOverdue: number;
  amountOverdue: number;
  amountPaid: number;
  totalPaid: number;
  completedProjectsCount: number;
}

export function AdminStats({
  totalReceivables,
  totalPending,
  totalOverdue,
  amountOverdue,
  amountPaid,
  totalPaid,
  completedProjectsCount,
}: AdminStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm">Total Piutang</CardTitle>
          <DollarSign className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">{formatCurrency(totalReceivables)}</div>
          <p className="text-xs text-gray-500 mt-1">{totalPending + totalOverdue} payments pending</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm">Overdue Payments</CardTitle>
          <AlertCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold text-red-600">{totalOverdue}</div>
          <p className="text-xs text-gray-500 mt-1">{formatCurrency(amountOverdue)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm">Total Terbayar</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold text-green-600">{formatCurrency(amountPaid)}</div>
          <p className="text-xs text-gray-500 mt-1">{totalPaid} payments received</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm">Need Final Tagging</CardTitle>
          <Bell className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold text-yellow-600">{completedProjectsCount}</div>
          <p className="text-xs text-gray-500 mt-1">Project selesai</p>
        </CardContent>
      </Card>
    </div>
  );
}

