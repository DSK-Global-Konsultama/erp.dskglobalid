# Project Detail Page – Dokumentasi

Halaman detail project yang menampilkan informasi handover, status workflow, payment gate, dan tab konten. **Akses hanya untuk COO dan PM.**

---

## Ringkasan

| Aspek | Keterangan |
|--------|------------|
| **File utama** | `pages/ProjectDetailPage.tsx` |
| **Akses** | COO, PM (role lain melihat "Access Denied") |
| **Data** | Diambil via `projectApi.getProjectDetailByHandoverId(handoverId)` |
| **Navigasi** | Dibuka dari **Projects Management** saat user klik "See Details" pada project; identifikasi project → handover via `projectApi.getHandoverIdByProjectId(projectId)` |

---

## 1. File Utama: `ProjectDetailPage.tsx`

**Lokasi:** `src/features/projects/pages/ProjectDetailPage.tsx`

### Props

```ts
interface ProjectDetailPageProps {
  handoverId: string;   // ID handover (bukan project ID)
  userRole: string;     // 'PM' | 'COO' | 'COO Tax' | ...
  onBack: () => void;   // Kembali ke daftar project (set selectedHandoverId = null)
}
```

### Alur

1. **Cek role**  
   Jika `userRole` bukan PM dan bukan COO → render pesan "Access Denied" (inline, bukan komponen `AccessDenied`).

2. **Ambil data**  
   `projectApi.getProjectDetailByHandoverId(handoverId)` → mengembalikan `ProjectDetailBundle | null`.

3. **Handover tidak ditemukan**  
   Jika `bundle === null` → tampil "Project Not Found" + tombol "Back to Projects".

4. **Render konten**  
   - **ProjectDetailHeaderBar** – judul, client, status, meta (ID, period), tombol back.  
   - **WorkStartAlert** – Work Start Allowed / Not Allowed berdasarkan payment gate.  
   - **WorkflowStepCard** – indikator step workflow (Draft → CEO Review → … → Active).  
   - **ProjectTabs** – tab Overview, Handover, Requirements, Documents, Progress, Activity.

### Tipe yang diekspor

- **ProjectDetailTabId**  
  `'overview' | 'handover' | 'requirements' | 'documents' | 'progress' | 'activity'`
- **ProjectDetailPageProps**  
  Interface props di atas.

---

## 2. File yang Berkaitan (Struktur & Tanggung Jawab)

### 2.1 API & Data

| File | Peran |
|------|--------|
| **`api/projectApi.ts`** | `getProjectDetailByHandoverId(handoverId)` mengembalikan handover, lead, proposal, engagement letter, `workStartAllowed`, `paymentGateStatus`, `workflowDisplayStatus`. Sumber data saat ini: mock (mockHandovers, mockLeads, mockProposals, mockEngagementLetters, mockDeals, mockProjects). |
| **`lib/projectWorkflowTypes.ts`** | Tipe `ExtendedHandover`, `HandoverWorkflowStatus`; dipakai WorkflowStepIndicator dan ProjectTabs. |
| **`lib/mock-data.ts`** | Tipe & data mock: Lead, Proposal, EngagementLetter, Project, Handover, Deal, dll. |

### 2.2 UI Detail (header, alert, workflow, tabs)

| File | Peran |
|------|--------|
| **`ui/detail/ProjectDetailHeaderBar.tsx`** | Header: tombol back, title, subtitle (client), status badge, meta line (ID • Period). Mendukung mode `inHeader` (layout ringkas di global header). |
| **`ui/detail/WorkStartAlert.tsx`** | Alert hijau (Work Start Allowed + payment gate status) atau merah (Work Start Not Allowed, menunggu pembayaran). |
| **`ui/detail/WorkflowStepCard.tsx`** | Wrapper card yang membungkus `WorkflowStepIndicator`. |
| **`ui/detail/WorkflowStepIndicator.tsx`** | Step visual: Draft → CEO Review → Approved → PM Assigned → PM Accepted → Active. Memetakan status API (mis. APPROVED_BY_CEO → CEO_APPROVED, SENT_TO_PM → PM_ASSIGNED). Menampilkan notice "Revisi Diminta" jika `REVISION_REQUESTED`. |
| **`ui/detail/ProjectTabs.tsx`** | Enam tab; hanya **Handover** punya konten nyata (`ProjectHandoverTab`); sisanya menampilkan `ComingSoonTab`. |

### 2.3 Tab konten

| File | Peran |
|------|--------|
| **`ui/tabs/ProjectHandoverTab.tsx`** | Tab Handover: form handover **read-only** (`HandoverForm`). Data dari `handoverToDraft(handover, leadData, engagementLetter)`. PM: section 4 (Fee) disembunyikan; COO melihat semua. |
| **`ui/tabs/ComingSoonTab.tsx`** | Placeholder untuk tab Overview, Requirements, Documents, Progress, Activity. |

### 2.4 Fitur Handover (dipakai ProjectHandoverTab)

| File | Peran |
|------|--------|
| **`features/handover/ui/forms/HandoverForm.tsx`** | Form handover (draft, sections, read-only/editable). Di Project Handover dipakai dengan `readOnly`, `onDraftChange` no-op. |
| **`features/handover/model/mappers.ts`** | `handoverToDraft(existingHandover, leadData?, engagementLetter?)` → draft untuk inisialisasi HandoverForm. |
| **`features/handover/model/types.ts`** | `SectionId`, `ALL_SECTIONS`; dipakai untuk expand/collapse dan `PM_HIDDEN_SECTIONS` (section 4). |

### 2.5 Shared & Entry

