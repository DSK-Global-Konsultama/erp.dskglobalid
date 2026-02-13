/**
 * Workflow Step Indicator – handover workflow progress only (do not use project.status).
 */

import { Check } from 'lucide-react';
import {
  mapWorkflowToDisplayStatus,
  getWorkflowSteps,
  getWorkflowLabel,
} from '../../model/selectors';

export interface WorkflowStepIndicatorProps {
  /** Raw or display workflow status (mapped via selectors). */
  currentStatus: string;
}

export function WorkflowStepIndicator({ currentStatus }: WorkflowStepIndicatorProps) {
  const displayStatus = mapWorkflowToDisplayStatus(currentStatus);
  const workflowSteps = getWorkflowSteps();

  const currentStepIndex = workflowSteps.findIndex(step => step.key === displayStatus);
  const effectiveIndex = currentStepIndex >= 0 ? currentStepIndex : 0;

  return (
    <div className="py-6">
      <div className="flex items-center justify-between">
        {workflowSteps.map((step, index) => {
          const isCompleted = index < effectiveIndex;
          const isCurrent = index === effectiveIndex;
          const isLast = index === workflowSteps.length - 1;

          return (
            <div key={step.key} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    isCompleted
                      ? 'bg-gray-800 border-red-500 text-white'
                      : isCurrent
                        ? 'bg-red-600 border-red-600 text-white'
                        : 'bg-white border-gray-300 text-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <div
                  className={`mt-2 text-xs font-medium text-center whitespace-nowrap ${
                    isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-500'
                  }`}
                >
                  {getWorkflowLabel(step.key)}
                </div>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div
                  className={`flex-1 h-0.5 mx-2 ${
                    isCompleted ? 'bg-red-500' : 'bg-gray-300'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Revision Notice */}
      {currentStatus === 'REVISION_REQUESTED' && (
        <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-800">
          <strong>Revisi Diminta:</strong> CEO meminta perbaikan sebelum approval
        </div>
      )}
    </div>
  );
}
