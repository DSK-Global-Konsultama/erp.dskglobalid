// UI
export { HandoverForm } from './ui/forms/HandoverForm';
export { RequestRevisionModal } from './ui/modals/RequestRevisionModal';
export { SectionHeader } from './ui/shared/SectionHeader';
export { EditableList } from './ui/shared/EditableList';
export { RevisionComments } from './ui/shared/RevisionComments';
export { ProjectInformationSection } from './ui/sections/ProjectInformationSection';
export { BackgroundSummarySection } from './ui/sections/BackgroundSummarySection';
export { ScopeOfWorkSection } from './ui/sections/ScopeOfWorkSection';
export { FeeStructureSection } from './ui/sections/FeeStructureSection';
export { ClientDocumentsSection } from './ui/sections/ClientDocumentsSection';
export { DataRequirementsSection } from './ui/sections/DataRequirementsSection';
export { RisksSection } from './ui/sections/RisksSection';
export { CommunicationProtocolSection } from './ui/sections/CommunicationProtocolSection';
export { TeamAssignmentSection } from './ui/sections/TeamAssignmentSection';
export { HandoverChecklistSection } from './ui/sections/HandoverChecklistSection';
export { SignOffSection } from './ui/sections/SignOffSection';

// Pages (role-based views)
export { BdExecutiveHandoverPage, CeoHandoverPage, CooHandoverPage, PmHandoverPage } from './pages';

// Model – types & constants (same export names as before)
export type { SectionId, HandoverDraft } from './model/types';
export { ALL_SECTIONS, TOTAL_SECTIONS } from './model/types';
export { HANDOVER_CONSTANTS, SECTION_NAMES } from './model/constants';
