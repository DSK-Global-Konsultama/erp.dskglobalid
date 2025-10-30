import { Alert, AlertDescription, AlertTitle } from '../../../../components/ui/alert';
import { Bell } from 'lucide-react';
import type { Project } from '../../../../lib/mock-data';

interface NewAssignmentAlertProps {
  myProjects: Project[];
}

export function NewAssignmentAlert({ myProjects }: NewAssignmentAlertProps) {
  const hasNewAssignment = myProjects.filter(
    p => p.pmNotified && p.status === 'waiting-first-payment' && !p.assignedConsultant
  ).length > 0;

  if (!hasNewAssignment) return null;

  return (
    <Alert>
      <Bell className="h-4 w-4" />
      <AlertTitle>New Project Assignment!</AlertTitle>
      <AlertDescription>
        Anda mendapat project baru. Assign consultant dan tunggu payment 50% untuk mulai pengerjaan.
      </AlertDescription>
    </Alert>
  );
}

