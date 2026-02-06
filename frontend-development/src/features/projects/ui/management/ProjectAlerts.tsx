import { Alert, AlertDescription, AlertTitle } from '../../../../components/ui/alert';
import { UserPlus, AlertCircle } from 'lucide-react';

interface ProjectAlertsProps {
  projectsWaitingPM: number;
  projectsWaitingPayment: number;
  projectsOverdue: number;
  projectsAtRisk: number;
  alertTitle?: string;
  alertDescription?: string;
}

export function ProjectAlerts({
  projectsWaitingPM,
  projectsWaitingPayment,
  projectsOverdue,
  projectsAtRisk,
  alertTitle,
  alertDescription,
}: ProjectAlertsProps) {
  const hasAnyAlert =
    projectsWaitingPM > 0 ||
    projectsWaitingPayment > 0 ||
    projectsOverdue > 0 ||
    projectsAtRisk > 0;

  if (!hasAnyAlert) {
    return null;
  }

  return (
    <div className="space-y-4">
      {projectsWaitingPM > 0 && (
        <Alert>
          <UserPlus className="h-4 w-4" />
          <AlertTitle>{alertTitle || 'Perhatian COO!'}</AlertTitle>
          <AlertDescription>
            {alertDescription ||
              `Ada ${projectsWaitingPM} project yang belum di-assign PM.`}
          </AlertDescription>
        </Alert>
      )}

      {projectsWaitingPayment > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Waiting First Payment</AlertTitle>
          <AlertDescription>
            Ada {projectsWaitingPayment} project menunggu pembayaran 50% sebelum
            bisa dimulai PM.
          </AlertDescription>
        </Alert>
      )}

      {projectsOverdue > 0 && (
        <Alert className="border-red-500 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-900">Peringatan Overdue!</AlertTitle>
          <AlertDescription className="text-red-800">
            Ada {projectsOverdue} project yang sudah melewati deadline. Segera
            selesaikan project ini!
          </AlertDescription>
        </Alert>
      )}

      {projectsAtRisk > 0 && (
        <Alert className="border-orange-500 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-900">
            Peringatan Deadline!
          </AlertTitle>
          <AlertDescription className="text-orange-800">
            Ada {projectsAtRisk} project yang sudah dekat deadline namun progress
            masih di bawah 100%. Perlu perhatian khusus untuk menyelesaikan
            project tepat waktu.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
