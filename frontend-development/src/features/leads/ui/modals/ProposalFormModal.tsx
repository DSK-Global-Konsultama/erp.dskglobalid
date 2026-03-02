import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { animate } from 'framer-motion';
import { Dialog, DialogContent } from '../../../../components/ui/dialog';
import { Input } from '../../../../components/ui/input';
import { Button } from '../../../../components/ui/button';
import type { Proposal, Lead } from '../../../../lib/mock-data';
import type { LeadStatus } from '../../model/types';

interface ProposalFormModalProps {
  leadId: string;
  leads: Lead[];
  proposals: Proposal[];
  open: boolean;
  onClose: () => void;
  onAddProposal: (proposal: Proposal & { file?: File }) => void;
  onUpdateLeadStatus: (leadId: string, status: LeadStatus) => void;
  editingProposal?: Proposal | null;
  onUpdateProposal?: (id: string, updates: Partial<Proposal> & { file?: File }) => void;
}

type Tier = 'STRATEGIC_RETAINER' | 'PREMIUM_MODULAR' | 'STANDARDIZED_MODULAR';

/** Cara bayar: jadwal tagihan (list item) / retainer bulanan / dispute UM+SF */
type PlanMode = 'INSTALLMENTS' | 'MONTHLY_RETAINER' | 'DISPUTE_UM_SF';

/** Satu item di jadwal tagihan: Down Payment atau Termin 1, 2, ... */
interface BillingScheduleItem {
  id: string;
  order: number;
  kind: 'DOWN_PAYMENT' | 'TERM';
  label: string;
  percentage: number;
  description: string;
}

function createBillingItem(
  order: number,
  kind: BillingScheduleItem['kind'],
  label: string,
  percentage: number,
  description = ''
): BillingScheduleItem {
  return {
    id: `bi-${Date.now()}-${order}-${Math.random().toString(36).slice(2)}`,
    order,
    kind,
    label,
    percentage,
    description,
  };
}

function defaultBillingSchedule(): BillingScheduleItem[] {
  return [
    createBillingItem(0, 'DOWN_PAYMENT', 'Down Payment', 50),
    createBillingItem(1, 'TERM', 'Termin 1', 50),
  ];
}

// Service options by tier
const SERVICE_OPTIONS: Record<Tier, string[]> = {
  STRATEGIC_RETAINER: ['Strategic Tax Advisory'],
  PREMIUM_MODULAR: [
    'Transfer Pricing Advisory',
    'Transfer Pricing Documentation (MF/LF/CbCR)',
    'Pendampingan Pemeriksaan Pajak',
    'Tax Litigation (Banding, Keberatan, Peninjauan Kembali, Kasasi, Gugatan)',
    'Business Structuring & Legal Engineering',
    'Customs Valuation & Dispute Advisory',
    'Sustainability Reporting (GRI/SRG Full)',
    'Tax Due Diligence (Akuisisi / Ekspansi)',
    'Legal Risk Mapping & Strategic Contract Review',
  ],
  STANDARDIZED_MODULAR: [
    'Dokumentasi TP Template (MF/LF Basic Format)',
    'Pendirian Badan Usaha (PT/PMDN/PMA)',
    'Virtual Office & Domisili Hukum',
    'Laporan Keberlanjutan Dasar (GRI/SRG Basic)',
    'Website Company Profile (Basic WebDev)',
  ],
};

