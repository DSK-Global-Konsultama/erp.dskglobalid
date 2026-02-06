# Fitur Leads – Dokumentasi Detail

Fitur **manajemen lead** dan **lead tracker** (pipeline: meeting → notulensi → proposal → engagement letter → handover). Dipakai oleh **BD Executive**, **CEO**, SuperAdmin, IT. CEO punya **Lead Inbox** terpisah untuk follow-up lead yang di-promote dari Bank Data.

---

## Ringkasan Per File (Detail & Spesifik)

### `api/leadApi.ts`
**Fungsi:** Single entry point untuk akses data lead (mock).

**Untuk apa:**
- `getAll()`: return daftar lead dari `mockLeads` (legacy).
- `getTrackerData(userName)`: return data lengkap untuk Lead Tracker: `leads` (dari `generateDummyLeadsBDMEO`), `meetings`, `notulensi`, `proposals`, `engagementLetters`, `handovers`, `leadSources`.
- `getByStatus(status, leads)`: filter lead by status.
- `getByUser(userName, leads)`: filter lead by createdBy atau claimedBy.
- `updateStatus(leadId, status, leads)`: update status lead, return array baru.
- `claimLead(leadId, userName, leads)`: claim lead (status→claimed, claimedBy, claimedDate).
- `getAvailableLeads(leads)`: filter status `available`.
- `getClaimedLeads(userName, leads)`: filter lead yang di-claim user & bukan available.
- Export types: Lead, Meeting, Notulensi, Proposal, EngagementLetter, Handover. Export `leadSources`.

---

### `model/types.ts`
**Fungsi:** Tipe status pipeline Lead Tracker.

**Untuk apa:**
- **LeadStatus**: union type status pipeline: NEW, TO_BE_MEET, MEETING_SCHEDULED, NEED_NOTULEN, NEED_PROPOSAL, IN_PROPOSAL, PROPOSAL_EXPIRED, NEED_ENGAGEMENT_LETTER, NEED_HANDOVER, IN_HANDOVER, DEAL_WON, ON_HOLD, DROP.

---

### `model/selectors.ts`
**Fungsi:** Derive metadata untuk row Lead Tracker.

**Untuk apa:**
- **CommercialStage**: TO_BE_MEET, MEETING_SCHEDULED, NEED_NOTULEN, IN_NOTULEN, NEED_PROPOSAL, IN_PROPOSAL, IN_EL, EL_SIGNED, ON_HOLD, DROP.
- **HandoverStatus**: LOCKED, NOT_STARTED, DRAFT, WAITING_CEO, CEO_APPROVED.
- **LeadTrackerRowMeta**: { commercialStage, activeDocumentLabel, handoverStatus }.
- `deriveLeadTrackerRowMeta(lead, meetings, notulensi, proposals, engagementLetters, handovers)`: hitung stage berdasarkan dokumen terakhir (EL signed→handover; EL belum signed→EL; proposal→proposal; notulensi→notulensi; meeting→meeting; else TO_BE_MEET). Set activeDocumentLabel & handoverStatus sesuai.
- Helper internal: getHandoverSubstatusLabel, getELSubstatusLabel, getProposalSubstatusLabel, getNotulenSubstatusLabel.

---

### `pages/index.ts`
**Fungsi:** Barrel export halaman leads.

**Untuk apa:**
- Export: `LeadsManagementPage`, `LeadTrackerDetailPage`, `LeadInboxPage`, type `LeadStatus`.

---

### `pages/LeadsManagementPage.tsx`
**Fungsi:** Halaman daftar lead dengan filter, tabel, pagination.

