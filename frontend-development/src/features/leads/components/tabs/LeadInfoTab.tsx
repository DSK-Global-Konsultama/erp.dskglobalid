import type { Lead } from '../../../../lib/mock-data';

interface LeadInfoTabProps {
  lead: Lead;
}

export function LeadInfoTab({ lead }: LeadInfoTabProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3>Lead Information</h3>
      </div>

      <div className="border rounded-lg p-4 border-gray-200 hover:border-gray-300 transition-all">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Client Name</p>
            <p className="font-medium">{lead.clientName || '-'}</p>
          </div>
          <div>
            <p className="text-gray-600">Company</p>
            <p className="font-medium">{lead.company || '-'}</p>
          </div>
          <div>
            <p className="text-gray-600">PIC Phone</p>
            <p className="font-medium">{lead.phone || '-'}</p>
          </div>
          <div>
            <p className="text-gray-600">PIC Email</p>
            <p className="font-medium">{lead.email || '-'}</p>
          </div>
          {(lead as any).service && (
            <div>
              <p className="text-gray-600">Service</p>
              <p className="font-medium">{(lead as any).service}</p>
            </div>
          )}
          <div>
            <p className="text-gray-600">Source</p>
            <p className="font-medium">{lead.source || '-'}</p>
          </div>
          <div>
            <p className="text-gray-600">Created By</p>
            <p className="font-medium">{lead.createdBy || '-'}</p>
          </div>
          <div>
            <p className="text-gray-600">Created At</p>
            <p className="font-medium">{formatDate(lead.createdDate)}</p>
          </div>
        </div>
      </div>

      {(lead as any).lastActivity && (
        <div className="border rounded-lg p-4 border-gray-200 hover:border-gray-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-900">Last Activity</h4>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">{(lead as any).lastActivity}</p>
          </div>
        </div>
      )}
    </div>
  );
}

