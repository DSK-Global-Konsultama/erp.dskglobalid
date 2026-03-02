import { Alert, AlertDescription, AlertTitle } from '../../../../components/ui/alert';
import { Bell } from 'lucide-react';
import type { Project } from '../../../../lib/mock-data';

export interface ActionRequiredAlertProps {
  completedProjects: Project[];
}

export function ActionRequiredAlert({
  completedProjects,
}: ActionRequiredAlertProps) {
  if (completedProjects.length === 0) return null;

  return (
    <Alert>
      <Bell className="h-4 w-4" />
      <AlertTitle>Action Required!</AlertTitle>
      <AlertDescription>
        Ada {completedProjects.length} project yang sudah selesai dan perlu
        ditagih final payment.
      </AlertDescription>
    </Alert>
  );
}
