/**
 * Project Detail – Progress tab. Tracking progress dengan timeline.
 * Desain awal: header seperti Documents/Requirements, card gradient biru, timeline dot biru.
 */

import { useState } from 'react';
import { Plus, TrendingUp, TrendingDown, Calendar, AlertCircle, FileText, ArrowRightCircle } from 'lucide-react';
import type { ProgressLog, ProjectPhase } from '../../../../lib/projectWorkflowTypes';
import { AddProgressModal } from '../modals/AddProgressModal';

export interface ProjectProgressTabProps {
  handoverId: string;
  userRole: string;
  progressLogs: ProgressLog[];
  createdByDisplay?: string;
  onAddProgress?: (log: ProgressLog) => void;
}

function getPhaseColor(phase: ProjectPhase): string {
  switch (phase) {
    case 'Data Collection':
      return 'bg-blue-100 text-blue-800';
    case 'Analysis':
      return 'bg-purple-100 text-purple-800';
    case 'Drafting':
      return 'bg-orange-100 text-orange-800';
    case 'Review':
      return 'bg-yellow-100 text-yellow-800';
    case 'Finalization':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function ProjectProgressTab({
  handoverId,
  userRole,
  progressLogs,
  createdByDisplay,
  onAddProgress,
}: ProjectProgressTabProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const latestProgress = progressLogs.length > 0 ? progressLogs[0] : null;
  const createdBy = createdByDisplay ?? userRole;
  const currentPercent = latestProgress?.progressPercentage ?? 0;
  const currentPhase = latestProgress?.phase;

  return (
    <div className="space-y-4">
      {/* Header – sama seperti Documents / Requirements */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Progress</h3>
          <p className="text-sm text-gray-600 mt-1">
            Pantau perkembangan project dan riwayat update
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors font-medium cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Add Progress Update
        </button>
      </div>

      {/* Current Progress Card – header hitam, progress bar merah, aksen kiri merah */}
      <div className="rounded-xl border-2 border-gray-900 border-l-4 border-l-red-600 bg-white shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-gray-900 via-gray-900 to-[#1a2035] px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-white">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white">Current Progress</h3>
              {latestProgress ? (
                <p className="text-sm text-gray-400 mt-0.5">
                  Terakhir update: {new Date(latestProgress.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              ) : (
                <p className="text-sm text-gray-500 mt-0.5">Belum ada update</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold tracking-tight text-white">{currentPercent}%</span>
              {currentPhase != null ? (
                <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white/25 text-white">
                  {currentPhase}
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white/20 text-white">
                  —
                </span>
              )}
            </div>
          </div>
          <div className="mt-4">
            <div className="h-2.5 w-full rounded-full bg-white/20">
              <div
                className="h-2.5 rounded-full bg-red-500 transition-all duration-300 ease-out"
                style={{ width: `${currentPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="p-6 bg-white">
          {latestProgress ? (
            <div className="space-y-4">
              {latestProgress.reasonForDecrease && (
                <div className="rounded-lg border-2 border-red-300 bg-red-50/80 p-4">
                  <div className="flex items-start gap-2">
                    <TrendingDown className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-red-700 mb-1">Reason for Decrease</p>
                      <p className="text-sm text-red-800 leading-relaxed">{latestProgress.reasonForDecrease}</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-green-700 mb-1">
                    Update note
                  </p>
                  <p className="text-sm text-gray-900 leading-relaxed">{latestProgress.updateNote}</p>
                </div>
              </div>
              {latestProgress.blockers && (
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-red-700 mb-1">Blockers</p>
                    <p className="text-sm text-gray-900 leading-relaxed">{latestProgress.blockers}</p>
                  </div>
                </div>
              )}
              {latestProgress.nextSteps && (
                <div className="flex items-start gap-2">
                  <ArrowRightCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-blue-700 mb-1.5">Next steps</p>
                    <p className="text-sm text-gray-900 leading-relaxed">{latestProgress.nextSteps}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 py-12 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-200">
                <TrendingUp className="h-7 w-7 text-gray-500" />
              </div>
              <p className="text-sm font-medium text-gray-700">Belum ada progress update</p>
              <p className="text-sm text-gray-500 mt-1">Tambahkan update pertama untuk melacak perkembangan project</p>
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="mt-5 inline-flex items-center gap-2 px-5 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors font-medium cursor-pointer"
              >
                <Plus className="w-5 h-5" />
                Add First Update
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Progress History – timeline dot biru seperti permintaan pertama */}
      {progressLogs.length > 0 && (
        <div className="rounded-lg border border-gray-200 p-6 bg-white">
          <h3 className="font-semibold text-gray-900 mb-4">
            Progress History ({progressLogs.length})
          </h3>

          <div className="space-y-4">
            {progressLogs.map((log, index) => {
              const prevLog = progressLogs[index + 1];
              const progressChange = prevLog
                ? log.progressPercentage - prevLog.progressPercentage
                : null;

              return (
                <div
                  key={log.id}
                  className="relative pl-8 pb-4 border-l-2 border-gray-200 last:border-l-0 last:pb-0"
                >
                  <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-blue-600 border-4 border-white" />

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl font-bold text-gray-900">
                          {log.progressPercentage}%
                        </div>
                        {progressChange !== null && (
                          <div
                            className={`flex items-center gap-1 text-sm font-medium ${
                              progressChange > 0
                                ? 'text-green-600'
                                : progressChange < 0
                                  ? 'text-red-600'
                                  : 'text-gray-600'
                            }`}
                          >
                            {progressChange > 0 ? (
                              <>
                                <TrendingUp className="w-4 h-4" />
                                +{progressChange}%
                              </>
                            ) : progressChange < 0 ? (
                              <>
                                <TrendingDown className="w-4 h-4" />
                                {progressChange}%
                              </>
                            ) : (
                              'No change'
                            )}
                          </div>
                        )}
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getPhaseColor(log.phase)}`}
                      >
                        {log.phase}
                      </span>
                    </div>

                    {log.reasonForDecrease && (
                      <div className="rounded-lg border-2 border-red-300 bg-red-50/80 p-4 mb-3">
                        <div className="flex items-start gap-2">
                          <TrendingDown className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-medium text-red-700 mb-1">Reason for Decrease</p>
                            <p className="text-sm text-red-800 leading-relaxed">{log.reasonForDecrease}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-2 mb-3">
                      <FileText className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-green-700 mb-1">Update note</p>
                        <p className="text-sm text-gray-900">{log.updateNote}</p>
                      </div>
                    </div>

                    {log.blockers && (
                      <div className="flex items-start gap-2 mb-3">
                        <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-red-700 mb-1">Blockers</p>
                          <p className="text-sm text-gray-900 leading-relaxed">{log.blockers}</p>
                        </div>
                      </div>
                    )}

                    {log.nextSteps && (
                      <div className="flex items-start gap-2">
                        <ArrowRightCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-blue-700 mb-1">Next Steps</p>
                          <p className="text-sm text-gray-900">{log.nextSteps}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(log.createdAt).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                      <span>•</span>
                      <span>by {log.createdBy}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <AddProgressModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={(log) => {
          onAddProgress?.(log);
          setShowAddModal(false);
        }}
        handoverId={handoverId}
        createdBy={createdBy}
        latestProgress={latestProgress}
      />
    </div>
  );
}
