# Projects Feature

Modul manajemen project untuk sistem ERP DSK Global. Digunakan untuk memantau, menyaring, dan mengelola lifecycle project dari assignment PM hingga completion.

Struktur mengikuti pola **Leads** (api/model/pages/ui).

---

## Ringkasan Per File (Detail & Spesifik)

### `api/projectApi.ts`
**Fungsi:** Single entry point untuk data project (mock).

**Untuk apa:**
- `getAll()`: return semua project dari `mockProjects`.
- `getByPM(pmName, projects)`: filter project by assigned PM.
- `getByStatus(status, projects)`: filter project by status.
- `assignPM(projectId, pmName, projects)`: update project dengan PM baru & status `waiting-first-payment`, return array baru.
- `assignConsultant(projectId, consultantName, projects)`: update `assignedConsultant`.
- Export type: `Project`. Semua page hanya ambil data via `projectApi`, tidak import `mockProjects` langsung.

---

### `model/types.ts`
**Fungsi:** Re-export type untuk feature-internal use.

**Untuk apa:**
- Re-export type `Project` dari `lib/mock-data`.

---

### `model/selectors.ts`
**Fungsi:** Helper & derived logic untuk project.

**Untuk apa:**
- `formatDate(dateString)`: format tanggal ke locale Indonesia (e.g. "5 Feb 2025").
- `getDaysUntilDue(dueDate)`: hitung sisa hari ke due date (negatif = overdue).
- `deriveProjectFlags(project)`: return `{ daysUntilDue, isOverdue, isAtRisk, isUrgent }`.
- `getProjectDisplayStatus(project)`: return status tampilan (overdue, waiting-assignment, in-progress, dll.).
- `filterProjectsBySearch(projects, searchTerm)`: filter by projectName, clientName, id, assignedPM.
- `filterProjectsByStatus(projects, filterStatus, getDisplayStatus)`: filter by status tampilan.
- `sortProjectsByPriority(projects)`: urutan prioritas—waiting-assignment → overdue → near deadline → completed (completed paling bawah, waiting-final-payment di atas completed) → by daysUntilDue.

---

### `pages/index.ts`
**Fungsi:** Barrel export pages.

**Untuk apa:**
- Export: `ProjectsManagementPage`.

---

### `pages/ProjectsManagementPage.tsx`
**Fungsi:** Container utama halaman project management.

**Untuk apa:**
- Props: `userRole`.
- State: `projects` (dari `projectApi.getAll()`), `isAssignPMOpen`, `selectedProject`, `selectedPM`, `viewMode` (table/card), `searchTerm`, `filterStatus`.
- Filter COO: hanya project yang bisa di-assign PM atau sudah punya PM.
- Filter & sort via selectors: `filterProjectsBySearch`, `filterProjectsByStatus`, `sortProjectsByPriority`.
- Handler: `handleAssignPM` (validasi `canAssignPM`, update state, toast), `completeProject` (validasi progress 100%, update ke `waiting-final-payment`).
- Stats: `projectsWaitingPM`, `projectsWaitingPayment`, `projectsInProgress`, `projectsWaitingFinal`, `projectsAtRisk`, `projectsOverdue`.
- Pagination via `useProjectPagination`.
- Render: `ProjectAlerts`, `ProjectStatsCards`, `ProjectsFilters`, `ProjectsTableView` / `ProjectsCardView`, `AssignPMDialog`.

---

### `hooks/useProjectPagination.ts`
**Fungsi:** Custom hook pagination (generic).

**Untuk apa:**
- State: `currentPage`, `itemsPerPage`. Reset `currentPage` ke 1 saat `itemsPerPage` berubah.
- Hitung: `totalPages`, `paginatedItems` (slice), `startIndex`, `endIndex`.
- Pastikan `currentPage` tidak melebihi `totalPages`.
- Return: `currentPage`, `setCurrentPage`, `itemsPerPage`, `setItemsPerPage`, `totalPages`, `paginatedItems`, `paginatedItemsCount`, `startIndex`, `endIndex`, `totalItems`.

---

### `ui/management/ProjectsFilters.tsx`
**Fungsi:** UI filter & search.

**Untuk apa:**
- Input search placeholder "Search by project name, client, ID, or PM...".
- Select filter status: All, Waiting Assignment, In Progress, Overdue, Waiting Final Payment, Completed.
- Tombol Reset untuk clear search dan filter.
- Props: `searchTerm`, `onSearchChange`, `filterStatus`, `onFilterStatusChange`, `onReset`.

---

### `ui/management/ProjectsTableView.tsx`
**Fungsi:** Tampilan tabel daftar project.

**Untuk apa:**
- Kolom: Project Name, Client, Status, Work Start, Payment Gate, Progress, Internal PIC (BD), PM, Due Date, Aksi.
- Resolve handover dari `mockHandovers` (by projectId atau lead+service) untuk project title, company, internal PIC, client PIC.
- Row styling: merah (overdue), orange (at risk). Status Work Start: Allowed (hijau) / Waiting (merah). Progress bar + persentase.
- Aksi: COO → "Review and Assign PM" / "See Details"; PM → Badge "Tunggu Payment" / Tombol "Selesai" (jika progress 100%) / Badge status lain.
- Pagination di bawah tabel via `ProjectsPagination`.

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
- Export: `ProjectsManagementPage`, `projectApi`, `ProjectsPagination`, `ProjectStatusBadge`.

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
│   └── ProjectsManagementPage.tsx
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
│   ├── guards/
│   │   ├── canProject.ts
│   │   ├── ProjectActionGuard.tsx
│   │   └── ProjectStateGuard.tsx
│   └── shared/
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
import { ProjectsManagementPage } from '@/features/projects';

<ProjectsManagementPage userRole={currentUser?.role} />
```

**Integrasi Route:** CEO & COO → `ProjectsPage.tsx` → path `projects`

---

## Dependencies

- `@/lib/mock-data`: mockProjects, Project, projectManagers, mockHandovers, mockDeals, mockLeads
- `@/utils/rolePermissions`: canAssignPM, isCOO, isPM, getCOOManageableServices
- `@/components/ui`: Card, Button, Badge, Alert, Dialog, Table, Input, Select, Label
- `lucide-react`, `sonner`
