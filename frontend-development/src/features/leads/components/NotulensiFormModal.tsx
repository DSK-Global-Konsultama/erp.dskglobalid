import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { animate } from 'framer-motion';
import { Dialog, DialogContent } from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Button } from '../../../components/ui/button';
import type { Meeting, Notulensi, Lead } from '../../../lib/mock-data';

interface NotulensiFormModalProps {
  leadId: string;
  meetingId: string;
  meetings: Meeting[];
  leads: Lead[];
  open: boolean;
  onClose: () => void;
  onAddNotulensi: (notulensi: Notulensi) => void;
  editingNotulensi?: Notulensi | null;
  onUpdateNotulensi?: (id: string, updates: Partial<Notulensi>) => void;
}

export function NotulensiFormModal({ 
  leadId, 
  meetingId, 
  meetings, 
  leads,
  open,
  onClose,
  onAddNotulensi,
  editingNotulensi,
  onUpdateNotulensi
}: NotulensiFormModalProps) {
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const actualMeetingId = editingNotulensi?.meetingId || meetingId;
  const meeting = meetings.find(m => m.id === actualMeetingId);
  const lead = leads.find(l => l.id === leadId);
  const [formData, setFormData] = useState({
    internalParticipants: [''],
    clientParticipants: [''],
    objectives: '',
    background: '',
    issuesDiscussed: '',
    clientInfo: '',
    firmInfo: '',
    risks: '',
    agreements: [{ item: '', details: '' }],
    actionItems: [{ action: '', pic: '', deadline: '' }],
    nextSteps: '',
    notes: ''
  });

  // Update form data when editingNotulensi changes
  useEffect(() => {
    if (editingNotulensi) {
      setFormData({
        internalParticipants: editingNotulensi.participants.internal.length > 0 
          ? editingNotulensi.participants.internal 
          : [''],
        clientParticipants: editingNotulensi.participants.client.length > 0 
          ? editingNotulensi.participants.client 
          : [''],
        objectives: editingNotulensi.objectives || '',
        background: editingNotulensi.discussionSummary.background || '',
        issuesDiscussed: editingNotulensi.discussionSummary.issuesDiscussed || '',
        clientInfo: editingNotulensi.discussionSummary.clientInfo || '',
        firmInfo: editingNotulensi.discussionSummary.firmInfo || '',
        risks: editingNotulensi.discussionSummary.risks || '',
        agreements: editingNotulensi.agreements.length > 0 
          ? editingNotulensi.agreements 
          : [{ item: '', details: '' }],
        actionItems: editingNotulensi.actionItems.length > 0 
          ? editingNotulensi.actionItems 
          : [{ action: '', pic: '', deadline: '' }],
        nextSteps: editingNotulensi.nextSteps || '',
        notes: editingNotulensi.notes || ''
      });
    } else {
      setFormData({
        internalParticipants: [''],
        clientParticipants: [''],
        objectives: '',
        background: '',
        issuesDiscussed: '',
        clientInfo: '',
        firmInfo: '',
        risks: '',
        agreements: [{ item: '', details: '' }],
        actionItems: [{ action: '', pic: '', deadline: '' }],
        nextSteps: '',
        notes: ''
      });
    }
  }, [editingNotulensi, open]);

  const addParticipant = (type: 'internal' | 'client') => {
    if (type === 'internal') {
      setFormData({ ...formData, internalParticipants: [...formData.internalParticipants, ''] });
    } else {
      setFormData({ ...formData, clientParticipants: [...formData.clientParticipants, ''] });
    }
  };

  const removeParticipant = (type: 'internal' | 'client', index: number) => {
    if (type === 'internal') {
      const updated = formData.internalParticipants.filter((_, i) => i !== index);
      setFormData({ ...formData, internalParticipants: updated });
    } else {
      const updated = formData.clientParticipants.filter((_, i) => i !== index);
      setFormData({ ...formData, clientParticipants: updated });
    }
  };

  const updateParticipant = (type: 'internal' | 'client', index: number, value: string) => {
    if (type === 'internal') {
      const updated = [...formData.internalParticipants];
      updated[index] = value;
      setFormData({ ...formData, internalParticipants: updated });
    } else {
      const updated = [...formData.clientParticipants];
      updated[index] = value;
      setFormData({ ...formData, clientParticipants: updated });
    }
  };

  const addAgreement = () => {
    setFormData({
      ...formData,
      agreements: [...formData.agreements, { item: '', details: '' }]
    });
  };

  const removeAgreement = (index: number) => {
    const updated = formData.agreements.filter((_, i) => i !== index);
    setFormData({ ...formData, agreements: updated });
  };

  const updateAgreement = (index: number, field: 'item' | 'details', value: string) => {
    const updated = [...formData.agreements];
    updated[index][field] = value;
    setFormData({ ...formData, agreements: updated });
  };

  const addActionItem = () => {
    setFormData({
      ...formData,
      actionItems: [...formData.actionItems, { action: '', pic: '', deadline: '' }]
    });
  };

  const removeActionItem = (index: number) => {
    const updated = formData.actionItems.filter((_, i) => i !== index);
    setFormData({ ...formData, actionItems: updated });
  };

  const updateActionItem = (index: number, field: 'action' | 'pic' | 'deadline', value: string) => {
    const updated = [...formData.actionItems];
    updated[index][field] = value;
    setFormData({ ...formData, actionItems: updated });
  };

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

  const handleSaveDraft = () => {
    if (!meeting || !lead) return;
    
    const dateTimeParts = meeting.dateTime.split('T');
    const date = dateTimeParts[0];
    const time = dateTimeParts[1] || '10:00';
    
    if (editingNotulensi && onUpdateNotulensi) {
      // Update existing notulensi
      onUpdateNotulensi(editingNotulensi.id, {
        participants: {
          internal: formData.internalParticipants.filter(p => p.trim() !== ''),
          client: formData.clientParticipants.filter(p => p.trim() !== '')
        },
        objectives: formData.objectives,
        discussionSummary: {
          background: formData.background,
          issuesDiscussed: formData.issuesDiscussed,
          clientInfo: formData.clientInfo,
          firmInfo: formData.firmInfo,
          risks: formData.risks
        },
        agreements: formData.agreements.filter(a => a.item.trim() !== '' || a.details.trim() !== ''),
        actionItems: formData.actionItems.filter(a => a.action.trim() !== ''),
        nextSteps: formData.nextSteps,
        notes: formData.notes,
        status: 'DRAFT'
      });
      toast.success('Notulensi updated and saved as draft');
      handleClose();
    } else {
      // Create new notulensi
      const newNotulensi: Notulensi = {
        id: 'n' + Date.now(),
        leadId,
        meetingId,
        clientName: lead.clientName,
        meetingInfo: {
          date,
          time,
          location: meeting.location
        },
        participants: {
          internal: formData.internalParticipants.filter(p => p.trim() !== ''),
          client: formData.clientParticipants.filter(p => p.trim() !== '')
        },
        objectives: formData.objectives,
        discussionSummary: {
          background: formData.background,
          issuesDiscussed: formData.issuesDiscussed,
          clientInfo: formData.clientInfo,
          firmInfo: formData.firmInfo,
          risks: formData.risks
        },
        agreements: formData.agreements.filter(a => a.item.trim() !== '' || a.details.trim() !== ''),
        actionItems: formData.actionItems.filter(a => a.action.trim() !== ''),
        nextSteps: formData.nextSteps,
        notes: formData.notes,
        status: 'DRAFT',
        createdBy: 'BD Executive',
        createdAt: new Date().toISOString().split('T')[0]
      };
      
      onAddNotulensi(newNotulensi);
      toast.success('Notulensi saved as draft');
      handleClose();
    }
  };

  const handleSubmit = () => {
    if (!meeting || !lead) return;
    
    const dateTimeParts = meeting.dateTime.split('T');
    const date = dateTimeParts[0];
    const time = dateTimeParts[1] || '10:00';
    
    if (editingNotulensi && onUpdateNotulensi) {
      // Update existing notulensi and submit for approval
      onUpdateNotulensi(editingNotulensi.id, {
        participants: {
          internal: formData.internalParticipants.filter(p => p.trim() !== ''),
          client: formData.clientParticipants.filter(p => p.trim() !== '')
        },
        objectives: formData.objectives,
        discussionSummary: {
          background: formData.background,
          issuesDiscussed: formData.issuesDiscussed,
          clientInfo: formData.clientInfo,
          firmInfo: formData.firmInfo,
          risks: formData.risks
        },
        agreements: formData.agreements.filter(a => a.item.trim() !== '' || a.details.trim() !== ''),
        actionItems: formData.actionItems.filter(a => a.action.trim() !== ''),
        nextSteps: formData.nextSteps,
        notes: formData.notes,
        status: 'WAITING_CEO_APPROVAL'
      });
      toast.success('Notulensi updated and submitted to CEO for approval!');
    } else {
      // Create new notulensi and submit for approval
      const newNotulensi: Notulensi = {
        id: 'n' + Date.now(),
        leadId,
        meetingId,
        clientName: lead.clientName,
        meetingInfo: {
          date,
          time,
          location: meeting.location
        },
        participants: {
          internal: formData.internalParticipants.filter(p => p.trim() !== ''),
          client: formData.clientParticipants.filter(p => p.trim() !== '')
        },
        objectives: formData.objectives,
        discussionSummary: {
          background: formData.background,
          issuesDiscussed: formData.issuesDiscussed,
          clientInfo: formData.clientInfo,
          firmInfo: formData.firmInfo,
          risks: formData.risks
        },
        agreements: formData.agreements.filter(a => a.item.trim() !== '' || a.details.trim() !== ''),
        actionItems: formData.actionItems.filter(a => a.action.trim() !== ''),
        nextSteps: formData.nextSteps,
        notes: formData.notes,
        status: 'WAITING_CEO_APPROVAL',
        createdBy: 'BD Executive',
        createdAt: new Date().toISOString().split('T')[0]
      };
      
      onAddNotulensi(newNotulensi);
      toast.success('Notulensi submitted to CEO for approval!');
    }
    handleClose();
  };

  if (!meeting || !lead) return null;

  const dateTimeParts = meeting.dateTime.split('T');
  const date = dateTimeParts[0];
  const time = dateTimeParts[1] || '10:00';

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
        className="!fixed top-0 right-0 left-auto bottom-0 !translate-x-0 !translate-y-0 min-w-[800px] w-auto max-w-[95vw] h-screen max-h-screen rounded-none border-l border-r-0 border-t-0 border-b-0 shadow-xl p-0 flex flex-col [&>button]:hidden [&]:!animate-none [&]:!opacity-100 z-[9999]"
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
            <h2 className="text-lg font-semibold">{editingNotulensi ? 'Edit Notulensi Meeting' : 'Notulensi Meeting'}</h2>
            <p className="text-sm text-gray-600 mt-1">{lead?.clientName || ''}</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Form Content - Area Input */}
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <div className="space-y-6">
          {/* 1. Meeting Info (Auto-filled) */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm text-gray-600 mb-3">1. Meeting Info</h3>
            <div className="grid grid-cols-3 gap-4 text-sm overflow-hidden">
              <div>
                <p className="text-gray-600">Date</p>
                <p className="font-medium">{date}</p>
              </div>
              <div>
                <p className="text-gray-600">Time</p>
                <p className="font-medium">{time}</p>
              </div>
              <div className="min-w-0 overflow-hidden">
                <p className="text-gray-600">Location</p>
                <p className="font-medium truncate" title={meeting.location}>{meeting.location}</p>
              </div>
            </div>
          </div>

          {/* 2. Participants */}
          <div>
            <h3 className="mb-3">2. Participants</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm text-gray-700">Internal Team</label>
                  <button
                    onClick={() => addParticipant('internal')}
                    className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.internalParticipants.map((participant, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        type="text"
                        value={participant}
                        onChange={(e) => updateParticipant('internal', idx, e.target.value)}
                        className="flex-1"
                        placeholder="Name (Position)"
                      />
                      {formData.internalParticipants.length > 1 && (
                        <button
                          onClick={() => removeParticipant('internal', idx)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm text-gray-700">Client Team</label>
                  <button
                    onClick={() => addParticipant('client')}
                    className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.clientParticipants.map((participant, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        type="text"
                        value={participant}
                        onChange={(e) => updateParticipant('client', idx, e.target.value)}
                        className="flex-1"
                        placeholder="Name (Position)"
                      />
                      {formData.clientParticipants.length > 1 && (
                        <button
                          onClick={() => removeParticipant('client', idx)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 3. Meeting Objectives */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">3. Meeting Objectives</label>
            <Textarea
              value={formData.objectives}
              onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
              rows={3}
              className="w-full"
              placeholder="Tujuan utama dari meeting ini..."
            />
          </div>

          {/* 4. Discussion Summary */}
          <div>
            <h3 className="mb-3">4. Discussion Summary</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Background Summary</label>
                <Textarea
                  value={formData.background}
                  onChange={(e) => setFormData({ ...formData, background: e.target.value })}
                  rows={3}
                  className="w-full"
                  placeholder="Latar belakang bisnis klien..."
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Issues Discussed (Client Problems)</label>
                <Textarea
                  value={formData.issuesDiscussed}
                  onChange={(e) => setFormData({ ...formData, issuesDiscussed: e.target.value })}
                  rows={3}
                  className="w-full"
                  placeholder="Permasalahan yang dihadapi klien..."
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Information Provided by Client</label>
                <Textarea
                  value={formData.clientInfo}
                  onChange={(e) => setFormData({ ...formData, clientInfo: e.target.value })}
                  rows={3}
                  className="w-full"
                  placeholder="Informasi yang diberikan klien..."
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Information Provided by Our Firm</label>
                <Textarea
                  value={formData.firmInfo}
                  onChange={(e) => setFormData({ ...formData, firmInfo: e.target.value })}
                  rows={3}
                  className="w-full"
                  placeholder="Penjelasan dan solusi yang ditawarkan..."
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Risks / Concerns</label>
                <Textarea
                  value={formData.risks}
                  onChange={(e) => setFormData({ ...formData, risks: e.target.value })}
                  rows={3}
                  className="w-full"
                  placeholder="Risiko atau hal-hal yang perlu diperhatikan..."
                />
              </div>
            </div>
          </div>

          {/* 5. Agreements */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3>5. Agreements</h3>
              <button
                onClick={addAgreement}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Agreement
              </button>
            </div>
            <div className="space-y-3">
              {formData.agreements.map((agreement, idx) => (
                <div key={idx} className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg">
                  <div>
                    <Input
                      type="text"
                      value={agreement.item}
                      onChange={(e) => updateAgreement(idx, 'item', e.target.value)}
                      className="w-full"
                      placeholder="Agreement item..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={agreement.details}
                      onChange={(e) => updateAgreement(idx, 'details', e.target.value)}
                      className="flex-1"
                      placeholder="Details..."
                    />
                    {formData.agreements.length > 1 && (
                      <button
                        onClick={() => removeAgreement(idx)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 6. Action Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3>6. Action Items</h3>
              <button
                onClick={addActionItem}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Action Item
              </button>
            </div>
            <div className="space-y-3">
              {formData.actionItems.map((item, idx) => (
                <div key={idx} className="grid grid-cols-3 gap-3 p-3 bg-gray-50 rounded-lg">
                  <Input
                    type="text"
                    value={item.action}
                    onChange={(e) => updateActionItem(idx, 'action', e.target.value)}
                    className="w-full"
                    placeholder="Action..."
                  />
                  <Input
                    type="text"
                    value={item.pic}
                    onChange={(e) => updateActionItem(idx, 'pic', e.target.value)}
                    className="w-full"
                    placeholder="PIC..."
                  />
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      value={item.deadline}
                      onChange={(e) => updateActionItem(idx, 'deadline', e.target.value)}
                      className="flex-1"
                    />
                    {formData.actionItems.length > 1 && (
                      <button
                        onClick={() => removeActionItem(idx)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 7. Next Steps */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">7. Next Steps</label>
            <Textarea
              value={formData.nextSteps}
              onChange={(e) => setFormData({ ...formData, nextSteps: e.target.value })}
              rows={3}
              className="w-full"
              placeholder="Langkah-langkah selanjutnya..."
            />
          </div>

          {/* 8. Notes & Follow-Up */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">8. Notes & Follow-Up</label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full"
              placeholder="Catatan tambahan dan rencana follow up..."
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
              type="button"
              variant="outline"
              onClick={handleSaveDraft}
              className="flex items-center gap-2"
            >
              Simpan Draft
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
            >
              Submit ke CEO
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

