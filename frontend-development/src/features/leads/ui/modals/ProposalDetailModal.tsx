import { useState, useEffect } from 'react';
import { X, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { animate } from 'framer-motion';
import { Dialog, DialogContent } from '../../../../components/ui/dialog';
import { Input } from '../../../../components/ui/input';
import { Button } from '../../../../components/ui/button';
import { AgreeFeeModal } from './AgreeFeeModal';
import type { Proposal, Lead } from '../../../../lib/mock-data';

interface ProposalDetailModalProps {
  proposal: Proposal | null;
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
  onEdit?: (proposal: Proposal) => void;
  onUpdateProposal?: (id: string, updates: Partial<Proposal>) => void;
  isCEOView?: boolean;
  readOnly?: boolean;
}

type Tier = 'STRATEGIC_RETAINER' | 'PREMIUM_MODULAR' | 'STANDARDIZED_MODULAR';
type PaymentMethod = 'MONTHLY_RETAINER' | 'TERMIN' | 'DISPUTE_UM_SF' | 'SUBCON';

export function ProposalDetailModal({
  proposal,
  lead,
  open,
  onClose,
  onEdit,
  onUpdateProposal,
  isCEOView = false,
  readOnly = false
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
    if (!proposal || !onEdit) return;
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
        },
      });
    } else {
      onClose();
      onEdit(proposal);
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

  const handleApprove = () => {
    if (currentProposal && onUpdateProposal) {
      onUpdateProposal(currentProposal.id, {
        status: 'APPROVED'
      });
      setCurrentProposal({
        ...currentProposal,
        status: 'APPROVED'
      });
      toast.success('Proposal approved!');
      handleClose();
    }
  };

  const handleReject = () => {
    if (currentProposal && onUpdateProposal) {
      onUpdateProposal(currentProposal.id, {
        status: 'REJECTED'
      });
      setCurrentProposal({
        ...currentProposal,
        status: 'REJECTED'
      });
      toast.success('Proposal rejected!');
      handleClose();
    }
  };

  if (!currentProposal || !lead) return null;

  // Determine tier, payment method, and subcon status from paymentType
  const determinePaymentInfo = (paymentType: string, service: string) => {
    let tier: Tier = 'PREMIUM_MODULAR';
    let paymentMethod: PaymentMethod = 'TERMIN';
    let isDispute = false;
    let hasSubcon = false;

    // PRIORITY 1: Check for subcon first (standalone payment method)
    if (paymentType.includes('Subkon dengan')) {
      hasSubcon = true;
      paymentMethod = 'SUBCON';
      isDispute = false; // Dispute tidak berlaku saat subcon
      // Try to detect tier from service
      if (service.includes('Strategic Tax Advisory')) {
        tier = 'STRATEGIC_RETAINER';
      } else if (service.includes('Dokumentasi TP Template') || service.includes('Pendirian Badan Usaha') || 
                 service.includes('Virtual Office') || service.includes('Laporan Keberlanjutan Dasar') ||
                 service.includes('Website Company Profile')) {
        tier = 'STANDARDIZED_MODULAR';
      } else {
        tier = 'PREMIUM_MODULAR';
      }
    } else {
      // Only parse other payment methods if not subcon
      // Check for dispute
      if (paymentType.includes('Sengketa') || paymentType.includes('Uang Muka')) {
        isDispute = true;
        paymentMethod = 'DISPUTE_UM_SF';
        // Try to detect tier from service
        if (service.includes('Strategic Tax Advisory')) {
          tier = 'STRATEGIC_RETAINER';
        } else if (service.includes('Dokumentasi TP Template') || service.includes('Pendirian Badan Usaha') || 
                   service.includes('Virtual Office') || service.includes('Laporan Keberlanjutan Dasar') ||
                   service.includes('Website Company Profile')) {
          tier = 'STANDARDIZED_MODULAR';
        } else {
          tier = 'PREMIUM_MODULAR';
        }
      } else if (paymentType.includes('Retainer bulanan') || paymentType.includes('Periode')) {
        tier = 'STRATEGIC_RETAINER';
        paymentMethod = 'MONTHLY_RETAINER';
      } else {
        // Termin - try to detect tier from service
        if (service.includes('Strategic Tax Advisory')) {
          tier = 'STRATEGIC_RETAINER';
          paymentMethod = 'MONTHLY_RETAINER';
        } else if (service.includes('Dokumentasi TP Template') || service.includes('Pendirian Badan Usaha') || 
                   service.includes('Virtual Office') || service.includes('Laporan Keberlanjutan Dasar') ||
                   service.includes('Website Company Profile')) {
          tier = 'STANDARDIZED_MODULAR';
          paymentMethod = 'TERMIN';
        } else {
          tier = 'PREMIUM_MODULAR';
          paymentMethod = 'TERMIN';
        }
      }
    }

    return { tier, paymentMethod, isDispute, hasSubcon };
  };

  const paymentInfo = determinePaymentInfo(currentProposal.paymentType, currentProposal.service);

  // Parse payment type for different payment methods
  const parsePaymentType = (paymentType: string, method: PaymentMethod) => {
    // Extract subcon info if exists (separated by |)
    let mainPaymentType = paymentType;
    let subconInfo: { partner?: string; timing?: string } = {};
    
    if (paymentType.includes(' | Subkon')) {
      const parts = paymentType.split(' | Subkon');
      mainPaymentType = parts[0];
      const subconPart = 'Subkon' + (parts[1] || '');
      const partnerMatch = subconPart.match(/Subkon dengan (.+?):/);
      const timingMatch = subconPart.match(/pembayaran (.+?) oleh partner/);
      subconInfo = {
        partner: partnerMatch ? partnerMatch[1] : '',
        timing: timingMatch && timingMatch[1].includes('awal') ? 'UPFRONT' : 'END'
      };
    } else if (paymentType.includes('Subkon dengan')) {
      // Legacy format where subcon is the main payment type
      const partnerMatch = paymentType.match(/Subkon dengan (.+?):/);
      const timingMatch = paymentType.match(/pembayaran (.+?) oleh partner/);
      subconInfo = {
        partner: partnerMatch ? partnerMatch[1] : '',
        timing: timingMatch && timingMatch[1].includes('awal') ? 'UPFRONT' : 'END'
      };
    }

    if (method === 'TERMIN') {
      const termins = mainPaymentType.split(' | ').map((term) => {
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
      return { termins, ...subconInfo };
    } else if (method === 'MONTHLY_RETAINER') {
      const periodMatch = mainPaymentType.match(/Periode (.+?) s\/d (.+?);/);
      const timingMatch = mainPaymentType.match(/Penagihan: (.+)/);
      return {
        contractStart: periodMatch ? periodMatch[1] : '',
        contractEnd: periodMatch ? periodMatch[2] : '',
        billingTiming: timingMatch && timingMatch[1].includes('Awal') ? 'START_OF_MONTH' : 'END_OF_MONTH',
        ...subconInfo
      };
    } else if (method === 'DISPUTE_UM_SF') {
      const dpMatch = mainPaymentType.match(/Uang Muka IDR ([\d.]+)M/);
      const sfMatch = mainPaymentType.match(/Success Fee (\d+)%/);
      const baseMatch = mainPaymentType.match(/Basis: (.+)/);
      return {
        downPayment: dpMatch ? (parseFloat(dpMatch[1]) * 1000000).toString() : '',
        successFeePercent: sfMatch ? sfMatch[1] : '',
        successFeeBase: baseMatch ? baseMatch[1] : '',
        ...subconInfo
      };
    } else if (method === 'SUBCON') {
      // Subcon is standalone - parse directly from paymentType
      const partnerMatch = paymentType.match(/Subkon dengan (.+?):/);
      const timingMatch = paymentType.match(/pembayaran (.+?) oleh partner/);
      return {
        partner: partnerMatch ? partnerMatch[1] : '',
        timing: timingMatch && timingMatch[1].includes('awal') ? 'UPFRONT' : 'END'
      };
    }
    return { ...subconInfo };
  };

  const paymentData = parsePaymentType(currentProposal.paymentType, paymentInfo.paymentMethod) as any;

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
            <div className="space-y-4">
              {/* Client Info */}
              <div className="bg-gray-50 rounded-lg p-3">
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

              {/* Tier */}
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">
                  Kelas Layanan (Tier)
                </label>
                <select
                  value={paymentInfo.tier}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                >
                  <option value="STRATEGIC_RETAINER">Strategic Retainer</option>
                  <option value="PREMIUM_MODULAR">Premium Modular</option>
                  <option value="STANDARDIZED_MODULAR">Standardized Modular</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Pilihan tier menentukan service type yang tersedia dan default payment method.
                </p>
              </div>

              {/* Service Type */}
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">
                  Service Type
                </label>
                <select
                  value={currentProposal.service || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                >
                  <option value={currentProposal.service || ''}>{currentProposal.service || '-'}</option>
                </select>
              </div>

              {/* Fees - 3 columns */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1.5">
                    Proposal Fee (IDR)
                  </label>
                  <Input
                    type="text"
                    value={currentProposal.proposalFee.toLocaleString('id-ID')}
                    disabled
                    className="w-full bg-gray-100 text-gray-700 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1.5">
                    Diskon (IDR)
                  </label>
                  <Input
                    type="text"
                    value="-"
                    disabled
                    className="w-full bg-gray-100 text-gray-700 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1.5">
                    Agree Fee
                  </label>
                  <Input
                    type="text"
                    value={currentProposal.agreeFee ? currentProposal.agreeFee.toLocaleString('id-ID') : 'Akan diisi setelah deal disetujui client'}
                    disabled
                    className="w-full bg-gray-100 text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Dispute Toggle */}
              <div className={`flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-white ${paymentInfo.hasSubcon ? 'opacity-60' : ''}`}>
                <label className={`flex items-center gap-2 flex-shrink-0 ${paymentInfo.hasSubcon ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                  <input
                    type="checkbox"
                    checked={paymentInfo.isDispute}
                    disabled
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Dispute (Sengketa)?
                  </span>
                </label>
                <p className="text-xs text-gray-500">
                  Jika aktif, payment method akan menjadi UM + Success Fee (hanya untuk dispute)
                </p>
              </div>

              {/* Subcon Toggle */}
              <div className={`flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-white ${paymentInfo.isDispute ? 'opacity-60' : ''}`}>
                <label className={`flex items-center gap-2 flex-shrink-0 ${paymentInfo.isDispute ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                  <input
                    type="checkbox"
                    checked={paymentInfo.hasSubcon}
                    disabled
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Sub Contract (White Kitchen)?
                  </span>
                </label>
                <p className="text-xs text-gray-500">
                  Jika aktif, payment method akan menjadi Sub Contract
                </p>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">
                  Payment Method
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  {paymentInfo.hasSubcon
                    ? 'Payment method untuk sub contract: Sub Contract'
                    : paymentInfo.isDispute 
                    ? 'Payment method untuk dispute: UM + Success Fee' 
                    : `Payment method default untuk ${paymentInfo.tier}: ${paymentInfo.tier === 'STRATEGIC_RETAINER' ? 'Monthly Retainer' : 'Termin'}`}
                </p>
                <select
                  value={paymentInfo.paymentMethod}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                >
                  <option value="MONTHLY_RETAINER">Monthly Retainer</option>
                  <option value="TERMIN">Termin</option>
                  <option value="DISPUTE_UM_SF">Dispute (UM + Success Fee)</option>
                  <option value="SUBCON">Sub Contract</option>
                </select>
              </div>

              {/* Subcon Section - Only show when subcon is active */}
              {paymentInfo.hasSubcon && (
                <div className="border border-gray-200 rounded-lg p-3 bg-white space-y-2.5">
                  <p className="text-sm text-gray-600 font-medium mb-0.5">
                    Payment – Sub Contract (White Kitchen)
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Partner / Flag
                      </label>
                      <Input
                        type="text"
                        value={paymentData.partner || '-'}
                        disabled
                        className="w-full bg-gray-100 text-gray-700 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Payment Timing
                      </label>
                      <div className="flex gap-4 text-sm mt-1">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            checked={paymentData.timing === 'UPFRONT'}
                            disabled
                            className="w-4 h-4"
                          />
                          <span className={paymentData.timing === 'UPFRONT' ? 'text-gray-700' : 'text-gray-400'}>100% di awal</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            checked={paymentData.timing === 'END'}
                            disabled
                            className="w-4 h-4"
                          />
                          <span className={paymentData.timing === 'END' ? 'text-gray-700' : 'text-gray-400'}>100% di akhir</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Proposal Fee di atas adalah nilai yang dibayarkan partner
                    (mis. Asahi) ke perusahaan kita.
                  </p>
                </div>
              )}

              {/* Payment / Billing Section - Hide when subcon is active */}
              {!paymentInfo.hasSubcon && (
              <div>
                {/* 1. TERMIN */}
                {paymentInfo.paymentMethod === 'TERMIN' && (
                  <>
                    <label className="block text-sm text-gray-700 mb-1.5">
                      Termin Pembayaran (Payment Type)
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      Pilih skema termin pembayaran untuk proposal ini.
                    </p>

                    {/* Payment Scheme Display */}
                    {paymentData.termins && paymentData.termins.length > 0 && (
                      <div className="mb-3">
                        <select
                          value={
                            paymentData.termins.length === 2 && 
                            paymentData.termins[0]?.percentage === 50 && 
                            paymentData.termins[1]?.percentage === 50 ? '50-50' :
                            paymentData.termins.length === 3 && 
                            paymentData.termins[0]?.percentage === 50 && 
                            paymentData.termins[1]?.percentage === 35 && 
                            paymentData.termins[2]?.percentage === 15 ? '50-35-15' :
                            paymentData.termins.length === 3 && 
                            paymentData.termins[0]?.percentage === 40 && 
                            paymentData.termins[1]?.percentage === 30 && 
                            paymentData.termins[2]?.percentage === 30 ? '40-30-30' : 'Custom'
                          }
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                        >
                          <option value="50-50">50-50</option>
                          <option value="50-35-15">50-35-15</option>
                          <option value="40-30-30">40-30-30</option>
                          <option value="Custom">Custom</option>
                        </select>
                      </div>
                    )}

                    <div className="border border-gray-200 rounded-lg p-3 bg-white">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Detail Termin</p>
                      </div>
                      {paymentData.termins && paymentData.termins.length > 0 ? (
                        <div className="space-y-2">
                          {paymentData.termins.map((termin: any, index: number) => (
                            <div
                              key={index}
                              className="border border-gray-200 rounded-lg p-2.5 bg-gray-50"
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <label className="text-sm font-medium text-gray-700">
                                  Termin {termin.number}
                                </label>
                              </div>
                              <div className="grid grid-cols-2 gap-2 mb-1.5">
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">
                                    Persentase (%)
                                  </label>
                                  <Input
                                    type="text"
                                    value={`${termin.percentage}%`}
                                    disabled
                                    className="w-full bg-gray-100 text-gray-700 cursor-not-allowed"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">
                                    Nominal (IDR)
                                  </label>
                                  <Input
                                    type="text"
                                    value={termin.amount.toLocaleString('id-ID')}
                                    disabled
                                    className="w-full bg-gray-100 text-gray-700 cursor-not-allowed"
                                  />
                                </div>
                              </div>
                              {termin.description && (
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">
                                    Deskripsi termin
                                  </label>
                                  <Input
                                    type="text"
                                    value={termin.description}
                                    disabled
                                    className="w-full bg-gray-100 text-gray-700 cursor-not-allowed"
                                  />
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
                      {paymentData.termins && paymentData.termins.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-200 flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Total Persentase:
                          </span>
                          <span
                            className={`font-medium ${
                              paymentData.termins.reduce((sum: number, t: any) => sum + (t.percentage || 0), 0) === 100
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {paymentData.termins.reduce((sum: number, t: any) => sum + (t.percentage || 0), 0)}%
                          </span>
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-1.5">
                        Ini adalah skema termin yang diajukan di proposal. Termin
                        final bisa dikonfirmasi lagi setelah client setuju (deal).
                      </p>
                    </div>
                  </>
                )}

                {/* 2. MONTHLY_RETAINER */}
                {paymentInfo.paymentMethod === 'MONTHLY_RETAINER' && (
                  <div className="border border-gray-200 rounded-lg p-3 bg-white space-y-2.5">
                    <p className="text-sm text-gray-600 font-medium mb-0.5">
                      Payment – Strategic Advisory (Bulanan)
                    </p>
                    <p className="text-xs text-gray-500 mb-1">
                      Proposal Fee akan dianggap sebagai fee per bulan (retainer).
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Periode Kontrak – Mulai
                        </label>
                        <Input
                          type="date"
                          value={paymentData.contractStart || ''}
                          disabled
                          className="w-full bg-gray-100 text-gray-700 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Periode Kontrak – Selesai
                        </label>
                        <Input
                          type="date"
                          value={paymentData.contractEnd || ''}
                          disabled
                          className="w-full bg-gray-100 text-gray-700 cursor-not-allowed"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Waktu Penagihan
                      </label>
                      <div className="flex gap-4 text-sm mt-1">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            checked={paymentData.billingTiming === 'START_OF_MONTH'}
                            disabled
                            className="w-4 h-4"
                          />
                          <span className={paymentData.billingTiming === 'START_OF_MONTH' ? 'text-gray-700' : 'text-gray-400'}>Awal bulan</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            checked={paymentData.billingTiming === 'END_OF_MONTH'}
                            disabled
                            className="w-4 h-4"
                          />
                          <span className={paymentData.billingTiming === 'END_OF_MONTH' ? 'text-gray-700' : 'text-gray-400'}>Akhir bulan</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. DISPUTE_UM_SF */}
                {paymentInfo.paymentMethod === 'DISPUTE_UM_SF' && (
                  <div className="border border-gray-200 rounded-lg p-3 bg-white space-y-2.5">
                    <p className="text-sm text-gray-600 font-medium mb-0.5">
                      Payment – Sengketa (UM + Success Fee)
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Uang Muka (IDR)
                        </label>
                        <Input
                          type="text"
                          value={paymentData.downPayment ? Number(paymentData.downPayment).toLocaleString('id-ID') : '-'}
                          disabled
                          className="w-full bg-gray-100 text-gray-700 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Success Fee (%)
                        </label>
                        <Input
                          type="text"
                          value={paymentData.successFeePercent ? `${paymentData.successFeePercent}%` : '-'}
                          disabled
                          className="w-full bg-gray-100 text-gray-700 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Basis Success Fee
                        </label>
                        <Input
                          type="text"
                          value={paymentData.successFeeBase || '-'}
                          disabled
                          className="w-full bg-gray-100 text-gray-700 cursor-not-allowed"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Proposal Fee di atas bisa dipakai sebagai indikasi total
                      potensi fee, tapi struktur resmi: UM + Success Fee.
                    </p>
                  </div>
                )}

              </div>
              )}

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
            {readOnly ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="bg-white text-gray-900 border border-gray-300 hover:bg-gray-50"
              >
                Close
              </Button>
            ) : isCEOView && currentProposal.status === 'WAITING_CEO_APPROVAL' ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReject}
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  Reject
                </Button>
                <Button
                  type="button"
                  onClick={handleApprove}
                  className="bg-gray-900 hover:bg-gray-800 text-white"
                >
                  Approve
                </Button>
              </>
            ) : currentProposal.status === 'DRAFT' ? (
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
                className="bg-white text-gray-900 border border-gray-300 hover:bg-gray-50"
              >
                Close
              </Button>
            ) : currentProposal.status === 'APPROVED' ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="bg-white text-gray-900 border border-gray-300 hover:bg-gray-50"
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
                  className="bg-white text-gray-900 border border-gray-300 hover:bg-gray-50"
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
                className="bg-white text-gray-900 border border-gray-300 hover:bg-gray-50"
              >
                Close
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleClose}
                className="bg-white text-gray-900 border border-gray-300 hover:bg-gray-50"
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
