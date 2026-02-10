# Projects Feature

Modul manajemen project untuk sistem ERP DSK Global. Digunakan untuk memantau, menyaring, dan mengelola lifecycle project dari assignment PM hingga completion.

Struktur mengikuti pola **Leads** (api/model/pages/ui).

---

## Ringkasan Per File (Detail & Spesifik)

### `api/projectApi.ts`
**Fungsi:** Single entry point untuk data project (mock). Mock hanya di-import di sini; pages tidak import `lib/mock-data` langsung.

**Untuk apa:**
- `getAll()`: return semua project dari mock.
- `getByPM(pmName, projects)`, `getByStatus(status, projects)`, `assignPM(...)`, `assignConsultant(...)`.
- `getProjectIdByHandoverId(handoverId)`: project id jika handover sudah jadi project; null jika belum.
- `getHandoverIdByProjectId(projectId)`: handover id untuk project (via deal.leadId); null jika tidak ada.
- `getProjectDetailByHandoverId(handoverId)`: return `ProjectDetailBundle | null` (handover, lead?, proposal?, engagementLetter?, workStartAllowed, paymentGateStatus, workflowDisplayStatus). Dipakai oleh ProjectDetailPage.
- Export type: `Project`, `ProjectDetailBundle`.

---

### `model/types.ts`
**Fungsi:** Re-export dan type feature-internal.

**Untuk apa:**
- Re-export type `Project` dari `lib/mock-data`.
- `ProjectWorkflowDisplayStatus`: type untuk workflow step indicator saja (HANDOVER_DRAFT, SUBMITTED_TO_CEO, CEO_APPROVED, PM_ASSIGNED, PM_ACCEPTED, PROJECT_ACTIVE). Jangan dipakai untuk list filtering/badges.

---

### `model/selectors.ts`
**Fungsi:** Helper & derived logic untuk project. Workflow display hanya untuk detail page (bukan list/badges).

**Untuk apa:**
- `formatDate`, `getDaysUntilDue`, `deriveProjectFlags(project)`.
- `getProjectDisplayStatus(project)`: status tampilan list (overdue, waiting-assignment, in-progress, dll.) — pakai project.status, bukan handover.workflowStatus.
- `mapWorkflowToDisplayStatus(handoverWorkflowStatus)`: map status API ke `ProjectWorkflowDisplayStatus` untuk WorkflowStepIndicator (REVISION_REQUESTED→SUBMITTED_TO_CEO, APPROVED_BY_CEO→CEO_APPROVED, SENT_TO_PM→PM_ASSIGNED). Jangan pakai project.status untuk indicator.
- `getWorkflowLabel(displayStatus)`: label manusia (Draft, CEO Review, Approved, …).
- `getWorkflowSteps()`: urutan step untuk WorkflowStepIndicator.
- `filterProjectsBySearch`, `filterProjectsByStatus`, `sortProjectsByPriority`.

---

### `pages/index.ts`
**Fungsi:** Barrel export pages & types.

**Untuk apa:**
- Export: `ProjectsManagementPage`, `ProjectDetailPage`, `ProjectDetailPageProps`, `ProjectDetailTabId`.

---

### `pages/ProjectsManagementPage.tsx`
**Fungsi:** Container utama halaman project management. Data hanya dari `projectApi` (tidak import mock).

**Untuk apa:**
- Props: `userRole`.
- State: `projects` (dari `projectApi.getAll()`), `selectedHandoverId`, `isAssignPMOpen`, `selectedProject`, `selectedPM`, `viewMode`, `searchTerm`, `filterStatus`.
- Saat user klik "See Details": `handoverId = projectApi.getHandoverIdByProjectId(project.id)`; jika ada, `setSelectedHandoverId(handoverId)` lalu render `<ProjectDetailPage handoverId={...} userRole={...} onBack={() => setSelectedHandoverId(null)} />`. Jika tidak ada handover, toast info.
- Filter COO, filter & sort via selectors, handler assign/complete, stats, pagination.
- Render: `ProjectAlerts`, `ProjectStatsCards`, `ProjectsFilters`, Table/Card view, `AssignPMDialog`; atau `ProjectDetailPage` bila `selectedHandoverId` tidak null.

---

### `hooks/useProjectPagination.ts`
**Fungsi:** Custom hook pagination (generic).