| File | Peran |
|------|--------|
| **`ui/shared/AccessDenied.tsx`** | Komponen "Access Denied" (saat ini ProjectDetailPage memakai inline message, komponen ini tersedia untuk konsistensi). |
| **`pages/ProjectsManagementPage.tsx`** | Halaman daftar project. Saat user klik "See Details", `handoverId` di-resolve dari project lalu render `<ProjectDetailPage handoverId={...} userRole={...} onBack={...} />`. |
| **`pages/index.ts`** | Export `ProjectDetailPage` dan `ProjectDetailPageProps`. |
| **`index.tsx`** | Export publik fitur projects (termasuk pages dan `ProjectDetailHeaderBar`). |

### 2.6 Komponen UI umum

| File | Peran |
|------|--------|
| **`components/ui/card.tsx`** | `Card`, `CardContent` dipakai di `WorkflowStepCard`. |

---

## 3. Diagram Alur Data (Ringkas)

```
ProjectsManagementPage
  └─ User klik "See Details" pada project
       → projectApi.getHandoverIdByProjectId(project.id)
       → setSelectedHandoverId(handoverId)
  └─ selectedHandoverId !== null
       → render <ProjectDetailPage handoverId={handoverId} userRole={...} onBack={() => setSelectedHandoverId(null)} />

ProjectDetailPage
  └─ projectApi.getProjectDetailByHandoverId(handoverId)
       → bundle: { handover, lead, proposal, engagementLetter, workStartAllowed, paymentGateStatus, workflowDisplayStatus }
  └─ ProjectDetailHeaderBar(title, subtitle, statusLabel, metaLine, onBack)
  └─ WorkStartAlert(workStartAllowed, paymentGateStatus)
  └─ WorkflowStepCard(currentStatus: workflowDisplayStatus)
  └─ ProjectTabs(activeTab, onTabChange, userRole, handover, lead, proposal, engagementLetter, onBack)
       └─ Tab Handover → ProjectHandoverTab
            └─ handoverToDraft(handover, leadData, engagementLetter) → draft
            └─ HandoverForm(draft, readOnly, hiddenSections=[4] untuk PM)
       └─ Tab lain → ComingSoonTab(title)
```

---

## 4. Aturan Akses & Tampilan

- **COO**  
  Bisa buka halaman; semua section tab Handover terlihat (termasuk Fee).
- **PM**  
  Bisa buka halaman; di tab Handover section 4 (Fee Structure & Payment Terms) disembunyikan.
- **Role lain**  
  Halaman menampilkan "Access Denied" (tanpa data).

---

## 5. Status Workflow (WorkflowStepIndicator)

Step yang ditampilkan (urutan):

1. HANDOVER_DRAFT – Draft  
2. SUBMITTED_TO_CEO – CEO Review  
3. CEO_APPROVED – Approved  
4. PM_ASSIGNED – PM Assigned  
5. PM_ACCEPTED – PM Accepted  
6. PROJECT_ACTIVE – Active  

Pemetaan status API → tampilan:

- `REVISION_REQUESTED` → ditampilkan sebagai step "CEO Review" + notice revisi.  
- `APPROVED_BY_CEO` → CEO_APPROVED.  
- `SENT_TO_PM` → PM_ASSIGNED.  
- Jika sudah ada project dengan `assignedPM`, `workflowDisplayStatus` dari API bisa `PM_ASSIGNED`.

---

## 6. Daftar File Lengkap (Referensi Cepat)

```
features/projects/
├── pages/
│   ├── ProjectDetailPage.tsx      # Halaman utama detail project
│   ├── ProjectsManagementPage.tsx # Entry: daftar project + buka detail
│   └── index.ts                   # Export ProjectDetailPage, ProjectDetailPageProps
├── api/
│   └── projectApi.ts              # getProjectDetailByHandoverId, getHandoverIdByProjectId, ...
├── ui/
│   ├── detail/
│   │   ├── ProjectDetailHeaderBar.tsx
│   │   ├── WorkStartAlert.tsx
│   │   ├── WorkflowStepCard.tsx
│   │   ├── WorkflowStepIndicator.tsx
│   │   └── ProjectTabs.tsx
│   ├── tabs/
│   │   ├── ProjectHandoverTab.tsx
│   │   └── ComingSoonTab.tsx
│   └── shared/
│       └── AccessDenied.tsx
└── index.tsx                      # Public exports

lib/
├── projectWorkflowTypes.ts        # ExtendedHandover, HandoverWorkflowStatus
└── mock-data.ts                   # Lead, Proposal, EngagementLetter, mockHandovers, ...

features/handover/
├── ui/forms/HandoverForm.tsx      # Form handover (read-only di project detail)
└── model/
    ├── mappers.ts                 # handoverToDraft
    └── types.ts                   # SectionId, ALL_SECTIONS

components/ui/
└── card.tsx                       # Card, CardContent
```

---

## 7. Cara Menambah Konten Tab Baru

Untuk tab selain Handover (Overview, Requirements, Documents, Progress, Activity):

1. Buat komponen tab baru di `ui/tabs/`, mis. `ProjectOverviewTab.tsx`.
2. Di `ProjectTabs.tsx`, impor komponen tersebut dan di dalam `p-6` ganti kondisi: untuk `activeTab === 'overview'` render `ProjectOverviewTab` (dengan props yang diperlukan dari handover/lead/proposal/engagementLetter), bukan `ComingSoonTab`.
3. Sisanya tetap pakai `ComingSoonTab` sampai konten siap.

---

*Dokumentasi ini menjelaskan ProjectDetailPage dan semua file yang berkaitan dalam fitur projects serta ketergantungan ke handover dan lib.*
