/**
 * Create Campaign Modal
 */
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { animate } from 'framer-motion';
import { toast } from 'sonner';
import { Dialog, DialogContent } from '../../../../components/ui/dialog';
import { Input } from '../../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Textarea } from '../../../../components/ui/textarea';
import { Button } from '../../../../components/ui/button';
import type { CampaignStatus, CampaignType, Channel } from '../../../../lib/leadManagementTypes';
import { campaignsService } from '../../services/campaignsService';

interface CreateCampaignModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateCampaignModal({ open, onClose, onSuccess }: CreateCampaignModalProps) {
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'SOCIAL_MEDIA' as CampaignType,
    channel: 'INSTAGRAM' as Channel,
    status: 'ACTIVE' as CampaignStatus,
    topicTag: '',
    dateStart: '',
    dateEnd: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [noEndDate, setNoEndDate] = useState(false);

  useEffect(() => {
    if (noEndDate) {
      setFormData((prev) => ({ ...prev, dateEnd: '' }));
    }
  }, [noEndDate]);

  const CHANNEL_OPTIONS_BY_TYPE: Record<CampaignType, Array<{ value: Channel; label: string }>> = {
    SOCIAL_MEDIA: [
      { value: 'INSTAGRAM', label: 'Instagram' },
      { value: 'LINKEDIN', label: 'LinkedIn' }
    ],
    SOCIAL: [
      { value: 'INSTAGRAM', label: 'Instagram' },
      { value: 'LINKEDIN', label: 'LinkedIn' }
    ],
    FREEBIE: [{ value: 'WEBSITE', label: 'Website' }],
    EVENT: [
      { value: 'SEMINAR', label: 'Seminar' },
      { value: 'WEBINAR', label: 'Webinar' },
      { value: 'BREVET', label: 'Brevet' }
    ],
    WEBINAR: [
      { value: 'SEMINAR', label: 'Seminar' },
      { value: 'WEBINAR', label: 'Webinar' },
      { value: 'BREVET', label: 'Brevet' }
    ]
  };

  const allowedChannels = CHANNEL_OPTIONS_BY_TYPE[formData.type];

  useEffect(() => {
    const isAllowed = allowedChannels.some((c) => c.value === formData.channel);
    if (!isAllowed) {
      setFormData((prev) => ({ ...prev, channel: allowedChannels[0].value }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.type]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.type || !formData.channel || !formData.status) {
      toast.error('Mohon lengkapi data campaign');
      return;
    }

    if (!formData.dateStart || (!noEndDate && !formData.dateEnd)) {
      toast.error('Start Date dan End Date wajib diisi');
      return;
    }

    if (!noEndDate && formData.dateStart && formData.dateEnd && new Date(formData.dateStart) > new Date(formData.dateEnd)) {
      toast.error('End Date must be after Start Date');
      return;
    }

    try {
      setSubmitting(true);
      await campaignsService.create({
        name: formData.name.trim(),
        type: formData.type,
        channel: formData.channel,
        topic_tag: formData.topicTag || null,
        date_start: formData.dateStart || null,
        date_end: noEndDate ? null : (formData.dateEnd || null),
        notes: formData.notes || null,
        status: formData.status
      });
      onSuccess();
      handleClose();
    } catch (err: any) {
      toast.error(err?.message || 'Gagal membuat campaign');
    } finally {
      setSubmitting(false);
    }
  };

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
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Campaign Type */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Campaign Type <span className="text-red-500">*</span>
              </label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as CampaignType })}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[10000]">
                  <SelectItem value="SOCIAL_MEDIA">Social Media</SelectItem>
                  <SelectItem value="FREEBIE">Freebie / Lead Magnet</SelectItem>
                  <SelectItem value="EVENT">Event</SelectItem>
                </SelectContent>
              </Select>
              <p className="mt-1 text-sm text-gray-500">
                {formData.type === 'SOCIAL_MEDIA' && 'Campaign di social media (post, story, ads)'}
                {formData.type === 'FREEBIE' && 'Free download atau lead magnet di website'}
                {formData.type === 'EVENT' && 'Event fisik atau seminar offline'}
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
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select channel" />
                </SelectTrigger>
                <SelectContent className="z-[10000]">
                  {allowedChannels.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as CampaignStatus })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[10000]">
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="PAUSED">Paused</SelectItem>
                  <SelectItem value="ENDED">Ended</SelectItem>
                </SelectContent>
              </Select>
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

            {/* Topic Tag */}
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-700 mb-2">
                Topic Tag (optional)
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

            {/* Date Range */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Start Date <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={formData.dateStart}
                onChange={(e) => setFormData({ ...formData, dateStart: e.target.value })}
                className="w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                End Date {!noEndDate && <span className="text-red-500">*</span>}
              </label>
              {noEndDate ? (
                <Input
                  type="text"
                  value="-"
                  readOnly
                  className="w-full bg-gray-50"
                />
              ) : (
                <Input
                  type="date"
                  value={formData.dateEnd}
                  onChange={(e) => setFormData({ ...formData, dateEnd: e.target.value })}
                  className="w-full"
                  required={!noEndDate}
                />
              )}
              <label className="mt-2 inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={noEndDate}
                  onChange={(e) => setNoEndDate(e.target.checked)}
                />
                Present (tanpa end date)
              </label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Notes <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              className="w-full"
              placeholder="Target audience, goals, special instructions..."
              required
            />
          </div>
            </div>
          </div>
          
          {/* Footer - Tombol di Bawah */}
          <div className="bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 flex-shrink-0">
            <Button type="button" variant="outline" onClick={handleClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Campaign'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

