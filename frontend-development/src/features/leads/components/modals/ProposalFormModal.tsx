import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { animate } from 'framer-motion';
import { Dialog, DialogContent } from '../../../../components/ui/dialog';
import { Input } from '../../../../components/ui/input';
import { Button } from '../../../../components/ui/button';
import type { Proposal, Lead } from '../../../../lib/mock-data';
import type { LeadStatus } from '../management/LeadTrackerDetail';

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

type Tier = 'STRATEGIC_RETAINER' | 'PREMIUM_MODULAR' | 'STANDARDIZED_MODULAR';

type PaymentMethod = 'MONTHLY_RETAINER' | 'TERMIN' | 'DISPUTE_UM_SF' | 'SUBCON';

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

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('MONTHLY_RETAINER');
  const [isDispute, setIsDispute] = useState(false);

  // Payment Scheme for TERMIN
  const [paymentScheme, setPaymentScheme] = useState<PaymentScheme>('50-50');
  const [termins, setTermins] = useState<Termin[]>([
    { percentage: 50, amount: 0, description: '' },
    { percentage: 50, amount: 0, description: '' },
  ]);

  // Monthly Retainer fields
  const [contractStart, setContractStart] = useState('');
  const [contractEnd, setContractEnd] = useState('');
  const [billingTiming, setBillingTiming] = useState<
    'START_OF_MONTH' | 'END_OF_MONTH'
  >('START_OF_MONTH');

  // Dispute fields (UM + Success Fee)
  const [downPayment, setDownPayment] = useState('');
  const [successFeePercent, setSuccessFeePercent] = useState('');
  const [successFeeBase, setSuccessFeeBase] = useState('');

  // Subkon (white kitchen / nebeng bendera) - separate toggle
  const [hasSubcon, setHasSubcon] = useState(false);
  const [subconPartner, setSubconPartner] = useState('');
  const [subconPaymentTiming, setSubconPaymentTiming] = useState<
    'UPFRONT' | 'END'
  >('UPFRONT');

  // Reset service when tier changes
  useEffect(() => {
    const availableServices = SERVICE_OPTIONS[tier];
    if (availableServices.length > 0) {
      // Reset to first option or empty if current service not in tier options
      if (!availableServices.includes(service)) {
        setService('');
      }
    } else {
      setService('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tier]);

  // Handle subcon toggle - changes payment method similar to dispute
  useEffect(() => {
    if (hasSubcon) {
      setPaymentMethod('SUBCON');
      setIsDispute(false); // Dispute tidak berlaku saat subcon
      // Clear irrelevant fields
      setContractStart('');
      setContractEnd('');
      setBillingTiming('START_OF_MONTH');
      setDownPayment('');
      setSuccessFeePercent('');
      setSuccessFeeBase('');
      setPaymentScheme('50-50');
      setTermins([
        { percentage: 50, amount: 0, description: '' },
        { percentage: 50, amount: 0, description: '' },
      ]);
    } else if (!editingProposal) {
      // Reset to tier default when subcon is turned off
      if (isDispute) {
        setPaymentMethod('DISPUTE_UM_SF');
      } else {
        switch (tier) {
          case 'STRATEGIC_RETAINER':
            setPaymentMethod('MONTHLY_RETAINER');
            break;
          case 'PREMIUM_MODULAR':
          case 'STANDARDIZED_MODULAR':
            setPaymentMethod('TERMIN');
            setPaymentScheme('50-50');
            break;
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasSubcon]);

  // Set default payment method based on tier (only on initial load or tier change when not in edit mode and not subcon)
  useEffect(() => {
    if (editingProposal || hasSubcon) return; // Don't override when editing or subcon is active
    
    if (isDispute) {
      setPaymentMethod('DISPUTE_UM_SF');
      return;
    }
    
    switch (tier) {
      case 'STRATEGIC_RETAINER':
        setPaymentMethod('MONTHLY_RETAINER');
        break;
      case 'PREMIUM_MODULAR':
      case 'STANDARDIZED_MODULAR':
        setPaymentMethod('TERMIN');
        setPaymentScheme('50-50');
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tier, isDispute]);

  // Handle dispute toggle (only when not subcon)
  useEffect(() => {
    if (hasSubcon) {
      setIsDispute(false); // Disable dispute when subcon is active
      return;
    }
    
    if (isDispute) {
      setPaymentMethod('DISPUTE_UM_SF');
      setHasSubcon(false); // Disable subcon when dispute is active
    } else if (!editingProposal) {
      // Reset to tier default only if not editing
      switch (tier) {
        case 'STRATEGIC_RETAINER':
          setPaymentMethod('MONTHLY_RETAINER');
          break;
        case 'PREMIUM_MODULAR':
        case 'STANDARDIZED_MODULAR':
          setPaymentMethod('TERMIN');
          break;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDispute, hasSubcon]);

  // Update form data when editingProposal changes
  useEffect(() => {
    if (editingProposal) {
      setService(editingProposal.service || '');
      setProposalFee(editingProposal.proposalFee?.toString() || '');
      setDiscount('');

      // Parse paymentType for backward compatibility
      const paymentType = editingProposal.paymentType || '';
      let detectedTier: Tier = 'PREMIUM_MODULAR';
      let detectedPaymentMethod: PaymentMethod = 'TERMIN';
      let detectedDispute = false;
      
      // PRIORITY 1: Check for subcon first (most important - standalone payment method)
      // Also check hasSubcon property for robustness
      if (paymentType.includes('Subkon dengan') || editingProposal.hasSubcon) {
        setHasSubcon(true);
        detectedPaymentMethod = 'SUBCON';
        setIsDispute(false); // Dispute tidak berlaku saat subcon
        const partnerMatch = paymentType.match(/Subkon dengan (.+?):/);
        const timingMatch = paymentType.match(/pembayaran (.+?) oleh partner/);
        if (partnerMatch) {
          setSubconPartner(partnerMatch[1]);
        }
        if (timingMatch && timingMatch[1].includes('awal')) {
          setSubconPaymentTiming('UPFRONT');
        } else {
          setSubconPaymentTiming('END');
        }
        // Clear all other payment fields
        setContractStart('');
        setContractEnd('');
        setBillingTiming('START_OF_MONTH');
        setDownPayment('');
        setSuccessFeePercent('');
        setSuccessFeeBase('');
        setPaymentScheme('50-50');
        setTermins([
          { percentage: 50, amount: 0, description: '' },
          { percentage: 50, amount: 0, description: '' },
        ]);
      } else {
        // Only parse other payment methods if not subcon
        setHasSubcon(false);
        setSubconPartner('');
        setSubconPaymentTiming('UPFRONT');

        // Check for dispute (only if not subcon)
        if (paymentType.includes('Sengketa') || paymentType.includes('Uang Muka')) {
          detectedDispute = true;
          setIsDispute(true);
          detectedPaymentMethod = 'DISPUTE_UM_SF';
          const dpMatch = paymentType.match(/Uang Muka IDR ([\d.]+)M/);
          const sfMatch = paymentType.match(/Success Fee (\d+)%/);
          const baseMatch = paymentType.match(/Basis: (.+)/);
          if (dpMatch) {
            setDownPayment((parseFloat(dpMatch[1]) * 1000000).toString());
          }
          if (sfMatch) {
            setSuccessFeePercent(sfMatch[1]);
          }
          if (baseMatch) {
            setSuccessFeeBase(baseMatch[1]);
          }
        } else {
          setIsDispute(false);
          setDownPayment('');
          setSuccessFeePercent('');
          setSuccessFeeBase('');
        }

        // Check for retainer (STRATEGIC_RETAINER) - only if not subcon and not dispute
        if ((paymentType.includes('Retainer bulanan') || paymentType.includes('Periode')) && !detectedDispute) {
          detectedTier = 'STRATEGIC_RETAINER';
          detectedPaymentMethod = 'MONTHLY_RETAINER';
          const periodMatch = paymentType.match(/Periode (.+?) s\/d (.+?);/);
          const timingMatch = paymentType.match(/Penagihan: (.+)/);
          if (periodMatch) {
            setContractStart(periodMatch[1]);
            setContractEnd(periodMatch[2]);
          }
          if (timingMatch && timingMatch[1].includes('Awal')) {
            setBillingTiming('START_OF_MONTH');
          } else {
            setBillingTiming('END_OF_MONTH');
          }
        } else if (!detectedDispute) {
          // Check for termin - only if not subcon and not dispute
          if (paymentType.includes('Termin')) {
            detectedPaymentMethod = 'TERMIN';
            // Parse termin data
            const terminMatches = paymentType.matchAll(/Termin (\d+): (\d+)% \(IDR ([\d.]+)M\)(?: - (.+))?/g);
            const parsedTermins: Termin[] = [];
            for (const match of terminMatches) {
              parsedTermins.push({
                percentage: parseInt(match[2]),
                amount: parseFloat(match[3]) * 1000000,
                description: match[4] || '',
              });
            }
            if (parsedTermins.length > 0) {
              setTermins(parsedTermins);
              // Determine payment scheme
              if (parsedTermins.length === 2 && parsedTermins[0].percentage === 50 && parsedTermins[1].percentage === 50) {
                setPaymentScheme('50-50');
              } else if (parsedTermins.length === 3 && parsedTermins[0].percentage === 50 && parsedTermins[1].percentage === 35 && parsedTermins[2].percentage === 15) {
                setPaymentScheme('50-35-15');
              } else if (parsedTermins.length === 3 && parsedTermins[0].percentage === 40 && parsedTermins[1].percentage === 30 && parsedTermins[2].percentage === 30) {
                setPaymentScheme('40-30-30');
              } else {
                setPaymentScheme('Custom');
              }
            }
          }
          
          // Try to detect tier from service name
          if (editingProposal.service) {
            const serviceName = editingProposal.service;
            if (SERVICE_OPTIONS.STRATEGIC_RETAINER.includes(serviceName)) {
              detectedTier = 'STRATEGIC_RETAINER';
              detectedPaymentMethod = 'MONTHLY_RETAINER';
            } else if (SERVICE_OPTIONS.STANDARDIZED_MODULAR.includes(serviceName)) {
              detectedTier = 'STANDARDIZED_MODULAR';
              detectedPaymentMethod = 'TERMIN';
            } else {
              detectedTier = 'PREMIUM_MODULAR';
              detectedPaymentMethod = 'TERMIN';
            }
          }
        }
      }

      setTier(detectedTier);
      setPaymentMethod(detectedPaymentMethod);

      // Reset fields that don't match (only if not subcon)
      if (detectedPaymentMethod === 'SUBCON') {
        // Subcon is standalone - all other fields already cleared above
        // No need to reset again
      } else {
        if (detectedPaymentMethod !== 'TERMIN') {
          setPaymentScheme('50-50');
          setTermins([
            { percentage: 50, amount: 0, description: '' },
            { percentage: 50, amount: 0, description: '' },
          ]);
        }
        if (detectedPaymentMethod !== 'MONTHLY_RETAINER') {
          setContractStart('');
          setContractEnd('');
          setBillingTiming('START_OF_MONTH');
        }
        if (detectedPaymentMethod !== 'DISPUTE_UM_SF') {
          setDownPayment('');
          setSuccessFeePercent('');
          setSuccessFeeBase('');
        }
      }

      setAttachments([]);
    } else {
      // Reset all fields
      setTier('STRATEGIC_RETAINER');
      setService('');
      setProposalFee('');
      setDiscount('');
      setAttachments([]);
      
      setPaymentMethod('MONTHLY_RETAINER');
      setIsDispute(false);
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
      
      setHasSubcon(false);
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

  const handleSubmit = (saveAsDraft: boolean) => {
    if (!lead) return;

    // Basic validation
    if (!service.trim()) {
      toast.error('Mohon pilih Service Type');
      return;
    }
    if (!proposalFee || isNaN(Number(proposalFee))) {
      toast.error('Mohon masukkan Proposal Fee yang valid');
      return;
    }

    // Payment method specific validation
    if (paymentMethod === 'SUBCON' && !saveAsDraft) {
      if (!subconPartner) {
        toast.error('Mohon isi nama partner/flag untuk subkon');
        return;
      }
    }

    if (paymentMethod === 'TERMIN' && !saveAsDraft && totalPercentage !== 100) {
      toast.error('Total payment percentage must equal 100%');
      return;
    }

    if (paymentMethod === 'MONTHLY_RETAINER' && !saveAsDraft) {
      if (!contractStart || !contractEnd) {
        toast.error('Mohon isi periode kontrak untuk monthly retainer');
        return;
      }
    }

    if (paymentMethod === 'DISPUTE_UM_SF' && !saveAsDraft) {
      if (!downPayment || !successFeePercent) {
        toast.error('Mohon isi Uang Muka dan Success Fee untuk sengketa');
        return;
      }
    }

    // Attachments validation
    if (attachments.length === 0) {
      toast.error('Mohon tambahkan minimal 1 attachment');
      return;
    }

    // Build paymentType string from payment method
    let paymentTypeString = '';

    if (paymentMethod === 'SUBCON') {
      // Subcon is standalone payment method - format tunggal
      const timingText =
        subconPaymentTiming === 'UPFRONT'
          ? '100% di awal'
          : '100% di akhir';
      paymentTypeString = `Subkon dengan ${subconPartner}: pembayaran ${timingText} oleh partner`;
    } else if (paymentMethod === 'TERMIN') {
      paymentTypeString = termins
        .map(
          (t, i) =>
            `Termin ${i + 1}: ${t.percentage}% (IDR ${(
              t.amount / 1_000_000
            ).toFixed(0)}M)${t.description ? ' - ' + t.description : ''}`,
        )
        .join(' | ');
    } else if (paymentMethod === 'MONTHLY_RETAINER') {
      const fee = Number(proposalFee);
      const timingLabel =
        billingTiming === 'START_OF_MONTH' ? 'Awal bulan' : 'Akhir bulan';
      paymentTypeString = `Retainer bulanan: IDR ${(fee / 1_000_000).toFixed(
        0,
      )}M/bulan; Periode ${contractStart || '-'} s/d ${
        contractEnd || '-'
      }; Penagihan: ${timingLabel}`;
    } else if (paymentMethod === 'DISPUTE_UM_SF') {
      const dp = Number(downPayment || 0);
      paymentTypeString = `Sengketa: Uang Muka IDR ${(dp / 1_000_000).toFixed(
        0,
      )}M; Success Fee ${successFeePercent}% dari ${
        successFeeBase || 'nilai kemenangan'
      }`;
    }

    // Update existing proposal
    if (editingProposal && onUpdateProposal) {
      // Only allow edit if status is DRAFT
      if (editingProposal.status !== 'DRAFT') {
        toast.error('Proposal tidak bisa diedit karena sudah disubmit untuk approval');
        return;
      }
      
      onUpdateProposal(editingProposal.id, {
        service: service.trim(),
        proposalFee: Number(proposalFee),
        paymentType: paymentTypeString,
        hasSubcon: hasSubcon,
        status: saveAsDraft ? 'DRAFT' : 'WAITING_APPROVAL',
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
    const newProposal: Proposal = {
      id: 'p' + Date.now(),
      leadId: leadId,
      service: service.trim(),
      proposalFee: Number(proposalFee),
      paymentType: paymentTypeString,
      hasSubcon: hasSubcon,
      status: saveAsDraft ? 'DRAFT' : 'WAITING_APPROVAL',
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

              {/* Fees - 3 columns */}
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

              {/* Dispute Toggle */}
              <div className={`flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-white ${hasSubcon ? 'opacity-60' : ''}`}>
                <label className={`flex items-center gap-2 flex-shrink-0 ${hasSubcon ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                  <input
                    type="checkbox"
                    checked={isDispute}
                    onChange={(e) => setIsDispute(e.target.checked)}
                    disabled={hasSubcon}
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
              <div className={`flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-white ${isDispute ? 'opacity-60' : ''}`}>
                <label className={`flex items-center gap-2 flex-shrink-0 ${isDispute ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                  <input
                    type="checkbox"
                    checked={hasSubcon}
                    onChange={(e) => setHasSubcon(e.target.checked)}
                    disabled={isDispute}
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
                  {hasSubcon
                    ? 'Payment method untuk sub contract: Sub Contract'
                    : isDispute 
                    ? 'Payment method untuk dispute: UM + Success Fee' 
                    : `Payment method default untuk ${tier}: ${tier === 'STRATEGIC_RETAINER' ? 'Monthly Retainer' : 'Termin'}`}
                </p>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  disabled={isDispute || hasSubcon}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black hover:border-black ${isDispute || hasSubcon ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                >
                  <option value="MONTHLY_RETAINER" disabled={isDispute || hasSubcon}>
                    Monthly Retainer
                  </option>
                  <option value="TERMIN" disabled={isDispute || hasSubcon}>
                    Termin
                  </option>
                  <option value="DISPUTE_UM_SF" disabled={!isDispute || hasSubcon}>
                    Dispute (UM + Success Fee)
                  </option>
                  <option value="SUBCON" disabled={!hasSubcon}>
                    Sub Contract
                  </option>
                  </select>
                </div>

              {/* Subcon Section - Only show when subcon is active */}
              {hasSubcon && (
                <div className="border border-gray-200 rounded-lg p-3 bg-white space-y-2.5">
                  <p className="text-sm text-gray-600 font-medium mb-0.5">
                    Payment – Sub Contract (White Kitchen)
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Partner / Flag <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        value={subconPartner}
                        onChange={(e) =>
                          setSubconPartner(e.target.value)
                        }
                        placeholder="Asahi"
                        className="focus-visible:ring-black focus-visible:ring-1 focus-visible:border-black hover:border-black"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Payment Timing <span className="text-red-500">*</span>
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

              {/* Payment / Billing Section - Hide when subcon is active */}
              {!hasSubcon && (
              <div>
                {/* 1. TERMIN */}
                {paymentMethod === 'TERMIN' && (
                  <>
                    <label className="block text-sm text-gray-700 mb-1.5">
                      Termin Pembayaran (Payment Type)
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      Pilih skema termin pembayaran untuk proposal ini.
                    </p>

                    <select
                      value={paymentScheme}
                      onChange={(e) =>
                        setPaymentScheme(e.target.value as PaymentScheme)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black hover:border-black mb-3"
                    >
                      <option value="50-50">50-50</option>
                      <option value="50-35-15">50-35-15</option>
                      <option value="40-30-30">40-30-30</option>
                      <option value="Custom">Custom</option>
                    </select>

                    <div className="border border-gray-200 rounded-lg p-3 bg-white">
                      <div className="flex items-center justify-between mb-2">
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
                      <div className="space-y-2">
                        {termins.map((termin, index) => (
                          <div
                            key={index}
                            className="border border-gray-200 rounded-lg p-2.5 bg-gray-50"
                          >
                            <div className="flex items-center justify-between mb-1.5">
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
                            <div className="grid grid-cols-2 gap-2 mb-1.5">
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
                                  className="w-full focus-visible:ring-black focus-visible:ring-1 focus-visible:border-black hover:border-black disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                                className="w-full focus-visible:ring-black focus-visible:ring-1 focus-visible:border-black hover:border-black"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 pt-2 border-t border-gray-200 flex items-center justify-between">
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
                      <p className="text-xs text-gray-500 mt-1.5">
                        Ini adalah skema termin yang diajukan di proposal. Termin
                        final bisa dikonfirmasi lagi setelah client setuju (deal).
                      </p>
                    </div>
                  </>
                )}

                {/* 2. MONTHLY_RETAINER */}
                {paymentMethod === 'MONTHLY_RETAINER' && (
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
                {paymentMethod === 'DISPUTE_UM_SF' && (
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
              )}

              {/* Attachments */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Attachments <span className="text-red-500">*</span>
                </label>
                <div className="border border-gray-200 rounded-lg p-4 bg-white">
                  <div 
                    className={`flex flex-col items-center justify-center py-6 border-2 border-dashed rounded-lg transition-colors ${
                      isDragOver 
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
