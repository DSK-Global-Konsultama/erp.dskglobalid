import { Input } from '../../../../components/ui/input';
import { Textarea } from '../../../../components/ui/textarea';
import { Label } from '../../../../components/ui/label';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent } from '../../../../components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { SectionHeader } from '../shared/SectionHeader';
import { RevisionComments } from '../shared/RevisionComments';
import type { RevisionComment } from '../../../../lib/projectWorkflowTypes';
import type { Proposal } from '../../../../lib/mock-data';
import type { SectionId } from '../../model/types';

type FeeStructureItem = {
  id?: string;
  description?: string;
  amount?: number;
  percentage?: number;
};

/** Ringkasan dari proposal: yang telah diisi di proposal (untuk ditampilkan di handover) */
export interface ProposalSummary {
  agreeFee?: number;
  discount?: number;
  subconPartner?: string;
  subconPayer?: 'PARTNER' | 'CLIENT';
  paymentType?: string;
}

function getPaymentMethodLabel(paymentType: string): string {
  if (!paymentType) return '–';
  if (paymentType.includes('Retainer bulanan') || paymentType.includes('Periode')) return 'Retainer Bulanan';
  if (paymentType.includes('Sengketa') || paymentType.includes('Uang Muka')) return 'Dispute (UM + Success Fee)';
  return 'Termin (Jadwal Tagihan)';
}

type PaymentDetail =
  | { kind: 'TERMIN'; termins: Array<{ label: string; percentage: number; amount: number; description?: string }> }
  | { kind: 'MONTHLY_RETAINER'; contractStart: string; contractEnd: string; billingTiming: string }
  | { kind: 'DISPUTE'; downPayment: string; successFeePercent: string; successFeeBase: string }
  | null;

/** Parse paymentType menjadi detail untuk ditampilkan di "Detail Fee / Jadwal Tagihan" */
function parsePaymentDetail(paymentType: string): PaymentDetail {
  if (!paymentType?.trim()) return null;
  let main = paymentType;
  if (paymentType.includes(' | Subkon')) main = paymentType.split(' | Subkon')[0].trim();
  else if (paymentType.includes('Subkon dengan') && !paymentType.includes('Termin')) return null;

  if (main.includes('Retainer bulanan') || main.includes('Periode')) {
    const periodMatch = main.match(/Periode (.+?) s\/d (.+?);/);
    const parenMatch = main.match(/\((.+?)\s*-\s*(.+?)\)/);
    const timingMatch = main.match(/Penagihan:\s*(.+?)(?:;|$)/);
    return {
      kind: 'MONTHLY_RETAINER',
      contractStart: periodMatch ? periodMatch[1].trim() : (parenMatch ? parenMatch[1].trim() : ''),
      contractEnd: periodMatch ? periodMatch[2].trim() : (parenMatch ? parenMatch[2].trim() : ''),
      billingTiming: timingMatch ? timingMatch[1].trim() : '',
    };
  }
  if (main.includes('Sengketa') || main.includes('Uang Muka')) {
    const dpMatch = main.match(/Uang Muka IDR ([\d.]+)M/);
    const sfMatch = main.match(/Success Fee (\d+)%/);
    const baseMatch = main.match(/dari (.+?)(?:$|;)/);
    return {
      kind: 'DISPUTE',
      downPayment: dpMatch ? (parseFloat(dpMatch[1]) * 1000000).toString() : '',
      successFeePercent: sfMatch ? sfMatch[1] : '',
      successFeeBase: baseMatch ? baseMatch[1].trim() : '',
    };
  }
  // Termin / Jadwal tagihan
  const termins: Array<{ label: string; percentage: number; amount: number; description?: string }> = [];
  const parts = main.split(' | ').filter(Boolean);
  for (const term of parts) {
    const match = term.match(/Termin (\d+): (\d+)% \(IDR ([\d.]+)M\)(?: - (.+))?/);
    const downMatch = term.match(/Down Payment:\s*(\d+)%(?: \(IDR ([\d.]+)M\))?(?: - (.+))?/);
    if (match) {
      termins.push({
        label: `Termin ${match[1]}`,
        percentage: parseInt(match[2], 10),
        amount: parseFloat(match[3]) * 1000000,
        description: match[4]?.trim() || undefined,
      });
    } else if (downMatch) {
      const amount = downMatch[2] ? parseFloat(downMatch[2]) * 1000000 : 0;
      termins.push({
        label: 'Down Payment',
        percentage: parseInt(downMatch[1], 10),
        amount,
        description: downMatch[3]?.trim() || undefined,
      });
    }
  }
  if (termins.length > 0) return { kind: 'TERMIN', termins };
  return null;
}

