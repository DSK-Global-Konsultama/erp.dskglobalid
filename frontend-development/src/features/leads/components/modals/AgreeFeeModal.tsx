import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { animate } from 'framer-motion';
import { Dialog, DialogContent } from '../../../../components/ui/dialog';
import { Input } from '../../../../components/ui/input';
import { Button } from '../../../../components/ui/button';
import type { Proposal, Lead } from '../../../../lib/mock-data';

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

interface AgreeFeeModalProps {
  proposal: Proposal;
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
  onSave: (updates: { agreeFee: number; paymentTypeFinal: string; dealDate: string }) => void;
}

export function AgreeFeeModal({
  proposal,
  lead,
  open,
  onClose,
  onSave
}: AgreeFeeModalProps) {
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [agreeFee, setAgreeFee] = useState('');
  const [dealDate, setDealDate] = useState(new Date().toISOString().split('T')[0]);

  // Determine billing model from proposal paymentType
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

  const billingModel = determineBillingModel(proposal.paymentType);

  // Payment type final states based on billing model
  const [paymentScheme, setPaymentScheme] = useState<PaymentScheme>('50-50');
  const [termins, setTermins] = useState<Termin[]>([
    { percentage: 50, amount: 0, description: '' },
    { percentage: 50, amount: 0, description: '' },
  ]);

  // Strategic advisory
  const [contractStart, setContractStart] = useState('');
  const [contractEnd, setContractEnd] = useState('');
  const [billingTiming, setBillingTiming] = useState<'START_OF_MONTH' | 'END_OF_MONTH'>('START_OF_MONTH');

  // Sengketa (UM + Success Fee)
  const [downPayment, setDownPayment] = useState('');
  const [successFeePercent, setSuccessFeePercent] = useState('');
  const [successFeeBase, setSuccessFeeBase] = useState('');

  // Subkon
  const [subconPartner, setSubconPartner] = useState('');
  const [subconPaymentTiming, setSubconPaymentTiming] = useState<'UPFRONT' | 'END'>('UPFRONT');

  // Parse existing paymentTypeFinal to populate form
  useEffect(() => {
    if (open && proposal.paymentTypeFinal) {
      // Try to parse existing paymentTypeFinal
      // For now, just initialize with defaults
    }
  }, [open, proposal]);

  // Update termins when payment scheme changes
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

  // Calculate termin amounts when agreeFee changes
  useEffect(() => {
    if (agreeFee && billingModel === 'PROJECT_TERMIN') {
      const fee = Number(agreeFee);
      setTermins(prev => prev.map(t => ({
        ...t,
        amount: Math.round((fee * t.percentage) / 100)
      })));
    }
  }, [agreeFee, billingModel]);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setAgreeFee(proposal.agreeFee?.toString() || proposal.proposalFee.toString());
      setDealDate(proposal.dealDate || new Date().toISOString().split('T')[0]);
      
      // Reset payment type final form
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
    }
  }, [open, proposal]);

  // Handle close with animation
  const handleClose = () => {
    if (isAnimatingOut) return;
    
    const dialogContent = document.querySelector('[data-agree-fee-modal]') as HTMLElement;
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
      const dialogContent = document.querySelector('[data-agree-fee-modal]') as HTMLElement;
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

  const handleAddTermin = () => {
    setTermins([...termins, { percentage: 0, amount: 0, description: '' }]);
  };

  const handleRemoveTermin = (index: number) => {
    if (termins.length > 1) {
      setTermins(termins.filter((_, i) => i !== index));
    }
  };

  const handleTerminChange = (index: number, field: keyof Termin, value: string | number) => {
    const updated = [...termins];
    if (field === 'percentage') {
      const newPercentage = Number(value);
      updated[index].percentage = newPercentage;
      if (agreeFee) {
        const fee = Number(agreeFee);
        updated[index].amount = Math.round((fee * newPercentage) / 100);
      }
    } else if (field === 'description') {
      updated[index].description = value as string;
    }
    setTermins(updated);
  };

  const buildPaymentTypeFinal = (): string => {
    if (billingModel === 'PROJECT_TERMIN') {
      return termins
        .map(
          (t, i) =>
            `Termin ${i + 1}: ${t.percentage}% (IDR ${(
              t.amount / 1_000_000
            ).toFixed(0)}M)${t.description ? ' - ' + t.description : ''}`,
        )
        .join(' | ');
    } else if (billingModel === 'STRATEGIC_ADVISORY') {
      const fee = Number(agreeFee);
      const timingLabel =
        billingTiming === 'START_OF_MONTH' ? 'Awal bulan' : 'Akhir bulan';
      return `Retainer bulanan: IDR ${(fee / 1_000_000).toFixed(
        0,
      )}M/bulan; Periode ${contractStart || '-'} s/d ${
        contractEnd || '-'
      }; Penagihan: ${timingLabel}`;
    } else if (billingModel === 'DISPUTE_UM_SF') {
      const dp = Number(downPayment || 0);
      return `Sengketa: Uang Muka IDR ${(dp / 1_000_000).toFixed(
        0,
      )}M; Success Fee ${successFeePercent}% dari ${
        successFeeBase || 'nilai kemenangan'
      }`;
    } else if (billingModel === 'SUBCON') {
      const timingText =
        subconPaymentTiming === 'UPFRONT'
          ? '100% di awal'
          : '100% di akhir';
      return `Subkon dengan ${subconPartner}: pembayaran ${timingText} oleh partner`;
    }
    return '';
  };

  const handleSave = () => {
    // Validation
    if (!agreeFee || isNaN(Number(agreeFee)) || Number(agreeFee) <= 0) {
      toast.error('Mohon isi Agree Fee yang valid (harus > 0)');
      return;
    }

    // Billing-model-specific validation
    if (billingModel === 'PROJECT_TERMIN') {
      const totalPercentage = termins.reduce((sum, t) => sum + t.percentage, 0);
      if (totalPercentage !== 100) {
        toast.error('Total payment percentage must equal 100%');
        return;
      }
    }

    if (billingModel === 'STRATEGIC_ADVISORY') {
      if (!contractStart || !contractEnd) {
        toast.error('Mohon isi periode kontrak untuk strategic advisory');
        return;
      }
    }

    if (billingModel === 'DISPUTE_UM_SF') {
      if (!downPayment || !successFeePercent) {
        toast.error('Mohon isi Uang Muka dan Success Fee untuk sengketa');
        return;
      }
    }

    if (billingModel === 'SUBCON') {
      if (!subconPartner) {
        toast.error('Mohon isi nama partner/flag untuk subkon');
        return;
      }
    }

    const paymentTypeFinalString = buildPaymentTypeFinal();
    const finalDealDate = dealDate || new Date().toISOString().split('T')[0];

    onSave({
      agreeFee: Number(agreeFee),
      paymentTypeFinal: paymentTypeFinalString,
      dealDate: finalDealDate
    });

    toast.success('Deal terms berhasil disimpan dan terkunci!');
    // Close immediately without animation
    onClose();
  };

  const totalPercentage = termins.reduce((sum, t) => sum + t.percentage, 0);

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
        data-agree-fee-modal
        className="!fixed top-0 right-0 left-auto bottom-0 !translate-x-0 !translate-y-0 min-w-[800px] w-auto max-w-[95vw] h-screen max-h-screen rounded-none border-l border-r-0 border-t-0 border-b-0 shadow-xl p-0 flex flex-col [&>button]:hidden [&]:!animate-none [&]:!opacity-100 z-[9999]"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Setujui Deal & Isi Agree Fee</h2>
            <p className="text-sm text-gray-600 mt-1">{lead?.clientName || ''}</p>
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
              {/* Info Client & Proposal (Readonly) */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm text-gray-600 mb-3">Informasi Proposal</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-gray-600">Client</p>
                    <p className="font-medium">{lead?.clientName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Service</p>
                    <p className="font-medium">{proposal.service}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Proposal Fee</p>
                    <p className="font-medium">IDR {proposal.proposalFee.toLocaleString('id-ID')}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Payment Type (Proposal)</p>
                    <p className="font-medium">{proposal.paymentType}</p>
                  </div>
                </div>
              </div>

              {/* Agree Fee Input */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Agree Fee (Final) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  value={agreeFee}
                  onChange={(e) => setAgreeFee(e.target.value)}
                  placeholder="150000000"
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Nilai fee final yang disepakati dengan client (boleh sama atau berbeda dengan Proposal Fee).
                </p>
              </div>

              {/* Payment Type Final - Same design as payment type */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Payment Type Final <span className="text-red-500">*</span>
                </label>
                <p className="text-sm text-gray-500 mb-3">
                  Tentukan skema pembayaran final yang disepakati dengan client.
                </p>

                {/* 1. PROJECT_TERMIN */}
                {billingModel === 'PROJECT_TERMIN' && (
                  <>
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
                      Agree Fee akan dianggap sebagai fee per bulan (retainer).
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
                      Agree Fee di atas bisa dipakai sebagai indikasi total
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
                      Agree Fee di atas adalah nilai yang dibayarkan partner
                      (mis. Asahi) ke perusahaan kita.
                    </p>
                  </div>
                )}
              </div>

              {/* Deal Date Input */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Deal Date
                </label>
                <Input
                  type="date"
                  value={dealDate}
                  onChange={(e) => setDealDate(e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Tanggal deal disetujui oleh client.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3 justify-end flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
            >
              Simpan & Lock Terms
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

