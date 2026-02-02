import { useMemo, useState, useCallback } from 'react';
import { HandoverForm } from '../ui/forms/HandoverForm';
import { handoverToDraft } from '../model/mappers';
import { ALL_SECTIONS } from '../model/types';
import type { SectionId } from '../model/types';
import type { ExtendedHandover } from '../../../lib/projectWorkflowTypes';
import type { Lead, Proposal, EngagementLetter } from '../../../lib/mock-data';

export interface CooHandoverPageProps {
  handover: ExtendedHandover;
  lead?: Lead;
  proposal?: Proposal;
  engagementLetter?: EngagementLetter;
  onBack?: () => void;
}

/** Section 4 = Fee Structure – hidden for COO view per requirement */
const COO_HIDDEN_SECTIONS: SectionId[] = [4];

export function CooHandoverPage({
  handover,
  lead,
  proposal,
  engagementLetter,
  onBack,
}: CooHandoverPageProps) {
  const leadData = useMemo(() => ({
    clientName: lead?.clientName || handover.clientName || '',
    companyName: lead?.company || handover.clientName || '',
    service: proposal?.service || '',
    picName: lead?.clientName || '',
    picEmail: lead?.email || '',
    picPhone: lead?.phone || '',
  }), [lead, handover.clientName, proposal?.service]);

  const draft = useMemo(
    () => handoverToDraft(handover, leadData, engagementLetter ? { signedDate: engagementLetter.signedDate, status: engagementLetter.status } : undefined),
    [handover, leadData, engagementLetter]
  );

  const [expandedSections, setExpandedSections] = useState<Set<SectionId>>(new Set(ALL_SECTIONS));

  const toggleSection = useCallback((sectionId: SectionId) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  }, []);

  return (
    <div className="space-y-6">
      <HandoverForm
        draft={draft}
        onDraftChange={() => {}}
        existingHandover={handover}
        readOnly={true}
        errors={{}}
        showValidation={false}
        expandedSections={expandedSections}
        onToggleSection={toggleSection}
        revisionComments={handover.revisionComments || []}
        hiddenSections={COO_HIDDEN_SECTIONS}
        onBack={onBack}
      />
    </div>
  );
}
