# Fitur Leads – Dokumentasi

Fitur **manajemen lead** dan **lead tracker** (pipeline: meeting → notulensi → proposal → engagement letter → handover). Dipakai oleh **BD Executive**, **CEO**, dan role lain (SuperAdmin, IT). Inbox CEO untuk follow-up lead (promoted dari Bank Data) juga ada di fitur ini.

---

## Struktur Folder

```
features/leads/
├── api/                    # Akses data
│   └── leadApi.ts
├── model/                  # Tipe & selector
│   ├── types.ts
│   └── selectors.ts
├── pages/                  # Halaman
│   ├── index.ts            # Barrel export
│   ├── LeadsManagementPage.tsx   # Daftar lead (view/tracker)
│   ├── LeadTrackerDetailPage.tsx # Detail lead + tab
│   └── LeadInboxPage.tsx          # Inbox CEO
├── ui/
│   ├── management/         # List, filter, table, pagination
│   │   ├── LeadsFilters.tsx
│   │   ├── LeadsTable.tsx
│   │   ├── LeadsPagination.tsx
│   │   ├── LeadInboxFilters.tsx
│   │   ├── LeadInboxTable.tsx
│   │   └── LeadInboxPagination.tsx
│   ├── detail/             # Detail shell (header bar + tabs)
│   │   ├── LeadDetailHeaderBar.tsx   # Header di app bar saat lihat lead
│   │   └── LeadTabs.tsx              # Tab nav + konten tab
│   ├── guards/             # RBAC & workflow state
│   │   ├── canLead.ts
│   │   ├── LeadActionGuard.tsx
│   │   └── LeadStateGuard.tsx
│   ├── modals/             # Modal form & detail
│   ├── shared/             # Komponen bersama
│   │   └── StatusChip.tsx
│   └── tabs/               # Isi tab di halaman detail
└── README.md               # Dokumen ini
```

---

## 1. API (`api/`)

### `leadApi.ts`

- **Sumber data**: Mock dari `lib/mock-data`. Satu pintu akses agar nanti bisa diganti ke API nyata.
- **Fungsi**:
  - `getAll()` – daftar lead (legacy).
  - `getTrackerData(userName)` – data untuk Lead Tracker: leads, meetings, notulensi, proposals, engagementLetters, handovers, leadSources.
  - `getByStatus`, `getByUser`, `updateStatus`, `claimLead`, `getAvailableLeads`, `getClaimedLeads`.
- **Export type**: Lead, Meeting, Notulensi, Proposal, EngagementLetter, Handover.

---

## 2. Model (`model/`)

### `types.ts`

- **LeadStatus**: status pipeline tracker (NEW, TO_BE_MEET, MEETING_SCHEDULED, NEED_NOTULEN, NEED_PROPOSAL, … DEAL_WON, ON_HOLD, DROP).

### `selectors.ts`

- **CommercialStage**, **HandoverStatus**, **LeadTrackerRowMeta**.
- **deriveLeadTrackerRowMeta(lead, meetings, notulensi, proposals, engagementLetters, handovers)** – menghitung commercial stage, dokumen aktif, handover status. Dipakai di LeadsTable (filter & kolom) mode `tracker`.

---

## 3. Pages (`pages/`)

### `index.ts` (barrel)

- Export: `LeadsManagementPage`, `LeadTrackerDetailPage`, `LeadInboxPage`, type `LeadStatus`.

### `LeadsManagementPage.tsx`

- **Fungsi**: Daftar lead dengan filter + tabel + pagination.
- **Props**: `userName`, `mode` ('view' | 'tracker'), `title?`, `onLeadClick?`.
- **State**: searchTerm, filter (source, status, commercial stage, handover, service), currentPage, itemsPerPage.
- **Komponen**: LeadsFilters (search + filter), LeadsTable (Table dari ui/table), LeadsPagination (rows per page 5/10/20/50).
- **Dipanggil**: BD Executive (Lead Tracker), CEO/SuperAdmin/IT (Leads), dengan `onLeadClick` untuk buka detail.

### `LeadTrackerDetailPage.tsx`

