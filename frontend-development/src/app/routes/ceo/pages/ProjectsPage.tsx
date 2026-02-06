import { ProjectsManagementPage } from '../../../../features/projects';
import { authService } from '../../../../services/authService';

export function ProjectsPage() {
  const currentUser = authService.getCurrentUser();

  return (
    <ProjectsManagementPage userRole={currentUser?.role} />
  );
}
