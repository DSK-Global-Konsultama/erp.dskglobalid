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
  const [revisionNotes, setRevisionNotes] = useState('');
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
        status: 'WAITING_CEO_APPROVAL'
      });
      setCurrentProposal({
        ...currentProposal,
        status: 'WAITING_CEO_APPROVAL'
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

  const handleRevision = () => {
    if (!revisionNotes.trim()) {
      toast.error('Gagal mengirim revisi proposal', {
        description: 'Catatan revisi harus diisi.'
      });
      return;
    }

    if (currentProposal && onUpdateProposal) {
      onUpdateProposal(currentProposal.id, {
        status: 'REVISION' as any,
        revisionNotes: revisionNotes
      });
      setCurrentProposal({
        ...currentProposal,
        status: 'REVISION' as any,
        revisionNotes: revisionNotes
      });
      toast.success('Proposal sent for revision!');
      handleClose();
    }
  };

  if (!currentProposal || !lead) return null;

  // Determine tier, payment method, and subcon status (konsisten dengan ProposalFormModal)
  const determinePaymentInfo = (paymentType: string, service: string, hasSubconProp?: boolean) => {
    let tier: Tier = 'PREMIUM_MODULAR';
    let paymentMethod: PaymentMethod = 'TERMIN';
    let hasSubcon = !!hasSubconProp || paymentType.includes('Subkon dengan') || paymentType.includes('Subkon:');

    if (service.includes('Strategic Tax Advisory')) {
      tier = 'STRATEGIC_RETAINER';
    } else if (service.includes('Dokumentasi TP Template') || service.includes('Pendirian Badan Usaha') ||
      service.includes('Virtual Office') || service.includes('Laporan Keberlanjutan Dasar') ||
      service.includes('Website Company Profile')) {
      tier = 'STANDARDIZED_MODULAR';
    } else {
      tier = 'PREMIUM_MODULAR';
    }

    if (paymentType.includes('Sengketa') || paymentType.includes('Uang Muka')) {
      paymentMethod = 'DISPUTE_UM_SF';
    } else if (paymentType.includes('Retainer bulanan') || paymentType.includes('Periode')) {
      tier = 'STRATEGIC_RETAINER';
      paymentMethod = 'MONTHLY_RETAINER';
    } else if (paymentType.includes('Termin') || paymentType.includes('Down Payment') || paymentType.includes('Subkon dengan')) {
      paymentMethod = 'TERMIN';
    }

    return { tier, paymentMethod, hasSubcon };
  };

  const paymentInfo = determinePaymentInfo(currentProposal.paymentType, currentProposal.service, currentProposal.hasSubcon);

  // Parse payment type for different payment methods (format baru & legacy)
  const parsePaymentType = (paymentType: string, method: PaymentMethod) => {
    let mainPaymentType = paymentType;
    let subconInfo: { partner?: string; timing?: string; payer?: string } = {};

    if (paymentType.includes(' | Subkon')) {
      const parts = paymentType.split(' | Subkon');
      mainPaymentType = parts[0].trim();
      const subconPart = 'Subkon' + (parts[1] || '');
      const partnerNew = subconPart.match(/Subkon:\s*(.+?)(?:;|$)/);
      const payerMatch = subconPart.match(/Pembayar:\s*(Partner|Client)/i);
      if (partnerNew) subconInfo.partner = partnerNew[1].trim();
      if (payerMatch) subconInfo.payer = payerMatch[1].toUpperCase() as 'PARTNER' | 'CLIENT';
    } else if (paymentType.includes('Subkon dengan')) {
      const partnerMatch = paymentType.match(/Subkon dengan (.+?)(?::| \|)/);
      const timingMatch = paymentType.match(/pembayaran (.+?) oleh partner/);
      if (partnerMatch) subconInfo.partner = partnerMatch[1].trim();
      subconInfo.timing = timingMatch && timingMatch[1].includes('awal') ? 'UPFRONT' : 'END';
    }

    if (method === 'TERMIN') {
      const termins = mainPaymentType.split(' | ').map((term) => {
        const match = term.match(/Termin (\d+): (\d+)% \(IDR ([\d.]+)M\)(?: - (.+))?/);
        const downMatch = term.match(/Down Payment:\s*(\d+)%/);
        if (match) {
          return {
            number: parseInt(match[1]),
            percentage: parseInt(match[2]),
            amount: parseFloat(match[3]) * 1000000,
            description: match[4] || ''
          };
        }
        if (downMatch) {
          return {
            number: 0,
            percentage: parseInt(downMatch[1]),
            amount: 0,
            description: 'Down Payment'
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
      const baseMatch = mainPaymentType.match(/dari (.+?)(?:$|;)/);
      return {
        downPayment: dpMatch ? (parseFloat(dpMatch[1]) * 1000000).toString() : '',
        successFeePercent: sfMatch ? sfMatch[1] : '',
        successFeeBase: baseMatch ? baseMatch[1] : '',
        ...subconInfo
      };
    } else if (method === 'SUBCON') {
      return { ...subconInfo, partner: subconInfo.partner || (paymentType.match(/Subkon dengan (.+?)(?::| \|)/)?.[1] ?? '') };
    }
    return { ...subconInfo };
  };

  const paymentData = parsePaymentType(currentProposal.paymentType, paymentInfo.paymentMethod) as any;

  return (
    <Dialog open={open || isAnimatingOut} onOpenChange={() => { }}>
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
                  className="w-full h-9 rounded-lg border border-gray-300 px-3 py-1 text-sm bg-gray-100 text-gray-700 cursor-not-allowed"
                >
                  <option value="STRATEGIC_RETAINER">Strategic Retainer</option>
                  <option value="PREMIUM_MODULAR">Premium Modular</option>
                  <option value="STANDARDIZED_MODULAR">Standardized Modular</option>
                </select>
              </div>

              {/* Service Type */}
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">
                  Service Type
                </label>
                <select
                  value={currentProposal.service || ''}
                  disabled
                  className="w-full h-9 rounded-lg border border-gray-300 px-3 py-1 text-sm bg-gray-100 text-gray-700 cursor-not-allowed"
                >
                  <option value={currentProposal.service || ''}>{currentProposal.service || '-'}</option>
                </select>
              </div>

              {/* Subcon: wadah sama dengan form (checkbox state + partner/payer di dalam) */}
              <div className="border border-gray-200 rounded-lg bg-white p-3 space-y-3">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 flex-shrink-0 cursor-default">
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
                    Subcontract hanya informasi tambahan (partner + pembayar).
                  </p>
                </div>
                {paymentInfo.hasSubcon && (
                  <>
                    <div className="border-t border-gray-200 pt-3" />
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
                          Pembayar (opsional)
                        </label>
                        <Input
                          type="text"
                          value={paymentData.payer === 'PARTNER' ? 'Partner' : paymentData.payer === 'CLIENT' ? 'Client' : '-'}
                          disabled
                          className="h-9 w-full rounded-lg border border-gray-300 bg-gray-100 text-gray-700 cursor-not-allowed px-3 py-1 text-sm"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Proposal Fee di atas adalah nilai yang dibayarkan partner ke perusahaan kita. Jadwal tagihan mengikuti skema di bawah.
                    </p>
                  </>
                )}
              </div>

              {/* Metode Pembayaran - konsisten dengan Form */}
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">
                  Metode Pembayaran
                </label>
                <select
                  value={paymentInfo.paymentMethod}
                  disabled
                  className="w-full h-9 rounded-lg border border-gray-300 px-3 py-1 text-sm bg-gray-100 text-gray-700 cursor-not-allowed"
                >
                  <option value="TERMIN">Termin (Jadwal Tagihan)</option>
                  <option value="MONTHLY_RETAINER">Retainer Bulanan</option>
                  <option value="DISPUTE_UM_SF">Dispute (UM + Success Fee)</option>
                </select>
              </div>

              {/* Proposal Fee, Diskon, Agree Fee – disembunyikan jika Dispute (konsisten dengan Form) */}
              {paymentInfo.paymentMethod !== 'DISPUTE_UM_SF' && (
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
              )}

              {/* Detail (Payment / Billing) – urutan & label sama dengan Form */}
              <div>
                  {/* 1. Jadwal Tagihan (Termin) */}
                  {paymentInfo.paymentMethod === 'TERMIN' && (
                    <>
                      <label className="block text-sm text-gray-700 mb-1.5">
                        Jadwal Tagihan (Payment Type)
                      </label>
                      <p className="text-xs text-gray-500 mb-2">
                        Item pertama Down Payment, lalu Termin 1, 2, … Total 100%.
                      </p>
                      <div className="border border-gray-200 rounded-lg p-3 bg-white">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-600">Detail</p>
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
                              className={`font-medium ${paymentData.termins.reduce((sum: number, t: any) => sum + (t.percentage || 0), 0) === 100
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
                  <p className="text-gray-700 text-sm">
                    {currentProposal.fileUrl ? (
                      <a href={`http://localhost:3000${currentProposal.fileUrl}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Lihat Dokumen Proposal (PDF)
                      </a>
                    ) : (
                      'Attachments will be shown here'
                    )}
                  </p>
                </div>
              </div>

              {/* Revision Notes / Input for CEO */}
              {(currentProposal.revisionNotes || (isCEOView && currentProposal.status === 'WAITING_CEO_APPROVAL')) && (
                <div className="border border-red-200 bg-red-50 rounded-lg p-4 mt-4">
                  <h3 className="text-sm font-semibold text-red-800 mb-2">Catatan Revisi</h3>
                  {isCEOView && currentProposal.status === 'WAITING_CEO_APPROVAL' ? (
                    <div>
                      <textarea
                        value={revisionNotes}
                        onChange={(e) => setRevisionNotes(e.target.value)}
                        placeholder="Jika proposal perlu revisi, mohon berikan catatan revisi di sini..."
                        className="w-full text-sm border border-red-300 rounded-lg p-2 bg-white min-h-[80px]"
                      />
                      <p className="text-xs text-red-600 mt-1">Wajib diisi jika CEO memilih "Revision"</p>
                    </div>
                  ) : (
                    <p className="text-sm text-red-700 whitespace-pre-wrap">{currentProposal.revisionNotes}</p>
                  )}
                </div>
              )}
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
                  onClick={handleRevision}
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  Revision
                </Button>
                <Button
                  type="button"
                  onClick={handleApprove}
                  className="bg-gray-900 hover:bg-gray-800 text-white"
                >
                  Approve
                </Button>
              </>
            ) : currentProposal.status === 'DRAFT' || currentProposal.status === 'REVISION' ? (
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
