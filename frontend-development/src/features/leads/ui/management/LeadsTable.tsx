import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/table';
import { StatusChip } from '../shared/StatusChip';
import { deriveLeadTrackerRowMeta } from '../../model/selectors';
import type { Lead, Meeting, Notulensi, Proposal, EngagementLetter, Handover } from '../../../../lib/mock-data';
import type { CEOLead } from '../../../../lib/leadManagementMockData';

export interface LeadsTableProps {
  mode: 'view' | 'tracker';
  title: string;
  leads: Array<Lead | CEOLead>;
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

const formatChannelLabel = (ch?: string | null): string => {
  const normalized = String(ch || '').toUpperCase();
  const map: Record<string, string> = {
    INSTAGRAM: 'Instagram',
    IG: 'Instagram',
    LINKEDIN: 'LinkedIn',
    WEBSITE: 'Website',
    SEMINAR: 'Seminar',
    WEBINAR: 'Webinar',
    BREVET: 'Brevet',
    EVENT: 'Event',
  };
  return map[normalized] || (ch ? String(ch) : '-');
};

const getTrackerCreatedDate = (lead: Lead | CEOLead): string => {
  // backend: promotedAt is 'YYYY-MM-DD HH:mm:ss' (string)
  const promotedAt = (lead as any).promotedAt || (lead as any).promoted_at;
  const createdAt = (lead as any).createdAt || (lead as any).created_at;
  const createdDate = (lead as any).createdDate;
  return promotedAt || createdAt || createdDate || '';
};

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
                  const isBackendLead = (lead as any).sourceType && (lead as any).pipelineStatus;
                  const meta =
                    mode === 'tracker' && !isBackendLead
                      ? deriveLeadTrackerRowMeta(
                          lead as any,
                          meetings,
                          notulensi,
                          proposals,
                          engagementLetters,
                          handovers
                        )
                      : null;

                  const backendCommercialStage = (lead as any).commercialStage;
                  const backendActiveDocumentLabel = (lead as any).activeDocumentLabel;
                  const backendLastActivity = (lead as any).lastActivity;

                  return (
                    <TableRow
                      key={(lead as any).id}
                      className={onLeadClick ? 'cursor-pointer' : ''}
                      onClick={onLeadClick ? () => onLeadClick(String((lead as any).id)) : undefined}
                    >
                      <TableCell>
                        <span className="text-sm text-gray-700">{String((lead as any).id)}</span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">
                            {String((lead as any).company || (lead as any).sourceCampaignName || '-')}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">{String((lead as any).clientName || '-')}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-700">
                          {isBackendLead ? formatChannelLabel((lead as any).sourceChannel) : String((lead as any).source)}
                        </span>
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
                        </>
                      ) : mode === 'tracker' && isBackendLead ? (
                        <>
                          <TableCell>
                            <StatusChip status={String(backendCommercialStage || (lead as any).pipelineStatus || '-')} />
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-700">{String(backendActiveDocumentLabel || '-')}</span>
                          </TableCell>
                        </>
                      ) : (
                        <TableCell>
                          <StatusChip status={((lead as any) as Lead & { status?: string }).status || (lead as any).status} />
                        </TableCell>
                      )}
                      <TableCell>
                        <span className="text-sm text-gray-600">{formatDate(getTrackerCreatedDate(lead))}</span>
                      </TableCell>
                      {mode === 'tracker' && (
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {String(backendLastActivity || (lead as any).lastActivity || '-')}
                          </span>
                        </TableCell>
                      )}
                      {mode === 'view' && (
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {((lead as any) as Lead & { lastActivity?: string }).lastActivity ||
                              (((lead as any) as Lead).lastFollowUp
                                ? formatDate(((lead as any) as Lead).lastFollowUp as any)
                                : formatDate(((lead as any) as Lead).createdDate as any))}
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
