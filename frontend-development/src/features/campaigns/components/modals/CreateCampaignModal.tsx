/**
 * Create Campaign Modal
 */
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { animate } from 'framer-motion';
import { Dialog, DialogContent } from '../../../../components/ui/dialog';
import { Input } from '../../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Textarea } from '../../../../components/ui/textarea';
import { Button } from '../../../../components/ui/button';
import type { CampaignType, Channel } from '../../../../lib/leadManagementTypes';

interface CreateCampaignModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateCampaignModal({ open, onClose, onSuccess }: CreateCampaignModalProps) {
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'WEBINAR' as CampaignType,
    channel: 'EVENT' as Channel, // Default EVENT for WEBINAR
    topicTag: '',
    dateStart: '',
    dateEnd: '',
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
    
    // In real app: API call to create campaign
    console.log('Creating campaign:', formData);
    
    // Show success toast
    alert('Campaign created successfully!');
    onSuccess();
    handleClose();
  };

  const isWebinar = formData.type === 'WEBINAR';

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
          <h2 className="text-lg font-semibold">Create New Campaign</h2>
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
            <div className="space-y-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Campaign Type */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Campaign Type <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.type}
                onValueChange={(value) => {
                  const newType = value as CampaignType;
                  setFormData({ 
                    ...formData, 
                    type: newType,
                    // Auto-set channel: WEBINAR → EVENT, others → LINKEDIN default
                    channel: newType === 'WEBINAR' ? 'EVENT' : 'LINKEDIN',
                    // Reset topic tag if not webinar
                    topicTag: newType !== 'WEBINAR' ? '' : formData.topicTag
                  });
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[10000]">
                  <SelectItem value="WEBINAR">Webinar</SelectItem>
                  <SelectItem value="SOCIAL">Social Media</SelectItem>
                  <SelectItem value="FREEBIE">Freebie / Lead Magnet</SelectItem>
                </SelectContent>
              </Select>
              <p className="mt-1 text-sm text-gray-500">
                {formData.type === 'WEBINAR' && 'Event webinar atau online seminar'}
                {formData.type === 'SOCIAL' && 'Campaign di social media (post, story, ads)'}
                {formData.type === 'FREEBIE' && 'Free download atau lead magnet di website'}
              </p>
            </div>

            {/* Channel */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Channel <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.channel}
                onValueChange={(value) => setFormData({ ...formData, channel: value as Channel })}
                disabled={isWebinar}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={isWebinar ? "Event (Webinar)" : "Select channel"} />
                </SelectTrigger>
                <SelectContent className="z-[10000]">
                  {isWebinar ? (
                    <SelectItem value="EVENT">Event (Webinar)</SelectItem>
                  ) : (
                    <>
                      <SelectItem value="LINKEDIN">LinkedIn</SelectItem>
                      <SelectItem value="IG">Instagram</SelectItem>
                      <SelectItem value="WEBSITE">Website</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
              {isWebinar && (
                <p className="mt-1 text-sm text-gray-500">
                  Channel otomatis di-set ke EVENT untuk campaign webinar
                </p>
              )}
            </div>

            {/* Campaign Name */}
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-700 mb-2">
                Campaign Name <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Webinar: Tax Planning 2026"
                className="w-full"
                required
              />
            </div>

            {/* Topic Tag (Webinar only) */}
            {isWebinar && (
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-700 mb-2">
                  Topic Tag
                </label>
                <Input
                  type="text"
                  value={formData.topicTag}
                  onChange={(e) => setFormData({ ...formData, topicTag: e.target.value })}
                  placeholder="e.g., TAX_PLANNING, LEGAL_SETUP"
                  className="w-full"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Topic tag untuk analytics (tidak ditampilkan ke user form)
                </p>
              </div>
            )}

            {/* Date Range (Optional) */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Start Date (Optional)
              </label>
              <Input
                type="date"
                value={formData.dateStart}
                onChange={(e) => setFormData({ ...formData, dateStart: e.target.value })}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                End Date (Optional)
              </label>
              <Input
                type="date"
                value={formData.dateEnd}
                onChange={(e) => setFormData({ ...formData, dateEnd: e.target.value })}
                className="w-full"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              className="w-full"
              placeholder="Target audience, goals, special instructions..."
            />
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
            >
              Create Campaign
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

