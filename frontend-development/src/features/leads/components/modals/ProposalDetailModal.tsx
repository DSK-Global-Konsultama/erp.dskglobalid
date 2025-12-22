import { useState, useEffect } from 'react';
import { X, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { animate } from 'framer-motion';
import { Dialog, DialogContent } from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';
import { StatusChip } from '../shared/StatusChip';
import { AgreeFeeModal } from './AgreeFeeModal';
import type { Proposal, Lead } from '../../../../lib/mock-data';

interface ProposalDetailModalProps {
  proposal: Proposal | null;
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
  onEdit: (proposal: Proposal) => void;
  onUpdateProposal?: (id: string, updates: Partial<Proposal>) => void;
}

type BillingModel =
  | 'STRATEGIC_ADVISORY'
  | 'PROJECT_TERMIN'
  | 'DISPUTE_UM_SF'
  | 'SUBCON';

export function ProposalDetailModal({
  proposal,
  lead,
  open,
  onClose,
  onEdit,
  onUpdateProposal
}: ProposalDetailModalProps) {
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [showAgreeFeeModal, setShowAgreeFeeModal] = useState(false);
  const [currentProposal, setCurrentProposal] = useState<Proposal | null>(proposal);

  // Sync proposal with latest data
  useEffect(() => {
    if (proposal) {
      setCurrentProposal(proposal);
    }
  }, [proposal]);

  // Handle close with animation
  const handleClose = () => {
    if (isAnimatingOut) return;
    
    const dialogContent = document.querySelector('[data-proposal-detail-modal]') as HTMLElement;
    if (dialogContent) {
      setIsAnimatingOut(true);
      animate(dialogContent, { x: '100%' }, { 
        duration: 0.8, 
        ease: 'easeInOut',
        onComplete: () => {
          setIsAnimatingOut(false);
          onClose();
        }
      });
    } else {
      onClose();
    }
  };

  // Handle open animation
  useEffect(() => {
    if (!open || isAnimatingOut) return;

    const setupAnimation = () => {
      const dialogContent = document.querySelector('[data-proposal-detail-modal]') as HTMLElement;
      if (dialogContent) {
        dialogContent.style.cssText = 'animation: none !important; opacity: 1 !important; transform: translateX(100%) !important; transition: none !important;';
        void dialogContent.offsetHeight;
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              animate(dialogContent, { x: 0 }, { duration: 0.8, ease: 'easeInOut' });
            });
          });
        });
        return true;
      }
      return false;
    };

    const observer = new MutationObserver(() => {
      if (setupAnimation()) {
        observer.disconnect();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    if (setupAnimation()) {
      observer.disconnect();
    }

    return () => {
      observer.disconnect();
    };
  }, [open, isAnimatingOut]);

  const handleEdit = () => {
    if (proposal) {
      if (isAnimatingOut) return;
      
      const dialogContent = document.querySelector('[data-proposal-detail-modal]') as HTMLElement;
      if (dialogContent) {
        setIsAnimatingOut(true);
        onEdit(proposal);
        animate(dialogContent, { x: '100%' }, { 
          duration: 0.8, 
          ease: 'easeInOut',
          onComplete: () => {
            setIsAnimatingOut(false);
            onClose();
          }
        });
      } else {
        onClose();
        onEdit(proposal);
      }
    }
  };

  const handleSendToClient = () => {
    if (currentProposal && onUpdateProposal) {
      onUpdateProposal(currentProposal.id, {
        status: 'SENT',
        sentAt: new Date().toISOString().split('T')[0]
      });
      setCurrentProposal({
        ...currentProposal,
        status: 'SENT',
        sentAt: new Date().toISOString().split('T')[0]
      });
      toast.success('Proposal sent to client!');
    }
  };

  const handleSaveAgreeFee = (updates: { agreeFee: number; paymentTypeFinal: string; dealDate: string }) => {
    if (currentProposal && onUpdateProposal) {
      onUpdateProposal(currentProposal.id, {
        ...updates,
        status: 'ACCEPTED'
      });
      // Update local proposal state immediately
      setCurrentProposal({
        ...currentProposal,
        ...updates,
        status: 'ACCEPTED'
      });
      // Close AgreeFeeModal immediately
      setShowAgreeFeeModal(false);
    }
  };

  const handleSubmitForApproval = () => {
    if (currentProposal && onUpdateProposal) {
      onUpdateProposal(currentProposal.id, {
        status: 'WAITING_APPROVAL'
      });
      setCurrentProposal({
        ...currentProposal,
        status: 'WAITING_APPROVAL'
      });
      toast.success('Proposal submitted for approval!');
    }
  };

  if (!currentProposal || !lead) return null;

  // Determine billing model from paymentType
  const determineBillingModel = (paymentType: string): BillingModel => {
    if (paymentType.includes('Retainer bulanan') || paymentType.includes('Periode')) {
      return 'STRATEGIC_ADVISORY';
    } else if (paymentType.includes('Sengketa') || paymentType.includes('Uang Muka')) {
      return 'DISPUTE_UM_SF';
    } else if (paymentType.includes('Subkon')) {
      return 'SUBCON';
    }
    return 'PROJECT_TERMIN';
  };

  const billingModel = determineBillingModel(currentProposal.paymentType);

  // Parse payment type for different billing models
  const parsePaymentType = (paymentType: string, model: BillingModel) => {
    if (model === 'PROJECT_TERMIN') {
      const termins = paymentType.split(' | ').map((term) => {
        const match = term.match(/Termin (\d+): (\d+)% \(IDR ([\d.]+)M\)(?: - (.+))?/);
        if (match) {
          return {
            number: parseInt(match[1]),
            percentage: parseInt(match[2]),
            amount: parseFloat(match[3]) * 1000000,
            description: match[4] || ''
          };
        }
        return null;
      }).filter(Boolean);
      return { termins };
    } else if (model === 'STRATEGIC_ADVISORY') {
      const periodMatch = paymentType.match(/Periode (.+?) s\/d (.+?);/);
      const timingMatch = paymentType.match(/Penagihan: (.+)/);
      return {
        contractStart: periodMatch ? periodMatch[1] : '',
        contractEnd: periodMatch ? periodMatch[2] : '',
        billingTiming: timingMatch && timingMatch[1].includes('Awal') ? 'START_OF_MONTH' : 'END_OF_MONTH'
      };
    } else if (model === 'DISPUTE_UM_SF') {
      const dpMatch = paymentType.match(/Uang Muka IDR ([\d.]+)M/);
      const sfMatch = paymentType.match(/Success Fee (\d+)%/);
      const baseMatch = paymentType.match(/Basis: (.+)/);
      return {
        downPayment: dpMatch ? (parseFloat(dpMatch[1]) * 1000000).toString() : '',
        successFeePercent: sfMatch ? sfMatch[1] : '',
        successFeeBase: baseMatch ? baseMatch[1] : ''
      };
    } else if (model === 'SUBCON') {
      const partnerMatch = paymentType.match(/Subkon dengan (.+?):/);
      const timingMatch = paymentType.match(/pembayaran (.+?) oleh partner/);
      return {
        subconPartner: partnerMatch ? partnerMatch[1] : '',
        subconPaymentTiming: timingMatch && timingMatch[1].includes('awal') ? 'UPFRONT' : 'END'
      };
    }
    return {};
  };

  const paymentData = parsePaymentType(currentProposal.paymentType, billingModel);

  return (
    <Dialog open={open || isAnimatingOut} onOpenChange={() => {}}>
      <style>{`
        [data-slot="dialog-overlay"] {
          pointer-events: none !important;
          z-index: 9998 !important;
        }
        [data-slot="dialog-content"] {
          pointer-events: auto !important;
          z-index: 9999 !important;
        }
      `}</style>
      <DialogContent 
        data-proposal-detail-modal
        className="!fixed top-0 right-0 left-auto bottom-0 !translate-x-0 !translate-y-0 min-w-[800px] w-auto max-w-[95vw] h-screen max-h-screen rounded-none border-l border-r-0 border-t-0 border-b-0 shadow-xl p-0 flex flex-col [&>button]:hidden [&]:!animate-none [&]:!opacity-100 z-[9999]"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Proposal Details</h2>
            <p className="text-sm text-gray-600 mt-1">
              {lead?.clientName || ''}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <div className="space-y-6">
              {/* Client Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Nama PT</p>
                    <p className="font-medium">{lead.company || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">PIC</p>
                    <p className="font-medium">{lead.clientName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Contact</p>
                    <p className="font-medium">{lead.phone || lead.email || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Billing Model */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Jenis Jasa / Billing Model
                </label>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-700">
                    {billingModel === 'STRATEGIC_ADVISORY' && 'Strategic Advisory (bulanan)'}
                    {billingModel === 'PROJECT_TERMIN' && 'Premium Modular'}
                    {billingModel === 'DISPUTE_UM_SF' && 'Premium Modular - Sengketa'}
                    {billingModel === 'SUBCON' && 'Subkon (White Kitchen)'}
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Pilihan ini menentukan model pembayaran dan cara kita menulis
                  terms di proposal.
                </p>
              </div>

              {/* Service */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Service Type
                </label>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-700">{currentProposal.service}</p>
                </div>
              </div>

              {/* Fees - 3 columns */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Proposal Fee (IDR)
                  </label>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-700 font-medium">{currentProposal.proposalFee.toLocaleString('id-ID')}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Diskon (IDR)
                  </label>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-700">{'-'}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Agree Fee
                  </label>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-700">
                      {currentProposal.agreeFee ? `${currentProposal.agreeFee.toLocaleString('id-ID')}` : 'Akan diisi setelah deal disetujui client'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment / Billing Section */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Pengaturan Pembayaran
                </label>
                <p className="text-sm text-gray-500 mb-3">
                  Model pembayaran akan menyesuaikan jenis jasa yang dipilih di atas.
                </p>

                {/* 1. PROJECT_TERMIN */}
                {billingModel === 'PROJECT_TERMIN' && (
                  <>
                    <label className="block text-sm text-gray-700 mb-1">
                      Termin Pembayaran (Payment Type)
                    </label>
                    <p className="text-sm text-gray-500 mb-3">
                      Pilih skema termin pembayaran untuk proposal ini.
                    </p>

                    <div className="border border-gray-200 rounded-lg p-4 bg-white">
                      <div className="mb-3">
                        <p className="text-sm text-gray-600">Detail Termin</p>
                      </div>
                      {paymentData.termins && paymentData.termins.length > 0 ? (
                        <div className="space-y-3">
                          {paymentData.termins.map((termin: any, index: number) => (
                            <div
                              key={index}
                              className="border border-gray-200 rounded-lg p-3 bg-gray-50"
                            >
                              <div className="mb-2">
                                <label className="text-sm font-medium text-gray-700">
                                  Termin {termin.number}
                                </label>
                              </div>
                              <div className="grid grid-cols-2 gap-3 mb-2">
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">
                                    Persentase (%)
                                  </label>
                                  <div className="bg-white rounded-lg p-2 border border-gray-200">
                                    <p className="text-gray-700">{termin.percentage}%</p>
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">
                                    Nominal (IDR)
                                  </label>
                                  <div className="bg-white rounded-lg p-2 border border-gray-200">
                                    <p className="text-gray-700">{termin.amount.toLocaleString('id-ID')}</p>
                                  </div>
                                </div>
                              </div>
                              {termin.description && (
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">
                                    Deskripsi termin
                                  </label>
                                  <div className="bg-white rounded-lg p-2 border border-gray-200">
                                    <p className="text-gray-700">{termin.description}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-gray-700 whitespace-pre-wrap">{currentProposal.paymentType || '-'}</p>
                        </div>
                      )}
                      <p className="text-sm text-gray-500 mt-2">
                        Ini adalah skema termin yang diajukan di proposal. Termin
                        final bisa dikonfirmasi lagi setelah client setuju (deal).
                      </p>
                    </div>
                  </>
                )}

                {/* 2. STRATEGIC_ADVISORY */}
                {billingModel === 'STRATEGIC_ADVISORY' && (
                  <div className="border border-gray-200 rounded-lg p-4 bg-white space-y-3">
                    <p className="text-sm text-gray-600 font-medium mb-1">
                      Payment – Strategic Advisory (Bulanan)
                    </p>
                    <p className="text-xs text-gray-500">
                      Proposal Fee akan dianggap sebagai fee per bulan (retainer).
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Periode Kontrak – Mulai
                        </label>
                        <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                          <p className="text-gray-700">{paymentData.contractStart || '-'}</p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Periode Kontrak – Selesai
                        </label>
                        <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                          <p className="text-gray-700">{paymentData.contractEnd || '-'}</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Waktu Penagihan
                      </label>
                      <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                        <p className="text-gray-700">
                          {paymentData.billingTiming === 'START_OF_MONTH' ? 'Awal bulan' : 'Akhir bulan'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. DISPUTE_UM_SF */}
                {billingModel === 'DISPUTE_UM_SF' && (
                  <div className="border border-gray-200 rounded-lg p-4 bg-white space-y-3">
                    <p className="text-sm text-gray-600 font-medium mb-1">
                      Payment – Sengketa (UM + Success Fee)
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Uang Muka (IDR)
                        </label>
                        <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                          <p className="text-gray-700">
                            {paymentData.downPayment ? Number(paymentData.downPayment).toLocaleString('id-ID') : '-'}
                          </p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Success Fee (%)
                        </label>
                        <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                          <p className="text-gray-700">{paymentData.successFeePercent || '-'}%</p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Basis Success Fee
                        </label>
                        <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                          <p className="text-gray-700">{paymentData.successFeeBase || '-'}</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Proposal Fee di atas bisa dipakai sebagai indikasi total
                      potensi fee, tapi struktur resmi: UM + Success Fee.
                    </p>
                  </div>
                )}

                {/* 4. SUBCON */}
                {billingModel === 'SUBCON' && (
                  <div className="border border-gray-200 rounded-lg p-4 bg-white space-y-3">
                    <p className="text-sm text-gray-600 font-medium mb-1">
                      Payment – Subkon (White Kitchen / Nebeng Bendera)
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Partner / Flag
                        </label>
                        <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                          <p className="text-gray-700">{paymentData.subconPartner || '-'}</p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Skema Pembayaran ke Kita
                        </label>
                        <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                          <p className="text-gray-700">
                            {paymentData.subconPaymentTiming === 'UPFRONT' ? '100% di awal' : '100% di akhir'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Proposal Fee di atas adalah nilai yang dibayarkan partner
                      (mis. Asahi) ke perusahaan kita.
                    </p>
                  </div>
                )}
              </div>

              {/* Contract / Commercial Terms */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Contract / Commercial Terms
                </h3>
                
                {!currentProposal.agreeFee ? (
                  /* STATE 1 - SEBELUM AGREE FEE DIISI */
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Proposal Fee</p>
                        <p className="font-medium">IDR {currentProposal.proposalFee.toLocaleString('id-ID')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Payment Type</p>
                        <p className="font-medium text-sm">{currentProposal.paymentType}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Agree Fee & payment type final akan diisi setelah client menyatakan setuju (deal).
                    </p>
                  </div>
                ) : (
                  /* STATE 2 - SETELAH AGREE FEE DIISI */
                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                          Terms Locked
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Agree Fee (Final)</p>
                        <p className="font-medium text-green-600">
                          IDR {currentProposal.agreeFee.toLocaleString('id-ID')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Payment Type Final</p>
                        <p className="font-medium">{currentProposal.paymentTypeFinal || '-'}</p>
                      </div>
                      {currentProposal.dealDate && (
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Deal Date</p>
                          <p className="font-medium">{currentProposal.dealDate}</p>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      Nilai ini dipakai untuk EL, Handover, dan Invoice.
                    </p>
                    <p className="text-xs text-gray-400 italic">
                      Ajukan perubahan terms
                    </p>
                  </div>
                )}
              </div>

              {/* Attachments */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Attachments
                </label>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-700 text-sm">Attachments will be shown here</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3 justify-end flex-shrink-0">
            {currentProposal.status === 'DRAFT' ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleEdit}
                  className="flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmitForApproval}
                >
                  Submit for Approval
                </Button>
              </>
            ) : currentProposal.status === 'WAITING_APPROVAL' ? (
              <Button
                type="button"
                onClick={handleClose}
              >
                Close
              </Button>
            ) : currentProposal.status === 'APPROVED' ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                >
                  Close
                </Button>
                <Button
                  type="button"
                  onClick={handleSendToClient}
                >
                  Send to Client
                </Button>
              </>
            ) : currentProposal.status === 'SENT' ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                >
                  Close
                </Button>
                {!currentProposal.agreeFee && (
                  <Button
                    type="button"
                    onClick={() => setShowAgreeFeeModal(true)}
                  >
                    Setujui Deal & Isi Agree Fee
                  </Button>
                )}
              </>
            ) : currentProposal.status === 'ACCEPTED' ? (
              <Button
                type="button"
                onClick={handleClose}
              >
                Close
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleClose}
              >
                Close
              </Button>
            )}
          </div>
        </div>
      </DialogContent>

      {/* Agree Fee Modal */}
      {showAgreeFeeModal && currentProposal && (
        <AgreeFeeModal
          proposal={currentProposal}
          lead={lead}
          open={showAgreeFeeModal}
          onClose={() => setShowAgreeFeeModal(false)}
          onSave={handleSaveAgreeFee}
        />
      )}
    </Dialog>
  );
}
