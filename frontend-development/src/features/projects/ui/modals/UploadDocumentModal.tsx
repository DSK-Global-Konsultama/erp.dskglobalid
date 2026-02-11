/**
 * Modal upload document untuk Document Center.
 * Bergeser masuk dari kanan seperti MarkAsReceivedModal (framer-motion).
 */

import { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { animate } from 'framer-motion';
import { Dialog, DialogContent } from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';
import type { DocumentCategory } from '../../../../lib/projectWorkflowTypes';

const CATEGORIES: DocumentCategory[] = [
  '01-Handover',
  '02-Client Docs',
  '03-Working Papers',
  '04-Final',
];

export interface UploadDocumentModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export function UploadDocumentModal({
  open,
  onClose,
  onSubmit,
}: UploadDocumentModalProps) {
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [category, setCategory] = useState<DocumentCategory>('02-Client Docs');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    if (open) {
      setCategory('02-Client Docs');
      setDescription('');
      setAttachments([]);
    }
  }, [open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length) {
      setAttachments((prev) => [...prev, ...Array.from(files)]);
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files?.length) {
      setAttachments((prev) => [...prev, ...Array.from(files)]);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

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
    setIsAnimatingOut(true);
    onSubmit();
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
            <h2 className="text-lg font-semibold">Upload Document</h2>
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
              {/* File */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  File <span className="text-red-500">*</span>
                </label>
                <div className="border border-gray-200 rounded-lg p-4 bg-white">
                  <div
                    className={`flex flex-col items-center justify-center py-6 border-2 border-dashed rounded-lg transition-colors ${
                      isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <Upload className={`w-10 h-10 mb-3 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`} />
                    <label htmlFor="upload-document-file" className="cursor-pointer">
                      <span className={`text-sm ${isDragOver ? 'text-blue-600 font-medium' : 'text-gray-600'}`}>
                        Click to upload or drag and drop
                      </span>
                      <input
                        id="upload-document-file"
                        type="file"
                        className="hidden"
                        multiple
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, PNG, JPG (Max. 10MB per file)
                    </p>
                  </div>
                  {attachments.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {attachments.map((file, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveAttachment(index)}
                              className="text-sm text-red-600 hover:text-red-700 shrink-0 ml-2"
                              aria-label="Hapus file"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black hover:border-black"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">Description</label>
                <textarea
                  placeholder="Brief description of the document..."
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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
            <Button type="button" onClick={handleSubmit}>
              Upload
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
