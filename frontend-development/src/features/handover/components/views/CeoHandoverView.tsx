import { useState } from 'react';
import { CheckCircle, FileEdit } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { HandoverForm } from '../forms/HandoverForm';
import { RequestRevisionModal } from '../modals/RequestRevisionModal';
import type { ExtendedHandover } from '../../../../lib/projectWorkflowTypes';
import type { Lead, Proposal, EngagementLetter } from '../../../../lib/mock-data';

interface CeoHandoverViewProps {
  handover: ExtendedHandover;
  lead?: Lead;
  proposal?: Proposal;
  engagementLetter?: EngagementLetter;
  onApprove: (handoverId: string) => void;
  onReject: (handoverId: string) => void;
  onBack: () => void;
}

/**
 * CEO Handover View
 * Allows CEO to review all sections and approve/request revision for handover memos
 */
export function CeoHandoverView({
  handover,
  lead,
  proposal,
  engagementLetter,
  onApprove,
  onReject,
  onBack
}: CeoHandoverViewProps) {
  const [showRevisionModal, setShowRevisionModal] = useState(false);

  const handleApprove = () => {
    onApprove(handover.id!);
  };

  const handleReject = () => {
    setShowRevisionModal(true);
  };

  const handleRequestRevision = (revisions: Array<{ sectionName: string; comment: string }>) => {
    // TODO: Create revision comments for each selected section
    // revisions: array of objects with sectionName and comment
    // For now, just call onReject with handover ID
    console.log('Requesting revision for sections:', revisions);
    onReject(handover.id!);
  };

  return (
    <div className="space-y-6">
      <HandoverForm
        handoverId={handover.id}
        proposalId={proposal?.id}
        leadId={handover.leadId}
        onBack={onBack}
        onSaveDraft={() => {}} // Not used in read-only mode
        onSubmit={() => {}} // Not used in read-only mode
        existingHandover={handover}
        readOnly={true}
        leadData={{
          clientName: lead?.clientName || handover.clientName || '',
          companyName: lead?.company || handover.clientName || '',
          service: proposal?.service || '',
          picName: lead?.clientName || '',
          picEmail: lead?.email || '',
          picPhone: lead?.phone || '',
          source: lead?.source || 'Other'
        }}
        engagementLetter={engagementLetter ? {
          signedDate: engagementLetter.signedDate,
          status: engagementLetter.status
        } : undefined}
      />
      
      {/* CEO Action Buttons */}
      <div className="bg-white border-t border-gray-200 pt-6 mt-6">
        <div className="flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={onBack}
            className="px-6"
          >
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
          <Button
            onClick={handleApprove}
            className="px-6 bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Approve
          </Button>
        </div>
      </div>

      {/* Request Revision Modal */}
      <RequestRevisionModal
        open={showRevisionModal}
        onClose={() => setShowRevisionModal(false)}
        onRequestRevision={handleRequestRevision}
      />
    </div>
  );
}
