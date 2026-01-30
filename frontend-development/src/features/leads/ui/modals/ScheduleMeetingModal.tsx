import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { animate } from 'framer-motion';
import { Dialog, DialogContent } from '../../../../components/ui/dialog';
import { Input } from '../../../../components/ui/input';
import { Textarea } from '../../../../components/ui/textarea';
import { Button } from '../../../../components/ui/button';
import type { Meeting } from '../../../../lib/mock-data';
import type { LeadStatus } from '../../model/types';

interface ScheduleMeetingModalProps {
  leadId: string;
  open: boolean;
  onClose: () => void;
  onAddMeeting: (meeting: Meeting) => void;
  onUpdateMeeting?: (id: string, updates: Partial<Meeting>) => void;
  editingMeeting?: Meeting | null;
  onUpdateLeadStatus: (leadId: string, status: LeadStatus) => void;
}

export function ScheduleMeetingModal({ leadId, open, onClose, onAddMeeting, onUpdateMeeting, editingMeeting, onUpdateLeadStatus }: ScheduleMeetingModalProps) {
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    dateTime: '',
    location: '',
    notes: ''
  });

  useEffect(() => {
    if (editingMeeting) {
      setFormData({
        name: editingMeeting.name || '',
        dateTime: editingMeeting.dateTime,
        location: editingMeeting.location,
        notes: editingMeeting.notes || ''
      });
    } else {
      setFormData({
        name: '',
        dateTime: '',
        location: '',
        notes: ''
      });
    }
  }, [editingMeeting, open]);

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

  useEffect(() => {
    if (!open || isAnimatingOut) return;

    const setupAnimation = () => {
      const dialogContent = document.querySelector('[data-slot="dialog-content"]') as HTMLElement;
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
      if (setupAnimation()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    if (setupAnimation()) observer.disconnect();
    return () => observer.disconnect();
  }, [open, isAnimatingOut]);

  useEffect(() => {
    if (open || isAnimatingOut) return;
    const timer = setTimeout(() => {
      const dialogContent = document.querySelector('[data-slot="dialog-content"]') as HTMLElement;
      if (dialogContent) {
        setIsAnimatingOut(true);
        animate(dialogContent, { x: '100%' }, { duration: 0.8, ease: 'easeInOut', onComplete: () => setIsAnimatingOut(false) });
      }
    }, 10);
    return () => clearTimeout(timer);
  }, [open, isAnimatingOut]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMeeting && onUpdateMeeting) {
      onUpdateMeeting(editingMeeting.id, { name: formData.name, dateTime: formData.dateTime, location: formData.location, notes: formData.notes });
      toast.success('Meeting updated successfully!');
    } else {
      const newMeeting: Meeting = {
        id: 'm' + Date.now(),
        leadId,
        name: formData.name,
        dateTime: formData.dateTime,
        location: formData.location,
        notes: formData.notes,
        status: 'SCHEDULED'
      };
      onAddMeeting(newMeeting);
      onUpdateLeadStatus(leadId, 'MEETING_SCHEDULED');
      toast.success('Meeting scheduled successfully! Lead status updated to MEETING_SCHEDULED');
    }
    handleClose();
  };

  return (
    <Dialog open={open || isAnimatingOut} onOpenChange={() => {}}>
      <style>{`
        [data-slot="dialog-overlay"] { pointer-events: none !important; z-index: 9998 !important; }
        [data-slot="dialog-content"] { pointer-events: auto !important; z-index: 9999 !important; }
      `}</style>
      <DialogContent
        className="!fixed top-0 right-0 left-auto bottom-0 !translate-x-0 !translate-y-0 min-w-[600px] w-auto max-w-[95vw] h-screen max-h-screen rounded-none border-l border-r-0 border-t-0 border-b-0 shadow-xl p-0 flex flex-col [&>button]:hidden [&]:!animate-none [&]:!opacity-100 z-[9999]"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-semibold">{editingMeeting ? 'Edit Meeting' : 'Jadwalkan Meeting'}</h2>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Nama Meeting <span className="text-red-500">*</span></label>
                <Input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full" placeholder="e.g. Meeting Initial Discussion" />
              </div>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-[280px]">
                    <label className="block text-sm text-gray-700 mb-2">Date & Time <span className="text-red-500">*</span></label>
                    <Input type="datetime-local" required value={formData.dateTime} onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })} className="w-full" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm text-gray-700 mb-2">Location / Link <span className="text-red-500">*</span></label>
                    <Input type="text" required value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full truncate" placeholder="e.g. Zoom Meeting, Office Meeting Room A" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Notes</label>
                  <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full min-h-[100px]" placeholder="e.g. Meeting offline, perlu persiapan dokumen, dll." />
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-3 justify-end py-4 px-6 border-t border-gray-200 bg-white flex-shrink-0">
            <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
            <Button type="submit">{editingMeeting ? 'Update Meeting' : 'Schedule Meeting'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
