import { useState, useEffect } from 'react';
import { Plus, Eye } from 'lucide-react';
import { StatusChip } from '../shared/StatusChip';
import { ProposalFormModal } from '../modals/ProposalFormModal';
import { ProposalDetailModal } from '../modals/ProposalDetailModal';
import type { Proposal, Lead } from '../../../../lib/mock-data';
import type { LeadStatus } from '../management/LeadTrackerDetail';

interface ProposalTabProps {
  leadId: string;
  leads: Lead[];
  proposals: Proposal[];
  onAddProposal: (proposal: Proposal) => void;
  onUpdateProposal: (id: string, updates: Partial<Proposal>) => void;
  onUpdateLeadStatus: (leadId: string, status: LeadStatus) => void;
}

// Helper function to check if proposal is expired (30 days from sentAt)
const isProposalExpired = (proposal: Proposal): boolean => {
  // If already marked as expired, return true
  if (proposal.status === 'PROPOSAL_EXPIRED') {
    return true;
  }
  
  // Check if proposal with SENT status is expired (>30 days)
  if (!proposal.sentAt || proposal.status !== 'SENT') {
    return false;
  }
  
  const sentDate = new Date(proposal.sentAt);
  const today = new Date();
  const diffTime = today.getTime() - sentDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > 30;
};

export function ProposalTab({ leadId, leads, proposals, onAddProposal, onUpdateProposal, onUpdateLeadStatus }: ProposalTabProps) {
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [showProposalDetail, setShowProposalDetail] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
  const leadProposals = proposals.filter(p => p.leadId === leadId);
  const lead = leads.find(l => l.id === leadId);

  // Auto-update lead status to PROPOSAL_EXPIRED if any proposal is expired
  useEffect(() => {
    if (!lead) return;
    
    // Check if any proposal is expired
    const hasExpiredProposal = leadProposals.some(proposal => isProposalExpired(proposal));
    
    // Update lead status if there's an expired proposal and current status is not already PROPOSAL_EXPIRED
    if (hasExpiredProposal && (lead as any).status !== 'PROPOSAL_EXPIRED') {
      onUpdateLeadStatus(leadId, 'PROPOSAL_EXPIRED');
    }
  }, [leadProposals, lead, leadId, onUpdateLeadStatus]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3>Proposals</h3>
        <button 
          onClick={() => {
            setEditingProposal(null);
            setShowProposalForm(true);
          }}
          className="flex items-center gap-2 px-5 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors font-medium cursor-pointer"
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
        <div className="space-y-3">
          {leadProposals.map((proposal) => {
            const expired = isProposalExpired(proposal);
            // Display PROPOSAL_EXPIRED status if proposal is expired
            const displayStatus = expired ? 'PROPOSAL_EXPIRED' : proposal.status;
            return (
            <div 
              key={proposal.id} 
              className={`border rounded-lg p-4 transition-all ${expired ? 'border-red-500 border-2' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4>{proposal.service}</h4>
                    <StatusChip status={displayStatus} />
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
                  {proposal.hasSubcon && proposal.paymentType && (
                    <>
                      {(() => {
                        const partnerMatch = proposal.paymentType.match(/Subkon dengan (.+?):/);
                        if (partnerMatch) {
                          return (
                            <>
                              <p className="text-gray-600 mt-1">Subcon Partner</p>
                              <p className="font-medium text-blue-600">{partnerMatch[1]}</p>
                            </>
                          );
                        }
                        return null;
                      })()}
                    </>
                  )}
                </div>
                <div>
                  <p className="text-gray-600">Sent At</p>
                  <p className="font-medium">
                    {(proposal.status === 'SENT' || proposal.status === 'ACCEPTED' || expired) && proposal.sentAt
                      ? new Date(proposal.sentAt).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : '-'
                    }
                  </p>
                  <p className="text-gray-600 mt-1">Deal Date</p>
                  <p className="font-medium text-green-600">
                    {proposal.dealDate 
                      ? new Date(proposal.dealDate).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : '-'
                    }
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                <button 
                  onClick={() => {
                    setSelectedProposal(proposal);
                    setShowProposalDetail(true);
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
              </div>
            </div>
          );
          })}
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

