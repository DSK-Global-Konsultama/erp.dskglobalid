import { ReimbursementManagement } from '../../../../features/reimburse/components/ReimbursementManagement';
import { authService } from '../../../../services/authService';

export function ReimbursePage() {
  const currentUser = authService.getCurrentUser();
  const userRole = currentUser?.role === 'Admin' ? 'Admin' : 'Other';
  const userName = currentUser?.name || 'User';
  
  // Map role untuk submittedByRole
  const roleMap: Record<string, string> = {
    'BOD': 'BOD',
    'BD-Content': 'BD Content',
    'BD-Executive': 'BD Executive',
    'PM': 'PM',
    'ITSpecialist': 'IT',
    'Staff': 'Staff',
  };
  const userRoleString = roleMap[currentUser?.role || ''] || currentUser?.role || 'Other';

  return (
    <ReimbursementManagement 
      userRole={userRole} 
      userName={userName}
      userRoleString={userRoleString}
    />
  );
}

