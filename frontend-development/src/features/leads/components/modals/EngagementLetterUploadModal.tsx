import { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { animate } from 'framer-motion';
import { Dialog, DialogContent } from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';
import type { EngagementLetter, Lead } from '../../../../lib/mock-data';

interface EngagementLetterUploadModalProps {
  engagementLetter: EngagementLetter | null;
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
  onUpdateEngagementLetter?: (id: string, updates: Partial<EngagementLetter>) => void;
  isCEOView?: boolean;
}

export function EngagementLetterUploadModal({
  engagementLetter,
  lead,
  open,
  onClose,
  onUpdateEngagementLetter,
  isCEOView = false
}: EngagementLetterUploadModalProps) {
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [currentEL, setCurrentEL] = useState<EngagementLetter | null>(engagementLetter);

  // Sync engagement letter with latest data
  useEffect(() => {
    if (engagementLetter) {
      setCurrentEL(engagementLetter);
    }
  }, [engagementLetter]);

  // Handle close with animation
  const handleClose = () => {
    if (isAnimatingOut) return;
    
    const dialogContent = document.querySelector('[data-el-upload-modal]') as HTMLElement;
    if (dialogContent) {
      setIsAnimatingOut(true);
      animate(dialogContent, { x: '100%' }, { 
        duration: 0.8, 
        ease: 'easeInOut',
        onComplete: () => {
          setIsAnimatingOut(false);
          setSelectedFile(null);
          setIsDragOver(false);
          onClose();
        }
      });
    } else {
      setSelectedFile(null);
      setIsDragOver(false);
      onClose();
    }
  };

  // Handle open animation
  useEffect(() => {
    if (!open || isAnimatingOut) return;

    const setupAnimation = () => {
      const dialogContent = document.querySelector('[data-el-upload-modal]') as HTMLElement;
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

  const validateFile = (file: File): boolean => {
    const validTypes = ['.pdf', '.doc', '.docx'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(fileExtension)) {
      toast.error('File type not supported. Please upload PDF, DOC, or DOCX files.');
      return false;
    }

    if (file.size > maxSize) {
      toast.error('File size exceeds 10MB limit.');
      return false;
    }

    return true;
  };

  const handleFileSelect = (file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
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

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = () => {
    if (!selectedFile || !currentEL) {
      toast.error('Please select a file to upload');
      return;
    }

    // Here you would normally upload the file to a server
    // For now, we'll just update the engagement letter with a placeholder
    if (onUpdateEngagementLetter) {
      const uploadDate = new Date().toISOString().split('T')[0];
      onUpdateEngagementLetter(currentEL.id, {
        status: 'WAITING_APPROVAL',
        createdAt: uploadDate
      });
      // Update local state to reflect the upload
      setCurrentEL({
        ...currentEL,
        status: 'WAITING_APPROVAL',
        createdAt: uploadDate
      });
      setSelectedFile(null);
      toast.success('Engagement Letter uploaded successfully!');
    }
  };

  const handleApprove = () => {
    if (currentEL && onUpdateEngagementLetter) {
      const approvedDate = new Date().toISOString().split('T')[0];
      onUpdateEngagementLetter(currentEL.id, {
        status: 'APPROVED',
        approvedDate: approvedDate
      });
      setCurrentEL({
        ...currentEL,
        status: 'APPROVED',
        approvedDate: approvedDate
      });
      toast.success('Engagement Letter approved!');
      handleClose();
    }
  };

  const handleReject = () => {
    if (currentEL && onUpdateEngagementLetter) {
      onUpdateEngagementLetter(currentEL.id, {
        status: 'REJECTED'
      });
      setCurrentEL({
        ...currentEL,
        status: 'REJECTED'
      });
      toast.success('Engagement Letter rejected!');
      handleClose();
    }
  };

  const handleSendToClient = () => {
    if (currentEL && onUpdateEngagementLetter) {
      const sentDate = new Date().toISOString();
      onUpdateEngagementLetter(currentEL.id, {
        status: 'SENT',
        sentAt: sentDate
      });
      setCurrentEL({
        ...currentEL,
        status: 'SENT',
        sentAt: sentDate
      });
      toast.success('Engagement Letter sent to client!');
      handleClose();
    }
  };

  const handleMarkAsSigned = () => {
    if (currentEL && onUpdateEngagementLetter) {
      const signedDate = new Date().toISOString().split('T')[0];
      onUpdateEngagementLetter(currentEL.id, {
        status: 'SIGNED',
        signedDate: signedDate
      });
      setCurrentEL({
        ...currentEL,
        status: 'SIGNED',
        signedDate: signedDate
      });
      toast.success('Engagement Letter marked as signed!');
      handleClose();
    }
  };

  const isUploaded = currentEL?.createdAt;

  if (!currentEL || !lead) return null;

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
        data-el-upload-modal
        className="!fixed top-0 right-0 left-auto bottom-0 !translate-x-0 !translate-y-0 min-w-[800px] w-auto max-w-[95vw] h-screen max-h-screen rounded-none border-l border-r-0 border-t-0 border-b-0 shadow-xl p-0 flex flex-col [&>button]:hidden [&]:!animate-none [&]:!opacity-100 z-[9999]"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{isUploaded ? 'Engagement Letter' : 'Upload Engagement Letter'}</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <div className="space-y-4">
              {/* Engagement Letter Info */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Engagement Letter Info
                </h3>
                
                {/* Service Name */}
                <div className="mb-2">
                  <label className="block text-sm text-gray-600">
                    Nama Layanan
                  </label>
                  <div className="py-1">
                    {currentEL.service}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Agree Fee (Final)</p>
                    <p className="font-medium text-green-600">
                      {currentEL.agreeFee 
                        ? `IDR ${currentEL.agreeFee.toLocaleString('id-ID')}`
                        : '-'
                      }
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600 mb-1">Payment Type Final</p>
                    <p className="font-medium">{currentEL.paymentTypeFinal || '-'}</p>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Has Subcon
                    </label>
                    <div className="py-1">
                      {currentEL.hasSubcon ? 'Yes' : 'No'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Created
                    </label>
                    <div className="py-1">
                      {currentEL.createdAt 
                        ? new Date(currentEL.createdAt).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : '-'
                      }
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Signed Date
                    </label>
                    <div className="py-1">
                      {currentEL.signedDate 
                        ? new Date(currentEL.signedDate).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : '-'
                      }
                    </div>
                  </div>
                </div>
              </div>

              {/* Upload Document Section */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  {isUploaded ? 'Engagement Letter Document' : 'Upload Engagement Letter Document'}
                </label>
                <div className="border border-gray-200 rounded-lg p-4 bg-white">
                  <div 
                    className={`flex flex-col items-center justify-center py-6 border-2 border-dashed rounded-lg transition-colors ${
                      isDragOver 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <Upload className={`w-10 h-10 mb-3 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`} />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className={`text-sm ${isDragOver ? 'text-blue-600 font-medium' : 'text-gray-600'}`}>
                        {selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}
                      </span>
                      <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      PDF, DOC, DOCX (Max. 10MB)
                    </p>
                  </div>
                  {selectedFile && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700">{selectedFile.name}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <button
                          onClick={() => setSelectedFile(null)}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3 justify-end flex-shrink-0">
            {isCEOView && currentEL.status === 'WAITING_APPROVAL' ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReject}
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  Reject
                </Button>
                <Button
                  type="button"
                  onClick={handleApprove}
                  className="bg-gray-900 hover:bg-gray-800 text-white"
                >
                  Approve
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                {!isUploaded && (
                  <Button
                    type="button"
                    onClick={handleUpload}
                    disabled={!selectedFile}
                  >
                    Upload
                  </Button>
                )}
                {currentEL.status === 'APPROVED' && (
                  <Button
                    type="button"
                    onClick={handleSendToClient}
                    className="bg-gray-900 hover:bg-gray-800 text-white"
                  >
                    Send to Client
                  </Button>
                )}
                {currentEL.status === 'SENT' && (
                  <Button
                    type="button"
                    onClick={handleMarkAsSigned}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Mark as Signed
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

