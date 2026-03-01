/**
 * Bank Data Detail Modal
 * Shows detailed information about a bank data entry
 */
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { animate } from 'framer-motion';
import { Dialog, DialogContent } from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';
import type { BankDataEntry } from '../../../../lib/leadManagementTypes';
import { getTriageStatusBadge } from '../../../../lib/statusHelpers';
import { formatIndonesianLongDateTime } from '../../../../utils/dateFormat';

interface BankDataDetailModalProps {
  entry: BankDataEntry | null;
  open: boolean;
  onClose: () => void;
  onReject?: (reason: string) => void;
  onPromote?: () => void;
  canEdit?: boolean; // For BD-MEO, this should be false
}

export function BankDataDetailModal({ 
  entry, 
  open,
  onClose,
  onReject,
  onPromote,
  canEdit = true 
}: BankDataDetailModalProps) {
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  // Handle close with animation
  const handleClose = () => {
    if (isAnimatingOut) return;
    
    const dialogContent = document.querySelector('[data-slot="dialog-content"]') as HTMLElement;
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

  // Handle open animation - use MutationObserver to catch element immediately
  useEffect(() => {
    if (!open || isAnimatingOut || !entry) return;

    const setupAnimation = () => {
      const dialogContent = document.querySelector('[data-slot="dialog-content"]') as HTMLElement;
      if (dialogContent) {
        // Disable default Radix animations IMMEDIATELY
        dialogContent.style.cssText = 'animation: none !important; opacity: 1 !important; transform: translateX(100%) !important; transition: none !important;';
        
        // Force reflow to ensure initial state is applied
        void dialogContent.offsetHeight;
        
        // Use triple requestAnimationFrame to ensure browser has painted initial state
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              // Now animate to final position
              animate(dialogContent, { x: 0 }, { duration: 0.8, ease: 'easeInOut' });
            });
          });
        });
        return true;
      }
      return false;
    };

    // Use MutationObserver to catch element as soon as it appears
    const observer = new MutationObserver(() => {
      if (setupAnimation()) {
        observer.disconnect();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Also try immediately
    if (setupAnimation()) {
      observer.disconnect();
    }

    return () => {
      observer.disconnect();
    };
  }, [open, isAnimatingOut, entry]);

  // Handle close animation when open becomes false from parent
  useEffect(() => {
    if (open || isAnimatingOut) return;

    const timer = setTimeout(() => {
      const dialogContent = document.querySelector('[data-slot="dialog-content"]') as HTMLElement;
      if (dialogContent) {
        setIsAnimatingOut(true);
        animate(dialogContent, { x: '100%' }, { 
          duration: 0.8, 
          ease: 'easeInOut',
          onComplete: () => {
            setIsAnimatingOut(false);
          }
        });
      }
    }, 10);

    return () => clearTimeout(timer);
  }, [open, isAnimatingOut]);

  if (!entry) return null;

  const statusBadge = getTriageStatusBadge(entry.triageStatus);

  const toWhatsAppLink = (raw: string | null | undefined): string | null => {
    const s = String(raw || '').trim();
    if (!s) return null;

    const digits = s.replace(/\D/g, '');
    if (!digits) return null;

    let normalized = digits;
    if (normalized.startsWith('0')) normalized = `62${normalized.slice(1)}`;
    else if (normalized.startsWith('62')) normalized = normalized;
    else if (normalized.startsWith('8')) normalized = `62${normalized}`;

    if (!normalized.startsWith('62') || normalized.length < 10) return null;
    return `https://wa.me/${normalized}`;
  };

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
          <div>
            <h2 className="text-lg font-semibold">Bank Data Detail</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${statusBadge.color}`}>
                {statusBadge.label}
              </span>
              <span className="text-sm text-gray-500">ID: {entry.id}</span>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6">
          <div className="pt-0 pb-6 space-y-6">
            {/* Submission Info */}
            <div className="pt-0 -mt-0">
              <h3 className="text-sm font-medium text-gray-700 mb-3 mt-0">Submission Info</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Submitted At:</span>
                  <span className="font-medium text-gray-900">
                    {formatIndonesianLongDateTime(entry.submittedAt)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Campaign:</span>
                  <span className="font-medium text-gray-900">{entry.campaignName}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500">Source Channel</div>
                    <div className="text-sm text-gray-900">{entry.sourceChannel}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Entry Slug</div>
                    <div className="text-sm text-gray-900 font-mono break-all">{(entry as any).entrySlug || '-'}</div>
                  </div>
                </div>
                {entry.topicTag && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Topic Tag:</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border bg-indigo-100 text-indigo-700">
                      {entry.topicTag}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Core Contact Info */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Contact Information</h3>
              <div className="space-y-3">
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="text-xs text-gray-600 mb-1">Client Name</div>
                  <div className="font-medium text-gray-900">{entry.clientName}</div>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="text-xs text-gray-600 mb-1">PIC Name</div>
                  <div className="font-medium text-gray-900">{entry.picName}</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="text-xs text-gray-600 mb-1">Email</div>
                  <div className="font-medium text-gray-900">{entry.email}</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="text-xs text-gray-600 mb-1">Phone Number</div>
                  {toWhatsAppLink(entry.phone) ? (
                    <a
                      className="font-medium text-blue-600 hover:underline"
                      href={toWhatsAppLink(entry.phone) as string}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Chat via WhatsApp"
                    >
                      {entry.phone}
                    </a>
                  ) : (
                    <div className="font-medium text-gray-900">{entry.phone}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Extra Form Answers */}
            {Object.keys(entry.extraAnswers).length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Form Answers</h3>
                <div className="space-y-3">
                  {Object.entries(entry.extraAnswers).map(([key, value]) => (
                    <div key={key} className="bg-white border border-gray-200 rounded-lg p-3">
                      <div className="text-xs text-gray-600 mb-1">{key}</div>
                      <div className="font-medium text-gray-900">
                        {Array.isArray(value) ? (
                          <ul className="list-disc list-inside">
                            {value.map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        ) : (
                          String(value)
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}


          </div>
        </div>

        {/* Footer Actions (only for BD-Admin) */}
        {canEdit ? (
          <div className="border-t border-gray-200 px-6 py-4 bg-white flex-shrink-0">
            <div className="flex gap-3 justify-end">
              {entry.triageStatus === 'RAW_NEW' && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (onReject) {
                        onReject('');
                      }
                    }}
                    className="border-red-600 text-red-600 hover:bg-red-50"
                  >
                    Reject
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      if (onPromote) {
                        onPromote();
                      }
                    }}
                    className="bg-black text-white hover:bg-gray-800"
                  >
                    Promote to Lead
                  </Button>
                </>
              )}
              {(entry.triageStatus === 'REJECTED' || entry.triageStatus === 'PROMOTED_TO_LEAD') && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex-shrink-0">
            <div className="text-sm text-gray-600">
              <strong>Note:</strong> Data ini dikelola oleh BD Admin di halaman Bank Data. 
              MEO hanya bisa melihat (read-only).
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

