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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Client Name</label>
            <p className="font-medium">{lead.clientName}</p>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Company</label>
            <p className="font-medium">{lead.company}</p>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">PIC Phone</label>
            <p className="font-medium">{lead.phone}</p>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">PIC Email</label>
            <p className="font-medium">{lead.email}</p>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Source</label>
            <p className="font-medium">{lead.source}</p>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Created By</label>
            <p className="font-medium">{lead.createdBy}</p>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Created At</label>
            <p className="font-medium">{formatDate(lead.createdDate)}</p>
          </div>
        </div>
      </div>

      {(lead as any).lastActivity && (
        <div>
          <label className="block text-sm text-gray-600 mb-2">Last Activity</label>
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-gray-700">{(lead as any).lastActivity}</p>
          </div>
        </div>
      )}
    </div>
  );
}