**Untuk apa:**
- State: `currentPage`, `itemsPerPage`. Reset `currentPage` ke 1 saat `itemsPerPage` berubah.
- Hitung: `totalPages`, `paginatedItems` (slice), `startIndex`, `endIndex`.
- Pastikan `currentPage` tidak melebihi `totalPages`.
- Return: `currentPage`, `setCurrentPage`, `itemsPerPage`, `setItemsPerPage`, `totalPages`, `paginatedItems`, `paginatedItemsCount`, `startIndex`, `endIndex`, `totalItems`.

---

### `ui/management/ProjectsTableView.tsx`
**Fungsi:** Tampilan tabel daftar project. Kolom: Project Name, Client, Status, Work Start, Payment Gate, Progress, Internal PIC, PM, Due Date, Aksi. Row styling overdue/at risk. Aksi: COO (Assign PM / See Details), PM (Selesai jika progress 100%). Pagination via `ProjectsPagination`.

---

### `ui/management/ProjectsFilters.tsx`
**Fungsi:** UI filter & search.

**Untuk apa:**
- Input search placeholder "Search by project name, client, ID, or PM...".
- Select filter status: All, Waiting Assignment, In Progress, Overdue, Waiting Final Payment, Completed.
- Tombol Reset untuk clear search dan filter.
- Props: `searchTerm`, `onSearchChange`, `filterStatus`, `onFilterStatusChange`, `onReset`.

---

### `pages/ProjectDetailPage.tsx`
**Fungsi:** Halaman detail project (akses COO & PM saja; lain dapat "Access Denied" inline).

**Untuk apa:**
- Props: `handoverId`, `userRole`, `onBack`.
- Data: `projectApi.getProjectDetailByHandoverId(handoverId)` → bundle (handover, lead, proposal, engagementLetter, workStartAllowed, paymentGateStatus, workflowDisplayStatus). Status tampilan workflow dari `mapWorkflowToDisplayStatus` + `getWorkflowLabel` (selectors).
- UI: `ProjectDetailHeaderBar` (title, subtitle, status label, meta ID • Period, back), `WorkStartAlert` (hijau/merah + paymentGateStatus), `WorkflowStepCard` (raw workflow status), `ProjectTabs` (overview, handover, requirements, documents, progress, activity — hanya handover berisi; lain Coming Soon).
- Jika bundle null: "Project Not Found" + Back to Projects.

---

### `ui/management/ProjectsCardView.tsx`
**Fungsi:** Tampilan card/grid daftar project.

**Untuk apa:**
- Setiap project sebagai card: project title, status badge, overdue/urgent badge, company, ID, period, priority.
- Section: Work Start (Allowed/Waiting Payment), Payment Gate, progress bar. Quick info: PM, Internal PIC (BD), Due Date, sisa hari/overdue.
- Tombol aksi sama dengan TableView: COO (Assign PM / See Details), PM (Selesai jika progress 100%).
- Background card: merah (overdue), orange (at risk). Pagination via `ProjectsPagination`.

---

### `ui/management/ProjectsPagination.tsx`
**Fungsi:** Kontrol pagination.

**Untuk apa:**
- Teks "Showing X of Y entries", select rows per page (5/10/20/50), tombol Previous/Next, current page number.
- Return `null` jika `totalItems === 0`.

---

### `ui/management/AssignPMDialog.tsx`
**Fungsi:** Modal assign PM.

**Untuk apa:**
- Dialog title "Assign Project Manager", optional description.
- Select PM dari `projectManagers` (mock-data). Tombol Batal & Assign PM.
- Props: `open`, `onOpenChange`, `selectedPM`, `onPMChange`, `onAssign`, `dialogDescription`.

---

### `ui/management/ProjectAlerts.tsx`
**Fungsi:** Alert peringatan project.

**Untuk apa:**
- 4 jenis alert (jika ada): belum assign PM, menunggu payment 50%, overdue, at risk (deadline ≤15 hari, progress <100%).
- Return `null` jika tidak ada alert. Styling berbeda untuk overdue (border merah) dan at risk (border orange).

---

### `ui/management/ProjectStatsCards.tsx`
**Fungsi:** Kartu statistik project.

**Untuk apa:**
- 4 kartu: Waiting PM, Waiting Payment, In Progress, Waiting Final.
- Tiap kartu punya icon (UserPlus, AlertCircle, Clock) dan deskripsi singkat. Layout: grid 4 kolom (responsive md).

---

### `ui/guards/canProject.ts`
**Fungsi:** Helper permission RBAC untuk fitur projects.

**Untuk apa:**
- `canAssignPM(role, serviceName)`: wrapper dari `rolePermissions` untuk assign PM by service.
- `canCompleteProject(role)`: hanya PM.
- `canViewProject(role)`: role tidak null.
- `getCOOManageableServicesForProject(role)`: layanan yang bisa dikelola COO.
- `isCOOUser(role)`, `isPMUser(role)`.

