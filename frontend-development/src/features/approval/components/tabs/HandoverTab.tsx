import { useState } from 'react';
import { Eye } from 'lucide-react';
import { Card, CardContent } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { StatusChip } from '../../../leads';
import { CeoHandoverPage } from '../../../handover';
import type { Handover, Lead, Proposal, EngagementLetter } from '../../../../lib/mock-data';
import type { ExtendedHandover } from '../../../../lib/projectWorkflowTypes';

interface HandoverTabProps {
  handovers: Handover[];
  leads?: Lead[];
  proposals?: Proposal[];
  engagementLetters?: EngagementLetter[];
  onUpdateHandover: (id: string, updates: Partial<Handover>) => void;
}

export function HandoverTab({ handovers, leads = [], proposals = [], engagementLetters = [], onUpdateHandover }: HandoverTabProps) {
  const [viewingHandover, setViewingHandover] = useState<ExtendedHandover | undefined>(undefined);

  // If viewing a handover, show the CEO view
  if (viewingHandover) {
    const lead = leads.find(l => l.id === viewingHandover.leadId);
    const proposal = proposals.find(p => p.leadId === viewingHandover.leadId);
    const engagementLetter = engagementLetters.find(el => el.leadId === viewingHandover.leadId);
    
    return (
      <CeoHandoverPage
        handover={viewingHandover}
        lead={lead}
        proposal={proposal}
        engagementLetter={engagementLetter}
        onApprove={(handoverId) => {
          onUpdateHandover(handoverId, { status: 'APPROVED' });
          setViewingHandover(undefined);
        }}
        onReject={(handoverId) => {
          onUpdateHandover(handoverId, { status: 'REVISION' as any });
          setViewingHandover(undefined);
        }}
        onBack={() => setViewingHandover(undefined)}
      />
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Handover Memo Menunggu Approval</h2>
        <p className="text-gray-600 text-sm mt-1">{handovers.length} handover menunggu review</p>
      </div>
      
      {handovers.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
          Tidak ada handover menunggu approval
        </div>
      ) : (
        <div className="space-y-3">
          {handovers.map((handover) => {
            // Get ExtendedHandover data from handover (stored as additional fields)
            const handoverWithExtras = handover as Handover & { serviceLine?: string; projectPeriod?: string };
            const lead = leads.find(l => l.id === handover.leadId);
            const leadProposal = proposals.find(p => p.leadId === handover.leadId);
            const serviceLine = handoverWithExtras.serviceLine || leadProposal?.service || '';
            const projectPeriod = handoverWithExtras.projectPeriod || '';
            
            return (
              <Card key={handover.id} className="hover:border-gray-300 hover:shadow-lg transition-all">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 mb-1">
                        {handover.projectTitle}
                      </h3>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-gray-600">{lead?.company || handover.clientName}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">{serviceLine || '-'}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        {projectPeriod && (
                          <>
                            <span>Project Period: <span className="font-medium text-gray-900">{projectPeriod}</span></span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusChip status={handover.status} />
                      <Button
                        onClick={() => {
                          // Convert Handover to ExtendedHandover format
                          const handoverAny = handover as any;
                          const extendedHandover: ExtendedHandover = {
                            ...handover,
                            ...handoverAny, // Include all extended fields
                            // Map deliverablesExtended to deliverables if exists
                            deliverables: handoverAny.deliverablesExtended || handoverAny.deliverables || [],
                          };
                          setViewingHandover(extendedHandover);
                        }}
                        className="px-5 py-2 bg-white text-gray-900 border border-gray-300 text-sm rounded-lg hover:bg-gray-50 transition-colors font-medium"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Review
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-8 pt-3 border-t border-gray-100">
                    <div>
                      <div className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">Created By</div>
                      <div className="text-sm font-medium text-gray-900">{handover.createdBy}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">Created</div>
                      <div className="text-sm font-medium text-gray-900">
                        {handover.createdAt 
                          ? new Date(handover.createdAt).toLocaleDateString('id-ID', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          : '-'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

