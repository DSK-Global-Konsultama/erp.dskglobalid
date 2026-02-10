/**
 * Handover tab: read-only HandoverForm. Hidden sections from projectViewPolicy (PM: 4,5,6; COO: none).
 */

import { useMemo, useState, useCallback } from 'react';
import { HandoverForm } from '../../../handover/ui/forms/HandoverForm';
import { handoverToDraft } from '../../../handover/model/mappers';
import { getHandoverHiddenSections } from '../guards/projectViewPolicy';
import { ALL_SECTIONS } from '../../../handover/model/types';
import type { SectionId } from '../../../handover/model/types';
import type { ExtendedHandover } from '../../../../lib/projectWorkflowTypes';
import type { Lead, Proposal, EngagementLetter } from '../../../../lib/mock-data';

export interface ProjectHandoverTabProps {
  userRole: string;
  handover: ExtendedHandover;
  lead?: Lead;
  proposal?: Proposal;
  engagementLetter?: EngagementLetter;
}

export function ProjectHandoverTab({
  userRole,
  handover,
  lead,
  proposal,
  engagementLetter,
}: ProjectHandoverTabProps) {
  const leadData = useMemo(
    () => ({
      clientName: lead?.clientName ?? handover.clientName ?? '',
      companyName: lead?.company ?? handover.clientName ?? '',
      service: proposal?.service ?? '',
      picName: lead?.clientName ?? '',
      picEmail: lead?.email ?? '',
      picPhone: lead?.phone ?? '',
    }),
    [lead, handover.clientName, proposal?.service]
  );

  const draft = useMemo(
    () =>
      handoverToDraft(
        handover,
        leadData,
        engagementLetter
          ? { signedDate: engagementLetter.signedDate, status: engagementLetter.status }
          : undefined
      ),
    [handover, leadData, engagementLetter]
  );

  const [expandedSections, setExpandedSections] = useState<Set<SectionId>>(
    new Set(ALL_SECTIONS)
  );
  const toggleSection = useCallback((sectionId: SectionId) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  }, []);

  const hiddenSectionIds = getHandoverHiddenSections(userRole);
  const hiddenSections = hiddenSectionIds.length > 0 ? hiddenSectionIds : undefined;

  return (
    <HandoverForm
      draft={draft}
      onDraftChange={() => {}}
      existingHandover={handover}
      readOnly
      errors={{}}
      showValidation={false}
      expandedSections={expandedSections}
      onToggleSection={toggleSection}
      revisionComments={handover.revisionComments ?? []}
      hiddenSections={hiddenSections}
      showFormCompletion={false}
    />
  );
}