**Untuk apa:**
- Props: `userName`, `mode` ('view'|'tracker'), `title?`, `onLeadClick?`.
- State: searchTerm, filterSource, filterStatus, filterCommercialStage, filterHandoverStatus, serviceFilter, currentPage, itemsPerPage.
- Data dari `leadApi.getTrackerData('Sarah Wijaya')`, filter leads by RELEVANT_STATUSES.
- Filter: search (company, clientName), source (mode view), status, commercial stage & handover status & service (mode tracker).
- Pagination: slice filteredLeads, reset page saat filter berubah.
- Render: LeadsFilters, LeadsTable, LeadsPagination (slot pagination).
- Services & leadSources diambil dari data untuk filter dropdown.

---

### `pages/LeadTrackerDetailPage.tsx`
**Fungsi:** Halaman detail satu lead dengan tab.

**Untuk apa:**
- Props: leadId, leads, meetings, notulensi, proposals, engagementLetters, handovers, readOnly?, onAdd*, onUpdate*, onDelete*, onUpdateLeadStatus.
- Cari lead by leadId; jika tidak ditemukan tampilkan "Lead not found".
- State: activeTab ('info'|'meeting'|'proposal'|'engagement-letter'|'handover-memo').
- Render LeadTabs dengan semua data & callback. Header lead ditampilkan di app bar (LeadDetailHeaderBar) oleh layout Header.

---

### `pages/LeadInboxPage.tsx`
**Fungsi:** Inbox CEO untuk lead follow-up (promoted dari Bank Data).

**Untuk apa:**
- Guard: hanya CEO bisa akses; selain CEO tampilkan "Access Denied".
- Data: `mockCEOLeads` dari `lib/leadManagementMockData`, status `CEOFollowUpStatus` (FOLLOWUP_PENDING, FOLLOWED_UP, DROP).
- State: leads, openMenuId, menuPosition, buttonRefs, searchQuery, filterStatus, currentPage, itemsPerPage.
- Filter: search (clientName, picName, email), filter status.
- Handler: handleFollowUp (→FOLLOWED_UP), handleDrop (→DROP), handleSeeDetail (toast info), handleMenuToggle, handleActionButtonRef, handleActionClick.
- Alert jika ada newLeads (FOLLOWUP_PENDING).
- Render: LeadInboxFilters, LeadInboxTable, LeadInboxPagination. Menu aksi (Followed-up, Drop, See Detail) fixed overlay per baris.

---

### `index.tsx`
**Fungsi:** Public entry point fitur leads.

**Untuk apa:**
- Export pages: LeadsManagementPage, LeadTrackerDetailPage, LeadInboxPage, LeadStatus.
- Export API: leadApi.
- Export UI cross-feature: LeadDetailHeaderBar, StatusChip, ProposalDetailModal, EngagementLetterUploadModal, NotulensiDetailModal.

---

### `ui/management/LeadsFilters.tsx`
**Fungsi:** UI filter untuk daftar lead.

**Untuk apa:**
- Mode 'tracker': search (placeholder "Search by client or PIC..."), filter Commercial Stage, Handover Status, Service + Reset. Grid 4 kolom.
- Mode 'view': search, filter Source (leadSources), filter Status (semua status pipeline) + Reset. Flex layout.
- Controlled: searchTerm, filterSource, filterStatus, filterCommercialStage, filterHandoverStatus, serviceFilter. Callback onReset.

---

### `ui/management/LeadsTable.tsx`
**Fungsi:** Tabel lead untuk LeadsManagementPage.

**Untuk apa:**
- Props: mode, title, leads, meetings, notulensi, proposals, engagementLetters, handovers, onLeadClick?, formatDate, pagination?.
- Kolom: ID, Client Info (company + clientName), Source. Mode tracker tambah: Commercial Stage (StatusChip), Active Document (document + substatus), Handover Status (LOCKED icon atau StatusChip). Mode view: Status. Lalu: Created At, Last Activity.
- Row clickable jika onLeadClick ada.
- deriveLeadTrackerRowMeta dipanggil per lead di mode tracker.
- Pagination slot di bawah tabel (dalam Card).

---

