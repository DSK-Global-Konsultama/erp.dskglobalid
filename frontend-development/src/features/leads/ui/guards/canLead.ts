import type { UserRole } from '../../../../services/authService';

/**
 * canLead.ts – Helper permission untuk fitur Leads (RBAC action-level).
 *
 * Dipakai untuk:
 * - Menentukan siapa boleh create/edit/delete konten lead (meeting, notulensi, proposal, EL, handover).
 * - Menentukan siapa boleh approve/reject (flow approval CEO).
 *
 * Dipanggil dari LeadActionGuard dan bisa dipakai di komponen lain yang perlu cek role
 * tanpa if-else role tersebar di tab/modal.
 */

/** Roles yang boleh create/edit/delete lead-related content (meeting, notulensi, proposal, EL, handover). CEO dan view-only hanya lihat tombol "View". */
const EDIT_LEAD_ROLES: UserRole[] = ['BD-Executive'];

/**
 * Apakah role ini boleh mengedit konten lead (tambah meeting, buat notulensi, buat proposal, upload EL, buat handover, edit/hapus).
 * Dipakai oleh LeadActionGuard action="edit".
 */
export function canEditLead(role: UserRole | undefined): boolean {
  return role != null && EDIT_LEAD_ROLES.includes(role);
}

/** Role yang boleh approve/reject notulensi, proposal, EL, handover (hanya CEO). */
const APPROVE_LEAD_ROLES: UserRole[] = ['CEO'];

/**
 * Apakah role ini boleh approve/reject dokumen lead (notulensi, proposal, EL, handover).
 * Hanya CEO. Dipakai oleh LeadActionGuard action="approve" dan di modal yang punya tombol Approve/Reject (isCEOView).
 */
export function canApproveLead(role: UserRole | undefined): boolean {
  return role != null && APPROVE_LEAD_ROLES.includes(role);
}
