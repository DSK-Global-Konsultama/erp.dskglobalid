/**
 * Role-based policy for handover (e.g. hidden sections per role).
 */
import type { SectionId } from './types';

/** Section 4 = FEE STRUCTURE & PAYMENT TERMS – hidden for PM only; COO sees all. */
export function getHiddenSectionsForRole(role: string): SectionId[] {
  const isPM = role === 'PM';
  return isPM ? [4] : [];
}
