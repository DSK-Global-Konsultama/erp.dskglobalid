import { useState } from 'react';
import { Plus, Calendar, FileText, Edit, X } from 'lucide-react';
import { toast } from 'sonner';
import { StatusChip } from '../shared/StatusChip';
import { ScheduleMeetingModal } from '../modals/ScheduleMeetingModal';
import { NotulensiFormModal } from '../modals/NotulensiFormModal';
import { NotulensiDetailModal } from '../modals/NotulensiDetailModal';
import { Button } from '../../../../components/ui/button';
import type { Meeting, Notulensi, Lead } from '../../../../lib/mock-data';
import type { LeadStatus } from '../management/LeadTrackerDetail';

interface MeetingNotulensiTabProps {
  leadId: string;
  meetings: Meeting[];
  notulensi: Notulensi[];
  leads: Lead[];
  onAddMeeting: (meeting: Meeting) => void;
  onUpdateMeeting?: (id: string, updates: Partial<Meeting>) => void;
  onDeleteMeeting?: (id: string) => void;
  onAddNotulensi: (notulensi: Notulensi) => void;
  onUpdateNotulensi?: (id: string, updates: Partial<Notulensi>) => void;
  onUpdateLeadStatus: (leadId: string, status: LeadStatus) => void;
}

export function MeetingNotulensiTab({ 
  leadId, 
  meetings,
  notulensi,
  leads,
  onAddMeeting,
  onUpdateMeeting,
  onDeleteMeeting,
  onAddNotulensi,
  onUpdateNotulensi,
  onUpdateLeadStatus
}: MeetingNotulensiTabProps) {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showNotulensiModal, setShowNotulensiModal] = useState(false);
  const [showNotulensiDetailModal, setShowNotulensiDetailModal] = useState(false);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const [selectedNotulensi, setSelectedNotulensi] = useState<Notulensi | null>(null);
  const [editingNotulensi, setEditingNotulensi] = useState<Notulensi | null>(null);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const leadMeetings = meetings.filter(m => m.leadId === leadId);
  const leadNotulensi = notulensi.filter(n => n.leadId === leadId);

  const handleCreateNotulensi = (meetingId: string) => {
    setSelectedMeetingId(meetingId);
    setShowNotulensiModal(true);
  };

  const handleViewDetails = (notulensi: Notulensi) => {
    setSelectedNotulensi(notulensi);
    setShowNotulensiDetailModal(true);
  };

  const handleEditNotulensi = (notulensi: Notulensi) => {
    // Ensure detail modal is closed first
    setShowNotulensiDetailModal(false);
    setSelectedNotulensi(null);
    // Then open edit modal
    setEditingNotulensi(notulensi);
    setSelectedMeetingId(notulensi.meetingId);
    setShowNotulensiModal(true);
  };

  const handleCloseDetail = () => {
    setShowNotulensiDetailModal(false);
    setSelectedNotulensi(null);
  };

  const handleDeleteMeeting = (meetingId: string, meetingName: string) => {
    // Check if meeting has notulensi
    const hasNotulensi = leadNotulensi.some(n => n.meetingId === meetingId);
    
    if (hasNotulensi) {
      toast.error('Tidak dapat menghapus meeting yang sudah memiliki notulensi');
      return;
    }

    if (window.confirm(`Apakah Anda yakin ingin menghapus meeting "${meetingName}"?`)) {
      if (onDeleteMeeting) {
        onDeleteMeeting(meetingId);
        toast.success('Meeting berhasil dihapus');
      } else {
        toast.error('Fungsi hapus meeting belum tersedia');
      }
    }
  };

  // Helper function to check if location is a URL
  const isUrl = (str: string): boolean => {
    if (!str || typeof str !== 'string') return false;
    
    // Check if it's already a valid URL with protocol
    try {
      const url = new URL(str);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      // Check if it starts with common URL patterns (zoom, maps, www, etc.)
      const urlPattern = /^(https?:\/\/|www\.|zoom\.us\/j\/|zoom\.us\/join|meet\.google\.com|maps\.google\.com|goo\.gl|bit\.ly|maps\.app\.goo\.gl|zoom\.us\/s\/)/i;
      return urlPattern.test(str.trim());
    }
  };

  // Helper function to format URL for display
  const formatUrl = (url: string): string => {
    // Remove protocol for cleaner display
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '');
  };

  // Helper function to ensure URL has protocol
  const ensureProtocol = (url: string): string => {
    if (!url) return url;
    const trimmed = url.trim();
    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }
    // Handle zoom.us links
    if (/^zoom\.us/i.test(trimmed)) {
      return `https://${trimmed}`;
    }
    // Handle Google Maps links
    if (/^(maps\.google\.com|maps\.app\.goo\.gl|goo\.gl\/maps)/i.test(trimmed)) {
      return `https://${trimmed}`;
    }
    // Handle Google Meet links
    if (/^meet\.google\.com/i.test(trimmed)) {
      return `https://${trimmed}`;
    }
    // Default: add https://
    return `https://${trimmed}`;
  };

  // Helper function to format date and time
  const formatDateTime = (dateTime: string): string => {
    if (!dateTime) return '-';
    try {
      const date = new Date(dateTime);
      const dateStr = date.toLocaleDateString('id-ID', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
      const timeStr = date.toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
      });
      return `${dateStr}, ${timeStr}`;
    } catch {
      // Fallback to original format if parsing fails
      return dateTime;
    }
  };

  return (
    <div className="space-y-6">
      {/* Meetings Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3>Meetings</h3>
          <button
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center gap-2 px-5 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Jadwalkan Meeting
          </button>
        </div>
        {leadMeetings.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <Calendar className="w-6 h-6 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600">Belum ada meeting dijadwalkan</p>
            <p className="text-sm text-gray-500 mt-1">Segera buat jadwal meeting untuk follow up dengan klien</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm text-gray-600">Nama Meeting</th>
                  <th className="px-4 py-3 text-left text-sm text-gray-600">Date & Time</th>
                  <th className="px-4 py-3 text-left text-sm text-gray-600">Platform/Location</th>
                  <th className="px-4 py-3 text-left text-sm text-gray-600">Notes</th>
                  <th className="px-4 py-3 text-left text-sm text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left text-sm text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {leadMeetings.map((meeting) => (
                  <tr key={meeting.id}>
                    <td className="px-4 py-3 max-w-[200px]">
                      <span className="truncate block" title={meeting.name || '-'}>
                        {meeting.name || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm">{formatDateTime(meeting.dateTime)}</span>
                    </td>
                    <td className="px-4 py-3 max-w-[300px]">
                      {isUrl(meeting.location) ? (
                        <a
                          href={ensureProtocol(meeting.location)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline truncate block"
                          title={meeting.location}
                        >
                          {formatUrl(meeting.location)}
                        </a>
                      ) : (
                        <span className="truncate block" title={meeting.location}>{meeting.location}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">{meeting.notes || '-'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusChip status={meeting.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {meeting.status === 'SCHEDULED' && (
                          <button
                            onClick={() => {
                              if (onUpdateMeeting) {
                                onUpdateMeeting(meeting.id, { status: 'DONE' });
                                // Update lead status to NEED_NOTULEN when meeting is marked as done
                                onUpdateLeadStatus(leadId, 'NEED_NOTULEN');
                              }
                            }}
                            className="px-3 py-1.5 bg-black text-white rounded-lg hover:bg-gray-900 text-sm transition-colors cursor-pointer"
                          >
                            Selesai
                          </button>
                        )}
                        {meeting.status === 'DONE' && !leadNotulensi.find(n => n.meetingId === meeting.id) && (
                          <button
                            onClick={() => handleCreateNotulensi(meeting.id)}
                            className="text-blue-600 hover:text-black text-sm cursor-pointer"
                          >
                            Buat Notulensi
                          </button>
                        )}
                        {meeting.status !== 'DONE' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingMeeting(meeting)}
                              className="flex items-center gap-2"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </Button>
                            <button
                              onClick={() => handleDeleteMeeting(meeting.id, meeting.name || 'Meeting')}
                              className="p-1.5 hover:bg-red-50 rounded-lg transition-colors cursor-pointer text-red-600 hover:text-red-700"
                              title="Hapus Meeting"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Notulensi Section */}
      <div>
        <div className="mb-4">
          <h3>Notulensi</h3>
        </div>
        {leadNotulensi.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <FileText className="w-6 h-6 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600">Belum ada notulensi dibuat</p>
            <p className="text-sm text-gray-500 mt-1">Setelah meeting selesai, buat notulensi untuk dokumentasi</p>
          </div>
        ) : (
          <div className="space-y-4">
            {leadNotulensi.map((notulensi) => (
              <div key={notulensi.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4>Meeting {notulensi.meetingInfo.date}</h4>
                      <StatusChip status={notulensi.status} />
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {isUrl(notulensi.meetingInfo.location) ? (
                        <a
                          href={ensureProtocol(notulensi.meetingInfo.location)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {formatUrl(notulensi.meetingInfo.location)}
                        </a>
                      ) : (
                        <span>{notulensi.meetingInfo.location}</span>
                      )} • {notulensi.meetingInfo.time}
                    </p>
                    <p className="text-sm text-gray-700">{notulensi.objectives}</p>
                  </div>
                  <button 
                    onClick={() => handleViewDetails(notulensi)}
                    className="text-blue-600 hover:text-black text-sm cursor-pointer"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ScheduleMeetingModal
        leadId={leadId}
        open={showScheduleModal || editingMeeting !== null}
        onClose={() => {
          setShowScheduleModal(false);
          setEditingMeeting(null);
        }}
        onAddMeeting={onAddMeeting}
        onUpdateMeeting={editingMeeting ? onUpdateMeeting : undefined}
        editingMeeting={editingMeeting}
        onUpdateLeadStatus={onUpdateLeadStatus}
      />

      <NotulensiFormModal
        leadId={leadId}
        meetingId={editingNotulensi?.meetingId || selectedMeetingId || ''}
        meetings={meetings}
        leads={leads}
        open={showNotulensiModal && (selectedMeetingId !== null || editingNotulensi !== null)}
        onClose={() => {
          setShowNotulensiModal(false);
          setSelectedMeetingId(null);
          setEditingNotulensi(null);
        }}
        onAddNotulensi={onAddNotulensi}
        editingNotulensi={editingNotulensi}
        onUpdateNotulensi={onUpdateNotulensi}
      />

      <NotulensiDetailModal
        notulensi={selectedNotulensi}
        open={showNotulensiDetailModal}
        onClose={handleCloseDetail}
        onEdit={handleEditNotulensi}
        onUpdateNotulensi={onUpdateNotulensi}
      />
    </div>
  );
}

