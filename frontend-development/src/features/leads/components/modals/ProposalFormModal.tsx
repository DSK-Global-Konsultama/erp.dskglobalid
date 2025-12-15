import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { animate } from 'framer-motion';
import { Dialog, DialogContent } from '../../../../components/ui/dialog';
import { Input } from '../../../../components/ui/input';
import { Textarea } from '../../../../components/ui/textarea';
import { Button } from '../../../../components/ui/button';
import type { Proposal, Lead } from '../../../../lib/mock-data';
import type { LeadStatus } from '../shared/LeadTrackerDetail';

interface ProposalFormModalProps {
  leadId: string;
  leads: Lead[];
  proposals: Proposal[];
  open: boolean;
  onClose: () => void;
  onAddProposal: (proposal: Proposal) => void;
  onUpdateLeadStatus: (leadId: string, status: LeadStatus) => void;
  editingProposal?: Proposal | null;
  onUpdateProposal?: (id: string, updates: Partial<Proposal>) => void;
}

interface Termin {
  percentage: number;
  amount: number;
  description: string;
}

type PaymentScheme = '50-50' | '50-35-15' | '40-30-30' | 'Custom';

type BillingModel =
  | 'STRATEGIC_ADVISORY'
  | 'PROJECT_TERMIN'
  | 'DISPUTE_UM_SF'
  | 'SUBCON';