### `ui/management/LeadsPagination.tsx`
**Fungsi:** Kontrol pagination untuk daftar lead.

**Untuk apa:**
- "Showing X of Y entries", rows per page (5/10/20/50), Previous/Next, current page number.
- Return null jika totalItems === 0.
- Sama pola dengan ProjectPagination.

---

### `ui/management/LeadInboxFilters.tsx`
**Fungsi:** Filter untuk Lead Inbox CEO.

**Untuk apa:**
- Input search placeholder "Search by name, email...".
- Select filter status: All, Pending (FOLLOWUP_PENDING), Followed Up (FOLLOWED_UP), Dropped (DROP).
- Tombol Reset.
- Controlled: searchQuery, filterStatus (CEOFollowUpStatus | 'ALL').

---

### `ui/management/LeadInboxTable.tsx`
**Fungsi:** Tabel lead inbox CEO.

**Untuk apa:**
- Kolom: Client, Contact (picName, email, phone), Source (CAMPAIGN_FORM: sourceCampaignName + topicTag; else "Manual Entry"), Promoted (promotedAt, promotedBy), Status (renderStatusBadge), Action (tombol 3 dots).
- Tombol action: ref via onActionButtonRef, onClick via onActionClick untuk buka menu.
- Slot pagination di bawah tabel.

---

### `ui/management/LeadInboxPagination.tsx`
**Fungsi:** Kontrol pagination untuk Lead Inbox.

**Untuk apa:**
- Sama dengan LeadsPagination: entries, rows per page, Previous/Next.

---

### `ui/detail/LeadDetailHeaderBar.tsx`
**Fungsi:** Header lead di app bar saat view detail lead.

**Untuk apa:**
- Props: clientName, company?, status, service?, source?, picEmail?, picPhone?, onBack.
- Tombol back (ArrowLeft), company/clientName, StatusChip, client name, source tag, PIC email/phone.
- Dipanggil dari Header.tsx saat leadDetail ada.

---

### `ui/detail/LeadTabs.tsx`
**Fungsi:** Tab nav + konten tab untuk detail lead.

**Untuk apa:**
- Tab: Info Lead, Meeting & Notulensi, Proposal, Engagement Letter, Handover Memo.
- Render tab content: LeadInfoTab, MeetingNotulensiTab, ProposalTab, EngagementLetterTab, HandoverMemoTab.
- Pass lead, meetings, notulensi, proposals, engagementLetters, handovers, readOnly, callback onAdd*/onUpdate*/onDelete*, onUpdateLeadStatus.
- Styling: border-bottom active (black), hover red.

---

### `ui/guards/canLead.ts`
**Fungsi:** Helper permission RBAC untuk fitur leads.

**Untuk apa:**
- `canEditLead(role)`: true jika role = BD-Executive. Dipakai LeadActionGuard action="edit".
- `canApproveLead(role)`: true jika role = CEO. Dipakai LeadActionGuard action="approve" dan modal dengan tombol Approve/Reject.

---

### `ui/guards/LeadActionGuard.tsx`
**Fungsi:** Render children berdasarkan permission action.

**Untuk apa:**
- Props: action ('edit'|'view'|'approve'), readOnly?, children.
- action view: selalu render children.
- action approve: render jika canApproveLead(role).
- action edit: render jika !readOnly && canEditLead(role); else null.
- Pakai authService.getCurrentUser().

---

### `ui/guards/LeadStateGuard.tsx`
**Fungsi:** Gate berdasarkan workflow state.

**Untuk apa:**
- Props: allow, hideOnly? (default true), children.
- allow true: render children.
- allow false, hideOnly true: return null.
- allow false, hideOnly false: render children dengan opacity-50, pointer-events-none.
- TODO: ganti dengan rules eksplisit (canCreateProposal, canCreateEL, dll).

---

### `ui/shared/StatusChip.tsx`
**Fungsi:** Chip status untuk lead, proposal, meeting, notulensi, EL, handover.

