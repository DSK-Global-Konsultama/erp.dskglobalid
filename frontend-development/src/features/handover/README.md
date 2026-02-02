# Fitur Handover – Dokumentasi

Fitur **Project Handover Memo** (dokumen serah-terima proyek dari BD ke PM). Memiliki 11 section (Project Information, Background Summary, Scope of Work, Fee Structure, Client Documents, Data Requirements, Risks, Communication Protocol, Team Assignment, Handover Checklist, Sign-Off). Dipakai oleh **BD Executive** (buat/edit handover), **CEO** (approve/revision), **COO** (review read-only, section Fee disembunyikan), dan **PM** (stub). Alur: draft → submit to CEO → approve / revision requested → (setelah approve) convert to project.

---

## Struktur Folder

```
features/handover/
├── api/                         # Pintu data handover
│   └── handoverApi.ts           # getByLeadId, saveDraft, submit, approve, requestRevision (stub)
├── model/                       # Tipe, konstanta, validasi, mapper, selector
│   ├── types.ts                 # SectionId, ALL_SECTIONS, TOTAL_SECTIONS, HandoverDraft
│   ├── constants.ts             # HANDOVER_CONSTANTS, SECTION_NAMES
│   ├── validators.ts            # validateHandoverDraft(draft) → { ok, errors }
│   ├── mappers.ts               # handoverToDraft(), draftToPayload(draft, meta, 'draft'|'submit')
│   └── selectors.ts             # getSectionCompletion(), findSectionIdFromRevision(), hasRevisionForSection()
├── pages/                       # Halaman per role
│   ├── index.ts                 # Barrel export pages
│   ├── BdExecutiveHandoverPage.tsx  # Form editable + tombol Save Draft / Ajukan ke CEO / Convert
│   ├── CeoHandoverPage.tsx      # Form read-only + Approve / Revision / Cancel + RequestRevisionModal
│   ├── CooHandoverPage.tsx      # Form read-only, hiddenSections=[4] (Fee Structure)
│   └── PmHandoverPage.tsx       # Stub (TODO)
├── ui/
│   ├── forms/
│   │   └── HandoverForm.tsx     # Form UI-only: draft + onDraftChange, progress bar, 11 section, slot actionButtons
│   ├── modals/
│   │   └── RequestRevisionModal.tsx  # Modal pilih section + komentar revision (CEO)
│   ├── shared/
│   │   ├── SectionHeader.tsx    # Header section (expand/collapse, complete/revision badge)
│   │   ├── EditableList.tsx     # Daftar item editable (scope, risks, data requirements, dll.)
│   │   └── RevisionComments.tsx # Blok komentar revision CEO per section
│   └── sections/                # 11 section form
│       ├── ProjectInformationSection.tsx   # Section 1
│       ├── BackgroundSummarySection.tsx   # Section 2
│       ├── ScopeOfWorkSection.tsx         # Section 3
│       ├── FeeStructureSection.tsx        # Section 4
│       ├── ClientDocumentsSection.tsx     # Section 5
│       ├── DataRequirementsSection.tsx    # Section 6
│       ├── RisksSection.tsx               # Section 7
│       ├── CommunicationProtocolSection.tsx # Section 8
│       ├── TeamAssignmentSection.tsx      # Section 9
│       ├── HandoverChecklistSection.tsx   # Section 10
│       └── SignOffSection.tsx            # Section 11
├── index.tsx                    # Barrel export feature (UI, pages, types, constants)
└── README.md                    # Dokumen ini
```

---

## 1. API (`api/`)

### `handoverApi.ts`

- **Status**: Stub. Caller (HandoverMemoTab, Approval HandoverTab) saat ini memakai callback (onSaveDraft, onSubmit, onApprove, onReject) yang di-inject dari luar; data handover diambil dari leads/approval context.
- **Fungsi**:
  - `getByLeadId(leadId)` – ambil handover by lead (stub, return undefined).
  - `saveDraft(payload)` – simpan draft (stub).
  - `submit(payload)` – submit ke CEO (stub).
  - `approve(handoverId)` – approve handover (stub).
  - `requestRevision(handoverId, revisions)` – minta revisi per section (stub).
- **Kegunaan**: Satu pintu untuk nanti ganti ke API nyata; halaman tetap memanggil callback yang disuplai parent.

---

## 2. Model (`model/`)

### `types.ts`

