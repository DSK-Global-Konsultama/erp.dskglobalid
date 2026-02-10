/**
 * Placeholder for project detail tabs not yet implemented.
 */
export interface ComingSoonTabProps {
  title: string;
}

export function ComingSoonTab({ title }: ComingSoonTabProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
      <p className="text-gray-600 font-medium">{title} — Coming Soon</p>
      <p className="text-gray-500 text-sm mt-2">
        This section will be available in the next iteration.
      </p>
    </div>
  );
}
