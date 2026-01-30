import { useState } from 'react';
import { Plus, Calendar, FileText, Edit, X, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { StatusChip } from '../shared/StatusChip';
import { LeadActionGuard } from '../guards/LeadActionGuard';
import { ScheduleMeetingModal } from '../modals/ScheduleMeetingModal';
import { NotulensiFormModal } from '../modals/NotulensiFormModal';
import { NotulensiDetailModal } from '../modals/NotulensiDetailModal';
import type { Meeting, Notulensi, Lead } from '../../../../lib/mock-data';
import type { LeadStatus } from '../../model/types';

interface MeetingNotulensiTabProps {
  leadId: string;
  meetings: Meeting[];
  notulensi: Notulensi[];
  leads: Lead[];
  readOnly?: boolean;
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
  readOnly = false,
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
    setShowNotulensiDetailModal(false);
    setSelectedNotulensi(null);
    setEditingNotulensi(notulensi);
    setSelectedMeetingId(notulensi.meetingId);
    setShowNotulensiModal(true);
  };

  const handleCloseDetail = () => {
    setShowNotulensiDetailModal(false);
    setSelectedNotulensi(null);
  };

  const handleDeleteMeeting = (meetingId: string, meetingName: string) => {
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

  const isUrl = (str: string): boolean => {
    if (!str || typeof str !== 'string') return false;
    try {
      const url = new URL(str);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      const urlPattern = /^(https?:\/\/|www\.|zoom\.us\/j\/|zoom\.us\/join|meet\.google\.com|maps\.google\.com|goo\.gl|bit\.ly|maps\.app\.goo\.gl|zoom\.us\/s\/)/i;
      return urlPattern.test(str.trim());
    }
  };

  const formatUrl = (url: string): string => {
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '');
  };

  const ensureProtocol = (url: string): string => {
    if (!url) return url;
    const trimmed = url.trim();
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    if (/^zoom\.us/i.test(trimmed)) return `https://${trimmed}`;
    if (/^(maps\.google\.com|maps\.app\.goo\.gl|goo\.gl\/maps)/i.test(trimmed)) return `https://${trimmed}`;
    if (/^meet\.google\.com/i.test(trimmed)) return `https://${trimmed}`;
    return `https://${trimmed}`;
  };

  const formatDateTime = (dateTime: string): string => {
    if (!dateTime) return '-';
    try {
      const date = new Date(dateTime);
      const dateStr = date.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
      const timeStr = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
      return `${dateStr}, ${timeStr}`;
    } catch {
      return dateTime;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3>Meetings</h3>
          <LeadActionGuard action="edit" readOnly={readOnly}>
            <button
              onClick={() => setShowScheduleModal(true)}
              className="flex items-center gap-2 px-5 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors font-medium cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              Jadwalkan Meeting
            </button>
          </LeadActionGuard>
        </div>
        {leadMeetings.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
            <Calendar className="w-6 h-6 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600">Belum ada meeting dijadwalkan</p>
            <p className="text-sm text-gray-500 mt-1">Segera buat jadwal meeting untuk follow up dengan klien</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leadMeetings.map((meeting) => (
              <div
                key={meeting.id}
                className="border rounded-lg p-4 border-gray-200 hover:border-gray-300 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4>{meeting.name || 'Meeting'}</h4>
                      <StatusChip status={meeting.status} />
                    </div>
                    <p className="text-sm text-gray-600">{formatDateTime(meeting.dateTime)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-gray-600">Platform/Location</p>
                    <p className="font-medium">
                      {isUrl(meeting.location) ? (
                        <a
                          href={ensureProtocol(meeting.location)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline break-words"
                          title={meeting.location}
                        >
                          {formatUrl(meeting.location)}
                        </a>
                      ) : (
                        <span className="break-words" title={meeting.location}>{meeting.location || '-'}</span>
                      )}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-600">Notes</p>
                    <p className="font-medium break-words whitespace-pre-wrap">{meeting.notes || '-'}</p>
                  </div>
                </div>
                {(() => {
                  const hasNotulensi = leadNotulensi.find(n => n.meetingId === meeting.id);
                  const isScheduled = meeting.status === 'SCHEDULED';
                  const showCreateNotulensi = meeting.status === 'DONE' && !hasNotulensi;
                  const showEditDelete = meeting.status !== 'DONE' && meeting.status !== 'SCHEDULED';
                  const showFooter = isScheduled || showCreateNotulensi || showEditDelete;

                  if (!showFooter) return null;

                  return (
                    <LeadActionGuard action="edit" readOnly={readOnly}>
                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                      {isScheduled && (
                        <>
                          <button
                            onClick={() => setEditingMeeting(meeting)}
                            className="flex-1 px-3 py-2 rounded-lg text-sm cursor-pointer border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 flex items-center justify-center gap-2"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              if (onUpdateMeeting) {
                                onUpdateMeeting(meeting.id, { status: 'DONE' });
                                onUpdateLeadStatus(leadId, 'NEED_NOTULEN');
                              }
                            }}
                            className="flex-1 px-3 py-2 rounded-lg text-sm cursor-pointer border border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
                          >
                            Mark as Done
                          </button>
                          <button
                            onClick={() => handleDeleteMeeting(meeting.id, meeting.name || 'Meeting')}
                            className="px-3 py-2 rounded-lg text-sm cursor-pointer border border-red-300 bg-white text-red-600 hover:bg-red-50 flex items-center justify-center"
                            title="Hapus Meeting"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {showCreateNotulensi && (
                        <button
                          onClick={() => handleCreateNotulensi(meeting.id)}
                          className="flex-1 px-3 py-2 rounded-lg text-sm cursor-pointer border border-blue-600 bg-blue-600 text-white hover:bg-blue-700"
                        >
                          Buat Notulensi
                        </button>
                      )}
                      {showEditDelete && (
                        <>
                          <button
                            onClick={() => setEditingMeeting(meeting)}
                            className="flex-1 px-3 py-2 rounded-lg text-sm cursor-pointer border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 flex items-center justify-center gap-2"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteMeeting(meeting.id, meeting.name || 'Meeting')}
                            className="px-3 py-2 rounded-lg text-sm cursor-pointer border border-red-300 bg-white text-red-600 hover:bg-red-50 flex items-center justify-center"
                            title="Hapus Meeting"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                    </LeadActionGuard>
                  );
                })()}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="mb-4">
          <h3>Notulensi</h3>
        </div>
        {leadNotulensi.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
            <FileText className="w-6 h-6 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600">Belum ada notulensi dibuat</p>
            <p className="text-sm text-gray-500 mt-1">Setelah meeting selesai, buat notulensi untuk dokumentasi</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leadNotulensi.map((notulensi) => (
              <div
                key={notulensi.id}
                className="border rounded-lg p-4 border-gray-200 hover:border-gray-300 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4>Meeting {notulensi.meetingInfo.date}</h4>
                      <StatusChip status={notulensi.status} />
                    </div>
                    <p className="text-sm text-gray-600">
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
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-gray-600">Objectives</p>
                    <p className="font-medium">{notulensi.objectives || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Created By</p>
                    <p className="font-medium">{notulensi.createdBy || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Created</p>
                    <p className="font-medium">
                      {notulensi.createdAt
                        ? new Date(notulensi.createdAt).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : '-'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleViewDetails(notulensi)}
                    className="flex-1 px-3 py-2 rounded-lg text-sm cursor-pointer border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    {readOnly ? 'View' : 'View Details'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!readOnly && (
      <>
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

      </>
      )}

      {showNotulensiDetailModal && selectedNotulensi && (
        <NotulensiDetailModal
          notulensi={selectedNotulensi}
          open={showNotulensiDetailModal}
          onClose={handleCloseDetail}
          onEdit={readOnly ? undefined : handleEditNotulensi}
          onUpdateNotulensi={onUpdateNotulensi}
          readOnly={readOnly}
        />
      )}
    </div>
  );
}
