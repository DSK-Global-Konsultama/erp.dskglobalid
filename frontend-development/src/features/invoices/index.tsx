// Public entry for invoices feature. Consumer outside features/invoices must import from here.

// Pages
export { InvoicesManagementPage } from './pages';

// API
export { invoiceApi } from './api/invoiceApi';
export type { Invoice, PaymentTerm } from './api/invoiceApi';

// Model
export type {
  InvoiceOverallStatus,
  PaymentTermStatus,
  ClientInvoiceStatus,
  ClientInvoiceSummary,
} from './model';
export {
  getInvoiceOverallStatus,
  getInvoiceStats,
  type InvoiceStats,
} from './model/selectors';

// UI – components used cross-feature or by layout/routes
export {
  AdminStats,
  ActionRequiredAlert,
  StafAdminInvoiceList,
} from './ui/management';
export { InvoiceDetailPage } from './pages';
export { PaymentTermDetailDrawer } from './ui/drawers/PaymentTermDetailDrawer';
export { InvoiceDetailModal } from './ui/modals/InvoiceDetailModal';
export { PaymentTermStatusBadge } from './ui/shared/PaymentTermStatusBadge';
