# Fitur Invoices – Dokumentasi

Fitur **manajemen invoice** dan **payment**. Dipakai oleh **Admin** (mode payment), **CEO** (approve invoice), **COO** (view only). Struktur mengikuti pola feature leads.

---

## Struktur Folder

```
features/invoices/
├── api/
│   └── invoiceApi.ts
├── model/
│   ├── types.ts
│   └── selectors.ts
├── pages/
│   ├── index.ts
│   └── InvoicesManagementPage.tsx
├── ui/
│   ├── management/
│   │   ├── InvoicesFilters.tsx
│   │   ├── InvoicesTable.tsx
│   │   ├── InvoicesPagination.tsx
│   │   ├── InvoicesStatsCards.tsx
│   │   ├── AdminStats.tsx
│   │   └── ActionRequiredAlert.tsx
│   ├── modals/
│   │   └── PaymentTermDetailModal.tsx
│   └── shared/
│       └── PaymentTermStatusBadge.tsx
├── index.tsx
└── README.md
```

---

## Ringkasan Per File

### `api/invoiceApi.ts`
- Single entry point data invoice (mock). `getAll()`, `getByStatus()`, `markTermAsPaid()`.
- Export types: `Invoice`, `PaymentTerm`.

### `model/types.ts`
- `PaymentTermStatus`: 'pending' | 'paid' | 'overdue'.
- `InvoiceOverallStatus`: 'Lunas' | 'Ada Overdue' | 'Dalam Proses'.

### `model/selectors.ts`
- `getInvoiceOverallStatus(invoice)`: status keseluruhan invoice.
- `getInvoiceStats(invoices)`: total pending/overdue/paid (count + amount).

### `pages/InvoicesManagementPage.tsx`
- Halaman daftar invoice dengan filter, tabel, pagination, stats cards, modal detail.
- Props: `mode` ('invoice' | 'payment'), `showStatistics`, `title`, `description`, `canApprove`, `userRole`, `invoices`, `onUpdateInvoices`, `filterStatus`, `onFilterChange`.

### `ui/management/InvoicesFilters.tsx`
- Search + filter status (all / pending / paid / overdue) + Reset.

### `ui/management/InvoicesTable.tsx`
- Tabel invoice: ID, Client, Total, Terms, Status, Progress, Aksi (Detail).

### `ui/management/InvoicesPagination.tsx`
- Baris per halaman, Previous/Next, info "Menampilkan X dari Y data".

### `ui/management/InvoicesStatsCards.tsx`
- Tiga kartu: Pending Payments, Overdue Payments, Paid.

### `ui/management/AdminStats.tsx`
- Empat kartu untuk dashboard Admin: Total Piutang, Overdue, Total Terbayar, Need Final Tagging. Butuh prop `formatCurrency`.

### `ui/management/ActionRequiredAlert.tsx`
- Alert untuk project yang selesai dan perlu final tagging.

### `ui/modals/PaymentTermDetailModal.tsx`
- Modal detail termin pembayaran (slide dari kanan, animasi seperti ProposalFormModal).

### `ui/shared/PaymentTermStatusBadge.tsx`
- Badge status termin: Pending, Paid, Overdue.

---

## Penggunaan

- **Admin:** Dashboard pakai `ActionRequiredAlert`, `AdminStats`, `InvoicesManagementPage` (mode payment, controlled invoices/filter).
- **CEO / COO:** `InvoicesManagementPage` (mode invoice, canApprove hanya CEO).

Import dari `features/invoices` (index): pages, api, selectors, AdminStats, ActionRequiredAlert, PaymentTermDetailModal, PaymentTermStatusBadge.
