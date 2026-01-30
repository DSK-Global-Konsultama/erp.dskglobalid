import { Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/table';
import { StatusChip } from '../shared/StatusChip';
import { deriveLeadTrackerRowMeta } from '../../model/selectors';
import type { Lead, Meeting, Notulensi, Proposal, EngagementLetter, Handover } from '../../../../lib/mock-data';

export interface LeadsTableProps {
  mode: 'view' | 'tracker';
  title: string;
  leads: Lead[];
  meetings: Meeting[];
  notulensi: Notulensi[];
  proposals: Proposal[];
  engagementLetters: EngagementLetter[];
  handovers: Handover[];
  onLeadClick?: (leadId: string) => void;
  formatDate: (dateString: string) => string;
  /** Optional pagination UI to render below the table (same card) */
  pagination?: React.ReactNode;
}

export function LeadsTable({
  mode,
  title,
  leads,
  meetings,
  notulensi,
  proposals,
  engagementLetters,
  handovers,
  onLeadClick,
  formatDate,
  pagination,
}: LeadsTableProps) {
  const colSpan = mode === 'tracker' ? 8 : 6;

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
                <TableHead>ID</TableHead>
                <TableHead>Client Info</TableHead>
                <TableHead>Source</TableHead>
                {mode === 'tracker' && (
                  <>
                    <TableHead>Commercial Stage</TableHead>
                    <TableHead>Active Document</TableHead>
                    <TableHead>Handover Status</TableHead>
                  </>
                )}
                {mode !== 'tracker' && <TableHead>Status</TableHead>}
                <TableHead>Created At</TableHead>
                {(mode === 'tracker' || mode === 'view') && <TableHead>Last Activity</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={colSpan} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <p className="text-sm font-medium">Belum ada data lead</p>
                      <p className="text-xs mt-1">Tidak ada lead di sistem</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                leads.map((lead) => {
                  const meta =
                    mode === 'tracker'
                      ? deriveLeadTrackerRowMeta(
                          lead,
                          meetings,
                          notulensi,
                          proposals,
                          engagementLetters,
                          handovers
                        )
                      : null;

                  return (
                    <TableRow
                      key={lead.id}
                      className={onLeadClick ? 'cursor-pointer' : ''}
                      onClick={onLeadClick ? () => onLeadClick(lead.id) : undefined}
                    >
                      <TableCell>
                        <span className="text-sm text-gray-700">{lead.id}</span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">{lead.company}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{lead.clientName}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-700">{lead.source}</span>
                      </TableCell>
                      {mode === 'tracker' && meta ? (
                        <>
                          <TableCell>
                            <StatusChip status={meta.commercialStage} />
                          </TableCell>
                          <TableCell>
                            {(() => {
                              const parts = meta.activeDocumentLabel.split(' • ');
                              const document = parts[0];
                              const substatus = parts[1] || '';
                              return (
                                <div className="flex flex-col gap-1">
                                  <span className="text-sm font-medium text-gray-900">{document}</span>
                                  {substatus && <span className="text-xs text-gray-600">{substatus}</span>}
                                </div>
                              );
                            })()}
                          </TableCell>
                          <TableCell>
                            {meta.handoverStatus === 'LOCKED' ? (
                              <div className="flex items-center gap-1 text-xs text-gray-400">
                                <Lock className="w-3 h-3" />
                                <span>LOCKED</span>
                              </div>
                            ) : (
                              <StatusChip status={meta.handoverStatus} />
                            )}
                          </TableCell>
                        </>
                      ) : (
                        <TableCell>
                          <StatusChip status={(lead as Lead & { status?: string }).status || lead.status} />
                        </TableCell>
                      )}
                      <TableCell>
                        <span className="text-sm text-gray-600">{formatDate(lead.createdDate)}</span>
                      </TableCell>
                      {mode === 'tracker' && (
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {(lead as Lead & { lastActivity?: string }).lastActivity || '-'}
                          </span>
                        </TableCell>
                      )}
                      {mode === 'view' && (
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {(lead as Lead & { lastActivity?: string }).lastActivity ||
                              (lead.lastFollowUp ? formatDate(lead.lastFollowUp) : formatDate(lead.createdDate))}
                          </span>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
        {pagination}
      </CardContent>
    </Card>
  );
}
