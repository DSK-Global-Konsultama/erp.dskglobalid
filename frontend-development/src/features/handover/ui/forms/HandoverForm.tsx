import { useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import type { RevisionComment } from '../../../../lib/projectWorkflowTypes';
import type { Proposal } from '../../../../lib/mock-data';
import type { SectionId, HandoverDraft } from '../../model/types';
import { ALL_SECTIONS } from '../../model/types';
import { HANDOVER_CONSTANTS } from '../../model/constants';
import { getSectionCompletion, hasRevisionForSection } from '../../model/selectors';
import { ProjectInformationSection } from '../sections/ProjectInformationSection';
import { BackgroundSummarySection } from '../sections/BackgroundSummarySection';
import { ScopeOfWorkSection } from '../sections/ScopeOfWorkSection';
import { FeeStructureSection, buildProposalSummary } from '../sections/FeeStructureSection';
import { ClientDocumentsSection } from '../sections/ClientDocumentsSection';
import { DataRequirementsSection } from '../sections/DataRequirementsSection';
import { RisksSection } from '../sections/RisksSection';
import { CommunicationProtocolSection } from '../sections/CommunicationProtocolSection';
import { TeamAssignmentSection } from '../sections/TeamAssignmentSection';
import { HandoverChecklistSection } from '../sections/HandoverChecklistSection';
import { SignOffSection } from '../sections/SignOffSection';

export interface HandoverFormProps {
  draft: HandoverDraft;
  onDraftChange: (draft: HandoverDraft) => void;
  existingHandover?: { workflowStatus?: string; scopeLocked?: boolean; revisionComments?: RevisionComment[] };
  readOnly?: boolean;
  errors?: Record<string, string>;
  showValidation?: boolean;
  expandedSections: Set<SectionId>;
  onToggleSection: (sectionId: SectionId) => void;
  revisionComments?: RevisionComment[];
  hiddenSections?: SectionId[];
  onBack?: () => void;
  /** Optional action buttons (e.g. Save Draft, Submit, Convert) rendered inside the document card */
  actionButtons?: React.ReactNode;
  /** When false, hide the Form Completion progress card (e.g. on project detail Handover tab). Default true. */
  showFormCompletion?: boolean;
  /** Proposal yang disetujui: dipakai di Fee Structure section (agree fee, diskon, subcon, metode pembayaran) */
  proposal?: Proposal;
}

const VISIBLE_SECTIONS = ALL_SECTIONS;

export function HandoverForm({
  draft,
  onDraftChange,
  existingHandover,
  readOnly = false,
  errors = {},
  showValidation = false,
  expandedSections,
  onToggleSection,
  revisionComments = [],
  hiddenSections = [],
  onBack,
  actionButtons,
  showFormCompletion = true,
  proposal,
}: HandoverFormProps) {
  const isApproved = existingHandover?.workflowStatus === 'APPROVED_BY_CEO';
  const effectiveReadOnly = readOnly || isApproved;
  const isScopeLocked = existingHandover?.scopeLocked ?? false;

  const visibleIds = VISIBLE_SECTIONS.filter(id => !hiddenSections.includes(id));
  /** Nomor urut tampilan 1–8 agar tidak loncat (1,2,3,7,8,9,10,11 → 1,2,3,4,5,6,7,8) */
  const getDisplayNumber = useCallback((sectionId: SectionId) => visibleIds.indexOf(sectionId) + 1, [visibleIds]);

  const updateDraft = useCallback(<K extends keyof HandoverDraft>(key: K, value: HandoverDraft[K]) => {
    onDraftChange({ ...draft, [key]: value });
  }, [draft, onDraftChange]);

  const getHasRevision = useCallback((sectionId: SectionId) => hasRevisionForSection(revisionComments, sectionId), [revisionComments]);

  return (
    <div className="space-y-6">
      <div>
        {onBack && (
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Pipeline
          </Button>
        )}

        <div className={effectiveReadOnly ? 'pointer-events-none' : ''}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-center text-2xl mb-2">{HANDOVER_CONSTANTS.DOCUMENT_TITLE}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="documentCode" className="mb-2 block">
                    Document Code <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="documentCode"
                    type="text"
                    value={draft.documentCode}
                    onChange={(e) => updateDraft('documentCode', e.target.value)}
                    placeholder="e.g., BD-HO-PT-MSM-2025-003"
                    disabled={effectiveReadOnly}
                    className={`${showValidation && errors.documentCode ? 'border-red-300' : ''} ${effectiveReadOnly ? 'disabled:opacity-100 disabled:text-gray-900' : ''}`}
                  />
                  {showValidation && errors.documentCode && (
                    <p className="text-xs text-red-600 mt-1">{errors.documentCode}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="classification" className="mb-2 block">Classification</Label>
                  <Input
                    id="classification"
                    type="text"
                    value={HANDOVER_CONSTANTS.CLASSIFICATION}
                    disabled
                    className="bg-gray-50 disabled:opacity-100 disabled:text-gray-900"
                  />
                </div>
              </div>
              {actionButtons && (
                <div className="flex items-center justify-end gap-3 pt-4">
                  {actionButtons}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {showFormCompletion && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Form Completion</span>
              <span className="text-sm font-medium text-gray-900">
                {visibleIds.filter(id => getSectionCompletion(draft, id)).length} / {visibleIds.length} Sections
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{
                  width: `${(visibleIds.filter(id => getSectionCompletion(draft, id)).length / Math.max(visibleIds.length, 1)) * 100}%`
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {!hiddenSections.includes(1) && (
        <ProjectInformationSection
          sectionId={1}
          displayNumber={getDisplayNumber(1)}
          projectName={draft.projectName}
          clientName={draft.clientName}
          companyGroup={draft.companyGroup}
          serviceLine={draft.serviceLine}
          projectStartDate={draft.projectStartDate}
          projectEndDate={draft.projectEndDate}
          clientPic={draft.clientPic}
          clientEmail={draft.clientEmail}
          clientPhone={draft.clientPhone}
          engagementLetterStatus={draft.engagementLetterStatus}
          proposalReference={draft.proposalReference}
          onProjectNameChange={(v) => updateDraft('projectName', v)}
          onClientNameChange={(v) => updateDraft('clientName', v)}
          onCompanyGroupChange={(v) => updateDraft('companyGroup', v)}
          onServiceLineChange={(v) => updateDraft('serviceLine', v)}
          onProjectStartDateChange={(v) => updateDraft('projectStartDate', v)}
          onProjectEndDateChange={(v) => updateDraft('projectEndDate', v)}
          onClientPicChange={(v) => updateDraft('clientPic', v)}
          onClientEmailChange={(v) => updateDraft('clientEmail', v)}
          onClientPhoneChange={(v) => updateDraft('clientPhone', v)}
          onEngagementLetterStatusChange={(v) => updateDraft('engagementLetterStatus', v)}
          onProposalReferenceChange={(v) => updateDraft('proposalReference', v)}
          isExpanded={expandedSections.has(1)}
          isComplete={getSectionCompletion(draft, 1)}
          hasRevision={getHasRevision(1)}
          showValidation={showValidation}
          errors={errors}
          readOnly={effectiveReadOnly}
          revisionComments={revisionComments}
          onToggle={() => onToggleSection(1)}
        />
      )}

      {!hiddenSections.includes(2) && (
        <BackgroundSummarySection
          sectionId={2}
          displayNumber={getDisplayNumber(2)}
          background={draft.background}
          onBackgroundChange={(v) => updateDraft('background', v)}
          isExpanded={expandedSections.has(2)}
          isComplete={getSectionCompletion(draft, 2)}
          hasRevision={getHasRevision(2)}
          showValidation={showValidation}
          error={errors.background}
          readOnly={effectiveReadOnly}
          revisionComments={revisionComments}
          onToggle={() => onToggleSection(2)}
        />
      )}

      {!hiddenSections.includes(3) && (
        <ScopeOfWorkSection
          sectionId={3}
          displayNumber={getDisplayNumber(3)}
          scopeIncluded={draft.scopeIncluded}
          scopeExclusions={draft.scopeExclusions}
          deliverables={draft.deliverables}
          milestones={draft.milestones}
          isScopeLocked={isScopeLocked}
          onScopeIncludedChange={(v) => updateDraft('scopeIncluded', v)}
          onScopeExclusionsChange={(v) => updateDraft('scopeExclusions', v)}
          onDeliverablesChange={(v) => updateDraft('deliverables', v)}
          onMilestonesChange={(v) => updateDraft('milestones', v)}
          isExpanded={expandedSections.has(3)}
          isComplete={getSectionCompletion(draft, 3)}
          hasRevision={getHasRevision(3)}
          showValidation={showValidation}
          readOnly={effectiveReadOnly}
          revisionComments={revisionComments}
          onToggle={() => onToggleSection(3)}
        />
      )}

      {!hiddenSections.includes(4) && (
        <FeeStructureSection
          sectionId={4}
          displayNumber={getDisplayNumber(4)}
          feeStructure={draft.feeStructure}
          paymentTermsText={draft.paymentTermsText}
          onFeeStructureChange={(v) => updateDraft('feeStructure', v)}
          onPaymentTermsTextChange={(v) => updateDraft('paymentTermsText', v)}
          isExpanded={expandedSections.has(4)}
          isComplete={getSectionCompletion(draft, 4)}
          hasRevision={getHasRevision(4)}
          showValidation={showValidation}
          readOnly={effectiveReadOnly}
          revisionComments={revisionComments}
          onToggle={() => onToggleSection(4)}
          proposalSummary={proposal ? buildProposalSummary(proposal) : undefined}
        />
      )}

      {!hiddenSections.includes(5) && (
        <ClientDocumentsSection
          sectionId={5}
          displayNumber={getDisplayNumber(5)}
          documentsReceived={draft.documentsReceived}
          onDocumentsReceivedChange={(v) => updateDraft('documentsReceived', v)}
          isExpanded={expandedSections.has(5)}
          isComplete={getSectionCompletion(draft, 5)}
          hasRevision={getHasRevision(5)}
          showValidation={showValidation}
          readOnly={effectiveReadOnly}
          revisionComments={revisionComments}
          onToggle={() => onToggleSection(5)}
        />
      )}

      {!hiddenSections.includes(6) && (
        <DataRequirementsSection
          sectionId={6}
          displayNumber={getDisplayNumber(6)}
          dataRequirements={draft.dataRequirements}
          onDataRequirementsChange={(v) => updateDraft('dataRequirements', v)}
          isExpanded={expandedSections.has(6)}
          isComplete={getSectionCompletion(draft, 6)}
          hasRevision={getHasRevision(6)}
          showValidation={showValidation}
          readOnly={effectiveReadOnly}
          revisionComments={revisionComments}
          onToggle={() => onToggleSection(6)}
        />
      )}

      {!hiddenSections.includes(7) && (
        <RisksSection
          sectionId={7}
          displayNumber={getDisplayNumber(7)}
          risks={draft.risks}
          onRisksChange={(v) => updateDraft('risks', v)}
          isExpanded={expandedSections.has(7)}
          isComplete={getSectionCompletion(draft, 7)}
          hasRevision={getHasRevision(7)}
          showValidation={showValidation}
          readOnly={effectiveReadOnly}
          revisionComments={revisionComments}
          onToggle={() => onToggleSection(7)}
        />
      )}

      {!hiddenSections.includes(8) && (
        <CommunicationProtocolSection
          sectionId={8}
          displayNumber={getDisplayNumber(8)}
          communicationInternal={draft.communicationInternal}
          communicationExternal={draft.communicationExternal}
          externalContacts={draft.externalContacts}
          onCommunicationInternalChange={(v) => updateDraft('communicationInternal', v)}
          onCommunicationExternalChange={(v) => updateDraft('communicationExternal', v)}
          onExternalContactsChange={(v) => updateDraft('externalContacts', v)}
          isExpanded={expandedSections.has(8)}
          isComplete={getSectionCompletion(draft, 8)}
          hasRevision={getHasRevision(8)}
          showValidation={showValidation}
          error={errors.communicationInternal}
          readOnly={effectiveReadOnly}
          revisionComments={revisionComments}
          onToggle={() => onToggleSection(8)}
        />
      )}

      {!hiddenSections.includes(9) && (
        <TeamAssignmentSection
          sectionId={9}
          displayNumber={getDisplayNumber(9)}
          preliminaryTeam={draft.preliminaryTeam}
          onPreliminaryTeamChange={(v) => updateDraft('preliminaryTeam', v)}
          isExpanded={expandedSections.has(9)}
          isComplete={getSectionCompletion(draft, 9)}
          hasRevision={getHasRevision(9)}
          showValidation={showValidation}
          readOnly={effectiveReadOnly}
          revisionComments={revisionComments}
          onToggle={() => onToggleSection(9)}
        />
      )}

      {!hiddenSections.includes(10) && (
        <HandoverChecklistSection
          sectionId={10}
          displayNumber={getDisplayNumber(10)}
          handoverChecklist={draft.handoverChecklist}
          onHandoverChecklistChange={(v) => updateDraft('handoverChecklist', v)}
          isExpanded={expandedSections.has(10)}
          isComplete={getSectionCompletion(draft, 10)}
          hasRevision={getHasRevision(10)}
          showValidation={showValidation}
          readOnly={effectiveReadOnly}
          revisionComments={revisionComments}
          onToggle={() => onToggleSection(10)}
        />
      )}

      {!hiddenSections.includes(11) && (
        <SignOffSection
          sectionId={11}
          displayNumber={getDisplayNumber(11)}
          signOffs={draft.signOffs}
          onSignOffsChange={(v) => updateDraft('signOffs', v)}
          isExpanded={expandedSections.has(11)}
          isComplete={getSectionCompletion(draft, 11)}
          hasRevision={getHasRevision(11)}
          showValidation={showValidation}
          readOnly={effectiveReadOnly}
          revisionComments={revisionComments}
          onToggle={() => onToggleSection(11)}
        />
      )}
    </div>
  );
}
