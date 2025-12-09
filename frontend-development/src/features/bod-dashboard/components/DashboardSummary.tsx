import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Users, TrendingUp, AlertCircle, Clock, DollarSign } from 'lucide-react';
import { useBODStats } from '../hooks/useBODStats';

export function DashboardSummary() {
  const stats = useBODStats();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
          <Users className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">{stats.totalLeads}</div>
          <p className="text-xs text-gray-500 mt-1">
            {stats.followUpLeads} sedang di-follow up
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Leads Belum Assign</CardTitle>
          <AlertCircle className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold text-orange-600">{stats.availableLeads}</div>
          <p className="text-xs text-gray-500 mt-1">
            Perlu assign BD Executive
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Missed Follow Up</CardTitle>
          <AlertCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold text-red-600">{stats.missedLeads}</div>
          <p className="text-xs text-gray-500 mt-1">
            Lebih dari 3 bulan tidak di-follow up
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Layanan</CardTitle>
          <TrendingUp className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">{stats.totalServices}</div>
          <p className="text-xs text-gray-500 mt-1">
            dari {stats.totalDeals} deals
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
          <Clock className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">{stats.activeProjects}</div>
          <p className="text-xs text-gray-500 mt-1">
            {stats.waitingAssignment} belum assign PM
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Waiting First Payment</CardTitle>
          <AlertCircle className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold text-orange-600">{stats.waitingPayment}</div>
          <p className="text-xs text-gray-500 mt-1">
            Project belum bisa dimulai
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
          <DollarSign className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">{stats.pendingPayments + stats.overduePayments}</div>
          <p className="text-xs text-red-500 mt-1">
            {stats.overduePayments} overdue
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Piutang</CardTitle>
          <DollarSign className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">{formatCurrency(stats.totalPendingAmount)}</div>
          <p className="text-xs text-gray-500 mt-1">
            Invoice yang belum dibayar
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

