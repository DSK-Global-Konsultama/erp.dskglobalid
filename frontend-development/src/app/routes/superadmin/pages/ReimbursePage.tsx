import { ReimbursementManagement } from '../../../../features/reimburse/components/ReimbursementManagement';
import { authService } from '../../../../services/authService';

export function SuperAdminReimbursePage() {
  const currentUser = authService.getCurrentUser();
  const userRole = currentUser?.role === 'Admin' ? 'Admin' : 'Other';
  const userName = currentUser?.name || 'User';
  
  const roleMap: Record<string, string> = {
    'BOD': 'BOD',
    'BD-MEO': 'BD MEO',
    'BD-Executive': 'BD Executive',
    'PM': 'PM',
    'ITSpecialist': 'IT',
    'SuperAdmin': 'Super Admin',
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
