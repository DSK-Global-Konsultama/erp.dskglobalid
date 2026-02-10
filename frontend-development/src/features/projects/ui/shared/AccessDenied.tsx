/**
 * Simple "Access Denied" message for role-restricted pages.
 */
export function AccessDenied() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="text-center">
        <p className="text-lg font-semibold text-gray-900">Access Denied</p>
        <p className="text-sm text-gray-600 mt-1">You do not have permission to view this page.</p>
      </div>
    </div>
  );
}
