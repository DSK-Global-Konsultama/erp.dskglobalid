/**
 * Modal tambah progress update. Design konsisten dengan UploadDocumentModal (slide dari kanan).
 */

import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { animate } from 'framer-motion';
import { toast } from 'sonner';
import { Dialog, DialogContent } from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';
import type { ProgressLog, ProjectPhase } from '../../../../lib/projectWorkflowTypes';

const PHASES: ProjectPhase[] = [
  'Data Collection',
  'Analysis',
  'Drafting',
  'Review',
  'Finalization',
  'Other',
];

export interface AddProgressModalProps {
  open: boolean;
  onClose: () => void;
  /** Dipanggil dengan data log baru (id, handoverId, createdAt diisi oleh modal) */
  onSubmit: (log: ProgressLog) => void;
  handoverId: string;
  createdBy: string;
  /** Progress terakhir (untuk tampil current % dan validasi penurunan) */
  latestProgress: ProgressLog | null;
}

export function AddProgressModal({
  open,
  onClose,
  onSubmit,
  handoverId,
  createdBy,
  latestProgress,
}: AddProgressModalProps) {
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState(latestProgress?.progressPercentage ?? 0);
  const [phase, setPhase] = useState<ProjectPhase>('Data Collection');
  const [updateNote, setUpdateNote] = useState('');
  const [blockers, setBlockers] = useState('');
  const [nextSteps, setNextSteps] = useState('');
  const [reasonForDecrease, setReasonForDecrease] = useState('');

  const currentPercent = latestProgress?.progressPercentage ?? 0;
  const isProgressDecreasing = latestProgress != null && progressPercentage < latestProgress.progressPercentage;

  useEffect(() => {
    if (open) {
      setProgressPercentage(latestProgress?.progressPercentage ?? 0);
      setPhase(latestProgress?.phase ?? 'Data Collection');
      setUpdateNote('');
      setBlockers('');
      setNextSteps('');
      setReasonForDecrease('');
    }
  }, [open, latestProgress?.progressPercentage, latestProgress?.phase]);

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
        },
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
      if (setupAnimation()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    if (setupAnimation()) observer.disconnect();
    return () => observer.disconnect();
  }, [open, isAnimatingOut]);

  const handleSubmit = () => {
    if (!updateNote.trim()) {
      toast.error('Mohon isi update note');
      return;
    }
    if (isProgressDecreasing && !reasonForDecrease.trim()) {
      toast.error('Mohon jelaskan alasan penurunan progress');
      return;
    }
    const newLog: ProgressLog = {
      id: crypto.randomUUID?.() ?? `pl-${Date.now()}`,
      handoverId,
      progressPercentage: progressPercentage,
      phase,
      updateNote: updateNote.trim(),
      blockers: blockers.trim() || undefined,
      nextSteps: nextSteps.trim() || undefined,
      reasonForDecrease: isProgressDecreasing ? reasonForDecrease.trim() : undefined,
      createdBy,
      createdAt: new Date().toISOString(),
    };
    setIsAnimatingOut(true);
    onSubmit(newLog);
    toast.success('Progress berhasil diperbarui');
    const dialogContent = document.querySelector('[data-slot="dialog-content"]') as HTMLElement;
    if (dialogContent) {
      animate(dialogContent, { x: '100%' }, {
        duration: 0.8,
        ease: 'easeInOut',
        onComplete: () => {
          setIsAnimatingOut(false);
          onClose();
        },
      });
    } else {
      setIsAnimatingOut(false);
      onClose();
    }
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
        className="!fixed top-0 right-0 left-auto bottom-0 !translate-x-0 !translate-y-0 min-w-[480px] w-auto max-w-[95vw] h-screen max-h-screen rounded-none border-l border-r-0 border-t-0 border-b-0 shadow-xl p-0 flex flex-col [&>button]:hidden [&]:!animate-none [&]:!opacity-100 z-[9999]"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold">Add Progress Update</h2>
            <p className="text-sm text-gray-600 mt-1">Catat perkembangan project</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <div className="space-y-4">
              {/* Current vs New */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 mb-1">Current Progress</p>
                    <p className="text-2xl font-bold text-gray-900">{currentPercent}%</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">New Progress</p>
                    <p className="text-2xl font-bold text-blue-600">{progressPercentage}%</p>
                  </div>
                </div>
              </div>

              {/* Progress Percentage */}
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">
                  Progress Percentage <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={progressPercentage}
                    onChange={(e) => setProgressPercentage(Number(e.target.value))}
                    className="flex-1"
                  />
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={progressPercentage}
                    onChange={(e) =>
                      setProgressPercentage(Math.min(100, Math.max(0, Number(e.target.value) || 0)))
                    }
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black hover:border-black text-center"
                  />
                  <span className="text-sm text-gray-600">%</span>
                </div>
              </div>

              {/* Phase */}
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">
                  Current Phase <span className="text-red-500">*</span>
                </label>
                <select
                  value={phase}
                  onChange={(e) => setPhase(e.target.value as ProjectPhase)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black hover:border-black"
                >
                  {PHASES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reason for Decrease */}
              {isProgressDecreasing && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-2 mb-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-900">
                      Progress turun dari {latestProgress?.progressPercentage}% ke {progressPercentage}%.
                      Mohon jelaskan alasan.
                    </p>
                  </div>
                  <label className="block text-sm font-medium text-red-900 mb-1.5">
                    Reason for Decrease <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={reasonForDecrease}
                    onChange={(e) => setReasonForDecrease(e.target.value)}
                    placeholder="Alasan penurunan progress..."
                    rows={2}
                    className="w-full px-3 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 resize-none"
                  />
                </div>
              )}

              {/* Update Note */}
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">
                  Update Note <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={updateNote}
                  onChange={(e) => setUpdateNote(e.target.value)}
                  placeholder="Apa yang sudah diselesaikan dalam update ini..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black hover:border-black resize-none"
                />
              </div>

              {/* Blockers */}
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">Blockers (Optional)</label>
                <textarea
                  value={blockers}
                  onChange={(e) => setBlockers(e.target.value)}
                  placeholder="Kendala atau halangan..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black hover:border-black resize-none"
                />
              </div>

              {/* Next Steps */}
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">Next Steps (Optional)</label>
                <textarea
                  value={nextSteps}
                  onChange={(e) => setNextSteps(e.target.value)}
                  placeholder="Rencana aktivitas periode berikutnya..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black hover:border-black resize-none"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 justify-end py-4 px-6 border-t border-gray-200 bg-white flex-shrink-0">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={
                !updateNote.trim() || (isProgressDecreasing && !reasonForDecrease.trim())
              }
            >
              Add Progress Update
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