**Untuk apa:**
- Props: status (string).
- getStatusStyle(): return class Tailwind berdasarkan status (NEW, TO_BE_MEET, MEETING_SCHEDULED, … DROP, DRAFT, WAITING_CEO_APPROVAL, APPROVED, REJECTED, SENT, SIGNED, ACCEPTED, PROPOSAL_EXPIRED, SCHEDULED, DONE, dll).
- formatStatus(): replace underscore, uppercase untuk commercial stages; label khusus untuk DRAFT, WAITING_CEO, CEO_APPROVED, NOT_STARTED, LOCKED.
- Dipakai di tabel, tab, LeadDetailHeaderBar.

---

### `ui/tabs/LeadInfoTab.tsx`
**Fungsi:** Tab Info Lead – data dasar lead.

**Untuk apa:**
- Grid: Client Name, Company, PIC Phone, PIC Email, Service (jika ada), Source, Created By, Created At.
- Section Last Activity (jika ada) dengan whitespace-pre-wrap.
- Props: lead.

---

### `ui/tabs/MeetingNotulensiTab.tsx`
**Fungsi:** Tab Meeting & Notulensi.

**Untuk apa:**
- Daftar meeting + notulensi per meeting.
- Tombol: Jadwalkan Meeting (LeadActionGuard edit), Buat Notulensi per meeting (LeadActionGuard edit), Edit meeting, Delete meeting, View/Edit notulensi.
- Modal: ScheduleMeetingModal, NotulensiFormModal, NotulensiDetailModal.
- readOnly: hanya tombol View (LeadActionGuard view).
- Props: leadId, meetings, notulensi, leads, readOnly, onAddMeeting, onUpdateMeeting, onDeleteMeeting, onAddNotulensi, onUpdateNotulensi, onUpdateLeadStatus.

---

### `ui/tabs/ProposalTab.tsx`
**Fungsi:** Tab Proposal.

**Untuk apa:**
- Daftar proposal. Tombol Buat Proposal (LeadActionGuard edit), View (LeadActionGuard view).
- Modal: ProposalFormModal, ProposalDetailModal.
- Props: leadId, leads, proposals, readOnly, onAddProposal, onUpdateProposal, onUpdateLeadStatus.

---

### `ui/tabs/EngagementLetterTab.tsx`
**Fungsi:** Tab Engagement Letter.

**Untuk apa:**
- Daftar EL. Tombol Upload/View (LeadActionGuard edit = Upload; view = View only).
- Modal: EngagementLetterUploadModal.
- readOnly: hanya View.
- Props: leadId, leads, engagementLetters, readOnly, onAddEngagementLetter, onUpdateEngagementLetter.

---

### `ui/tabs/HandoverMemoTab.tsx`
**Fungsi:** Tab Handover Memo.

**Untuk apa:**
- Daftar handover. Tombol Buat (LeadActionGuard edit), View Details, Edit, Convert to Project.
- Modal handover detail, form edit.
- Props: leadId, lead, leads, handovers, readOnly, onAddHandover, onUpdateHandover.

---

### `ui/modals/AddLeadModal.tsx`
**Fungsi:** Form tambah/edit lead.

**Untuk apa:**
- Props: open, onClose, onSave, editingLead?.
- Form input untuk data lead, submit via onSave.

---

### `ui/modals/ScheduleMeetingModal.tsx`
**Fungsi:** Modal jadwal meeting.

**Untuk apa:**
- Props: leadId, open, onClose, onAddMeeting, onUpdateMeeting?, editingMeeting?, onUpdateLeadStatus.
- Form jadwal meeting, create/update, update lead status.

---

### `ui/modals/NotulensiFormModal.tsx`
**Fungsi:** Form buat/edit notulensi.

**Untuk apa:**
- Form notulensi, create/update. Dipanggil dari MeetingNotulensiTab.

