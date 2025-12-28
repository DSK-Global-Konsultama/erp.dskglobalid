/**
 * Create Manual Lead Modal
 * BD_Admin can manually create leads (not from form submissions)
 */
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { animate } from 'framer-motion';
import { Dialog, DialogContent } from '../../../../components/ui/dialog';
import { Input } from '../../../../components/ui/input';
import { Textarea } from '../../../../components/ui/textarea';
import { Button } from '../../../../components/ui/button';

interface CreateManualLeadModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (leadData: ManualLeadData) => void;
}

interface ManualLeadData {
  clientName: string;
  picName: string;
  email: string;
  phone: string;
  notes: string;
  sourceType: 'MANUAL';
}

export function CreateManualLeadModal({ open, onClose, onSuccess }: CreateManualLeadModalProps) {
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [formData, setFormData] = useState({
    clientName: '',
    picName: '',
    email: '',
    phone: '',
    notes: ''
  });

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
    if (!open || isAnimatingOut) return;

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
  }, [open, isAnimatingOut]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const leadData: ManualLeadData = {
      ...formData,
      sourceType: 'MANUAL'
    };

    onSuccess(leadData);
    handleClose();
  };

  const isValid = formData.clientName && formData.picName && formData.email && formData.phone;

  return (
    <Dialog open={open || isAnimatingOut} onOpenChange={() => {
      // Prevent closing from outside clicks/ESC
      // Buttons call handleClose() directly which will call onClose()
      // So we ignore onOpenChange to prevent outside/ESC closing
    }}>
      <style>{`
        [data-slot="dialog-overlay"] {
          pointer-events: none !important;
          z-index: 9998 !important;
        }
        [data-slot="dialog-content"] {
          pointer-events: auto !important;
          z-index: 9999 !important;
        }
        [role="listbox"] {
          z-index: 10000 !important;
        }
        [data-radix-select-content] {
          z-index: 10000 !important;
        }
      `}</style>
      <DialogContent 
        className="!fixed top-0 right-0 left-auto bottom-0 !translate-x-0 !translate-y-0 min-w-[600px] w-auto max-w-[95vw] h-screen max-h-screen rounded-none border-l border-r-0 border-t-0 border-b-0 shadow-xl p-0 flex flex-col [&>button]:hidden [&]:!animate-none [&]:!opacity-100 z-[9999]"
        onInteractOutside={(e) => {
          // Prevent closing when clicking outside (on overlay)
          e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          // Prevent closing with ESC key
          e.preventDefault();
        }}
      >
        {/* Header - Paling Atas */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Create Manual Lead</h2>
            <p className="text-sm text-gray-600 mt-1">
              Tambah lead secara manual (tidak dari form submission)
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Form Content - Area Input */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6">
            <div className="space-y-4 py-4">
              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-blue-900">
                    <p className="font-medium mb-1">Manual Lead Note:</p>
                    <p>
                      Lead yang dibuat manual juga membutuhkan <strong>CEO follow-up tag</strong> sebelum 
                      bisa masuk ke pipeline BD_Admin (Prepitching → Meeting → Notulen → Handover).
                    </p>
                  </div>
                </div>
              </div>

              {/* Client Name */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Nama Perusahaan / Client <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  placeholder="PT ABC Indonesia"
                  className="w-full"
                  required
                />
              </div>

              {/* PIC Name */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Nama PIC <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.picName}
                  onChange={(e) => setFormData({ ...formData, picName: e.target.value })}
                  placeholder="John Doe"
                  className="w-full"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@company.com"
                  className="w-full"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Nomor Telepon / WhatsApp <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+62 812-3456-7890"
                  className="w-full"
                  required
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Notes
                </label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Source of contact, context, special notes..."
                  rows={4}
                  className="w-full"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Recommended: Catat bagaimana Anda mendapat kontak ini (referral, cold call, networking, dll.)
                </p>
              </div>
            </div>
          </div>
          
          {/* Footer - Tombol di Bawah */}
          <div className="flex gap-3 justify-end py-4 px-6 border-t border-gray-200 bg-white flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid}
              className="disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Lead
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

