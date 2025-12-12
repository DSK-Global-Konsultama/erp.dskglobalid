import { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import type { Meeting } from '../../../lib/mock-data';
import type { LeadStatus } from './LeadTrackerDetail';

interface ScheduleMeetingModalProps {
  leadId: string;
  onClose: () => void;
  onAddMeeting: (meeting: Meeting) => void;
  onUpdateLeadStatus: (leadId: string, status: LeadStatus) => void;
}

export function ScheduleMeetingModal({ leadId, onClose, onAddMeeting, onUpdateLeadStatus }: ScheduleMeetingModalProps) {
  const [formData, setFormData] = useState({
    dateTime: '',
    location: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newMeeting: Meeting = {
      id: 'm' + Date.now(),
      leadId,
      dateTime: formData.dateTime,
      location: formData.location,
      status: 'SCHEDULED',
      notes: formData.notes
    };
    
    onAddMeeting(newMeeting);
    onUpdateLeadStatus(leadId, 'MEETING_SCHEDULED');
    toast.success('Meeting scheduled successfully! Lead status updated to MEETING_SCHEDULED');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2>Jadwalkan Meeting</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Date & Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              required
              value={formData.dateTime}
              onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Location / Link <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Zoom Meeting, Office Meeting Room A"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add any meeting notes..."
            />
          </div>
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Schedule Meeting
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