export function ProposalFormModal({
  leadId,
  leads,
  proposals: _proposals,
  open,
  onClose,
  onAddProposal,
  onUpdateLeadStatus,
  editingProposal,
  onUpdateProposal,
}: ProposalFormModalProps) {
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const lead = leads.find((l) => l.id === leadId);

  // Tier and Service
  const [tier, setTier] = useState<Tier>('STRATEGIC_RETAINER');
  const [service, setService] = useState('');
  const [proposalFee, setProposalFee] = useState('');
  const [discount, setDiscount] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  // Cara bayar: INSTALLMENTS (jadwal tagihan) | MONTHLY_RETAINER | DISPUTE_UM_SF (dipilih lewat dropdown)
  const [planMode, setPlanMode] = useState<PlanMode>('MONTHLY_RETAINER');

  // Jadwal tagihan: Down Payment + Termin 1, 2, ... (hanya dipakai saat planMode === INSTALLMENTS)
  const [billingItems, setBillingItems] = useState<BillingScheduleItem[]>(() => defaultBillingSchedule());

  // Monthly Retainer
  const [contractStart, setContractStart] = useState('');
  const [contractEnd, setContractEnd] = useState('');
  const [billingTiming, setBillingTiming] = useState<
    'START_OF_MONTH' | 'END_OF_MONTH'
  >('START_OF_MONTH');

  // Dispute (UM + Success Fee)
  const [downPayment, setDownPayment] = useState('');
  const [successFeePercent, setSuccessFeePercent] = useState('');
  const [successFeeBase, setSuccessFeeBase] = useState('');

  // Subcontract: info tambahan saja (bisa dipakai bareng termin/retainer)
  const [hasSubcon, setHasSubcon] = useState(false);
  const [subconPartner, setSubconPartner] = useState('');
  const [subconPayer, setSubconPayer] = useState<'PARTNER' | 'CLIENT' | ''>('');

  // Reset service when tier changes (service list depends on tier)
  useEffect(() => {
    const availableServices = SERVICE_OPTIONS[tier];
    if (availableServices.length > 0) {
      if (!availableServices.includes(service)) setService('');
    } else {
      setService('');
    }
  }, [tier, service]);

  // Subcon ON: clear field dispute saja; metode pembayaran tetap bebas dipilih user
  useEffect(() => {
    if (hasSubcon) {
      setDownPayment('');
      setSuccessFeePercent('');
      setSuccessFeeBase('');
    }
  }, [hasSubcon]);

  // Update form data when editingProposal changes
  useEffect(() => {
    if (editingProposal) {
      setService(editingProposal.service || '');
      setProposalFee(editingProposal.proposalFee?.toString() || '');
      setDiscount('');

      // Parse paymentType for backward compatibility
      const paymentType = editingProposal.paymentType || '';
      let detectedTier: Tier = 'PREMIUM_MODULAR';
      let detectedDispute = false;

      // Subcon (legacy: standalone) -> sekarang hanya info; planMode tetap dari termin/retainer (most important - standalone payment method)
      // Also check hasSubcon property for robustness
      if (paymentType.includes('Subkon dengan') || editingProposal.hasSubcon) {
        setHasSubcon(true);
        const partnerMatch = paymentType.match(/Subkon dengan (.+?)(?::| \|)/);
        if (partnerMatch) setSubconPartner(partnerMatch[1].trim());
        setPlanMode('INSTALLMENTS');
        setBillingItems([createBillingItem(0, 'DOWN_PAYMENT', 'Down Payment', 100)]);
      } else {
        setHasSubcon(false);
        setSubconPartner('');
        setSubconPayer('');

        if (paymentType.includes('Sengketa') || paymentType.includes('Uang Muka')) {
          detectedDispute = true;
          setPlanMode('DISPUTE_UM_SF');
          setHasSubcon(false);
          const dpMatch = paymentType.match(/Uang Muka IDR ([\d.]+)M/);
          const sfMatch = paymentType.match(/Success Fee (\d+)%/);
          const baseMatch = paymentType.match(/dari (.+?)(?:$|;)/);
          if (dpMatch) setDownPayment((parseFloat(dpMatch[1]) * 1_000_000).toString());
          if (sfMatch) setSuccessFeePercent(sfMatch[1]);
          if (baseMatch) setSuccessFeeBase(baseMatch[1].trim());
        } else {
          setDownPayment('');
          setSuccessFeePercent('');
          setSuccessFeeBase('');
        }

        if ((paymentType.includes('Retainer bulanan') || paymentType.includes('Periode')) && !detectedDispute) {
          detectedTier = 'STRATEGIC_RETAINER';
          setPlanMode('MONTHLY_RETAINER');
          const periodMatch = paymentType.match(/Periode (.+?) s\/d (.+?);/);
          const timingMatch = paymentType.match(/Penagihan: (.+)/);
          if (periodMatch) {
            setContractStart(periodMatch[1].trim());
            setContractEnd(periodMatch[2].trim());
          }
          if (timingMatch?.[1].includes('Awal')) setBillingTiming('START_OF_MONTH');
          else setBillingTiming('END_OF_MONTH');
        } else if (!detectedDispute && paymentType.includes('Termin')) {
          setPlanMode('INSTALLMENTS');
          const terminRe = /Termin (\d+):\s*(\d+)%\s*\(IDR [\d.]+M\)(?:\s*-\s*(.+?))?(?=\s*\|\s*|$)/g;
          const items: BillingScheduleItem[] = [];
          const downMatch = paymentType.match(/Down Payment:\s*(\d+)%/);
          let order = 0;
          if (downMatch) {
            items.push(createBillingItem(0, 'DOWN_PAYMENT', 'Down Payment', parseInt(downMatch[1], 10)));
            order = 1;
          }
          let mm: RegExpExecArray | null;
          while ((mm = terminRe.exec(paymentType)) !== null) {
            const num = parseInt(mm[1], 10);
            const pct = parseInt(mm[2], 10);
            const desc = mm[3]?.trim() ?? '';
            items.push(createBillingItem(order++, 'TERM', `Termin ${num}`, pct, desc));
          }
          if (items.length === 0) {
            const legacyRe = paymentType.matchAll(/Termin (\d+):\s*(\d+)%\s*\(IDR [\d.]+M\)(?:\s*-\s*(.+?))?(?=\s*\|\s*|$)/g);
            for (const match of legacyRe) {
              const num = parseInt(match[1], 10);
              const pct = parseInt(match[2], 10);
              const desc = match[3]?.trim() ?? '';
              if (items.length === 0) {
                items.push(createBillingItem(0, 'DOWN_PAYMENT', 'Down Payment', pct, desc));
              } else {
                items.push(createBillingItem(items.length, 'TERM', `Termin ${num}`, pct, desc));
              }
            }
          }
          if (items.length > 0) setBillingItems(items.map((it, i) => ({ ...it, order: i })));
          else setBillingItems(defaultBillingSchedule());
        }

        if (editingProposal.service) {
          const sn = editingProposal.service;
          if (SERVICE_OPTIONS.STRATEGIC_RETAINER.includes(sn)) {
            detectedTier = 'STRATEGIC_RETAINER';
            if (!detectedDispute && !paymentType.includes('Termin')) setPlanMode('MONTHLY_RETAINER');
          } else if (SERVICE_OPTIONS.STANDARDIZED_MODULAR.includes(sn)) {
            detectedTier = 'STANDARDIZED_MODULAR';
            if (!detectedDispute && !paymentType.includes('Retainer')) setPlanMode('INSTALLMENTS');
          } else {
            detectedTier = 'PREMIUM_MODULAR';
            if (!detectedDispute && !paymentType.includes('Retainer')) setPlanMode('INSTALLMENTS');
          }
        }
      }

      setTier(detectedTier);
      setAttachments([]);
    } else {
      setTier('STRATEGIC_RETAINER');
      setService('');
      setProposalFee('');
      setDiscount('');
      setAttachments([]);
      setPlanMode('MONTHLY_RETAINER');
      setBillingItems(defaultBillingSchedule());
      setContractStart('');
      setContractEnd('');
      setBillingTiming('START_OF_MONTH');
      setDownPayment('');
      setSuccessFeePercent('');
      setSuccessFeeBase('');
      setHasSubcon(false);
      setSubconPartner('');
      setSubconPayer('');
    }
  }, [editingProposal, open]);

  const feeNum = Number(proposalFee) || 0;
  const totalPercentage = billingItems.reduce((sum, it) => sum + it.percentage, 0);

  function getItemAmountIdr(item: BillingScheduleItem): number {
    return Math.round((feeNum * item.percentage) / 100);
  }

  const applyTemplate = (template: '50-50' | '50-35-15' | '40-30-30') => {
    if (template === '50-50') {
      setBillingItems([
        createBillingItem(0, 'DOWN_PAYMENT', 'Down Payment', 50),
        createBillingItem(1, 'TERM', 'Termin 1', 50),
      ]);
    } else if (template === '50-35-15') {
      setBillingItems([
        createBillingItem(0, 'DOWN_PAYMENT', 'Down Payment', 50),
        createBillingItem(1, 'TERM', 'Termin 1', 35),
        createBillingItem(2, 'TERM', 'Termin 2', 15),
      ]);
    } else {
      setBillingItems([
        createBillingItem(0, 'DOWN_PAYMENT', 'Down Payment', 40),
        createBillingItem(1, 'TERM', 'Termin 1', 30),
        createBillingItem(2, 'TERM', 'Termin 2', 30),
      ]);
    }
  };

  const handleAddTermin = () => {
    const nextOrder = billingItems.length;
    const nextNum = billingItems.filter((i) => i.kind === 'TERM').length + 1;
    setBillingItems([...billingItems, createBillingItem(nextOrder, 'TERM', `Termin ${nextNum}`, 0)]);
  };

  const handleRemoveBillingItem = (index: number) => {
    if (index === 0 || billingItems.length <= 2) return;
    const next = billingItems.filter((_, i) => i !== index).map((it, i) => ({ ...it, order: i }));
    setBillingItems(next);
  };

  const handleBillingItemChange = (index: number, value: string) => {
    const updated = [...billingItems];
    updated[index] = { ...updated[index], description: value ?? '' };
    setBillingItems(updated);
  };

  const handleBillingItemPercentChange = (index: number, percent: number) => {
    const updated = [...billingItems];
    updated[index] = { ...updated[index], percentage: percent };
    setBillingItems(updated);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      setAttachments([...attachments, ...newFiles]);
      // Reset input value to allow selecting the same file again
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      setAttachments([...attachments, ...newFiles]);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  // Handle close with animation
  const handleClose = () => {
    if (isAnimatingOut) return;

    const dialogContent = document.querySelector(
      '[data-slot="dialog-content"]',
    ) as HTMLElement;
    if (dialogContent) {
      setIsAnimatingOut(true);
      animate(
        dialogContent,
        { x: '100%' },
        {
          duration: 0.8,
          ease: 'easeInOut',
          onComplete: () => {
            setIsAnimatingOut(false);
            onClose();
          },
        },
      );
    } else {
      onClose();
    }
  };

  // Handle open animation
  useEffect(() => {
    if (!open || isAnimatingOut) return;

    const setupAnimation = () => {
      const dialogContent = document.querySelector(
        '[data-slot="dialog-content"]',
      ) as HTMLElement;
      if (dialogContent) {
        dialogContent.style.cssText =
          'animation: none !important; opacity: 1 !important; transform: translateX(100%) !important; transition: none !important;';

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

  function generatePaymentTypeString(): string {
    let main = '';
    if (planMode === 'INSTALLMENTS' && billingItems.length >= 2) {
      main = billingItems
        .map(
          (it) =>
            `${it.label}: ${it.percentage}% (IDR ${(getItemAmountIdr(it) / 1_000_000).toFixed(0)}M)${it.description ? ' - ' + it.description : ''}`,
        )
        .join(' | ');
    } else if (planMode === 'MONTHLY_RETAINER') {
      const fee = Number(proposalFee) || 0;
      const timingLabel = billingTiming === 'START_OF_MONTH' ? 'Awal bulan' : 'Akhir bulan';
      main = `Retainer bulanan: IDR ${(fee / 1_000_000).toFixed(0)}M/bulan; Periode ${contractStart || '-'} s/d ${contractEnd || '-'}; Penagihan: ${timingLabel}`;
    } else if (planMode === 'DISPUTE_UM_SF') {
      const dp = Number(downPayment || 0);
      main = `Sengketa: Uang Muka IDR ${(dp / 1_000_000).toFixed(0)}M; Success Fee ${successFeePercent}% dari ${successFeeBase || 'nilai kemenangan'}`;
    }
    if (hasSubcon && subconPartner.trim()) {
      const payerText = subconPayer === 'PARTNER' ? '; Pembayar: Partner' : subconPayer === 'CLIENT' ? '; Pembayar: Client' : '';
      main = main ? `${main} | Subkon: ${subconPartner}${payerText}` : `Subkon: ${subconPartner}${payerText}`;
    }
    return main || 'Payment plan';
  }

  const handleSubmit = (saveAsDraft: boolean) => {
    if (!lead) return;

    if (!service.trim()) {
      toast.error('Mohon pilih Service Type');
      return;
    }
    if (planMode !== 'DISPUTE_UM_SF' && (!proposalFee || isNaN(Number(proposalFee)))) {
      toast.error('Mohon masukkan Proposal Fee yang valid');
      return;
    }

    if (hasSubcon && !saveAsDraft && !subconPartner.trim()) {
      toast.error('Mohon isi nama partner/flag untuk subkon');
      return;
    }

    if (planMode === 'INSTALLMENTS' && !saveAsDraft) {
      const dpFirst = billingItems[0]?.kind === 'DOWN_PAYMENT';
      if (!dpFirst || billingItems.length < 2) {
        toast.error('Minimal 2 item: Down Payment + minimal 1 Termin. Total harus 100%.');
        return;
      }
      if (totalPercentage !== 100) {
        toast.error('Total persentase harus 100%');
        return;
      }
    }

    if (planMode === 'MONTHLY_RETAINER' && !saveAsDraft) {
      if (!contractStart || !contractEnd) {
        toast.error('Mohon isi periode kontrak untuk monthly retainer');
        return;
      }
    }

    if (planMode === 'DISPUTE_UM_SF' && !saveAsDraft) {
      if (!downPayment || !successFeePercent) {
        toast.error('Mohon isi Uang Muka dan Success Fee untuk sengketa');
        return;
      }
    }

    if (attachments.length === 0) {
      toast.error('Mohon tambahkan minimal 1 attachment');
      return;
    }

    const paymentTypeString = generatePaymentTypeString();

    // Update existing proposal
    if (editingProposal && onUpdateProposal) {
      // Only allow edit if status is DRAFT or REVISION
      if (editingProposal.status !== 'DRAFT' && editingProposal.status !== 'REVISION') {
        toast.error('Proposal tidak bisa diedit karena sudah disubmit untuk approval');
        return;
      }

      onUpdateProposal(editingProposal.id, {
        service: service.trim(),
        proposalFee: Number(proposalFee),
        paymentType: paymentTypeString,
        hasSubcon: hasSubcon,
        status: saveAsDraft ? 'DRAFT' : 'WAITING_CEO_APPROVAL',
        file: attachments[0]
      });
      toast.success(
        saveAsDraft
          ? 'Proposal updated and saved as draft'
          : 'Proposal submitted for CEO approval',
      );
      handleClose();
      return;
    }

    // Create new proposal object
    const newProposal: Proposal & { file?: File } = {
      id: 'p' + Date.now(),
      leadId: leadId,
      service: service.trim(),
      proposalFee: planMode === 'DISPUTE_UM_SF' ? (Number(proposalFee) || 0) : Number(proposalFee),
      paymentType: paymentTypeString,
      hasSubcon: hasSubcon,
      status: saveAsDraft ? 'DRAFT' : 'WAITING_CEO_APPROVAL',
      createdAt: new Date().toISOString().split('T')[0],
      file: attachments[0]
    };

    onAddProposal(newProposal);

    if (!saveAsDraft) {
      onUpdateLeadStatus(leadId, 'IN_PROPOSAL');
    }
    toast.success(
      saveAsDraft ? 'Proposal saved as draft' : 'Proposal submitted for CEO approval',
    );
    handleClose();
  };

  if (!lead) return null;

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
        className="!fixed top-0 right-0 left-auto bottom-0 !translate-x-0 !translate-y-0 min-w-[800px] w-auto max-w-[95vw] h-screen max-h-screen rounded-none border-l border-r-0 border-t-0 border-b-0 shadow-xl p-0 flex flex-col [&>button]:hidden [&]:!animate-none [&]:!opacity-100 z-[9999]"
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold">
              {editingProposal ? 'Edit Proposal' : 'Buat Proposal'}
            </h2>
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

        {/* Form Content */}
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
                  Kelas Layanan (Tier) <span className="text-red-500">*</span>
                </label>
                <select
                  value={tier}
                  onChange={(e) => setTier(e.target.value as Tier)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black hover:border-black"
                >
                  <option value="STRATEGIC_RETAINER">
                    Strategic Retainer
                  </option>
                  <option value="PREMIUM_MODULAR">
                    Premium Modular
                  </option>
                  <option value="STANDARDIZED_MODULAR">
                    Standardized Modular
                  </option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Pilihan tier menentukan service type yang tersedia dan default payment method.
                </p>
              </div>

              {/* Service Type */}
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">
                  Service Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black hover:border-black"
                  required
                >
                  <option value="">-- Pilih Service Type --</option>
                  {SERVICE_OPTIONS[tier].map((serviceOption) => (
                    <option key={serviceOption} value={serviceOption}>
                      {serviceOption}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subcon: checklist + section (partner, payer) di dalam wadah yang sama */}
              <div className="border border-gray-200 rounded-lg bg-white p-3 space-y-3">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 flex-shrink-0 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasSubcon}
                      onChange={(e) => setHasSubcon(e.target.checked)}
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
                {hasSubcon && (
                  <>
                    <div className="border-t border-gray-200 pt-3" />
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Partner / Flag <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="text"
                          value={subconPartner}
                          onChange={(e) => setSubconPartner(e.target.value)}
                          placeholder="Asahi"
                          className="focus-visible:ring-black focus-visible:ring-1 focus-visible:border-black hover:border-black"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Pembayar (opsional)
                        </label>
                        <select
                          value={subconPayer}
                          onChange={(e) => setSubconPayer(e.target.value as 'PARTNER' | 'CLIENT' | '')}
                          className="h-9 w-full rounded-lg border border-gray-300 px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black hover:border-black"
                        >
                          <option value="">— Pilih —</option>
                          <option value="PARTNER">Partner</option>
                          <option value="CLIENT">Client</option>
                        </select>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Proposal Fee di atas adalah nilai yang dibayarkan partner ke perusahaan kita. Jadwal tagihan mengikuti skema di bawah.
                    </p>
                  </>
                )}
              </div>

              {/* Metode Pembayaran */}
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">
                  Metode Pembayaran
                </label>
                <select
                  value={planMode}
                  onChange={(e) => setPlanMode(e.target.value as PlanMode)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black hover:border-black"
                >
                  <option value="INSTALLMENTS">Termin (Jadwal Tagihan)</option>
                  <option value="MONTHLY_RETAINER">Retainer Bulanan</option>
                  <option value="DISPUTE_UM_SF">Dispute (UM + Success Fee)</option>
                </select>
              </div>

              {/* Proposal Fee, Diskon, Agree Fee – disembunyikan jika Dispute */}
              {planMode !== 'DISPUTE_UM_SF' && (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1.5">
                      Proposal Fee (IDR) <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      value={proposalFee}
                      onChange={(e) => setProposalFee(e.target.value)}
                      placeholder="150000000"
                      className="w-full focus-visible:ring-black focus-visible:ring-1 focus-visible:border-black hover:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1.5">
                      Diskon (IDR)
                    </label>
                    <Input
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      placeholder="15000000"
                      className="w-full focus-visible:ring-black focus-visible:ring-1 focus-visible:border-black hover:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1.5">
                      Agree Fee
                    </label>
                    <Input
                      type="text"
                      disabled
                      placeholder="Akan diisi setelah deal disetujui client"
                      className="w-full bg-gray-100 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                </div>
              )}

              {/* Detail (Payment / Billing - by planMode) */}
              <div>
                  {/* 1. Jadwal tagihan (Down Payment + Termin 1, 2, ...) */}
                  {planMode === 'INSTALLMENTS' && (
                    <>
                      <label className="block text-sm text-gray-700 mb-1.5">
                        Jadwal Tagihan (Payment Type)
                      </label>
                      <p className="text-xs text-gray-500 mb-2">
                        Item pertama Down Payment, lalu Termin 1, 2, … Total 100%. Gunakan template cepat atau edit manual.
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Button type="button" variant="outline" size="sm" onClick={() => applyTemplate('50-50')} className="border-gray-300">50-50</Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => applyTemplate('50-35-15')} className="border-gray-300">50-35-15</Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => applyTemplate('40-30-30')} className="border-gray-300">40-30-30</Button>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-3 bg-white">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-600">Detail</p>
                          <button
                            type="button"
                            onClick={handleAddTermin}
                            className="text-sm px-3 py-1 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-1"
                          >
                            <Plus className="w-4 h-4" /> Tambah Termin
                          </button>
                        </div>
                        <div className="space-y-2">
                          {billingItems.map((item, index) => (
                            <div key={item.id} className="border border-gray-200 rounded-lg p-2.5 bg-gray-50">
                              <div className="flex items-center justify-between mb-1.5">
                                <label className="text-sm font-medium text-gray-700">{item.label}</label>
                                {index > 0 && billingItems.length > 2 && (
                                  <button type="button" onClick={() => handleRemoveBillingItem(index)} className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                              <div className="grid grid-cols-2 gap-2 mb-1.5">
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">Persentase (%)</label>
                                  <Input
                                    type="number"
                                    value={item.percentage}
                                    onChange={(e) => handleBillingItemPercentChange(index, Number(e.target.value) || 0)}
                                    className="w-full focus-visible:ring-black focus-visible:ring-1 focus-visible:border-black hover:border-black"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">Nominal (IDR)</label>
                                  <Input
                                    type="text"
                                    value={getItemAmountIdr(item).toLocaleString('id-ID')}
                                    disabled
                                    className="w-full bg-gray-100 text-gray-700 cursor-not-allowed"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">Deskripsi (opsional)</label>
                                <Input
                                  type="text"
                                  value={item.description ?? ''}
                                  onChange={(e) => handleBillingItemChange(index, e.target.value)}
                                  placeholder="e.g., DP saat EL signed, Pelunasan saat project selesai"
                                  className="w-full focus-visible:ring-black focus-visible:ring-1 focus-visible:border-black hover:border-black"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-200 flex items-center justify-between">
                          <span className="text-sm text-gray-600">Total Persentase:</span>
                          <span className={`font-medium ${totalPercentage === 100 ? 'text-green-600' : 'text-red-600'}`}>{totalPercentage}%</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1.5">Minimal 2 item (Down Payment + 1 Termin). Total harus 100%.</p>
                      </div>
                    </>
                  )}

                  {/* 2. MONTHLY_RETAINER */}
                  {planMode === 'MONTHLY_RETAINER' && (
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
                            value={contractStart}
                            onChange={(e) => setContractStart(e.target.value)}
                            className="w-full focus-visible:ring-black focus-visible:ring-1 focus-visible:border-black hover:border-black"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            Periode Kontrak – Selesai
                          </label>
                          <Input
                            type="date"
                            value={contractEnd}
                            onChange={(e) => setContractEnd(e.target.value)}
                            className="w-full focus-visible:ring-black focus-visible:ring-1 focus-visible:border-black hover:border-black"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Waktu Penagihan
                        </label>
                        <div className="flex gap-4 text-sm">
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              checked={billingTiming === 'START_OF_MONTH'}
                              onChange={() =>
                                setBillingTiming('START_OF_MONTH')
                              }
                            />
                            <span>Awal bulan</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              checked={billingTiming === 'END_OF_MONTH'}
                              onChange={() => setBillingTiming('END_OF_MONTH')}
                            />
                            <span>Akhir bulan</span>
                          </label>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        Contoh: IDR {proposalFee || '0'} / bulan, periode{' '}
                        {contractStart || '...'} s/d {contractEnd || '...'}.
                      </p>
                    </div>
                  )}

                  {/* 3. DISPUTE_UM_SF */}
                  {planMode === 'DISPUTE_UM_SF' && (
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
                            type="number"
                            value={downPayment}
                            onChange={(e) => setDownPayment(e.target.value)}
                            placeholder="50000000"
                            className="focus-visible:ring-black focus-visible:ring-1 focus-visible:border-black hover:border-black"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            Success Fee (%)
                          </label>
                          <Input
                            type="number"
                            value={successFeePercent}
                            onChange={(e) =>
                              setSuccessFeePercent(e.target.value)
                            }
                            placeholder="20"
                            className="focus-visible:ring-black focus-visible:ring-1 focus-visible:border-black hover:border-black"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            Basis Success Fee
                          </label>
                          <Input
                            type="text"
                            value={successFeeBase}
                            onChange={(e) =>
                              setSuccessFeeBase(e.target.value)
                            }
                            placeholder="% dari pajak yang berhasil dikurangi / restitusi"
                            className="focus-visible:ring-black focus-visible:ring-1 focus-visible:border-black hover:border-black"
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

              {/* Attachments */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Attachments <span className="text-red-500">*</span>
                </label>
                <div className="border border-gray-200 rounded-lg p-4 bg-white">
                  <div
                    className={`flex flex-col items-center justify-center py-6 border-2 border-dashed rounded-lg transition-colors ${isDragOver
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                      }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <Upload className={`w-10 h-10 mb-3 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`} />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className={`text-sm ${isDragOver ? 'text-blue-600 font-medium' : 'text-gray-600'}`}>
                        Click to upload or drag and drop
                      </span>
                      <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        multiple
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX (Max. 10MB per file)
                    </p>
                  </div>
                  {attachments.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {attachments.map((attachment, index) => (
                        <div
                          key={index}
                          className="p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-700">{attachment.name}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {(attachment.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                            <button
                              onClick={() => handleRemoveAttachment(index)}
                              className="text-sm text-red-600 hover:text-red-700"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 justify-end py-4 px-6 border-t border-gray-200 bg-white flex-shrink-0">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSubmit(true)}
            >
              Save as Draft
            </Button>
            <Button type="button" onClick={() => handleSubmit(false)}>
              Submit for Approval
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
