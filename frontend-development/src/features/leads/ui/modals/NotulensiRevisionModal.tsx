import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { animate } from 'framer-motion';
import { Dialog, DialogContent } from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';
import { Textarea } from '../../../../components/ui/textarea';

interface NotulensiRevisionModalProps {
  open: boolean;
  onClose: () => void;
  /** Called when user submits revision notes */
  onSubmit: (payload: { sections: string[]; note: string }) => void;
}

const NOTULENSI_SECTIONS = [
  'Meeting Info',
  'Participants',
  'Meeting Objectives',
  'Discussion Summary',
  'Agreements',
  'Action Items',
  'Next Steps',
  'Notes & Follow-Up',
] as const;

export function NotulensiRevisionModal({ open, onClose, onSubmit }: NotulensiRevisionModalProps) {
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [selectedSections, setSelectedSections] = useState<Set<string>>(new Set());
  const [note, setNote] = useState('');

  const handleClose = () => {
    if (isAnimatingOut) return;
    const dialogContent = document.querySelector('[data-notulensi-revision-modal]') as HTMLElement;
    if (dialogContent) {
      setIsAnimatingOut(true);
      animate(dialogContent, { x: '100%' }, {
        duration: 0.8,
        ease: 'easeInOut',
        onComplete: () => {
          setIsAnimatingOut(false);
          setSelectedSections(new Set());
          setNote('');
          onClose();
        },
      });
    } else {
      setSelectedSections(new Set());
      setNote('');
      onClose();
    }
  };

  useEffect(() => {
    if (!open || isAnimatingOut) return;

    const setupAnimation = () => {
      const el = document.querySelector('[data-notulensi-revision-modal]') as HTMLElement;
      if (!el) return false;
      el.style.cssText = 'animation: none !important; opacity: 1 !important; transform: translateX(100%) !important; transition: none !important;';
      void el.offsetHeight;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            animate(el, { x: 0 }, { duration: 0.8, ease: 'easeInOut' });
          });
        });
      });
      return true;
    };

    const observer = new MutationObserver(() => {
      if (setupAnimation()) observer.disconnect();
    });

    observer.observe(document.body, { childList: true, subtree: true });
    if (setupAnimation()) observer.disconnect();

    return () => observer.disconnect();
  }, [open, isAnimatingOut]);

  const toggleSection = (section: string) => {
    setSelectedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  const canSubmit = selectedSections.size > 0 && note.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({ sections: Array.from(selectedSections.values()), note: note.trim() });
    handleClose();
  };

  return (
    <Dialog open={open || isAnimatingOut} onOpenChange={() => {}}>
      <style>{`
        [data-slot="dialog-overlay"] { pointer-events: none !important; z-index: 9998 !important; }
        [data-slot="dialog-content"] { pointer-events: auto !important; z-index: 9999 !important; }
      `}</style>
      <DialogContent
        data-notulensi-revision-modal
        className="!fixed top-0 right-0 left-auto bottom-0 !translate-x-0 !translate-y-0 min-w-[600px] w-auto max-w-[95vw] h-screen max-h-screen rounded-none border-l border-r-0 border-t-0 border-b-0 shadow-xl p-0 flex flex-col [&>button]:hidden [&]:!animate-none [&]:!opacity-100 z-[9999]"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">Request Revision (Notulensi)</h2>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 pb-6 pt-6 space-y-6">
            <div>
              <p className="text-sm text-gray-600 mb-3">Pilih bagian yang perlu direvisi:</p>
              <div className="space-y-2">
                {NOTULENSI_SECTIONS.map((section) => (
                  <label key={section} className="flex items-center gap-2 text-sm text-gray-900 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedSections.has(section)}
                      onChange={() => toggleSection(section)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span>{section}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Catatan revisi (wajib):</p>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Tuliskan apa yang perlu diperbaiki agar BD Executive jelas"
                rows={6}
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end py-4 px-6 border-t border-gray-200 bg-white flex-shrink-0">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={!canSubmit}>
              Send Revision
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
