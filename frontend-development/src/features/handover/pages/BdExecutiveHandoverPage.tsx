import { useState, useCallback, useEffect } from 'react';
import { Save, Send, ArrowRight } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { HandoverForm } from '../ui/forms/HandoverForm';
import { handoverToDraft } from '../model/mappers';
import { draftToPayload } from '../model/mappers';
import { validateHandoverDraft } from '../model/validators';
import { ALL_SECTIONS } from '../model/types';
import type { HandoverDraft } from '../model/types';
import type { ExtendedHandover } from '../../../lib/projectWorkflowTypes';
import type { SectionId } from '../model/types';

export interface BdExecutiveHandoverPageProps {
  handoverId?: string;
  proposalId?: string;
  leadId?: string;
  onBack: () => void;
  onSaveDraft: (handover: Partial<ExtendedHandover>) => void;
  onSubmit: (handover: Partial<ExtendedHandover>) => void;
  existingHandover?: ExtendedHandover;
  readOnly?: boolean;
  leadData?: {
    clientName: string;
    companyName?: string;
    service: string;
    picName: string;
    picEmail: string;
    picPhone: string;
    source: string;
  };
  engagementLetter?: { signedDate?: string; status?: string };
  onConvertToProject?: (handoverId: string) => void;
  showConvertButton?: boolean;
}

const initialDraftFromHandover = (
  existingHandover: ExtendedHandover | undefined,
  leadData?: BdExecutiveHandoverPageProps['leadData'],
  engagementLetter?: BdExecutiveHandoverPageProps['engagementLetter']
): HandoverDraft =>
  handoverToDraft(existingHandover, leadData, engagementLetter);

export function BdExecutiveHandoverPage({
  handoverId,
  proposalId,
  leadId,
  onBack,
  onSaveDraft,
  onSubmit,
  existingHandover,
  readOnly = false,
  leadData,
  engagementLetter,
  onConvertToProject,
  showConvertButton = true,
}: BdExecutiveHandoverPageProps) {
  const [draft, setDraft] = useState<HandoverDraft>(() =>
    initialDraftFromHandover(existingHandover, leadData, engagementLetter)
  );
  const [expandedSections, setExpandedSections] = useState<Set<SectionId>>(new Set(ALL_SECTIONS));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showValidation, setShowValidation] = useState(false);

  useEffect(() => {
    setDraft(initialDraftFromHandover(existingHandover, leadData, engagementLetter));
  }, [existingHandover?.id, leadId]);

  const isApproved = existingHandover?.workflowStatus === 'APPROVED_BY_CEO';
  const effectiveReadOnly = readOnly || isApproved;

  const toggleSection = useCallback((sectionId: SectionId) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  }, []);

  const handleSaveDraft = useCallback(() => {
    const payload = draftToPayload(draft, { handoverId, proposalId, leadId, existingHandover }, 'draft');
    onSaveDraft(payload);
  }, [draft, handoverId, proposalId, leadId, existingHandover, onSaveDraft]);

  const handleSubmit = useCallback(() => {
    setShowValidation(true);
    const { ok, errors: nextErrors } = validateHandoverDraft(draft);
    setErrors(nextErrors);
    if (!ok) {
      alert('Mohon lengkapi semua field yang wajib diisi');
      const firstKey = Object.keys(nextErrors)[0];
      if (firstKey) {
        let sectionId: SectionId = 1;
        if (firstKey.includes('document') || firstKey.includes('project') || firstKey.includes('client')) sectionId = 1;
        else if (firstKey.includes('background')) sectionId = 2;
        else if (firstKey.includes('scope') || firstKey.includes('deliverables') || firstKey.includes('milestones')) sectionId = 3;
        else if (firstKey.includes('fee')) sectionId = 4;
        else if (firstKey.includes('communication')) sectionId = 8;
        setExpandedSections(prev => new Set([...prev, sectionId]));
      }
      return;
    }
    const payload = draftToPayload(draft, { handoverId, proposalId, leadId, existingHandover }, 'submit');
    onSubmit(payload);
  }, [draft, handoverId, proposalId, leadId, existingHandover, onSubmit]);

  const actionButtons = !effectiveReadOnly && !isApproved ? (
    <>
      <Button variant="outline" onClick={handleSaveDraft}>
        <Save className="w-4 h-4" />
        Save Draft
      </Button>
      <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
        <Send className="w-4 h-4" />
        {existingHandover?.workflowStatus === 'REVISION_REQUESTED' ? 'Ajukan Ulang ke CEO' : 'Ajukan ke CEO'}
      </Button>
    </>
  ) : isApproved && showConvertButton ? (
    <Button
      onClick={() => {
        if (onConvertToProject && handoverId) onConvertToProject(handoverId);
        else console.log('Convert to project:', handoverId);
      }}
      className="bg-blue-600 hover:bg-blue-700"
    >
      <ArrowRight className="w-4 h-4 mr-2" />
      Convert to Project
    </Button>
  ) : null;

  return (
    <div className="space-y-6">
      <HandoverForm
        draft={draft}
        onDraftChange={setDraft}
        existingHandover={existingHandover}
        readOnly={effectiveReadOnly}
        errors={errors}
        showValidation={showValidation}
        expandedSections={expandedSections}
        onToggleSection={toggleSection}
        revisionComments={existingHandover?.revisionComments || []}
        onBack={onBack}
        actionButtons={actionButtons}
      />
    </div>
  );
}
