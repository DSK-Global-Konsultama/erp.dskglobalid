/**
 * Card wrapper for WorkflowStepIndicator.
 */

import { Card, CardContent } from '../../../../components/ui/card';
import { WorkflowStepIndicator } from './WorkflowStepIndicator';

export interface WorkflowStepCardProps {
  currentStatus: string;
}

export function WorkflowStepCard({ currentStatus }: WorkflowStepCardProps) {
  return (
    <Card className="mb-6 rounded-lg border border-gray-200">
      <CardContent className="pt-6">
        <WorkflowStepIndicator currentStatus={currentStatus} />
      </CardContent>
    </Card>
  );
}
