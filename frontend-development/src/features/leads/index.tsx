// Public entry for leads feature. Consumer outside features/leads must import from here.

// Pages
export {
  LeadsManagementPage,
  LeadTrackerDetailPage,
  LeadInboxPage,
  type LeadStatus,
} from './pages';

// API
export { leadApi } from './api/leadApi';

// UI – only components used cross-feature or by layout/routes
export { LeadDetailHeaderBar } from './ui/detail/LeadDetailHeaderBar';
export { StatusChip } from './ui/shared/StatusChip';
export { ProposalDetailModal } from './ui/modals/ProposalDetailModal';
export { EngagementLetterUploadModal } from './ui/modals/EngagementLetterUploadModal';
export { NotulensiDetailModal } from './ui/modals/NotulensiDetailModal';
