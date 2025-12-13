import { useState } from 'react';
import { Plus, Calendar, FileText, Edit } from 'lucide-react';
import { StatusChip } from './StatusChip';
import { ScheduleMeetingModal } from './ScheduleMeetingModal';
import { NotulensiFormModal } from './NotulensiFormModal';
import { Button } from '../../../components/ui/button';
import type { Meeting, Notulensi, Lead } from '../../../lib/mock-data';
import type { LeadStatus } from './LeadTrackerDetail';

interface MeetingNotulensiTabProps {
  leadId: string;
  meetings: Meeting[];
  notulensi: Notulensi[];
  leads: Lead[];
  onAddMeeting: (meeting: Meeting) => void;
  onUpdateMeeting?: (id: string, updates: Partial<Meeting>) => void;
  onAddNotulensi: (notulensi: Notulensi) => void;
  onUpdateLeadStatus: (leadId: string, status: LeadStatus) => void;
}

export function MeetingNotulensiTab({ 
  leadId, 
  meetings,
  notulensi,
  leads,
  onAddMeeting,
  onUpdateMeeting,
  onAddNotulensi,
  onUpdateLeadStatus
}: MeetingNotulensiTabProps) {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showNotulensiModal, setShowNotulensiModal] = useState(false);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const leadMeetings = meetings.filter(m => m.leadId === leadId);
  const leadNotulensi = notulensi.filter(n => n.leadId === leadId);

  const handleCreateNotulensi = (meetingId: string) => {
    setSelectedMeetingId(meetingId);
    setShowNotulensiModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Meetings Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3>Meetings</h3>
          <button
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors"
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
                  <th className="px-4 py-3 text-left text-sm text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left text-sm text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {leadMeetings.map((meeting) => (
                  <tr key={meeting.id}>
                    <td className="px-4 py-3">{meeting.name || '-'}</td>
                    <td className="px-4 py-3">{meeting.dateTime}</td>
                    <td className="px-4 py-3">{meeting.location}</td>
                    <td className="px-4 py-3">
                      <StatusChip status={meeting.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingMeeting(meeting)}
                          className="flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </Button>
                        {meeting.status === 'SCHEDULED' && (
                          <button
                            onClick={() => {
                              if (onUpdateMeeting) {
                                onUpdateMeeting(meeting.id, { status: 'DONE' });
                              }
                            }}
                            className="px-3 py-1.5 bg-black text-white rounded-lg hover:bg-gray-900 text-sm transition-colors"
                          >
                            Selesai
                          </button>
                        )}
                        {meeting.status === 'DONE' && !leadNotulensi.find(n => n.meetingId === meeting.id) && (
                          <button
                            onClick={() => handleCreateNotulensi(meeting.id)}
                            className="text-blue-600 hover:text-blue-700 text-sm"
                          >
                            Buat Notulensi
                          </button>
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
        <div className="flex items-center justify-between mb-4">
          <h3>Notulensi</h3>
          <button
            onClick={() => {
              const doneMeeting = leadMeetings.find(m => m.status === 'DONE' && !leadNotulensi.find(n => n.meetingId === m.id));
              if (doneMeeting) {
                handleCreateNotulensi(doneMeeting.id);
              }
            }}
            disabled={!leadMeetings.some(m => m.status === 'DONE' && !leadNotulensi.find(n => n.meetingId === m.id))}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
            Buat Notulensi
          </button>
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
                      {notulensi.meetingInfo.location} • {notulensi.meetingInfo.time}
                    </p>
                    <p className="text-sm text-gray-700">{notulensi.objectives}</p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm">
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
        meetingId={selectedMeetingId || ''}
        meetings={meetings}
        leads={leads}
        open={showNotulensiModal && selectedMeetingId !== null}
        onClose={() => {
          setShowNotulensiModal(false);
          setSelectedMeetingId(null);
        }}
        onAddNotulensi={onAddNotulensi}
      />
    </div>
  );
}

