import { Label } from '../../../../components/ui/label';
import { Textarea } from '../../../../components/ui/textarea';
import { Card, CardContent } from '../../../../components/ui/card';
import { SectionHeader } from '../shared/SectionHeader';
import { RevisionComments } from '../shared/RevisionComments';
import type { RevisionComment } from '../../../../lib/projectWorkflowTypes';
import type { SectionId } from '../../model/types';

interface BackgroundSummarySectionProps {
  sectionId: SectionId;
  background: string;
  onBackgroundChange: (value: string) => void;
  isExpanded: boolean;
  isComplete: boolean;
  hasRevision: boolean;
  showValidation: boolean;
  error?: string;
  readOnly?: boolean;
  revisionComments: RevisionComment[];
  onToggle: () => void;
}

export function BackgroundSummarySection({
  sectionId,
  background,
  onBackgroundChange,
  isExpanded,
  isComplete,
  hasRevision,
  showValidation,
  error,
  readOnly = false,
  revisionComments,
  onToggle
}: BackgroundSummarySectionProps) {
  return (
    <Card className="mb-6">
      <SectionHeader
        sectionId={sectionId}
        title="BACKGROUND SUMMARY"
        isExpanded={isExpanded}
        isComplete={isComplete}
        hasRevision={hasRevision}
        showValidation={showValidation}
        onToggle={onToggle}
      />
      {isExpanded && (
        <CardContent className="pt-0">
          <RevisionComments comments={revisionComments} sectionTitle="BACKGROUND SUMMARY" />
          <Label htmlFor="background" className="mb-3 block">
            Background Summary <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="background"
            value={background}
            onChange={(e) => onBackgroundChange(e.target.value)}
            placeholder="Describe the project background, client situation, context, and key objectives..."
            rows={6}
            disabled={readOnly}
            className={`${showValidation && error ? 'border-red-300' : ''} ${readOnly ? 'disabled:opacity-100 disabled:text-gray-900' : ''}`}
          />
          {showValidation && error && (
            <p className="text-xs text-red-600 mt-1">{error}</p>
          )}
        </CardContent>
      )}
    </Card>
  );
}
