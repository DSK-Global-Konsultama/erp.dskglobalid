import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { mockDeals } from '../../../lib/mock-data';
import { CheckCircle, Clock, FileText } from 'lucide-react';

interface DealsManagementProps {
  userRole: 'BOD' | 'BD-Executive';
  userName: string;
}

export function DealsManagement({ userRole, userName }: DealsManagementProps) {
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

  const getProposalStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      draft: 'outline',
      submitted: 'secondary',
      approved: 'default',
    };
    return <Badge variant={variants[status] || 'default'}>{status.toUpperCase()}</Badge>;
  };

  const getELStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      draft: 'outline',
      submitted: 'secondary',
      approved: 'default',
    };
    return <Badge variant={variants[status] || 'default'}>{status.toUpperCase()}</Badge>;
  };

  let displayDeals = mockDeals;
  if (userRole === 'BD-Executive') {
    displayDeals = mockDeals.filter(d => d.bdExecutive === userName);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          {userRole === 'BOD' ? 'Deals Management' : 'My Deals'}
        </h2>
        <p className="text-gray-500">Manage proposals and engagement letters</p>
      </div>

      <div className="space-y-4">
        {displayDeals.map(deal => (
          <Card key={deal.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{deal.clientName}</CardTitle>
                  <CardDescription>{deal.company} • BD: {deal.bdExecutive}</CardDescription>
                </div>
                {getProposalStatusBadge(deal.proposalStatus)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Services */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Services:</p>
                <div className="space-y-2">
                  {deal.services.map(service => (
                    <div key={service.id} className="flex items-start justify-between border-l-2 border-gray-200 pl-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{service.name}</p>
                        <p className="text-xs text-gray-500">{service.description}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatCurrency(service.estimatedValue)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-2 border-t pt-3">
                  <p className="text-sm font-bold text-gray-900">Total: {formatCurrency(deal.totalDealValue)}</p>
                </div>
              </div>

              {/* EL Status */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Engagement Letters:</p>
                <div className="space-y-2">
                  {deal.els.map(el => (
                    <div key={el.id} className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-sm">EL {el.id}</p>
                        {el.serviceIds.length === 1 && (
                          <p className="text-xs text-gray-500">
                            Service: {deal.services.find(s => s.id === el.serviceIds[0])?.name}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {getELStatusBadge(el.status)}
                        {el.status === 'submitted' && (
                          <Clock className="w-4 h-4 text-orange-500" />
                        )}
                        {el.status === 'approved' && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Client Needs */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Client Needs:</p>
                <p className="text-xs text-gray-600">{deal.clientNeeds}</p>
              </div>

              {/* Dates */}
              <div className="flex gap-4 text-xs text-gray-500">
                <p>Created: {formatDate(deal.createdDate)}</p>
                {deal.proposalApprovedDate && (
                  <p>Approved: {formatDate(deal.proposalApprovedDate)}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