/** Build proposal summary from Proposal (agree fee, discount, subcon, payment type) */
export function buildProposalSummary(proposal: Proposal): ProposalSummary {
  const paymentType = proposal.paymentTypeFinal || proposal.paymentType;
  let subconPartner: string | undefined;
  let subconPayer: 'PARTNER' | 'CLIENT' | undefined;

  if (proposal.hasSubcon && paymentType) {
    if (paymentType.includes(' | Subkon')) {
      const parts = paymentType.split(' | Subkon');
      const subconPart = 'Subkon' + (parts[1] || '');
      const partnerNew = subconPart.match(/Subkon:\s*(.+?)(?:;|$)/);
      const payerMatch = subconPart.match(/Pembayar:\s*(Partner|Client)/i);
      if (partnerNew) subconPartner = partnerNew[1].trim();
      if (payerMatch) subconPayer = payerMatch[1].toUpperCase() as 'PARTNER' | 'CLIENT';
    } else if (paymentType.includes('Subkon dengan')) {
      const m = paymentType.match(/Subkon dengan (.+?)(?::| \|)/);
      if (m) subconPartner = m[1].trim();
    }
  }

  const discount = (proposal as { discount?: number }).discount;
  return {
    agreeFee: proposal.agreeFee,
    discount: discount != null && discount !== 0 ? discount : undefined,
    subconPartner,
    subconPayer,
    paymentType: paymentType || undefined,
  };
}

interface FeeStructureSectionProps {
  sectionId: SectionId;
  displayNumber?: number;
  feeStructure: FeeStructureItem[];
  paymentTermsText: string;
  onFeeStructureChange: (fees: FeeStructureItem[]) => void;
  onPaymentTermsTextChange: (value: string) => void;
  isExpanded: boolean;
  isComplete: boolean;
  hasRevision: boolean;
  showValidation: boolean;
  readOnly?: boolean;
  revisionComments: RevisionComment[];
  onToggle: () => void;
  /** Data dari proposal yang telah diisi: agree fee, diskon, subcon, metode pembayaran */
  proposalSummary?: ProposalSummary;
}

