import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { mockLeads } from '../../../../lib/mock-data';

export function LeadsSection() {
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

  const recentLeads = [...mockLeads]
    .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
    .slice(0, 5);

  return (
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
  );
}

