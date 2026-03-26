'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { animate } from 'framer-motion';
import {
  Dialog,
  DialogContent,
} from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../../components/ui/card';
import { Separator } from '../../../../components/ui/separator';
import { Label } from '../../../../components/ui/label';
import { CheckCircle, X, FileText, Upload, Send } from 'lucide-react';
import type { Invoice, PaymentTerm } from '../../../../lib/mock-data';
import { PaymentTermStatusBadge } from '../shared/PaymentTermStatusBadge';

export interface InvoiceFigures {
  dpp: number;
  vat: number;
  gross: number;
  withholding: number;
  total: number;
  netDiterima: number;
  vatEnabled: boolean;
  withholdingEnabled: boolean;
  vatRate: number;
  withholdingRate: number;
}

/** Normalize rate: store as percent (11, 2); convert to decimal for compute */
function toDecimalRate(raw: number): number {
  return raw > 1 ? raw / 100 : raw;
}

export function computeInvoiceFigures(
  term: PaymentTerm,
  _invoice: Invoice
): InvoiceFigures {
  const dpp = term.amount;
  const vatEnabled = term.vatEnabled ?? false;
  const vatRateRaw = term.vatRate ?? (vatEnabled ? 11 : 0);
  const vatRate = toDecimalRate(vatRateRaw);
  const vat = vatEnabled ? dpp * vatRate : 0;
  const gross = dpp + vat;

  const withholdingEnabled = term.withholdingEnabled ?? false;
  const whRateRaw = term.withholdingRate ?? (withholdingEnabled ? 2 : 0);
  const withholdingRate = toDecimalRate(whRateRaw);
  const withholding = withholdingEnabled ? -(dpp * withholdingRate) : 0;
  const total = term.total ?? gross;
  const netDiterima = gross + withholding;

  return {
    dpp,
    vat,
    gross,
    withholding,
    total,
    netDiterima,
    vatEnabled,
    withholdingEnabled,
    vatRate,
    withholdingRate,
  };
}

export interface PaymentTermDetailModalProps {
  term: PaymentTerm;
  invoice: Invoice;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formatCurrency: (amount: number) => string;
  formatDate: (dateString?: string) => string;
  onMarkAsPaid?: (invoiceId: string, termId: string) => void;
  canMarkAsPaid?: boolean;
  onUploadInvoiceFile?: (invoiceId: string, termId: string, file: File) => void;
  onSubmitTermToCeo?: (invoiceId: string, termId: string) => void;
  onSendTermToClient?: (invoiceId: string, termId: string) => void;
  onUploadPaymentProof?: (
    invoiceId: string,
    termId: string,
    payload: { amount: number; date: string; file: File; note?: string }
  ) => void;
  onUpdateTermMeta?: (
    invoiceId: string,
    termId: string,
    patch: Partial<PaymentTerm>
  ) => void;
}