export function FeeStructureSection({
  sectionId,
  displayNumber,
  feeStructure,
  paymentTermsText,
  onFeeStructureChange,
  onPaymentTermsTextChange,
  isExpanded,
  isComplete,
  hasRevision,
  showValidation,
  readOnly = false,
  revisionComments,
  onToggle,
  proposalSummary,
}: FeeStructureSectionProps) {
  const hasSubcon = !!(proposalSummary?.subconPartner?.trim());
  const paymentDetail = proposalSummary?.paymentType ? parsePaymentDetail(proposalSummary.paymentType) : null;

  return (
    <Card className="mb-6">
      <SectionHeader
        sectionId={sectionId}
        displayNumber={displayNumber}
        title="FEE STRUCTURE & PAYMENT TERMS"
        isExpanded={isExpanded}
        isComplete={isComplete}
        hasRevision={hasRevision}
        showValidation={showValidation}
        onToggle={onToggle}
      />
      {isExpanded && (
        <CardContent className="pt-0">
          <RevisionComments comments={revisionComments} sectionTitle="FEE STRUCTURE & PAYMENT TERMS" />

          {/* 4.1 Data dari Proposal */}
          {proposalSummary && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">4.1 Payment Information</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-2 border border-gray-300 w-1/3">Item</th>
                      <th className="text-left px-4 py-2 border border-gray-300">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-2 border border-gray-300 font-medium">Agree Fee (IDR)</td>
                      <td className="px-4 py-2 border border-gray-300">
                        {proposalSummary.agreeFee != null ? proposalSummary.agreeFee.toLocaleString('id-ID') : '–'}
                      </td>
                    </tr>
                    {(proposalSummary.discount != null && proposalSummary.discount !== 0) && (
                      <tr>
                        <td className="px-4 py-2 border border-gray-300 font-medium">Diskon (IDR)</td>
                        <td className="px-4 py-2 border border-gray-300">{proposalSummary.discount.toLocaleString('id-ID')}</td>
                      </tr>
                    )}
                    <tr>
                      <td className="px-4 py-2 border border-gray-300 font-medium">Metode Pembayaran</td>
                      <td className="px-4 py-2 border border-gray-300">
                        {proposalSummary.paymentType ? getPaymentMethodLabel(proposalSummary.paymentType) : '–'}
                      </td>
                    </tr>
                    {hasSubcon && (
                      <>
                        <tr>
                          <td className="px-4 py-2 border border-gray-300 font-medium">Sub Contract – Partner / Flag</td>
                          <td className="px-4 py-2 border border-gray-300">{proposalSummary.subconPartner || '–'}</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 border border-gray-300 font-medium">Sub Contract – Pembayar</td>
                          <td className="px-4 py-2 border border-gray-300">
                            {proposalSummary.subconPayer === 'PARTNER' ? 'Partner' : proposalSummary.subconPayer === 'CLIENT' ? 'Client' : '–'}
                          </td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4.2 Detail Fee / Jadwal Tagihan */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">4.2 Detail Fee</h3>
            {paymentDetail ? (
              /* Detail dari metode pembayaran – design seperti proposal (ProposalDetailModal) */
              <div className="space-y-4">
                {paymentDetail.kind === 'TERMIN' && (
                  <>
                    <label className="block text-sm text-gray-700 font-medium">Jadwal Tagihan (Payment Type)</label>
                    <p className="text-xs text-gray-500 mb-2">
                      Item pertama Down Payment, lalu Termin 1, 2, … Total 100%.
                    </p>
                    <div className="border border-gray-200 rounded-lg p-3 bg-white">
                      <div className="space-y-2">
                        {paymentDetail.termins.map((t, i) => (
                          <div key={i} className="border border-gray-200 rounded-lg p-2.5 bg-gray-50">
                            <div className="mb-1.5">
                              <label className="text-sm font-medium text-gray-700">{t.label}</label>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mb-1.5">
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">Persentase (%)</label>
                                <Input
                                  type="text"
                                  value={`${t.percentage}%`}
                                  disabled
                                  className="w-full bg-gray-100 text-gray-700 cursor-not-allowed text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">Nominal (IDR)</label>
                                <Input
                                  type="text"
                                  value={t.amount.toLocaleString('id-ID')}
                                  disabled
                                  className="w-full bg-gray-100 text-gray-700 cursor-not-allowed text-sm"
                                />
                              </div>
                            </div>
                            {t.description && (
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">Deskripsi termin</label>
                                <Input
                                  type="text"
                                  value={t.description}
                                  disabled
                                  className="w-full bg-gray-100 text-gray-700 cursor-not-allowed text-sm"
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 pt-2 border-t border-gray-200 flex items-center justify-between">
                        <span className="text-sm text-gray-600">Total Persentase:</span>
                        <span
                          className={`font-medium ${paymentDetail.termins.reduce((s, t) => s + t.percentage, 0) === 100 ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {paymentDetail.termins.reduce((s, t) => s + t.percentage, 0)}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1.5">
                        Skema termin dari proposal. Termin final bisa dikonfirmasi lagi setelah client setuju (deal).
                      </p>
                    </div>
                  </>
                )}
                {paymentDetail.kind === 'MONTHLY_RETAINER' && (
                  <div className="border border-gray-200 rounded-lg p-3 bg-white space-y-2.5">
                    <p className="text-sm text-gray-600 font-medium">Payment – Strategic Advisory (Bulanan)</p>
                    <p className="text-xs text-gray-500">
                      Proposal Fee dianggap sebagai fee per bulan (retainer).
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Periode Kontrak – Mulai</label>
                        <Input
                          type="text"
                          value={paymentDetail.contractStart || '–'}
                          disabled
                          className="w-full bg-gray-100 text-gray-700 cursor-not-allowed text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Periode Kontrak – Selesai</label>
                        <Input
                          type="text"
                          value={paymentDetail.contractEnd || '–'}
                          disabled
                          className="w-full bg-gray-100 text-gray-700 cursor-not-allowed text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Waktu Penagihan</label>
                      <div className="flex gap-4 text-sm mt-1">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            checked={paymentDetail.billingTiming?.toLowerCase().includes('awal') ?? false}
                            disabled
                            className="w-4 h-4"
                          />
                          <span className="text-gray-700">Awal bulan</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            checked={paymentDetail.billingTiming?.toLowerCase().includes('akhir') ?? false}
                            disabled
                            className="w-4 h-4"
                          />
                          <span className="text-gray-700">Akhir bulan</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
                {paymentDetail.kind === 'DISPUTE' && (
                  <div className="border border-gray-200 rounded-lg p-3 bg-white space-y-2.5">
                    <p className="text-sm text-gray-600 font-medium">Payment – Sengketa (UM + Success Fee)</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Uang Muka (IDR)</label>
                        <Input
                          type="text"
                          value={paymentDetail.downPayment ? Number(paymentDetail.downPayment).toLocaleString('id-ID') : '–'}
                          disabled
                          className="w-full bg-gray-100 text-gray-700 cursor-not-allowed text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Success Fee (%)</label>
                        <Input
                          type="text"
                          value={paymentDetail.successFeePercent ? `${paymentDetail.successFeePercent}%` : '–'}
                          disabled
                          className="w-full bg-gray-100 text-gray-700 cursor-not-allowed text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Basis Success Fee</label>
                        <Input
                          type="text"
                          value={paymentDetail.successFeeBase || '–'}
                          disabled
                          className="w-full bg-gray-100 text-gray-700 cursor-not-allowed text-sm"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Struktur resmi: UM + Success Fee.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* Tabel fee structure (editable) bila tidak ada detail dari proposal */
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-2 border border-gray-300">Item</th>
                        <th className="text-left px-4 py-2 border border-gray-300">Amount (Rp)</th>
                        <th className="text-left px-4 py-2 border border-gray-300">Notes</th>
                        {!readOnly && <th className="w-12 px-2 py-2 border border-gray-300"></th>}
                      </tr>
                    </thead>
                    <tbody>
                      {feeStructure.map((fee, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 border border-gray-300">
                            <Input
                              type="text"
                              value={fee.description || ''}
                              onChange={(e) => {
                                const newFees = [...feeStructure];
                                newFees[index].description = e.target.value;
                                onFeeStructureChange(newFees);
                              }}
                              placeholder="Item description"
                              disabled={readOnly}
                              className={`w-full ${readOnly ? 'disabled:opacity-100 disabled:text-gray-900' : ''}`}
                            />
                          </td>
                          <td className="px-4 py-2 border border-gray-300">
                            <Input
                              type="number"
                              value={fee.amount || ''}
                              onChange={(e) => {
                                const newFees = [...feeStructure];
                                newFees[index].amount = Number(e.target.value);
                                onFeeStructureChange(newFees);
                              }}
                              placeholder="0"
                              disabled={readOnly}
                              className={`w-full tabular-nums ${readOnly ? 'disabled:opacity-100 disabled:text-gray-900' : ''}`}
                            />
                          </td>
                          <td className="px-4 py-2 border border-gray-300">
                            <Input
                              type="text"
                              value={fee.percentage ? `${fee.percentage}%` : ''}
                              onChange={(e) => {
                                const newFees = [...feeStructure];
                                const val = e.target.value.replace('%', '');
                                newFees[index].percentage = val ? Number(val) : undefined;
                                onFeeStructureChange(newFees);
                              }}
                              placeholder="Notes"
                              disabled={readOnly}
                              className={`w-full ${readOnly ? 'disabled:opacity-100 disabled:text-gray-900' : ''}`}
                            />
                          </td>
                          {!readOnly && (
                            <td className="px-2 py-2 border border-gray-300 text-center">
                              {feeStructure.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => onFeeStructureChange(feeStructure.filter((_, i) => i !== index))}
                                  className="text-red-600 hover:text-red-700 h-8 w-8"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {!readOnly && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onFeeStructureChange([...feeStructure, { id: `FEE-${Date.now()}`, description: '', amount: 0 }])}
                    className="mt-4"
                  >
                    <Plus className="w-4 h-4" />
                    Add Fee Item
                  </Button>
                )}
              </>
            )}
          </div>

          {/* 4.3 Payment Terms */}
          <div>
            <Label htmlFor="paymentTerms" className="mb-3 block">
              Payment Terms
            </Label>
            <Textarea
              id="paymentTerms"
              value={paymentTermsText}
              onChange={(e) => onPaymentTermsTextChange(e.target.value)}
              placeholder="Invoice details, payment schedule, work start conditions..."
              rows={4}
              disabled={readOnly}
              className={`${readOnly ? 'disabled:opacity-100 disabled:text-gray-900' : ''}`}
            />
          </div>
        </CardContent>
      )}
    </Card>
  );
}
