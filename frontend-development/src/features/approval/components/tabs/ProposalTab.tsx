import { useState } from 'react';
import { Eye } from 'lucide-react';
import { Card, CardContent } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { ProposalDetailModal } from '../../../leads';
import { leadsService } from '../../../leads/services/leadsService';
import type { Proposal, Lead } from '../../../../lib/mock-data';

interface ProposalTabProps {
  proposals: Proposal[];
  leads: Lead[];
  onUpdateProposal: (id: string, updates: Partial<Proposal>) => void;
}

export function ProposalTab({ proposals, leads, onUpdateProposal }: ProposalTabProps) {
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);

  const getLeadForProposal = (proposal: Proposal): Lead | null => {
    return leads.find(l => l.id === proposal.leadId) || null;
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Proposal Menunggu Approval</h2>
        <p className="text-gray-600 text-sm mt-1">{proposals.length} proposal menunggu review</p>
      </div>
      
      {proposals.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
          Tidak ada proposal menunggu approval
        </div>
      ) : (
        <div className="space-y-3">
          {proposals.map((proposal) => (
            <Card key={proposal.id} className="hover:border-gray-300 hover:shadow-lg transition-all">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-gray-900">
                        {getLeadForProposal(proposal)?.company || proposal.clientName || `Proposal ${proposal.id}`}
                      </h3>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">{proposal.service}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-1.5">
                      <div>
                        <span className="text-[11px] text-gray-500">Proposal Fee: </span>
                        <span className="text-sm font-semibold text-gray-900">
                          IDR {(proposal.proposalFee / 1000000).toFixed(0)}M
                        </span>
                      </div>
                      {proposal.agreeFee && (
                        <>
                          <span className="text-gray-300">|</span>
                          <div>
                            <span className="text-[11px] text-gray-500">Agree Fee: </span>
                            <span className="text-sm font-semibold text-gray-900">
                              IDR {(proposal.agreeFee / 1000000).toFixed(0)}M
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                      Waiting
                    </Badge>
                    <Button
                      onClick={() => setSelectedProposal(proposal)}
                      className="px-5 py-2 bg-white text-gray-900 border border-gray-300 text-sm rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Review
                    </Button>
                  </div>
                </div>
                <div className="flex gap-8 pt-3 border-t border-gray-100">
                  <div className="max-w-[700px]">
                    <div className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">Payment</div>
                    <div className="text-sm font-medium text-gray-900 break-words">{proposal.paymentType}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">Subcon</div>
                    <div className="text-sm font-medium text-gray-900">{proposal.hasSubcon ? 'Yes' : 'No'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">Created By</div>
                    <div className="text-sm font-medium text-gray-900">{proposal.createdBy || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">Created</div>
                    <div className="text-sm font-medium text-gray-900">
                      {proposal.createdAt 
                        ? new Date(proposal.createdAt).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })
                        : 'N/A'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedProposal && (
        <ProposalDetailModal
          proposal={selectedProposal}
          lead={getLeadForProposal(selectedProposal)}
          open={true}
          onClose={() => setSelectedProposal(null)}
          onEdit={() => {}}
          onUpdateProposal={async (id, updates) => {
            // optimistic update in parent
            onUpdateProposal(id, updates);

            const leadId = selectedProposal.leadId;
            try {
              const updated = await leadsService.updateProposal(leadId, id, updates);
              onUpdateProposal(id, updated);
              setSelectedProposal((prev) => (prev ? { ...prev, ...updated } : prev));
            } catch {
              // keep optimistic state
            }

            if (updates.status === 'APPROVED' || updates.status === 'REVISION') {
              setSelectedProposal(null);
            }
          }}
          isCEOView={true}
        />
      )}
    </div>
  );
}

