import { useState, useCallback, useMemo } from 'react';
import { CheckCircle, FileEdit } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { HandoverForm } from '../ui/forms/HandoverForm';
import { RequestRevisionModal } from '../ui/modals/RequestRevisionModal';
import { handoverToDraft } from '../model/mappers';
import { findSectionIdFromRevision } from '../model/selectors';
import { ALL_SECTIONS } from '../model/types';
import type { SectionId } from '../model/types';
import type { ExtendedHandover } from '../../../lib/projectWorkflowTypes';
import type { Lead, Proposal, EngagementLetter } from '../../../lib/mock-data';

export interface CeoHandoverPageProps {
  handover: ExtendedHandover;
  lead?: Lead;
  proposal?: Proposal;
  engagementLetter?: EngagementLetter;
  onApprove: (handoverId: string) => void;
  onReject: (handoverId: string) => void;
  onBack: () => void;
}

export function CeoHandoverPage({
  handover,
  lead,
  proposal,
  engagementLetter,
  onApprove,
  onReject,
  onBack,
}: CeoHandoverPageProps) {
  const [showRevisionModal, setShowRevisionModal] = useState(false);

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

  const [expandedSections, setExpandedSections] = useState<Set<SectionId>>(() => {
    const set = new Set<SectionId>(ALL_SECTIONS);
    if (handover.workflowStatus === 'REVISION_REQUESTED' && handover.revisionComments?.length) {
      const id = findSectionIdFromRevision(handover.revisionComments[0].sectionName);
      set.add(id);
    }
    return set;
  });

  const toggleSection = useCallback((sectionId: SectionId) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  }, []);

  const handleApprove = () => {
    onApprove(handover.id!);
  };

  const handleReject = () => {
    setShowRevisionModal(true);
  };

  const handleRequestRevision = (revisions: Array<{ sectionName: string; comment: string }>) => {
    console.log('Requesting revision for sections:', revisions);
    onReject(handover.id!);
  };

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
        onBack={onBack}
      />

      <div className="bg-white border-t border-gray-200 pt-6 mt-6">
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onBack} className="px-6">
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={handleReject}
            className="px-6 border-yellow-600 text-yellow-600 hover:bg-yellow-50 hover:border-yellow-700 hover:text-yellow-700"
          >
            <FileEdit className="w-4 h-4 mr-2" />
            Revision
          </Button>
          <Button onClick={handleApprove} className="px-6 bg-green-600 hover:bg-green-700">
            <CheckCircle className="w-4 h-4 mr-2" />
            Approve
          </Button>
        </div>
      </div>

      <RequestRevisionModal
        open={showRevisionModal}
        onClose={() => setShowRevisionModal(false)}
        onRequestRevision={handleRequestRevision}
      />
    </div>
  );
}