- **Fungsi**: Halaman detail satu lead: hanya render LeadTabs (tab Info, Meeting & Notulensi, Proposal, EL, Handover Memo). Header lead di app bar dari `LeadDetailHeaderBar` (di layout Header).
- **Props**: `leadId`, `leads`, meetings, notulensi, proposals, engagementLetters, handovers, `readOnly?`, callback onAdd*/onUpdate*.
- **readOnly**: CEO/view-only – tombol aksi disembunyikan via LeadActionGuard; tombol "View" tetap untuk buka modal view-only.

### `LeadInboxPage.tsx`

- **Fungsi**: Inbox CEO untuk lead yang perlu follow-up (promoted dari Bank Data). Hanya akses CEO.
- **State**: leads (CEOLead[]), searchQuery, filterStatus, currentPage, itemsPerPage, openMenuId, menuPosition.
- **Komponen**: LeadInboxFilters, LeadInboxTable, LeadInboxPagination. Menu aksi (Followed-up, Drop, See Detail) tetap di page (fixed overlay).
- **Data**: `mockCEOLeads` dari `lib/leadManagementMockData`; status follow-up CEO (FOLLOWUP_PENDING, FOLLOWED_UP, DROP).

---

## 4. UI – Management (`ui/management/`)

| Komponen | Dipakai di | Fungsi |
|----------|------------|--------|
| **LeadsFilters** | LeadsManagementPage | Search + filter (Source, Status, Commercial Stage, Handover, Service) + Reset. Mode view vs tracker. |
| **LeadsTable** | LeadsManagementPage | Tabel lead (Table dari components/ui/table). Kolom: ID, Client Info, Source, Status/Stage/Handover/Active Document, Created At, Last Activity. Slot `pagination`. |
| **LeadsPagination** | LeadsManagementPage | "Showing X of Y entries", Rows per page (5/10/20/50), Previous/Next. |
| **LeadInboxFilters** | LeadInboxPage | Search + filter status (Pending, Followed Up, Dropped) + Reset. |
| **LeadInboxTable** | LeadInboxPage | Tabel CEOLead (Client, Contact, Source, Promoted, Status, Action menu). `renderStatusBadge`, `onActionButtonRef`, `onActionClick`, slot `pagination`. |
| **LeadInboxPagination** | LeadInboxPage | Sama pola dengan LeadsPagination (entries, rows per page, prev/next). |

Desain table & pagination mengikuti **Project** (Table, TableHeader, TableBody, TableRow, TableHead, TableCell + bar pagination dengan rows-per-page).

---

## 5. UI – Detail (`ui/detail/`)

| Komponen | Fungsi |
|----------|--------|
| **LeadDetailHeaderBar** | Konten header lead di **app bar** (layout Header): tombol back, company/title, StatusChip, client, source, PIC email/phone. Dipanggil dari `Header.tsx` saat `leadDetail` ada. |
| **LeadTabs** | Tab nav (Info Lead, Meeting & Notulensi, Proposal, Engagement Letter, Handover Memo) + render isi tab. Menerima lead, leads, data meetings/notulensi/…, readOnly, callback onAdd*/onUpdate*. |

Tidak ada lagi `LeadHeader.tsx` (in-page) – info lead hanya di app bar via LeadDetailHeaderBar.

---

## 6. UI – Guards (`ui/guards/`)

### `canLead.ts` – Untuk apa?

**canLead** adalah helper permission (RBAC action-level) untuk fitur Leads. Fungsinya:

- **Menentukan siapa boleh edit** – create/edit/delete konten lead (meeting, notulensi, proposal, EL, handover). Hanya **BD-Executive** yang boleh; CEO dan view-only hanya melihat tombol "View".
- **Menentukan siapa boleh approve** – approve/reject notulensi, proposal, EL, handover (flow approval CEO). **Hanya CEO** yang boleh.

**Fungsi yang diexport:**

| Fungsi | Return | Dipakai untuk |
|--------|--------|----------------|
| `canEditLead(role)` | `true` jika role = BD-Executive | LeadActionGuard `action="edit"`; sembunyikan tombol Buat/Edit/Upload untuk non-BD. |
| `canApproveLead(role)` | `true` jika role = CEO (hanya CEO) | LeadActionGuard `action="approve"`; tombol Approve/Reject di modal (isCEOView). |

Dipakai di **LeadActionGuard** dan bisa dipanggil di komponen lain yang perlu cek role tanpa menyebarkan if-else role di tab/modal.

### Komponen guard lain