---

### `ui/modals/NotulensiDetailModal.tsx`
**Fungsi:** Modal detail notulensi (view-only atau edit).

**Untuk apa:**
- View detail notulensi. Tombol Edit, Submit. Support readOnly.

---

### `ui/modals/ProposalFormModal.tsx`
**Fungsi:** Form buat/edit proposal.

**Untuk apa:**
- Form proposal. Dipanggil dari ProposalTab.

---

### `ui/modals/ProposalDetailModal.tsx`
**Fungsi:** Modal detail proposal.

**Untuk apa:**
- View detail proposal. Tombol Edit, Submit, Send, Agree Fee. Support readOnly, isCEOView (untuk Approve/Reject).

---

### `ui/modals/AgreeFeeModal.tsx`
**Fungsi:** Modal input agree fee.

**Untuk apa:**
- Form input fee yang disepakati. Dipanggil dari ProposalDetailModal.

---

### `ui/modals/EngagementLetterUploadModal.tsx`
**Fungsi:** Modal upload/view EL.

**Untuk apa:**
- Upload atau view EL. Support readOnly, isCEOView (approve/reject).

---

## Struktur Folder

```
features/leads/
├── api/
│   └── leadApi.ts
├── model/
│   ├── types.ts
│   └── selectors.ts
├── pages/
│   ├── index.ts
│   ├── LeadsManagementPage.tsx
│   ├── LeadTrackerDetailPage.tsx
│   └── LeadInboxPage.tsx
├── ui/
│   ├── management/
│   │   ├── LeadsFilters.tsx
│   │   ├── LeadsTable.tsx
│   │   ├── LeadsPagination.tsx
│   │   ├── LeadInboxFilters.tsx
│   │   ├── LeadInboxTable.tsx
│   │   └── LeadInboxPagination.tsx
│   ├── detail/
│   │   ├── LeadDetailHeaderBar.tsx
│   │   └── LeadTabs.tsx
│   ├── guards/
│   │   ├── canLead.ts
│   │   ├── LeadActionGuard.tsx
│   │   └── LeadStateGuard.tsx
│   ├── modals/
│   │   ├── AddLeadModal.tsx
│   │   ├── ScheduleMeetingModal.tsx
│   │   ├── NotulensiFormModal.tsx
│   │   ├── NotulensiDetailModal.tsx
│   │   ├── ProposalFormModal.tsx
│   │   ├── ProposalDetailModal.tsx
│   │   ├── AgreeFeeModal.tsx
│   │   └── EngagementLetterUploadModal.tsx
│   ├── shared/
│   │   └── StatusChip.tsx
│   └── tabs/
│       ├── LeadInfoTab.tsx
│       ├── MeetingNotulensiTab.tsx
│       ├── ProposalTab.tsx
│       ├── EngagementLetterTab.tsx
│       └── HandoverMemoTab.tsx
├── index.tsx
└── README.md
```

---

## Alur Penggunaan

- **BD Executive:** Leads → LeadsManagementPage (mode tracker) → klik baris → LeadTrackerDetailPage (edit penuh). Header di app bar.
- **CEO:** Leads → LeadsManagementPage (mode tracker) → klik baris → LeadTrackerDetailPage (readOnly). Tombol View di tiap tab. Lead Inbox → LeadInboxPage.
- **SuperAdmin / IT:** Sama seperti CEO (daftar + detail readOnly).

---

## Dependencies

- `lib/mock-data`: mockLeads, generateDummyLeadsBDMEO, mockMeetings, mockNotulensi, mockProposals, mockEngagementLetters, mockHandovers, leadSources
- `lib/leadManagementMockData`: mockCEOLeads, CEOLead
- `lib/leadManagementTypes`: CEOFollowUpStatus
- `services/authService`: getCurrentUser
- `components/ui`: Card, Table, Input, Select, Button, Alert, Dialog
