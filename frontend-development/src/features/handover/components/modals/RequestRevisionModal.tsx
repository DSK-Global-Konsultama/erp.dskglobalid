import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { animate } from 'framer-motion';
import { Button } from '../../../../components/ui/button';
import { Dialog, DialogContent } from '../../../../components/ui/dialog';
import { Textarea } from '../../../../components/ui/textarea';
import { SECTION_NAMES } from '../../constants';

interface SectionRevision {
  sectionName: string;
  comment: string;
}

interface RequestRevisionModalProps {
  open: boolean;
  onClose: () => void;
  onRequestRevision: (revisions: SectionRevision[]) => void;
}

export function RequestRevisionModal({
  open,
  onClose,
  onRequestRevision
}: RequestRevisionModalProps) {
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [sectionRevisions, setSectionRevisions] = useState<Map<string, string>>(new Map());

  // Get all section names
  const sections = Object.values(SECTION_NAMES);

  const toggleSection = (section: string) => {
    setSectionRevisions(prev => {
      const newMap = new Map(prev);
      if (newMap.has(section)) {
        newMap.delete(section);
      } else {
        newMap.set(section, '');
      }
      return newMap;
    });
  };

  const updateSectionComment = (section: string, comment: string) => {
    setSectionRevisions(prev => {
      const newMap = new Map(prev);
      newMap.set(section, comment);
      return newMap;
    });
  };

  const selectedSections = Array.from(sectionRevisions.keys());

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
          setSectionRevisions(new Map());
          onClose();
        }
      });
    } else {
      setSectionRevisions(new Map());
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

  const handleRequestRevision = () => {
    // Validate that all selected sections have comments
    const revisions: SectionRevision[] = Array.from(sectionRevisions.entries())
      .filter(([_, comment]) => comment.trim() !== '')
      .map(([sectionName, comment]) => ({
        sectionName,
        comment: comment.trim()
      }));

    if (revisions.length === 0 || revisions.length !== sectionRevisions.size) {
      return; // All selected sections must have comments
    }

    onRequestRevision(revisions);
    handleClose();
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
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">Request Revision</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 pb-6 pt-6">
            <p className="text-sm text-gray-600 mb-6">
              Select sections that need revision and provide comments:
            </p>
            
            {/* Section Selection with Individual Comments */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Sections to Revise:</h4>
              <div className="space-y-4">
                {sections.map((section) => {
                  const isSelected = sectionRevisions.has(section);
                  const comment = sectionRevisions.get(section) || '';
                  
                  return (
                    <div
                      key={section}
                      className={`border rounded-lg p-4 transition-all ${
                        isSelected ? 'border-orange-300 bg-orange-50' : 'border-gray-200 bg-white'
                      }`}
                    >
                      <label className="flex items-center gap-2 cursor-pointer mb-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSection(section)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-900">{section}</span>
                      </label>
                      
                      {isSelected && (
                        <div className="mt-3">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Comment for this section <span className="text-red-500">*</span>
                          </label>
                          <Textarea
                            value={comment}
                            onChange={(e) => updateSectionComment(section, e.target.value)}
                            placeholder="Explain what needs to be fixed in this section..."
                            rows={3}
                            className="w-full"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="flex gap-3 justify-end py-4 px-6 border-t border-gray-200 bg-white flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleRequestRevision}
              disabled={selectedSections.length === 0 || Array.from(sectionRevisions.values()).some(comment => !comment.trim())}
              className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send Revision Request
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