| File | Fungsi |
|------|--------|
| **LeadActionGuard** | Render children berdasarkan permission: `action` ('edit' / 'view' / 'approve'), `readOnly?`. Pakai `authService.getCurrentUser()` + canLead. |
| **LeadStateGuard** | Gate berdasarkan workflow state: `allow`, `hideOnly?`. Skeleton untuk rules (TODO). |

Tab (Meeting, Proposal, EL, Handover) membungkus tombol create/edit/upload dengan LeadActionGuard; tombol "View" tetap tampil untuk CEO.

---

## 7. UI – Shared (`ui/shared/`)

### `StatusChip.tsx`

- Chip untuk menampilkan status (lead, proposal, meeting, notulensi, EL, handover). Dipakai di tabel, tab, dan LeadDetailHeaderBar.

---

## 8. UI – Tabs (`ui/tabs/`)

Semua dipakai di **LeadTabs** (LeadTrackerDetailPage). Menerima `readOnly`; bila true hanya tombol "View" (buka modal view-only).

| Tab | File | Isi singkat |
|-----|------|-------------|
| Info Lead | LeadInfoTab | Data dasar lead. |
| Meeting & Notulensi | MeetingNotulensiTab | Daftar meeting + notulensi; Jadwalkan Meeting, Buat Notulensi, Edit, View (guard edit). |
| Proposal | ProposalTab | Daftar proposal; Buat Proposal, View (guard edit). |
| Engagement Letter | EngagementLetterTab | Daftar EL; View/Upload (readOnly = View only). |
| Handover Memo | HandoverMemoTab | Daftar handover; Buat, View Details, Edit, Convert (guard edit). |

---

## 9. UI – Modals (`ui/modals/`)

| Modal | Fungsi |
|-------|--------|
| AddLeadModal | Form tambah lead. |
| ScheduleMeetingModal | Jadwal meeting. |
| NotulensiFormModal | Buat/edit notulensi. |
| NotulensiDetailModal | Lihat detail notulensi; Edit, Submit. Support `readOnly`. |
| ProposalFormModal | Buat/edit proposal. |
| ProposalDetailModal | Detail proposal; Edit, Submit, Send, Agree Fee. Support `readOnly`, `isCEOView`. |
| AgreeFeeModal | Input agree fee. |
| EngagementLetterUploadModal | Upload/view EL; support `readOnly`, `isCEOView`. |

---

## 10. Alur Penggunaan

- **BD Executive**  
  Leads → LeadsManagementPage (mode tracker) → klik baris → LeadTrackerDetailPage (edit penuh). Header lead di app bar (LeadDetailHeaderBar).

- **CEO**  
  Leads → LeadsManagementPage (mode tracker) → klik baris → LeadTrackerDetailPage (readOnly). Tombol View di tiap tab buka modal view-only. Header lead sama.

- **CEO Inbox**  
  Halaman terpisah: LeadInboxPage (LeadInboxFilters + LeadInboxTable + LeadInboxPagination), aksi Followed-up / Drop / See Detail lewat menu per baris.

- **SuperAdmin / IT**  
  Sama seperti CEO untuk halaman Leads (daftar + detail readOnly).

---

## 11. Ringkasan Singkat

| Bagian | Peran |
|--------|--------|
| **api/** | Satu pintu data lead & dokumen (mock). |
| **model/** | LeadStatus, CommercialStage, HandoverStatus, deriveLeadTrackerRowMeta. |
| **pages/** | Daftar lead (LeadsManagementPage), detail lead (LeadTrackerDetailPage), inbox CEO (LeadInboxPage). |
| **ui/management/** | Filter + table + pagination untuk daftar lead dan inbox; konsisten dengan Project. |
| **ui/detail/** | LeadDetailHeaderBar (app bar), LeadTabs (tab detail). |
| **ui/guards/** | LeadActionGuard (RBAC), LeadStateGuard (workflow), canLead (edit = BD-Executive, approve = CEO only). |
| **ui/tabs/** | Isi 5 tab detail; support readOnly + View. |
| **ui/modals/** | Form & detail lead/meeting/notulensi/proposal/EL; beberapa support readOnly. |
| **ui/shared/** | StatusChip. |

Import halaman dari `features/leads/pages` (barrel). Komponen UI dipakai internal di dalam fitur leads; layout (Header) mengimpor LeadDetailHeaderBar dari leads saat menampilkan lead detail.
