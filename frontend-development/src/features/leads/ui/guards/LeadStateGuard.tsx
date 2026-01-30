import type { ReactNode } from 'react';

export interface LeadStateGuardProps {
  /**
   * When false, children are not rendered (or rendered disabled - see hideOnly).
   * Use this to gate actions by workflow state (e.g. "can create proposal only if meeting/notulensi exists").
   */
  allow: boolean;
  /**
   * When true, children are still rendered but visually disabled (e.g. button disabled).
   * When false, children are not rendered at all.
   */
  hideOnly?: boolean;
  children: ReactNode;
}

/**
 * Guards UI by workflow state. Use allow=false to hide or disable actions when the
 * workflow doesn't permit them (e.g. proposal only after notulensi approved).
 *
 * TODO: Replace boolean `allow` with explicit rules when workflow is defined, e.g.:
 * - canCreateProposal(lead, meetings, notulensi)
 * - canCreateEL(lead, proposals)
 * - canCreateHandover(lead, engagementLetters)
 * - canConvertToProject(handover)
 */
export function LeadStateGuard({ allow, hideOnly = true, children }: LeadStateGuardProps) {
  if (allow) return <>{children}</>;
  if (hideOnly) return null;
  return (
    <span className="inline-block opacity-50 pointer-events-none" aria-hidden>
      {children}
    </span>
  );
}
