import { useState, useEffect } from 'react';
import { X, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { animate } from 'framer-motion';
import { Dialog, DialogContent } from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';
import type { Notulensi } from '../../../../lib/mock-data';

interface NotulensiDetailModalProps {
  notulensi: Notulensi | null;
  open: boolean;
  onClose: () => void;
  onEdit?: (notulensi: Notulensi) => void;
  onUpdateNotulensi?: (id: string, updates: Partial<Notulensi>) => void;
  readOnly?: boolean;
}

export function NotulensiDetailModal({
  notulensi,
  open,
  onClose,
  onEdit,
  onUpdateNotulensi,
  readOnly = false
}: NotulensiDetailModalProps) {
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  // Handle close with animation
  const handleClose = () => {
    if (isAnimatingOut) return;
    
    const dialogContent = document.querySelector('[data-notulensi-detail-modal]') as HTMLElement;
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
      const dialogContent = document.querySelector('[data-notulensi-detail-modal]') as HTMLElement;
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

  // Handle close animation when open becomes false from parent
  useEffect(() => {
    if (open || isAnimatingOut) return;

    const timer = setTimeout(() => {
      const dialogContent = document.querySelector('[data-notulensi-detail-modal]') as HTMLElement;
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

  const handleEdit = () => {
    if (!notulensi || !onEdit) return;
    if (isAnimatingOut) return;
    const dialogContent = document.querySelector('[data-notulensi-detail-modal]') as HTMLElement;
    if (dialogContent) {
      setIsAnimatingOut(true);
      onEdit(notulensi);
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
      onEdit(notulensi);
    }
  };

  const handleSubmitForApproval = () => {
    if (notulensi && onUpdateNotulensi) {
      onUpdateNotulensi(notulensi.id, {
        status: 'WAITING_CEO_APPROVAL'
      });
      toast.success('Notulensi submitted to CEO for approval!');
      handleClose();
    }
  };

  if (!notulensi) return null;

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
        data-notulensi-detail-modal
        className="!fixed top-0 right-0 left-auto bottom-0 !translate-x-0 !translate-y-0 min-w-[800px] w-auto max-w-[95vw] h-screen max-h-screen rounded-none border-l border-r-0 border-t-0 border-b-0 shadow-xl p-0 flex flex-col [&>button]:hidden [&]:!animate-none [&]:!opacity-100 z-[9999]"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2>Review Notulensi Meeting</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 space-y-6 overflow-y-auto flex-1">
          {/* Meeting Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm text-gray-600 mb-3">Meeting Info</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Client</p>
                <p className="font-medium">{notulensi.clientName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date & Time</p>
                <p className="font-medium">{notulensi.meetingInfo.date} {notulensi.meetingInfo.time}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-medium truncate" title={notulensi.meetingInfo.location}>
                  {notulensi.meetingInfo.location}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Created By</p>
                <p className="font-medium">{notulensi.createdBy}</p>
              </div>
            </div>
          </div>

          {/* Participants */}
          <div>
            <h3 className="mb-3">Participants</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Internal Team</p>
                <ul className="list-disc list-inside space-y-1">
                  {notulensi.participants.internal.length > 0 ? (
                    notulensi.participants.internal.map((person, idx) => (
                      <li key={idx}>{person}</li>
                    ))
                  ) : (
                    <li className="text-gray-400">-</li>
                  )}
                </ul>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Client Team</p>
                <ul className="list-disc list-inside space-y-1">
                  {notulensi.participants.client.length > 0 ? (
                    notulensi.participants.client.map((person, idx) => (
                      <li key={idx}>{person}</li>
                    ))
                  ) : (
                    <li className="text-gray-400">-</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Meeting Objectives */}
          <div>
            <h3 className="mb-3">Meeting Objectives</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{notulensi.objectives || '-'}</p>
          </div>

          {/* Discussion Summary */}
          <div>
            <h3 className="mb-3">Discussion Summary</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Background Summary</p>
                <p className="text-gray-700 whitespace-pre-wrap">{notulensi.discussionSummary.background || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Issues Discussed (Client Problems)</p>
                <p className="text-gray-700 whitespace-pre-wrap">{notulensi.discussionSummary.issuesDiscussed || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Information Provided by Client</p>
                <p className="text-gray-700 whitespace-pre-wrap">{notulensi.discussionSummary.clientInfo || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Information Provided by Our Firm</p>
                <p className="text-gray-700 whitespace-pre-wrap">{notulensi.discussionSummary.firmInfo || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Risks / Concerns</p>
                <p className="text-gray-700 whitespace-pre-wrap">{notulensi.discussionSummary.risks || '-'}</p>
              </div>
            </div>
          </div>

          {/* Agreements */}
          {notulensi.agreements.length > 0 && (
            <div>
              <h3 className="mb-3">Agreements</h3>
              <table className="w-full border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm text-gray-600">Item</th>
                    <th className="px-4 py-2 text-left text-sm text-gray-600">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {notulensi.agreements.map((agreement, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2">{agreement.item || '-'}</td>
                      <td className="px-4 py-2">{agreement.details || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Action Items */}
          {notulensi.actionItems.length > 0 && (
            <div>
              <h3 className="mb-3">Action Items</h3>
              <table className="w-full border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm text-gray-600">Action</th>
                    <th className="px-4 py-2 text-left text-sm text-gray-600">PIC</th>
                    <th className="px-4 py-2 text-left text-sm text-gray-600">Deadline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {notulensi.actionItems.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2">{item.action || '-'}</td>
                      <td className="px-4 py-2">{item.pic || '-'}</td>
                      <td className="px-4 py-2">{item.deadline || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Next Steps */}
          <div>
            <h3 className="mb-3">Next Steps</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{notulensi.nextSteps || '-'}</p>
          </div>

          {/* Notes & Follow-Up */}
          <div>
            <h3 className="mb-3">Notes & Follow-Up</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{notulensi.notes || '-'}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
          {readOnly ? (
            <Button
              type="button"
              onClick={handleClose}
              className="bg-white text-gray-900 border border-gray-300 hover:bg-gray-50"
            >
              Close
            </Button>
          ) : notulensi.status === 'DRAFT' ? (
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
      </DialogContent>
    </Dialog>
  );
}

