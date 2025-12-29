import { useState } from 'react';
import { Eye } from 'lucide-react';
import { Card, CardContent } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { ProposalDetailModal } from '../../../leads/components/modals/ProposalDetailModal';
import type { Proposal, Lead } from '../../../../lib/mock-data';

interface ELTabProps {
  proposals: Proposal[];
  leads: Lead[];
  onUpdateProposal: (id: string, updates: Partial<Proposal>) => void;
}

export function ELTab({ proposals, leads, onUpdateProposal }: ELTabProps) {
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);

  const getLeadForProposal = (proposal: Proposal): Lead | null => {
    return leads.find(l => l.id === proposal.leadId) || null;
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Engagement Letter Menunggu Approval</h2>
        <p className="text-gray-600 text-sm mt-1">{proposals.length} EL menunggu review</p>
      </div>
      
      {proposals.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
          Tidak ada EL menunggu approval
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
                        {proposal.clientName || `EL ${proposal.id}`}
                      </h3>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">{proposal.service}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Final Fee: <span className="text-sm font-semibold text-gray-900">
                        IDR {((proposal.agreeFee || proposal.proposalFee) / 1000000).toFixed(0)}M
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                      Waiting
                    </Badge>
                    <Button
                      onClick={() => setSelectedProposal(proposal)}
                      className="px-5 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors font-medium"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Review
                    </Button>
                  </div>
                </div>
                <div className="flex gap-8 pt-3 border-t border-gray-100">
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">Created By</div>
                    <div className="text-sm font-medium text-gray-900">{proposal.createdBy || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">Document Type</div>
                    <div className="text-sm font-medium text-gray-900">Engagement Letter</div>
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
          onUpdateProposal={(id, updates) => {
            onUpdateProposal(id, updates);
            if (updates.elStatus === 'APPROVED' || updates.elStatus === 'REJECTED') {
              setSelectedProposal(null);
            }
          }}
        />
      )}
    </div>
  );
}