export function ProposalFormModal({
  leadId,
  leads,
  proposals,
  open,
  onClose,
  onAddProposal,
  onUpdateLeadStatus,
  editingProposal,
  onUpdateProposal,
}: ProposalFormModalProps) {
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const lead = leads.find((l) => l.id === leadId);

  const [service, setService] = useState('');
  const [proposalFee, setProposalFee] = useState('');
  const [discount, setDiscount] = useState('');
  const [paymentScheme, setPaymentScheme] = useState<PaymentScheme>('50-50');
  const [termins, setTermins] = useState<Termin[]>([
    { percentage: 50, amount: 0, description: '' },
    { percentage: 50, amount: 0, description: '' },
  ]);
  const [attachments, setAttachments] = useState<File[]>([]);

  // Billing model & related states
  const [billingModel, setBillingModel] =
    useState<BillingModel>('STRATEGIC_ADVISORY');

  // Strategic advisory
  const [contractStart, setContractStart] = useState('');
  const [contractEnd, setContractEnd] = useState('');
  const [billingTiming, setBillingTiming] = useState<
    'START_OF_MONTH' | 'END_OF_MONTH'
  >('START_OF_MONTH');

  // Sengketa (UM + Success Fee)
  const [downPayment, setDownPayment] = useState('');
  const [successFeePercent, setSuccessFeePercent] = useState('');
  const [successFeeBase, setSuccessFeeBase] = useState('');

  // Subkon (white kitchen / nebeng bendera)
  const [subconPartner, setSubconPartner] = useState('');
  const [subconPaymentTiming, setSubconPaymentTiming] = useState<
    'UPFRONT' | 'END'
  >('UPFRONT');

  // Update form data when editingProposal changes
  useEffect(() => {
    if (editingProposal) {
      setService(editingProposal.service || '');
      setProposalFee(editingProposal.proposalFee?.toString() || '');
      setDiscount('');

      // Default billing model & related fields when editing
      setBillingModel('STRATEGIC_ADVISORY');
      setPaymentScheme('50-50');
      setTermins([
        { percentage: 50, amount: 0, description: '' },
        { percentage: 50, amount: 0, description: '' },
      ]);

      setContractStart('');
      setContractEnd('');
      setBillingTiming('START_OF_MONTH');

      setDownPayment('');
      setSuccessFeePercent('');
      setSuccessFeeBase('');

      setSubconPartner('');
      setSubconPaymentTiming('UPFRONT');

      setAttachments([]);
    } else {
      setService('');
      setProposalFee('');
      setDiscount('');
      setPaymentScheme('50-50');
      setTermins([
        { percentage: 50, amount: 0, description: '' },
        { percentage: 50, amount: 0, description: '' },
      ]);
      setAttachments([]);

      setBillingModel('STRATEGIC_ADVISORY');
      setContractStart('');
      setContractEnd('');
      setBillingTiming('START_OF_MONTH');
      setDownPayment('');
      setSuccessFeePercent('');
      setSuccessFeeBase('');
      setSubconPartner('');
      setSubconPaymentTiming('UPFRONT');
    }
  }, [editingProposal, open]);

  // Update termins when payment scheme changes (for project termin)
  useEffect(() => {
    if (paymentScheme === '50-50') {
      setTermins([
        { percentage: 50, amount: 0, description: '' },
        { percentage: 50, amount: 0, description: '' },
      ]);
    } else if (paymentScheme === '50-35-15') {
      setTermins([
        { percentage: 50, amount: 0, description: '' },
        { percentage: 35, amount: 0, description: '' },
        { percentage: 15, amount: 0, description: '' },
      ]);
    } else if (paymentScheme === '40-30-30') {
      setTermins([
        { percentage: 40, amount: 0, description: '' },
        { percentage: 30, amount: 0, description: '' },
        { percentage: 30, amount: 0, description: '' },
      ]);
    }
  }, [paymentScheme]);

  // Calculate termin amounts whenever proposalFee or termins change
  useEffect(() => {
    if (proposalFee) {
      const fee = Number(proposalFee);
      setTermins((prev) =>
        prev.map((t) => ({
          ...t,
          amount: Math.round((fee * t.percentage) / 100),
        })),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposalFee]);

  const totalPercentage = termins.reduce((sum, t) => sum + t.percentage, 0);

  const handleAddTermin = () => {
    setTermins([...termins, { percentage: 0, amount: 0, description: '' }]);
  };

  const handleRemoveTermin = (index: number) => {
    if (termins.length > 1) {
      setTermins(termins.filter((_, i) => i !== index));
    }
  };

  const handleTerminChange = (
    index: number,
    field: keyof Termin,
    value: string | number,
  ) => {
    const updated = [...termins];
    if (field === 'percentage') {
      const newPercentage = Number(value);
      updated[index].percentage = newPercentage;
      if (proposalFee) {
        const fee = Number(proposalFee);
        updated[index].amount = Math.round((fee * newPercentage) / 100);
      }
    } else if (field === 'description') {
      updated[index].description = value as string;
    }
    setTermins(updated);
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

  const handleSubmit = (saveAsDraft: boolean) => {
    if (!lead) return;

    // Basic validation
    if (!service.trim()) {
      toast.error('Please enter service type');
      return;
    }
    if (!proposalFee || isNaN(Number(proposalFee))) {
      toast.error('Please enter valid proposal fee');
      return;
    }

    // Billing-model-specific validation
    if (
      billingModel === 'PROJECT_TERMIN' &&
      !saveAsDraft &&
      totalPercentage !== 100
    ) {
      toast.error('Total payment percentage must equal 100%');
      return;
    }

    if (billingModel === 'STRATEGIC_ADVISORY' && !saveAsDraft) {
      if (!contractStart || !contractEnd) {
        toast.error('Mohon isi periode kontrak untuk strategic advisory');
        return;
      }
    }

    if (billingModel === 'DISPUTE_UM_SF' && !saveAsDraft) {
      if (!downPayment || !successFeePercent) {
        toast.error('Mohon isi Uang Muka dan Success Fee untuk sengketa');
        return;
      }
    }

    if (billingModel === 'SUBCON' && !saveAsDraft) {
      if (!subconPartner) {
        toast.error('Mohon isi nama partner/flag untuk subkon');
        return;
      }
    }

    // Attachments validation
    if (attachments.length === 0) {
      toast.error('Mohon tambahkan minimal 1 attachment');
      return;
    }

    // Build paymentType string from billingModel
    let paymentTypeString = '';

    if (billingModel === 'PROJECT_TERMIN') {
      paymentTypeString = termins
        .map(
          (t, i) =>
            `Termin ${i + 1}: ${t.percentage}% (IDR ${(
              t.amount / 1_000_000
            ).toFixed(0)}M)${t.description ? ' - ' + t.description : ''}`,
        )
        .join(' | ');
    } else if (billingModel === 'STRATEGIC_ADVISORY') {
      const fee = Number(proposalFee);
      const timingLabel =
        billingTiming === 'START_OF_MONTH' ? 'Awal bulan' : 'Akhir bulan';
      paymentTypeString = `Retainer bulanan: IDR ${(fee / 1_000_000).toFixed(
        0,
      )}M/bulan; Periode ${contractStart || '-'} s/d ${
        contractEnd || '-'
      }; Penagihan: ${timingLabel}`;
    } else if (billingModel === 'DISPUTE_UM_SF') {
      const dp = Number(downPayment || 0);
      paymentTypeString = `Sengketa: Uang Muka IDR ${(dp / 1_000_000).toFixed(
        0,
      )}M; Success Fee ${successFeePercent}% dari ${
        successFeeBase || 'nilai kemenangan'
      }`;
    } else if (billingModel === 'SUBCON') {
      const timingText =
        subconPaymentTiming === 'UPFRONT'
          ? '100% di awal'
          : '100% di akhir';
      paymentTypeString = `Subkon dengan ${subconPartner}: pembayaran ${timingText} oleh partner`;
    }

    // Update existing proposal
    if (editingProposal && onUpdateProposal) {
      onUpdateProposal(editingProposal.id, {
        service: service.trim(),
        proposalFee: Number(proposalFee),
        paymentType: paymentTypeString,
        hasSubcon: false,
        status: saveAsDraft ? 'DRAFT' : 'SENT',
      });
      toast.success(
        saveAsDraft
          ? 'Proposal updated and saved as draft'
          : 'Proposal updated and submitted for CEO approval',
      );
      handleClose();
      return;
    }

    // Create new proposal object
    const newProposal: Proposal = {
      id: 'p' + Date.now(),
      leadId: leadId,
      service: service.trim(),
      proposalFee: Number(proposalFee),
      paymentType: paymentTypeString,
      hasSubcon: false,
      status: saveAsDraft ? 'DRAFT' : 'SENT',
      createdAt: new Date().toISOString().split('T')[0],
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
                  Jenis Jasa / Billing Model <span className="text-red-500">*</span>
                </label>
                <select
                  value={billingModel}
                  onChange={(e) =>
                    setBillingModel(e.target.value as BillingModel)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="STRATEGIC_ADVISORY">
                    Strategic Advisory (bulanan)
                  </option>
                  <option value="PROJECT_TERMIN">
                    Premium Modular
                  </option>
                  <option value="DISPUTE_UM_SF">
                    Premium Modular - Sengketa
                  </option>
                  <option value="SUBCON">
                    Subkon (White Kitchen)
                  </option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Pilihan ini menentukan model pembayaran dan cara kita menulis
                  terms di proposal.
                </p>
              </div>

              {/* Service */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Service Type <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  placeholder="e.g., Tax Consulting - Transfer Pricing Review"
                  className="w-full"
                />
              </div>

              {/* Fees - 3 columns */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Proposal Fee (IDR) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    value={proposalFee}
                    onChange={(e) => setProposalFee(e.target.value)}
                    placeholder="150000000"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Diskon (IDR)
                  </label>
                  <Input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    placeholder="15000000"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
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

                    <select
                      value={paymentScheme}
                      onChange={(e) =>
                        setPaymentScheme(e.target.value as PaymentScheme)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                    >
                      <option value="50-50">50-50</option>
                      <option value="50-35-15">50-35-15</option>
                      <option value="40-30-30">40-30-30</option>
                      <option value="Custom">Custom</option>
                    </select>

                    <div className="border border-gray-200 rounded-lg p-4 bg-white">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm text-gray-600">Detail Termin</p>
                        {paymentScheme === 'Custom' && (
                          <button
                            onClick={handleAddTermin}
                            className="text-sm px-3 py-1 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-1"
                          >
                            <Plus className="w-4 h-4" />
                            Tambah Termin
                          </button>
                        )}
                      </div>
                      <div className="space-y-3">
                        {termins.map((termin, index) => (
                          <div
                            key={index}
                            className="border border-gray-200 rounded-lg p-3 bg-gray-50"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-sm font-medium text-gray-700">
                                Termin {index + 1}
                              </label>
                              {paymentScheme === 'Custom' &&
                                termins.length > 1 && (
                                  <button
                                    onClick={() => handleRemoveTermin(index)}
                                    className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-3 mb-2">
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">
                                  Persentase (%)
                                </label>
                                <Input
                                  type="number"
                                  value={termin.percentage}
                                  onChange={(e) =>
                                    handleTerminChange(
                                      index,
                                      'percentage',
                                      e.target.value,
                                    )
                                  }
                                  disabled={paymentScheme !== 'Custom'}
                                  className="w-full disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">
                                Deskripsi termin
                              </label>
                              <Input
                                type="text"
                                value={termin.description}
                                onChange={(e) =>
                                  handleTerminChange(
                                    index,
                                    'description',
                                    e.target.value,
                                  )
                                }
                                placeholder="e.g., DP saat EL signed, Progress 50%, Pelunasan saat project selesai"
                                className="w-full"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Total Persentase:
                        </span>
                        <span
                          className={`font-medium ${
                            totalPercentage === 100
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {totalPercentage}%
                        </span>
                      </div>
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
                        <Input
                          type="date"
                          value={contractStart}
                          onChange={(e) => setContractStart(e.target.value)}
                          className="w-full"
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
                          className="w-full"
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
                        <Input
                          type="number"
                          value={downPayment}
                          onChange={(e) => setDownPayment(e.target.value)}
                          placeholder="50000000"
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
                        />
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
                        <Input
                          type="text"
                          value={subconPartner}
                          onChange={(e) =>
                            setSubconPartner(e.target.value)
                          }
                          placeholder="Asahi"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Skema Pembayaran ke Kita
                        </label>
                        <div className="flex gap-4 text-sm mt-1">
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              checked={subconPaymentTiming === 'UPFRONT'}
                              onChange={() =>
                                setSubconPaymentTiming('UPFRONT')
                              }
                            />
                            <span>100% di awal</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              checked={subconPaymentTiming === 'END'}
                              onChange={() =>
                                setSubconPaymentTiming('END')
                              }
                            />
                            <span>100% di akhir</span>
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
              </div>

              {/* Attachments */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Attachments <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {attachments.map((attachment, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                    >
                      <span className="flex-1 text-sm">{attachment.name}</span>
                      <span className="text-xs text-gray-500">
                        {(attachment.size / 1024).toFixed(2)} KB
                      </span>
                      <button
                        onClick={() => handleRemoveAttachment(index)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <div>
                    <Input
                      type="file"
                      onChange={handleFileChange}
                      className="w-full"
                      multiple
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Format yang didukung: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
                    </p>
                  </div>
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