---

### `ui/guards/ProjectActionGuard.tsx`
**Fungsi:** Guard berdasarkan action permission.

**Untuk apa:**
- Props: `action` ('assign'|'complete'|'view'), `disabledOnly`, `userRole`, `children`.
- `view`: selalu render. `assign`: render jika COO/CEO. `complete`: render jika PM.
- `disabledOnly`: render children dalam state disabled jika tidak punya permission.

---

### `ui/guards/ProjectStateGuard.tsx`
**Fungsi:** Guard berdasarkan project workflow state.

**Untuk apa:**
- Props: `allow`, `hideOnly`, `children`.
- `allow` true: render children. `allow` false + `hideOnly` true: return null. `allow` false + `hideOnly` false: render children dengan opacity & pointer-events disabled.

---

### `ui/shared/ProjectStatusBadge.tsx`
**Fungsi:** Badge status project.

**Untuk apa:**
- Mapping status ke config (variant, className, icon, label). Status: waiting-assignment, waiting-pm, waiting-el, waiting-first-payment, in-progress, waiting-final-payment, completed.
- Return Badge component dengan icon (UserPlus, Clock, AlertCircle, CheckCircle) dan label.

---

### `index.tsx`
**Fungsi:** Public entry point feature projects.

**Untuk apa:**
- Export: pages dari `./pages` (ProjectsManagementPage, ProjectDetailPage, ProjectDetailPageProps, ProjectDetailTabId), `projectApi`, `ProjectDetailHeaderBar`, `ProjectsPagination`, `ProjectStatusBadge`.

---

## Struktur Folder

```
features/projects/
├── api/
│   └── projectApi.ts
├── model/
│   ├── types.ts
│   └── selectors.ts
├── pages/
│   ├── index.ts
│   ├── ProjectsManagementPage.tsx
│   └── ProjectDetailPage.tsx
├── hooks/
│   └── useProjectPagination.ts
├── ui/
│   ├── management/
│   │   ├── ProjectsFilters.tsx
│   │   ├── ProjectsTableView.tsx
│   │   ├── ProjectsCardView.tsx
│   │   ├── ProjectsPagination.tsx
│   │   ├── AssignPMDialog.tsx
│   │   ├── ProjectAlerts.tsx
│   │   └── ProjectStatsCards.tsx
│   ├── detail/
│   │   ├── ProjectDetailHeaderBar.tsx
│   │   ├── WorkStartAlert.tsx
│   │   ├── WorkflowStepCard.tsx
│   │   ├── WorkflowStepIndicator.tsx
│   │   └── ProjectTabs.tsx
│   ├── tabs/
│   │   ├── ProjectHandoverTab.tsx
│   │   └── ComingSoonTab.tsx
│   ├── guards/
│   │   ├── canProject.ts
│   │   ├── ProjectActionGuard.tsx
│   │   └── ProjectStateGuard.tsx
│   └── shared/
│       ├── AccessDenied.tsx
│       └── ProjectStatusBadge.tsx
├── index.tsx
└── README.md
```

---

## Project Status (Referensi)

| Status | Deskripsi |
|--------|-----------|
| `waiting-assignment` | Menunggu COO assign PM |
| `waiting-pm` | Menunggu assignment PM |
| `waiting-first-payment` | Menunggu pembayaran 50% |
| `in-progress` | Project sedang berjalan |
| `waiting-final-payment` | Menunggu pembayaran final |
| `completed` | Project selesai |
| `overdue` | Melewati deadline (derived dari in-progress) |

---

## Penggunaan

```tsx
import { ProjectsManagementPage, ProjectDetailPage, projectApi, ProjectDetailHeaderBar } from '@/features/projects';

<ProjectsManagementPage userRole={currentUser?.role} />
```

Detail page dibuka dari dalam ProjectsManagementPage saat user klik "See Details" (handoverId dari `projectApi.getHandoverIdByProjectId(project.id)`). Props: `handoverId`, `userRole`, `onBack`. Hanya COO & PM boleh akses.

**Integrasi Route:** CEO & COO → `ProjectsPage.tsx` → path `projects`

---

## Dependencies

- `@/lib/mock-data`: mockProjects, Project, projectManagers, mockHandovers, mockDeals, mockLeads
- `@/utils/rolePermissions`: canAssignPM, isCOO, isPM, getCOOManageableServices
- `@/components/ui`: Card, Button, Badge, Alert, Dialog, Table, Input, Select, Label
- `lucide-react`, `sonner`
