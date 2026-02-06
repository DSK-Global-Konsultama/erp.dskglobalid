import type { ReactNode } from 'react';

export interface ProjectStateGuardProps {
  allow: boolean;
  /** When true, children are rendered but disabled. When false, children are hidden. Default true = hide when allow=false. */
  hideOnly?: boolean;
  children: ReactNode;
}

/**
 * Guards UI by project workflow state (e.g. can complete only when progress 100%).
 * TODO: Replace with explicit rules when needed, e.g. canCompleteProject(project), canAssignPM(project).
 */
export function ProjectStateGuard({
  allow,
  hideOnly = true,
  children,
}: ProjectStateGuardProps) {
  if (allow) return <>{children}</>;
  if (hideOnly) return null;
  return (
    <span className="inline-block opacity-50 pointer-events-none" aria-hidden>
      {children}
    </span>
  );
}
