import { useState } from 'react';
import { Plus } from 'lucide-react';
import { StatusChip } from '../shared/StatusChip';
import { ProposalFormModal } from '../modals/ProposalFormModal';
import { ProposalDetailModal } from '../modals/ProposalDetailModal';
import type { Proposal, Lead } from '../../../../lib/mock-data';
import type { LeadStatus } from '../shared/LeadTrackerDetail';

interface ProposalTabProps {
  leadId: string;
  leads: Lead[];
  proposals: Proposal[];
  onAddProposal: (proposal: Proposal) => void;
  onUpdateProposal: (id: string, updates: Partial<Proposal>) => void;
  onUpdateLeadStatus: (leadId: string, status: LeadStatus) => void;
}

export function ProposalTab({ leadId, leads, proposals, onAddProposal, onUpdateProposal, onUpdateLeadStatus }: ProposalTabProps) {
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [showProposalDetail, setShowProposalDetail] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
  const leadProposals = proposals.filter(p => p.leadId === leadId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3>Proposals</h3>
        <button 
          onClick={() => {
            setEditingProposal(null);
            setShowProposalForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Buat Proposal
        </button>
      </div>
      {leadProposals.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">Belum ada proposal dibuat</p>
          <p className="text-sm text-gray-500 mt-1">Setelah notulensi approved, buat proposal untuk klien</p>
          <button 
            onClick={() => {
              setEditingProposal(null);
              setShowProposalForm(true);
            }}
            className="mt-3 text-blue-600 hover:text-blue-700"
          >
            Buat proposal pertama
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {leadProposals.map((proposal) => (
            <div key={proposal.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4>{proposal.service}</h4>
                    <StatusChip status={proposal.status} />
                  </div>
                  <p className="text-sm text-gray-600">Created: {proposal.createdAt}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Proposal Fee</p>
                  <p className="text-xl">IDR {(proposal.proposalFee / 1000000).toFixed(0)}M</p>
                  {proposal.agreeFee && (
                    <p className="text-sm text-green-600">Agree Fee: IDR {(proposal.agreeFee / 1000000).toFixed(0)}M</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                <div>
                  <p className="text-gray-600">Payment Type</p>
                  <p className="font-medium">{proposal.paymentType}</p>
                  {proposal.paymentTypeFinal && (
                    <>
                      <p className="text-gray-600 mt-1">Payment Type Final</p>
                      <p className="font-medium text-green-600">{proposal.paymentTypeFinal}</p>
                    </>
                  )}
                </div>
                <div>
                  <p className="text-gray-600">Has Subcon</p>
                  <p className="font-medium">{proposal.hasSubcon ? 'Yes' : 'No'}</p>
                </div>
                {proposal.sentAt && (
                  <div>
                    <p className="text-gray-600">Sent At</p>
                    <p className="font-medium">{proposal.sentAt}</p>
                    {proposal.dealDate && (
                      <>
                        <p className="text-gray-600 mt-1">Deal Date</p>
                        <p className="font-medium text-green-600">{proposal.dealDate}</p>
                      </>
                    )}
                  </div>
                )}
              </div>
              {/* EL Status */}
              {proposal.elStatus && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Engagement Letter</p>
                      <div className="flex items-center gap-2 mt-1">
                        <StatusChip status={proposal.elStatus} />
                        {proposal.elSignedDate && (
                          <span className="text-sm text-gray-600">Signed: {proposal.elSignedDate}</span>
                        )}
                      </div>
                    </div>
                    {proposal.elStatus === 'SIGNED' && (
                      <button className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                        Buat Handover
                      </button>
                    )}
                  </div>
                </div>
              )}
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                <button 
                  onClick={() => {
                    setSelectedProposal(proposal);
                    setShowProposalDetail(true);
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showProposalDetail && selectedProposal && (
        <ProposalDetailModal
          proposal={proposals.find(p => p.id === selectedProposal.id) || selectedProposal}
          lead={leads.find(l => l.id === leadId) || null}
          open={showProposalDetail}
          onClose={() => {
            setShowProposalDetail(false);
            setSelectedProposal(null);
          }}
          onEdit={(proposal) => {
            setEditingProposal(proposal);
            setShowProposalDetail(false);
            setShowProposalForm(true);
          }}
          onUpdateProposal={(id, updates) => {
            onUpdateProposal(id, updates);
            // Update selectedProposal with latest data
            const updatedProposal = proposals.find(p => p.id === id);
            if (updatedProposal) {
              setSelectedProposal({ ...updatedProposal, ...updates });
            }
          }}
        />
      )}

      {showProposalForm && (
        <ProposalFormModal
          leadId={leadId}
          leads={leads}
          proposals={proposals}
          open={showProposalForm}
          onClose={() => {
            setShowProposalForm(false);
            setEditingProposal(null);
          }}
          onAddProposal={onAddProposal}
          onUpdateProposal={onUpdateProposal}
          onUpdateLeadStatus={onUpdateLeadStatus}
          editingProposal={editingProposal}
        />
      )}
    </div>
  );
}

