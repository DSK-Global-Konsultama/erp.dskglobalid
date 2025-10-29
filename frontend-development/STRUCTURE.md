# Struktur Proyek Frontend

Proyek ini telah direstrukturisasi sesuai dengan best practices untuk aplikasi React yang scalable.

## Struktur Folder

```
src/
├── app/
│   ├── App.tsx                 # Entry utama aplikasi (role selector + layout global)
│   └── routes/                 # Routing berbasis role
│       ├── bod/
│       │   ├── index.tsx       # Dashboard BOD
│       │   ├── components/     # Komponen khusus BOD
│       │   │   ├── DashboardSummary.tsx
│       │   │   ├── LeadsSection.tsx
│       │   │   ├── DealsSection.tsx
│       │   │   ├── ProjectsSection.tsx
│       │   │   └── InvoicesSection.tsx
│       │   ├── pages/          # Halaman BOD
│       │   │   ├── LeadsPage.tsx
│       │   │   ├── DealsPage.tsx
│       │   │   ├── ProjectsPage.tsx
│       │   │   └── InvoicesPage.tsx
│       │   └── hooks/          # Hooks khusus BOD
│       │       └── useBODStats.ts
│       │
│       ├── bd-content/         # Untuk BD Content Creator
│       ├── bd-executive/       # Untuk BD Executive
│       ├── pm/                 # Project Manager Dashboard
│       │   └── PMDashboard.tsx
│       └── admin/              # Admin Dashboard
│           └── AdminDashboard.tsx
│
├── components/
│   ├── ui/                     # Shadcn components
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── sonner.tsx
│   │   └── tabs.tsx
│   ├── layout/                # Layout global (sidebar, header, dll)
│   ├── charts/                # Komponen grafik umum
│   └── shared/                # Komponen umum antar role
│
├── features/                  # Modul bisnis berbasis domain
│   ├── leads/
│   │   ├── components/
│   │   │   ├── LeadsManagement.tsx
│   │   │   ├── LeadsTable.tsx
│   │   │   └── LeadCard.tsx
│   │   ├── hooks/
│   │   └── services/
│   │       └── leadsService.ts
│   │
│   ├── deals/
│   │   ├── components/
│   │   │   └── DealsManagement.tsx
│   │   ├── hooks/
│   │   └── services/
│   │       └── dealsService.ts
│   │
│   ├── projects/
│   │   ├── components/
│   │   │   └── ProjectManagement.tsx
│   │   ├── hooks/
│   │   └── services/
│   │       └── projectsService.ts
│   │
│   └── invoices/
│       ├── components/
│       │   └── InvoiceManagement.tsx
│       ├── hooks/
│       └── services/
│           └── invoicesService.ts
│
└── lib/
    ├── mock-data.ts           # Data mock
    └── utils.ts               # Utility functions
```

## Konsep Struktur

### 1. **app/** - Application Layer
Folder ini berisi logika aplikasi dan routing:
- `App.tsx`: Entry point dengan role selector
- `routes/`: Routing untuk setiap role (BOD, BD-Content, BD-Executive, PM, Admin)

### 2. **features/** - Business Domain Layer
Folder ini berisi modul bisnis yang reusable:
- Setiap feature (leads, deals, projects, invoices) memiliki:
  - `components/`: Komponen UI khusus domain
  - `hooks/`: Custom hooks
  - `services/`: Logic untuk fetch data, update state, dll

### 3. **components/** - Shared Components
Folder ini berisi komponen yang bisa digunakan di mana saja:
- `ui/`: Komponen UI dasar (Shadcn)
- `layout/`: Layout komponen (header, sidebar, dll)
- `charts/`: Komponen grafik
- `shared/`: Komponen shared lainnya

## Manfaat Struktur Ini

1. **Scalability**: Mudah menambah role atau fitur baru
2. **Maintainability**: Kode terorganisir per domain bisnis
3. **Reusability**: Komponen dan services bisa digunakan di berbagai role
4. **Separation of Concerns**: UI, logic, dan data terpisah jelas
5. **Code Organization**: Developer baru mudah memahami struktur

## Cara Menggunakan

### Menambah Role Baru
1. Buat folder di `app/routes/[role-name]/`
2. Buat komponen dashboard untuk role tersebut
3. Update `app/App.tsx` untuk menambah routing

### Menambah Feature Baru
1. Buat folder di `features/[feature-name]/`
2. Buat `components/`, `hooks/`, dan `services/`
3. Import komponen di route yang membutuhkan

### Menambah UI Component
1. Buat file di `components/ui/`
2. Gunakan komponen dari Shadcn UI sebagai base

## Catatan

- Semua mock data ada di `lib/mock-data.ts`
- Services di `features/[feature]/services/` handle logic data
- UI components di `components/ui/` adalah shadcn components
- Setiap route memiliki pages dan components terpisah untuk modularity

