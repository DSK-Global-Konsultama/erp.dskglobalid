/**
 * Project Activity Tab. Audit trail of all project activities; filter by type.
 */

import { useState } from 'react';
import {
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  UserPlus,
  TrendingUp,
  DollarSign,
  Activity as ActivityIcon,
  Calendar,
  User,
} from 'lucide-react';
import type { ActivityLog } from '../../../../lib/projectWorkflowTypes';

export interface ProjectActivityTabProps {
  activityLogs: ActivityLog[];
}

const ACTIVITY_TYPES = [
  'HANDOVER_CREATED',
  'HANDOVER_SUBMITTED',
  'CEO_APPROVED',
  'PM_ASSIGNED',
  'PM_ACCEPTED',
  'DOCUMENT_UPLOADED',
  'REQUIREMENT_UPDATED',
  'PROGRESS_UPDATED',
  'STATUS_CHANGED',
] as const;

function getActivityIcon(type: string) {
  switch (type) {
    case 'HANDOVER_CREATED':
    case 'HANDOVER_SUBMITTED':
      return <FileText className="w-5 h-5 text-blue-600" />;
    case 'CEO_APPROVED':
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    case 'REVISION_REQUESTED':
      return <AlertCircle className="w-5 h-5 text-orange-600" />;
    case 'PM_ASSIGNED':
    case 'PM_ACCEPTED':
      return <UserPlus className="w-5 h-5 text-purple-600" />;
    case 'DOCUMENT_UPLOADED':
      return <Upload className="w-5 h-5 text-blue-600" />;
    case 'REQUIREMENT_UPDATED':
      return <CheckCircle className="w-5 h-5 text-teal-600" />;
    case 'PROGRESS_UPDATED':
      return <TrendingUp className="w-5 h-5 text-indigo-600" />;
    case 'PAYMENT_RECEIVED':
      return <DollarSign className="w-5 h-5 text-green-600" />;
    case 'STATUS_CHANGED':
      return <ActivityIcon className="w-5 h-5 text-gray-600" />;
    default:
      return <ActivityIcon className="w-5 h-5 text-gray-400" />;
  }
}

function getActivityColor(type: string): string {
  switch (type) {
    case 'CEO_APPROVED':
    case 'PM_ACCEPTED':
    case 'PAYMENT_RECEIVED':
      return 'bg-green-50 border-green-200';
    case 'REVISION_REQUESTED':
      return 'bg-orange-50 border-orange-200';
    case 'PROGRESS_UPDATED':
      return 'bg-indigo-50 border-indigo-200';
    case 'DOCUMENT_UPLOADED':
      return 'bg-blue-50 border-blue-200';
    case 'REQUIREMENT_UPDATED':
      return 'bg-teal-50 border-teal-200';
    default:
      return 'bg-gray-50 border-gray-200';
  }
}

function formatActivityType(type: string): string {
  return type
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}

export function ProjectActivityTab({ activityLogs }: ProjectActivityTabProps) {
  const [filter, setFilter] = useState<'ALL' | string>('ALL');

  const filteredLogs =
    filter === 'ALL' ? activityLogs : activityLogs.filter((log) => log.activityType === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Activity Log</h3>
          <p className="text-sm text-gray-600 mt-1">
            Riwayat lengkap semua aktivitas project
          </p>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer ${
            filter === 'ALL'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          All Activities ({activityLogs.length})
        </button>
        {ACTIVITY_TYPES.map((type) => {
          const count = activityLogs.filter((log) => log.activityType === type).length;
          if (count === 0) return null;
          return (
            <button
              key={type}
              type="button"
              onClick={() => setFilter(type)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer ${
                filter === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {formatActivityType(type)} ({count})
            </button>
          );
        })}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ActivityIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm font-medium text-gray-700">Belum ada aktivitas</p>
            <p className="text-xs text-gray-500 mt-1">Tidak ada aktivitas yang sesuai filter</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLogs.map((log, index) => (
              <div
                key={log.id}
                className={`relative pl-12 pb-4 ${
                  index !== filteredLogs.length - 1 ? 'border-l-2 border-gray-200' : ''
                }`}
              >
                <div className="absolute left-0 top-0 rounded-lg border-2 border-gray-200 bg-white p-2">
                  {getActivityIcon(log.activityType)}
                </div>
                <div className={`rounded-lg border p-4 ${getActivityColor(log.activityType)}`}>
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <div className="font-medium text-gray-900 mb-1">
                        {formatActivityType(log.activityType)}
                      </div>
                      <div className="text-sm text-gray-700">{log.description}</div>
                    </div>
                  </div>
                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <div className="mt-3 border-t border-gray-300/50 pt-3">
                      <div className="space-y-1 text-xs text-gray-600">
                        {Object.entries(log.metadata).map(([key, value]) => (
                          <div key={key}>
                            <strong>{key}:</strong> {String(value)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="mt-3 flex items-center gap-4 border-t border-gray-300/50 pt-3 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{log.actorName}</span>
                      <span className="text-gray-400">({log.actorRole})</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(log.createdAt).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
