import { useState, useEffect } from 'react';
import { StatusChip } from '../shared/StatusChip';
import { EngagementLetterUploadModal } from '../modals/EngagementLetterUploadModal';
import type { EngagementLetter, Lead, Proposal } from '../../../../lib/mock-data';
import type { LeadStatus } from '../management/LeadTrackerDetail';

interface EngagementLetterTabProps {
  leadId: string;
  leads: Lead[];
  proposals: Proposal[];
  engagementLetters: EngagementLetter[];
  onAddEngagementLetter: (el: EngagementLetter) => void;
  onUpdateEngagementLetter: (id: string, updates: Partial<EngagementLetter>) => void;
  onUpdateLeadStatus: (leadId: string, status: LeadStatus) => void;
}

export function EngagementLetterTab({ 
  leadId, 
  leads, 
  proposals,
  engagementLetters, 
  onAddEngagementLetter, 
  onUpdateEngagementLetter,
  onUpdateLeadStatus 
}: EngagementLetterTabProps) {
  const [showELUpload, setShowELUpload] = useState(false);
  const [selectedEL, setSelectedEL] = useState<EngagementLetter | null>(null);
  const leadELs = engagementLetters.filter(el => el.leadId === leadId);
  const leadProposals = proposals.filter(p => p.leadId === leadId);
  const lead = leads.find(l => l.id === leadId);

  // Auto-create Engagement Letter when proposal is ACCEPTED
  useEffect(() => {
    if (!lead) return;

    // Get accepted proposals that don't have an EL yet
    const acceptedProposals = leadProposals.filter(p => p.status === 'ACCEPTED');
    const existingELServices = new Set(engagementLetters
      .filter(el => el.leadId === leadId)
      .map(el => el.service)
    );

    // Create EL for each accepted proposal that doesn't have one
    acceptedProposals.forEach((proposal) => {
      if (!existingELServices.has(proposal.service)) {
        const newEL: EngagementLetter = {
          id: 'el' + Date.now() + '-' + proposal.id + '-' + Math.random().toString(36).substr(2, 5),
          leadId: leadId,
          service: proposal.service,
          agreeFee: proposal.agreeFee,
          hasSubcon: proposal.hasSubcon,
          paymentType: proposal.paymentType,
          paymentTypeFinal: proposal.paymentTypeFinal,
          status: 'DRAFT',
          clientName: lead.clientName,
        };
        onAddEngagementLetter(newEL);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposals, engagementLetters, leadId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3>Engagement Letter</h3>
      </div>
      {leadELs.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">Belum ada Engagement Letter</p>
          <p className="text-sm text-gray-500 mt-1">Engagement Letter akan otomatis dibuat ketika proposal sudah diterima (Accepted)</p>
        </div>
      ) : (
        <div className="space-y-4">
          {leadELs.map((el) => (
            <div 
              key={el.id} 
              className="border rounded-lg p-4 border-gray-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4>{el.service}</h4>
                    <StatusChip status={el.status} />
                  </div>
                  <p className="text-sm text-gray-600">Created: {el.createdAt || '-'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-green-600">Agree Fee</p>
                  <p className="text-xl text-green-600">
                    {el.agreeFee 
                      ? `IDR ${(el.agreeFee / 1000000).toFixed(0)}M`
                      : '-'
                    }
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                <div>
                  <p className="text-gray-600">Payment Type Final</p>
                  <p className="font-medium text-green-600">{el.paymentTypeFinal || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Has Subcon</p>
                  <p className="font-medium">{el.hasSubcon ? 'Yes' : 'No'}</p>
                  {el.hasSubcon && el.paymentTypeFinal && (
                    <>
                      {(() => {
                        const partnerMatch = el.paymentTypeFinal.match(/Subkon dengan (.+?):/);
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
                  <p className="text-gray-600">Signed Date</p>
                  <p className="font-medium text-green-600">
                    {el.signedDate 
                      ? new Date(el.signedDate).toLocaleDateString('id-ID', {
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
                    setSelectedEL(el);
                    setShowELUpload(true);
                  }}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm cursor-pointer ${
                    el.createdAt 
                      ? 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      : 'bg-black text-white hover:bg-gray-800'
                  }`}
                >
                  {el.createdAt ? 'View Details' : 'Upload Engagement Letter'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Engagement Letter Upload Modal */}
      {showELUpload && selectedEL && (
        <EngagementLetterUploadModal
          engagementLetter={engagementLetters.find(el => el.id === selectedEL.id) || selectedEL}
          lead={lead || null}
          open={showELUpload}
          onClose={() => {
            setShowELUpload(false);
            setSelectedEL(null);
          }}
          onUpdateEngagementLetter={(id, updates) => {
            onUpdateEngagementLetter(id, updates);
            // Update selectedEL with latest data
            const updatedEL = engagementLetters.find(el => el.id === id);
            if (updatedEL) {
              setSelectedEL({ ...updatedEL, ...updates });
            }
          }}
        />
      )}
    </div>
  );
}

