import { ProjectManagement } from '../../../../features/projects/components/ProjectManagement';
import { authService } from '../../../../services/authService';

export function ProjectsPage() {
  const currentUser = authService.getCurrentUser();

  return (
    <ProjectManagement userRole={currentUser?.role} />
  );
}
