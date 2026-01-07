import { Card, CardContent } from '../../../../components/ui/card';
import { SectionHeader } from '../shared/SectionHeader';
import { RevisionComments } from '../shared/RevisionComments';
import { EditableList } from '../shared/EditableList';
import type { RevisionComment } from '../../../../lib/projectWorkflowTypes';
import type { SectionId } from '../../types';

interface DataRequirementsSectionProps {
  sectionId: SectionId;
  dataRequirements: string[];
  onDataRequirementsChange: (requirements: string[]) => void;
  isExpanded: boolean;
  isComplete: boolean;
  hasRevision: boolean;
  showValidation: boolean;
  readOnly?: boolean;
  revisionComments: RevisionComment[];
  onToggle: () => void;
}

export function DataRequirementsSection({
  sectionId,
  dataRequirements,
  onDataRequirementsChange,
  isExpanded,
  isComplete,
  hasRevision,
  showValidation,
  readOnly = false,
  revisionComments,
  onToggle
}: DataRequirementsSectionProps) {
  return (
    <Card className="mb-6">
      <SectionHeader
        sectionId={sectionId}
        title="DATA REQUIREMENTS (OUTSTANDING)"
        isExpanded={isExpanded}
        isComplete={isComplete}
        hasRevision={hasRevision}
        showValidation={showValidation}
        onToggle={onToggle}
      />
      {isExpanded && (
        <CardContent className="pt-0 space-y-4">
          <RevisionComments comments={revisionComments} sectionTitle="DATA REQUIREMENTS (OUTSTANDING)" />
          <p className="text-sm text-gray-600 italic mb-4">
            (Sudah dikirimkan kepada klien dalam Data Request List)
          </p>
          <EditableList
            items={dataRequirements}
            onItemsChange={onDataRequirementsChange}
            placeholder="Requirement description"
            readOnly={readOnly}
          />
        </CardContent>
      )}
    </Card>
  );
}
