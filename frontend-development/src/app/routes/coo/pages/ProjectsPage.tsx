import { ProjectsManagementPage } from '../../../../features/projects';
import { authService } from '../../../../services/authService';

interface ProjectsPageProps {
  onProjectDetailChange?: (detail: { onBack: () => void } | null) => void;
}

export function ProjectsPage({ onProjectDetailChange }: ProjectsPageProps) {
  const currentUser = authService.getCurrentUser();

  return (
    <ProjectsManagementPage
      userRole={currentUser?.role}
      onProjectDetailChange={onProjectDetailChange}
    />
  );
}
