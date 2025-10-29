import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { mockLeads, mockDeals, mockProjects, mockInvoices } from '../lib/mock-data';
import { Users, TrendingUp, AlertCircle, Clock, DollarSign } from 'lucide-react';

export function Dashboard() {
  // Statistics
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

  // Recent activities
  const recentLeads = [...mockLeads]
    .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
    .slice(0, 5);

  const projectsNearDueDate = [...mockProjects]
    .filter(p => p.status === 'in-progress')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      available: 'default',
      'follow-up': 'secondary',
      deal: 'outline',
      lost: 'destructive',
    };
    return <Badge variant={variants[status] || 'default'}>{status.toUpperCase()}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Dashboard BOD</h2>
        <p className="text-gray-500">Monitoring Business Development & Project Management</p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLeads}</div>
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
            <div className="text-2xl font-bold text-orange-600">{newLeads}</div>
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
            <div className="text-2xl font-bold text-red-600">{missedLeads}</div>
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
            <div className="text-2xl font-bold">{totalServices}</div>
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
            <div className="text-2xl font-bold">{activeProjects}</div>
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
            <div className="text-2xl font-bold text-orange-600">{waitingPayment}</div>
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
            <div className="text-2xl font-bold">{pendingPayments + overduePayments}</div>
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
            <div className="text-2xl font-bold">{formatCurrency(totalPendingAmount)}</div>
            <p className="text-xs text-gray-500 mt-1">
              Invoice yang belum dibayar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Leads</CardTitle>
            <CardDescription>5 leads terbaru yang masuk</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentLeads.map(lead => (
                <div key={lead.id} className="flex items-start justify-between border-b pb-3 last:border-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{lead.clientName}</p>
                    <p className="text-xs text-gray-500">{lead.company}</p>
                    <p className="text-xs text-gray-400 mt-1">BD: {lead.claimedBy || 'Belum assign'}</p>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(lead.status)}
                    <p className="text-xs text-gray-400 mt-1">{formatDate(lead.createdDate)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Projects Due Date</CardTitle>
            <CardDescription>Project yang sedang berjalan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projectsNearDueDate.length > 0 ? (
                projectsNearDueDate.map(project => {
                  const daysUntilDue = Math.floor(
                    (new Date(project.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                  );
                  const isUrgent = daysUntilDue <= 7;

                  return (
                    <div key={project.id} className="flex items-start justify-between border-b pb-3 last:border-0">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{project.projectName}</p>
                        <p className="text-xs text-gray-500">{project.clientName}</p>
                        <p className="text-xs text-gray-400 mt-1">PM: {project.assignedPM || 'Belum assign'}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={isUrgent ? 'destructive' : 'secondary'}>
                          {daysUntilDue > 0 ? `${daysUntilDue} hari lagi` : 'Overdue'}
                        </Badge>
                        <p className="text-xs text-gray-400 mt-1">{formatDate(project.dueDate)}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-500">Tidak ada project yang sedang berjalan</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

