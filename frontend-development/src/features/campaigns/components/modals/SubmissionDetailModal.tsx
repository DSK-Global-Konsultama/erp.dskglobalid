/**
 * Submission Detail Modal
 * View submission details from campaign overview
 */
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { animate } from 'framer-motion';
import { Dialog, DialogContent } from '../../../../components/ui/dialog';
import type { BankDataEntry } from '../../../../lib/leadManagementTypes';

interface SubmissionDetailModalProps {
  submission: BankDataEntry | null;
  open: boolean;
  onClose: () => void;
}

export function SubmissionDetailModal({ submission, open, onClose }: SubmissionDetailModalProps) {
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  const getStatusColor = (status: BankDataEntry['triageStatus']) => {
    switch (status) {
      case 'RAW_NEW':
        return 'bg-yellow-100 text-yellow-700';
      case 'REJECTED':
        return 'bg-red-100 text-red-700';
      case 'PROMOTED_TO_LEAD':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

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
    if (!open || isAnimatingOut || !submission) return;

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
  }, [open, isAnimatingOut, submission]);

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

  if (!submission) return null;

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
            <h2 className="text-lg font-semibold">Submission Detail</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${getStatusColor(submission.triageStatus)}`}>
                {submission.triageStatus}
              </span>
              <span className="text-sm text-gray-500">ID: {submission.id}</span>
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
          <div className="py-6 space-y-6">
            {/* Submitted Info */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Submission Info</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Submitted At:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(submission.submittedAt).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Campaign:</span>
                  <span className="font-medium text-gray-900">{submission.campaignName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Source Channel:</span>
                  <span className="font-medium text-gray-900">{submission.sourceChannel}</span>
                </div>
                {submission.topicTag && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Topic Tag:</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-700">
                      {submission.topicTag}
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
                  <div className="font-medium text-gray-900">{submission.clientName}</div>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="text-xs text-gray-600 mb-1">PIC Name</div>
                  <div className="font-medium text-gray-900">{submission.picName}</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="text-xs text-gray-600 mb-1">Email</div>
                  <div className="font-medium text-gray-900">{submission.email}</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="text-xs text-gray-600 mb-1">Phone Number</div>
                  <div className="font-medium text-gray-900">{submission.phone}</div>
                </div>
              </div>
            </div>

            {/* Extra Form Answers */}
            {Object.keys(submission.extraAnswers).length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Form Answers</h3>
                <div className="space-y-3">
                  {Object.entries(submission.extraAnswers).map(([key, value]) => (
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

            {/* Processing History */}
            {(submission.cleanedBy || submission.rejectedBy || submission.promotedBy) && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Processing History</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  {submission.cleanedBy && (
                    <div className="text-sm">
                      <div className="font-medium text-gray-900 mb-1">Cleaned</div>
                      <div className="text-gray-600">
                        By: {submission.cleanedBy}
                        {submission.cleanedAt && (
                          <span className="ml-2 text-gray-500">
                            on {new Date(submission.cleanedAt).toLocaleDateString('id-ID')}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {submission.rejectedBy && (
                    <div className="text-sm">
                      <div className="font-medium text-red-600 mb-1">Rejected</div>
                      <div className="text-gray-600">
                        By: {submission.rejectedBy}
                        {submission.rejectedAt && (
                          <span className="ml-2 text-gray-500">
                            on {new Date(submission.rejectedAt).toLocaleDateString('id-ID')}
                          </span>
                        )}
                      </div>
                      {submission.rejectedReason && (
                        <div className="mt-1 text-red-600 bg-red-50 rounded p-2">
                          Reason: {submission.rejectedReason}
                        </div>
                      )}
                    </div>
                  )}

                  {submission.promotedBy && (
                    <div className="text-sm">
                      <div className="font-medium text-green-600 mb-1">Promoted to Lead</div>
                      <div className="text-gray-600">
                        By: {submission.promotedBy}
                        {submission.promotedAt && (
                          <span className="ml-2 text-gray-500">
                            on {new Date(submission.promotedAt).toLocaleDateString('id-ID')}
                          </span>
                        )}
                      </div>
                      {submission.promotedToLeadId && (
                        <div className="mt-1 text-green-600 bg-green-50 rounded p-2">
                          Lead ID: {submission.promotedToLeadId}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            {submission.notes && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Notes</h3>
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-900 whitespace-pre-wrap">
                  {submission.notes}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex-shrink-0">
          <div className="text-sm text-gray-600">
            <strong>Note:</strong> Data ini dikelola oleh BD Admin di halaman Bank Data. 
            MEO hanya bisa melihat (read-only).
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

