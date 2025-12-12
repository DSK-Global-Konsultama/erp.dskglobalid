import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Meeting, Notulensi, Lead } from '../../../lib/mock-data';

interface NotulensiFormModalProps {
  leadId: string;
  meetingId: string;
  meetings: Meeting[];
  leads: Lead[];
  onClose: () => void;
  onAddNotulensi: (notulensi: Notulensi) => void;
}

export function NotulensiFormModal({ 
  leadId, 
  meetingId, 
  meetings, 
  leads,
  onClose,
  onAddNotulensi 
}: NotulensiFormModalProps) {
  const meeting = meetings.find(m => m.id === meetingId);
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

  const handleSaveDraft = () => {
    if (!meeting || !lead) return;
    
    const dateTimeParts = meeting.dateTime.split('T');
    const date = dateTimeParts[0];
    const time = dateTimeParts[1] || '10:00';
    
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
    onClose();
  };

  const handleSubmit = () => {
    if (!meeting || !lead) return;
    
    const dateTimeParts = meeting.dateTime.split('T');
    const date = dateTimeParts[0];
    const time = dateTimeParts[1] || '10:00';
    
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
    onClose();
  };

  if (!meeting || !lead) return null;

  const dateTimeParts = meeting.dateTime.split('T');
  const date = dateTimeParts[0];
  const time = dateTimeParts[1] || '10:00';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2>Notulensi Meeting</h2>
            <p className="text-sm text-gray-600 mt-1">{lead.clientName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          {/* 1. Meeting Info (Auto-filled) */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm text-gray-600 mb-3">1. Meeting Info</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Date</p>
                <p className="font-medium">{date}</p>
              </div>
              <div>
                <p className="text-gray-600">Time</p>
                <p className="font-medium">{time}</p>
              </div>
              <div>
                <p className="text-gray-600">Location</p>
                <p className="font-medium">{meeting.location}</p>
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
                      <input
                        type="text"
                        value={participant}
                        onChange={(e) => updateParticipant('internal', idx, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      <input
                        type="text"
                        value={participant}
                        onChange={(e) => updateParticipant('client', idx, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <textarea
              value={formData.objectives}
              onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tujuan utama dari meeting ini..."
            />
          </div>

          {/* 4. Discussion Summary */}
          <div>
            <h3 className="mb-3">4. Discussion Summary</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Background Summary</label>
                <textarea
                  value={formData.background}
                  onChange={(e) => setFormData({ ...formData, background: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Latar belakang bisnis klien..."
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Issues Discussed (Client Problems)</label>
                <textarea
                  value={formData.issuesDiscussed}
                  onChange={(e) => setFormData({ ...formData, issuesDiscussed: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Permasalahan yang dihadapi klien..."
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Information Provided by Client</label>
                <textarea
                  value={formData.clientInfo}
                  onChange={(e) => setFormData({ ...formData, clientInfo: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Informasi yang diberikan klien..."
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Information Provided by Our Firm</label>
                <textarea
                  value={formData.firmInfo}
                  onChange={(e) => setFormData({ ...formData, firmInfo: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Penjelasan dan solusi yang ditawarkan..."
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Risks / Concerns</label>
                <textarea
                  value={formData.risks}
                  onChange={(e) => setFormData({ ...formData, risks: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    <input
                      type="text"
                      value={agreement.item}
                      onChange={(e) => updateAgreement(idx, 'item', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Agreement item..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={agreement.details}
                      onChange={(e) => updateAgreement(idx, 'details', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <input
                    type="text"
                    value={item.action}
                    onChange={(e) => updateActionItem(idx, 'action', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Action..."
                  />
                  <input
                    type="text"
                    value={item.pic}
                    onChange={(e) => updateActionItem(idx, 'pic', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="PIC..."
                  />
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={item.deadline}
                      onChange={(e) => updateActionItem(idx, 'deadline', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <textarea
              value={formData.nextSteps}
              onChange={(e) => setFormData({ ...formData, nextSteps: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Langkah-langkah selanjutnya..."
            />
          </div>

          {/* 8. Notes & Follow-Up */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">8. Notes & Follow-Up</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Catatan tambahan dan rencana follow up..."
            />
          </div>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveDraft}
            className="px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Simpan Draft
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Submit ke CEO
          </button>
        </div>
      </div>
    </div>
  );
}

