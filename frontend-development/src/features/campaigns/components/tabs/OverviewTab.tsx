import { Eye } from 'lucide-react';
import type { Campaign, BankDataEntry } from '../../../../lib/leadManagementTypes';
import { getTriageStatusBadge } from '../../../../lib/statusHelpers';
import { formatIndonesianLongDateTime } from '../../../../utils/dateFormat';

interface OverviewTabProps {
  campaign: Campaign;
  submissions: BankDataEntry[];
  onViewSubmission: (submission: BankDataEntry) => void;
}

export function OverviewTab({ campaign, submissions, onViewSubmission }: OverviewTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-6">Campaign Details</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Created By:</span>
            <span className="ml-2 font-medium text-gray-900">{campaign.createdBy}</span>
          </div>
          <div>
            <span className="text-gray-600">Created At:</span>
            <span className="ml-2 font-medium text-gray-900">{campaign.createdAt}</span>
          </div>
          <div>
            <span className="text-gray-600">Last Updated:</span>
            <span className="ml-2 font-medium text-gray-900">{campaign.updatedAt}</span>
          </div>
          <div>
            <span className="text-gray-600">Campaign ID:</span>
            <span className="ml-2 font-mono text-xs text-gray-600">{campaign.id}</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-3">Recent Submissions</h3>
        {submissions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No submissions yet
          </div>
        ) : (
          <div className="space-y-2">
            {submissions.slice(0, 5).map(submission => (
              <div key={submission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{submission.clientName}</div>
                  <div className="text-sm text-gray-600">{submission.picName} • {submission.email}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm text-gray-600">{formatIndonesianLongDateTime(submission.submittedAt)}</div>
                    <div>
                      {(() => {
                        const statusBadge = getTriageStatusBadge(submission.triageStatus);
                        return (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${statusBadge.color}`}>
                            {statusBadge.label}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                  <button
                    onClick={() => onViewSubmission(submission)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