export function PaymentTermDetailModal({
  term,
  invoice,
  open,
  onOpenChange,
  formatCurrency,
  formatDate,
  onMarkAsPaid,
  canMarkAsPaid = false,
  onUploadInvoiceFile,
  onSubmitTermToCeo,
  onSendTermToClient,
  onUploadPaymentProof,
  onUpdateTermMeta,
}: PaymentTermDetailModalProps) {
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const proofInputRef = useRef<HTMLInputElement>(null);

  const isOverdue =
    term.dueDate &&
    new Date(term.dueDate) < new Date() &&
    term.paymentStatus !== 'PAID';

  const figures = useMemo(
    () => computeInvoiceFigures(term, invoice),
    [term, invoice]
  );

  const invoiceMeta = useMemo(
    () => ({
      invoiceNumber:
        term.invoiceNumber ?? invoice.invoiceNumber ?? invoice.id ?? '-',
      issueDate:
        term.invoiceDate ??
        term.issueDate ??
        invoice.issueDate ??
        invoice.createdDate ??
        '-',
      billToName:
        term.billToName ?? invoice.clientName ?? invoice.companyName ?? '-',
      billToAddress: term.billToAddress ?? invoice.clientAddress ?? '',
      description:
        term.invoiceDescription ??
        term.description ??
        invoice.description ??
        '-',
    }),
    [term, invoice]
  );

  const canUploadInvoice =
    (term.processStatus === 'DRAFT' ||
      term.processStatus === 'READY_FOR_APPROVAL' ||
      term.processStatus === 'CEO_REJECTED') &&
    onUploadInvoiceFile;
  const canSubmitToCeo =
    term.processStatus === 'READY_FOR_APPROVAL' &&
    term.invoiceFileUrl != null &&
    onSubmitTermToCeo;
  const canSendToClient =
    term.processStatus === 'CEO_APPROVED' && onSendTermToClient;
  const canUploadProof =
    term.processStatus === 'SENT_TO_CLIENT' &&
    term.paymentStatus !== 'PAID' &&
    onUploadPaymentProof;
  const showMarkAsPaid =
    term.processStatus === 'SENT_TO_CLIENT' &&
    term.paymentStatus !== 'PAID' &&
    onMarkAsPaid;

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
            onOpenChange(false);
          },
        },
      );
    } else {
      onOpenChange(false);
    }
  };

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
        className="!fixed top-0 right-0 left-auto bottom-0 !translate-x-0 !translate-y-0 min-w-[600px] w-auto max-w-[95vw] h-screen max-h-screen rounded-none border-l border-r-0 border-t-0 border-b-0 shadow-xl p-0 flex flex-col [&>button]:hidden [&]:!animate-none [&]:!opacity-100 z-[9999]"
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-semibold">
            Termin {term.termNumber} – {term.description}
          </h2>
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
              {/* Ringkasan Invoice */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="h-5 w-5" />
                    Ringkasan Invoice
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Input meta: Nomor Invoice */}
                  {onUpdateTermMeta && (
                    <div className="pb-2 border-b border-gray-100">
                      <div>
                        <Label className="text-sm text-muted-foreground">
                          Nomor Invoice
                        </Label>
                        <Input
                          className="mt-1 font-mono text-sm"
                          value={term.invoiceNumber ?? ''}
                          onChange={(e) =>
                            onUpdateTermMeta(invoice.id, term.id, {
                              invoiceNumber: e.target.value || null,
                            })
                          }
                          placeholder="Contoh: INV-001/2025"
                        />
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">No. Invoice</p>
                      <p className="font-medium font-mono text-sm">
                        {invoiceMeta.invoiceNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tanggal</p>
                      <p className="font-medium text-sm">
                        {invoiceMeta.issueDate !== '-'
                          ? formatDate(invoiceMeta.issueDate)
                          : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Nama PT</p>
                      <p className="font-medium text-sm">{invoiceMeta.billToName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Alamat</p>
                      <p className="text-sm whitespace-pre-line">
                        {invoiceMeta.billToAddress || '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <PaymentTermStatusBadge term={term} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Persentase</p>
                      <p className="font-medium text-sm">{term.percentage}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Jatuh Tempo</p>
                      <p
                        className={`font-medium text-sm ${
                          isOverdue ? 'text-red-600' : ''
                        }`}
                      >
                        {term.dueDate ? formatDate(term.dueDate) : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tanggal Bayar</p>
                      <p
                        className={`font-medium text-sm ${
                          term.paidDate ? 'text-green-600' : ''
                        }`}
                      >
                        {term.paidDate ? formatDate(term.paidDate) : '—'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Deskripsi</p>
                    <p className="text-sm">{invoiceMeta.description}</p>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal / DPP</span>
                      <span>{formatCurrency(figures.dpp)}</span>
                    </div>
                    {figures.vatEnabled && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">PPN ({(figures.vatRate * 100).toFixed(0)}%)</span>
                        <span>{formatCurrency(figures.vat)}</span>
                      </div>
                    )}
                    {figures.withholdingEnabled && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Inc Tax Art. 23 ({(figures.withholdingRate * 100).toFixed(0)}%)</span>
                        <span>{formatCurrency(figures.withholding)}</span>
                      </div>
                    )}
                    {/* Checklist PPN & PPh 23 di bawah baris PPN dan PPh */}
                    {onUpdateTermMeta && (
                      <div className="space-y-3 pt-2">
                        <div className="border border-gray-200 rounded-lg bg-white p-3">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={term.vatEnabled ?? false}
                              onChange={(e) =>
                                onUpdateTermMeta(invoice.id, term.id, {
                                  vatEnabled: e.target.checked,
                                  vatRate: e.target.checked ? 11 : undefined,
                                })
                              }
                              className="w-4 h-4"
                            />
                            <span className="text-sm font-medium text-gray-700">
                              Gunakan PPN (11%)
                            </span>
                          </label>
                        </div>
                        <div className="border border-gray-200 rounded-lg bg-white p-3">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={term.withholdingEnabled ?? false}
                              onChange={(e) =>
                                onUpdateTermMeta(invoice.id, term.id, {
                                  withholdingEnabled: e.target.checked,
                                  withholdingRate: e.target.checked ? 2 : undefined,
                                })
                              }
                              className="w-4 h-4"
                            />
                            <span className="text-sm font-medium text-gray-700">
                              Gunakan PPh 23 (2%)
                            </span>
                          </label>
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <span className="font-semibold">Total Tagihan</span>
                      <span className="font-bold">
                        {formatCurrency(figures.netDiterima)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              {canUploadInvoice && (
                <div className="space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && onUploadInvoiceFile) {
                        onUploadInvoiceFile(invoice.id, term.id, file);
                        e.target.value = '';
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Dokumen Invoice
                  </Button>
                </div>
              )}
              {canSubmitToCeo && (
                <Button
                  className="w-full"
                  onClick={() => {
                    onSubmitTermToCeo(invoice.id, term.id);
                  }}
                >
                  Submit ke CEO
                </Button>
              )}
              {canSendToClient && (
                <Button
                  className="w-full"
                  onClick={() => {
                    onSendTermToClient(invoice.id, term.id);
                  }}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Kirim ke Klien
                </Button>
              )}
              {canUploadProof && (
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <input
                    ref={proofInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      const amount = Number(paymentAmount) || 0;
                      const date = paymentDate || new Date().toISOString().slice(0, 10);
                      if (file && amount > 0 && onUploadPaymentProof) {
                        onUploadPaymentProof(invoice.id, term.id, {
                          amount,
                          date,
                          file,
                        });
                        setPaymentAmount('');
                        setPaymentDate('');
                        e.target.value = '';
                      }
                    }}
                  />
                  <Input
                    type="number"
                    placeholder="Jumlah (Rp)"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                  />
                  <Input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => proofInputRef.current?.click()}
                    disabled={!paymentAmount || Number(paymentAmount) <= 0}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Bukti Bayar
                  </Button>
                </div>
              )}
              {showMarkAsPaid && (
                <div className="pt-4 border-t border-gray-200">
                  <Button
                    className="w-full"
                    onClick={() => {
                      onMarkAsPaid?.(invoice.id, term.id);
                      handleClose();
                    }}
                    disabled={!canMarkAsPaid}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Tandai Dibayar
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
