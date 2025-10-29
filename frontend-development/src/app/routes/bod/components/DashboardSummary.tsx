import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Users, TrendingUp, AlertCircle, Clock, DollarSign } from 'lucide-react';
import { mockLeads, mockDeals, mockProjects, mockInvoices } from '../../../../lib/mock-data';

export function DashboardSummary() {
  const totalLeads = mockLeads.length;
  const newLeads = mockLeads.filter(l => l.status === 'available').length;
  const followUpLeads = mockLeads.filter(l => l.status === 'follow-up').length;
  const missedLeads = mockLeads.filter(l => {
    if (l.status !== 'follow-up' || !l.lastFollowUp) return false;
    const daysSinceFollowUp = Math.floor(
      (new Date().getTime() - new Date(l.lastFollowUp).getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceFollowUp > 90;
  }).length;

  const totalDeals = mockDeals.length;
  const totalServices = mockDeals.reduce((sum, d) => sum + d.services.length, 0);

  const activeProjects = mockProjects.filter(p => p.status === 'in-progress').length;
  const waitingAssignment = mockProjects.filter(p => p.status === 'waiting-pm').length;
  const waitingPayment = mockProjects.filter(p => p.status === 'waiting-first-payment').length;

  const allPaymentTerms = mockInvoices.flatMap(inv => inv.paymentTerms);
  const pendingPayments = allPaymentTerms.filter(t => t.status === 'pending').length;
  const overduePayments = allPaymentTerms.filter(t => t.status === 'overdue').length;
  const totalPendingAmount = allPaymentTerms
    .filter(t => t.status === 'pending' || t.status === 'overdue')
    .reduce((sum, t) => sum + t.amount, 0);

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
          <div className="text-2xl font-semibold">{totalLeads}</div>
          <p className="text-xs text-gray-500 mt-1">
            {followUpLeads} sedang di-follow up
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Leads Belum Assign</CardTitle>
          <AlertCircle className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold text-orange-600">{newLeads}</div>
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
          <div className="text-2xl font-semibold text-red-600">{missedLeads}</div>
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
          <div className="text-2xl font-semibold">{totalServices}</div>
          <p className="text-xs text-gray-500 mt-1">
            dari {totalDeals} deals
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
          <Clock className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">{activeProjects}</div>
          <p className="text-xs text-gray-500 mt-1">
            {waitingAssignment} belum assign PM
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Waiting First Payment</CardTitle>
          <AlertCircle className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold text-orange-600">{waitingPayment}</div>
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
          <div className="text-2xl font-semibold">{pendingPayments + overduePayments}</div>
          <p className="text-xs text-red-500 mt-1">
            {overduePayments} overdue
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Piutang</CardTitle>
          <DollarSign className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">{formatCurrency(totalPendingAmount)}</div>
          <p className="text-xs text-gray-500 mt-1">
            Invoice yang belum dibayar
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