- **SectionId**: `1 | 2 | … | 11`.
- **ALL_SECTIONS**: `SectionId[]` = [1..11].
- **TOTAL_SECTIONS**: `11`.
- **HandoverDraft**: Tipe state form (UI-only). Berisi semua field yang bisa diedit: documentCode, projectName, clientName, companyGroup, serviceLine, projectStartDate/EndDate, clientPic/Email/Phone, engagementLetterStatus, proposalReference, background, scopeIncluded/scopeExclusions, deliverables, milestones, feeStructure, paymentTermsText, documentsReceived, storageLocation, dataRequirements, risks, communicationInternal/External, externalContacts, preliminaryTeam, handoverChecklist, signOffs. Dipakai oleh HandoverForm (draft + onDraftChange) dan pages (state draft).

### `constants.ts`

- **HANDOVER_CONSTANTS**: CLASSIFICATION, DOCUMENT_TITLE, MIN_BACKGROUND_LENGTH (20), TOTAL_SECTIONS.
- **SECTION_NAMES**: Objek map SectionId → nama section (e.g. 1 → 'PROJECT INFORMATION', 4 → 'FEE STRUCTURE & PAYMENT TERMS'). Dipakai di section header, progress bar, RequestRevisionModal, selectors.

### `validators.ts`

- **validateHandoverDraft(draft)**: Mengembalikan `{ ok: boolean, errors: Record<string, string> }`.
  - Aturan: documentCode, projectName, clientName, serviceLine, clientPic, clientEmail, projectStartDate/EndDate wajib; background min 20 karakter; scopeIncluded/deliverables/milestones/feeStructure minimal satu item; communicationInternal wajib.
  - Key error sama dengan field (documentCode, projectName, background, scopeIncluded, deliverables, milestones, feeStructure, communicationInternal) untuk tampil di section.
- Dipakai di **BdExecutiveHandoverPage** saat Submit (Ajukan ke CEO); jika !ok, set errors + expand section yang error.

### `mappers.ts`

- **DraftMeta**: { handoverId?, proposalId?, leadId?, existingHandover? }.
- **handoverToDraft(existingHandover, leadData?, engagementLetter?)**: Mengubah ExtendedHandover (+ data lead/EL) menjadi HandoverDraft untuk inisialisasi form. Menangani deliverablesExtended vs deliverables (string/object), projectPeriod split, documentsReceived mapping.
- **draftToPayload(draft, meta, mode)**: Mengubah HandoverDraft menjadi `Partial<ExtendedHandover>`.
  - `mode === 'draft'`: workflowStatus HANDOVER_DRAFT, tanpa submittedToCeoAt/createdAt/lastModifiedAt.
  - `mode === 'submit'`: workflowStatus SUBMITTED_TO_CEO, dengan submittedToCeoAt, createdAt, lastModifiedAt, communicationProtocol, escalationPath, proposalId.
- Filter array (scopeIncluded, deliverables, milestones, feeStructure, documentsReceived, risks, externalContacts, preliminaryTeam, handoverChecklist, signOffs) dan generate id (DEL-*, MS-*, FEE-*, dll.) di sini.

### `selectors.ts`

- **getSectionCompletion(draft, sectionId)**: Mengembalikan boolean apakah section dianggap “lengkap” (untuk progress bar dan ikon section). Aturan per section: 1 → projectName, clientName, clientPic, clientEmail, dates, serviceLine; 2 → background length > 20; 3 → scopeIncluded, deliverables, milestones; 4 → feeStructure; 5 → documentsReceived; 6 → dataRequirements; 7 → risks; 8 → communicationInternal + externalContacts; 9 → preliminaryTeam; 10 → handoverChecklist; 11 → signOffs.
- **findSectionIdFromRevision(sectionName)**: Map nama section (dari RevisionComment.sectionName) ke SectionId memakai SECTION_NAMES/ALL_SECTIONS (bukan hardcode string).
- **hasRevisionForSection(revisionComments, sectionId)**: Cek apakah ada revision comment untuk section tersebut (sectionName match atau includes). Dipakai untuk badge “Revision requested” di SectionHeader.

---

## 3. Pages (`pages/`)

### `index.ts`

- Export: `BdExecutiveHandoverPage`, `CeoHandoverPage`, `CooHandoverPage`, `PmHandoverPage`.

### `BdExecutiveHandoverPage.tsx`

