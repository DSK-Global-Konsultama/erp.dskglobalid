import { Card, CardContent } from '../../../../components/ui/card';
import { SectionHeader } from '../shared/SectionHeader';
import { RevisionComments } from '../shared/RevisionComments';
import { EditableList } from '../shared/EditableList';
import type { RevisionComment } from '../../../../lib/projectWorkflowTypes';
import type { SectionId } from '../../model/types';

interface RisksSectionProps {
  sectionId: SectionId;
  displayNumber?: number;
  risks: string[];
  onRisksChange: (risks: string[]) => void;
  isExpanded: boolean;
  isComplete: boolean;
  hasRevision: boolean;
  showValidation: boolean;
  readOnly?: boolean;
  revisionComments: RevisionComment[];
  onToggle: () => void;
}

export function RisksSection({
  sectionId,
  displayNumber,
  risks,
  onRisksChange,
  isExpanded,
  isComplete,
  hasRevision,
  showValidation,
  readOnly = false,
  revisionComments,
  onToggle
}: RisksSectionProps) {
  return (
    <Card className="mb-6">
      <SectionHeader
        sectionId={sectionId}
        displayNumber={displayNumber}
        title="KEY RISKS / RED FLAGS"
        isExpanded={isExpanded}
        isComplete={isComplete}
        hasRevision={hasRevision}
        showValidation={showValidation}
        onToggle={onToggle}
      />
      {isExpanded && (
        <CardContent className="pt-0 space-y-6">
          <RevisionComments comments={revisionComments} sectionTitle="KEY RISKS / RED FLAGS" />
          
          <EditableList
            items={risks}
            onItemsChange={onRisksChange}
            placeholder="Risk description"
            readOnly={readOnly}
          />
        </CardContent>
      )}
    </Card>
  );
}
