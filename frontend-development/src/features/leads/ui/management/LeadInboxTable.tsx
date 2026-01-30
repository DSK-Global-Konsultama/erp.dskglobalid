import { MoreVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/table';
import type { CEOLead } from '../../../../lib/leadManagementMockData';
import type { CEOFollowUpStatus } from '../../../../lib/leadManagementTypes';

export interface LeadInboxTableProps {
  title: string;
  leads: CEOLead[];
  renderStatusBadge: (status: CEOFollowUpStatus) => React.ReactNode;
  onActionButtonRef: (leadId: string, el: HTMLButtonElement | null) => void;
  onActionClick: (leadId: string) => void;
  pagination?: React.ReactNode;
}

export function LeadInboxTable({
  title,
  leads,
  renderStatusBadge,
  onActionButtonRef,
  onActionClick,
  pagination,
}: LeadInboxTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-6">
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Promoted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <p className="text-sm font-medium">Belum ada data lead</p>
                      <p className="text-xs mt-1">Tidak ada lead di inbox</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                leads.map((lead) => (
                  <TableRow key={lead.id} className="transition-colors">
                    <TableCell>
                      <p className="font-medium text-gray-900">{lead.clientName}</p>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{lead.picName}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{lead.email}</p>
                        <p className="text-xs text-gray-500">{lead.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {lead.sourceType === 'CAMPAIGN_FORM' ? (
                        <div>
                          <p className="text-sm text-gray-900 max-w-xs truncate">
                            {lead.sourceCampaignName}
                          </p>
                          {lead.topicTag && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded text-xs">
                              {lead.topicTag}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-600 italic">Manual Entry</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm text-gray-900">
                          {new Date(lead.promotedAt).toLocaleDateString('id-ID')}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">by {lead.promotedBy}</p>
                      </div>
                    </TableCell>
                    <TableCell>{renderStatusBadge(lead.ceoFollowUpStatus)}</TableCell>
                    <TableCell>
                      <button
                        type="button"
                        ref={(el) => onActionButtonRef(lead.id, el)}
                        onClick={(e) => {
                          e.stopPropagation();
                          onActionClick(lead.id);
                        }}
                        className="p-1.5 hover:bg-red-50 rounded transition-colors group"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-600 group-hover:text-red-600 transition-colors" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {pagination}
      </CardContent>
    </Card>
  );
}