- **Fungsi**: Halaman handover untuk **BD Executive** – form editable + tombol Save Draft, Ajukan ke CEO (atau Ajukan Ulang ke CEO jika REVISION_REQUESTED), dan (setelah approve) Convert to Project.
- **Props**: handoverId?, proposalId?, leadId?, onBack, onSaveDraft(payload), onSubmit(payload), existingHandover?, readOnly?, leadData?, engagementLetter?, onConvertToProject?, showConvertButton?.
- **State**: draft (HandoverDraft), expandedSections (Set&lt;SectionId&gt;), errors, showValidation.
- **Alur**: Inisialisasi draft dengan handoverToDraft(existingHandover, leadData, engagementLetter); reset draft saat existingHandover?.id atau leadId berubah. Save Draft → draftToPayload(..., 'draft') → onSaveDraft(payload). Submit → setShowValidation(true), validateHandoverDraft(draft); jika !ok set errors + expand section error; jika ok → draftToPayload(..., 'submit') → onSubmit(payload).
- **Tombol**: Dikirim ke HandoverForm via prop **actionButtons** (slot di dalam card header form). effectiveReadOnly = readOnly || workflowStatus === 'APPROVED_BY_CEO'.
- **Dipanggil dari**: HandoverMemoTab (leads) saat user klik “Buat Handover Memo” atau edit handover.

### `CeoHandoverPage.tsx`

- **Fungsi**: Halaman handover untuk **CEO** – form read-only + tombol Cancel, Revision, Approve + RequestRevisionModal.
- **Props**: handover, lead?, proposal?, engagementLetter?, onApprove(handoverId), onReject(handoverId), onBack.
- **State**: showRevisionModal, draft (dari handoverToDraft), expandedSections (inisialisasi bisa include section revision pertama).
- **Alur**: Approve → onApprove(handover.id). Revision → buka RequestRevisionModal; onRequestRevision(revisions) → console.log + onReject(handover.id). Modal: pilih section + isi komentar per section, validasi semua section terpilih punya komentar, lalu kirim.
- **Dipanggil dari**: Approval HandoverTab saat user klik “Review” pada handover yang menunggu approval.

### `CooHandoverPage.tsx`

- **Fungsi**: Halaman handover untuk **COO** – form read-only dengan **hiddenSections={[4]}** (Fee Structure & Payment Terms disembunyikan).
- **Props**: handover, lead?, proposal?, engagementLetter?, onBack?.
- **State**: draft, expandedSections. Tidak ada tombol aksi.

### `PmHandoverPage.tsx`

- **Fungsi**: Stub (return null). TODO: view PM untuk handover (mis. view semua section kecuali fee).

---

## 4. UI – Forms (`ui/forms/`)

### `HandoverForm.tsx`

- **Fungsi**: Form **UI-only** – tidak punya logic Save Draft / Submit / Convert; hanya render draft dan progress bar + 11 section.
- **Props**:
  - **draft**, **onDraftChange(draft)** – state form (dimiliki page).
  - **existingHandover?** – untuk readOnly/workflowStatus/scopeLocked/revisionComments.
  - **readOnly?**, **errors?**, **showValidation?**.
  - **expandedSections** (Set&lt;SectionId&gt;), **onToggleSection(sectionId)**.
  - **revisionComments?**, **hiddenSections?** (SectionId[]), **onBack?**, **actionButtons?** (ReactNode).
- **Render**: Tombol Back (jika onBack); Card header (Document Title, Document Code, Classification); slot **actionButtons** (dari page: Save Draft, Ajukan ke CEO, atau Convert to Project); progress bar (Form Completion X / Y Sections, pakai getSectionCompletion + visibleIds tanpa hiddenSections); 11 section (hanya section yang tidak di hiddenSections), masing-masing terhubung ke draft via updateDraft(key, value).
- **Dipakai oleh**: BdExecutiveHandoverPage (editable + actionButtons), CeoHandoverPage (readOnly, tanpa actionButtons), CooHandoverPage (readOnly, hiddenSections=[4]).

---

## 5. UI – Modals (`ui/modals/`)

### `RequestRevisionModal.tsx`

- **Fungsi**: Modal untuk CEO meminta revisi – pilih section yang perlu revisi + isi komentar per section.
- **Props**: open, onClose, onRequestRevision(revisions: { sectionName, comment }[]).
- **State**: sectionRevisions (Map sectionName → comment), isAnimatingOut (untuk animasi slide).
- **Data section**: Object.values(SECTION_NAMES) dari model/constants.
- **Validasi**: Semua section terpilih harus punya komentar non-kosong sebelum onRequestRevision dipanggil.
- **Dipakai oleh**: CeoHandoverPage.

