import { Badge } from '../../../components/ui/badge';
import type { Lead } from '../../../lib/mock-data';
import { Package } from 'lucide-react';

interface LeadsTableProps {
  leads: Lead[];
  showClaimedBy?: boolean;
  showCreatedBy?: boolean;
}

export function LeadsTable({ leads, showClaimedBy = false, showCreatedBy = false }: LeadsTableProps) {
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
      claimed: 'secondary',
      'follow-up': 'outline',
      deal: 'outline',
      lost: 'destructive',
    };
    const classNameMap: Record<string, string> = {
      'follow-up': 'bg-yellow-50 text-yellow-700 border-yellow-400',
      'deal': 'bg-green-50 text-green-700 border-green-500',
    };
    return <Badge variant={variants[status] || 'default'} className={classNameMap[status]}>{status.toUpperCase()}</Badge>;
  };

  return (
    <div className="space-y-4">
      {leads.map(lead => (
        <div key={lead.id} className="flex items-start justify-between border-b pb-4 last:border-0">
          <div className="flex-1">
            <div className="flex items-start gap-3">
              <Package className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">{lead.clientName}</p>
                <p className="text-xs text-gray-500">{lead.company}</p>
                <p className="text-xs text-gray-400 mt-1">{lead.email} • {lead.phone}</p>
                <p className="text-xs text-gray-400 mt-1">Source: {lead.source}</p>
                <p className="text-xs text-gray-500 mt-2">{lead.notes}</p>
                <p className="text-xs text-gray-400 mt-1">Created: {formatDate(lead.createdDate)}</p>
                {lead.claimedDate && (
                  <p className="text-xs text-gray-400">Claimed: {formatDate(lead.claimedDate)}</p>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            {getStatusBadge(lead.status)}
            {showCreatedBy && <p className="text-xs text-gray-500 mt-1">Created by: {lead.createdBy}</p>}
            {showClaimedBy && lead.claimedBy && (
              <p className="text-xs text-gray-500 mt-1">BD: {lead.claimedBy}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