---

## 6. UI – Shared (`ui/shared/`)

| Komponen | Fungsi |
|----------|--------|
| **SectionHeader** | Header tiap section: tombol expand/collapse, judul (sectionId + title), badge “Revision requested” jika hasRevision, ikon complete/error/kosong (isComplete, showValidation). |
| **EditableList** | Daftar item string (tambah/hapus/edit): dipakai di Scope (scopeIncluded/Exclusions), DataRequirements, Risks. Props: items, onItemsChange, placeholder?, readOnly?, label?. |
| **RevisionComments** | Blok komentar revision CEO: filter comments by sectionTitle, tampilkan comment + requestedBy + requestedAt. Dipakai di setiap section yang punya revision. |

---

## 7. UI – Sections (`ui/sections/`)

Setiap section: Card + SectionHeader + (jika expanded) CardContent + RevisionComments + field form. Semua menerima **readOnly** (effectiveReadOnly dari page), **revisionComments**, **onToggle**, **isExpanded**, **isComplete**, **hasRevision**, **showValidation**; section 1 juga **errors** (object), section 2/8 **error** (string).

| Section | File | Field draft / catatan |
|--------|------|------------------------|
| 1. Project Information | ProjectInformationSection.tsx | projectName, clientName, companyGroup, serviceLine, projectStartDate/EndDate, clientPic/Email/Phone, engagementLetterStatus, proposalReference. |
| 2. Background Summary | BackgroundSummarySection.tsx | background (textarea, min 20 char). |
| 3. Finalized Scope of Work | ScopeOfWorkSection.tsx | scopeIncluded, scopeExclusions, deliverables, milestones; isScopeLocked (dari existingHandover). |
| 4. Fee Structure & Payment Terms | FeeStructureSection.tsx | feeStructure, paymentTermsText. Disembunyikan di CooHandoverPage. |
| 5. Client-Provided Documents | ClientDocumentsSection.tsx | documentsReceived (fileName, file?, fileUrl?, uploadedAt, dll.). |
| 6. Data Requirements | DataRequirementsSection.tsx | dataRequirements (string[]). |
| 7. Key Risks / Red Flags | RisksSection.tsx | risks (string[]). |
| 8. Communication Protocol | CommunicationProtocolSection.tsx | communicationInternal, communicationExternal, externalContacts. |
| 9. Project Team Assignment | TeamAssignmentSection.tsx | preliminaryTeam (role, name, allocation). |
| 10. Handover Checklist | HandoverChecklistSection.tsx | handoverChecklist (description, status Pending/Completed). |
| 11. Sign-Off | SignOffSection.tsx | signOffs (name, role, notes, signedAt). |

---

## 8. Alur per Role

- **BD Executive**: Buka handover dari Lead (HandoverMemoTab) → BdExecutiveHandoverPage → edit draft → Save Draft (payload draft) atau Ajukan ke CEO (validasi + payload submit). Jika status REVISION_REQUESTED, tombol jadi “Ajukan Ulang ke CEO”. Setelah CEO approve → tombol Convert to Project muncul (actionButtons).
- **CEO**: Buka daftar handover menunggu approval (Approval HandoverTab) → klik Review → CeoHandoverPage → baca form read-only → Approve (onApprove) atau Revision (buka RequestRevisionModal, pilih section + komentar → onReject).
- **COO**: Buka handover (dari route COO) → CooHandoverPage → form read-only, section 4 (Fee) disembunyikan.
- **PM**: PmHandoverPage saat ini stub.

---

## 9. Export Feature (`index.tsx`)

- **UI**: HandoverForm, RequestRevisionModal, SectionHeader, EditableList, RevisionComments, 11 section components.
- **Pages**: BdExecutiveHandoverPage, CeoHandoverPage, CooHandoverPage, PmHandoverPage.
- **Model**: SectionId, HandoverDraft, ALL_SECTIONS, TOTAL_SECTIONS, HANDOVER_CONSTANTS, SECTION_NAMES.

Consumer luar (leads, approval): import pages dari `features/handover` atau `features/handover/pages`; HandoverMemoTab memakai BdExecutiveHandoverPage, HandoverTab (approval) memakai CeoHandoverPage.
