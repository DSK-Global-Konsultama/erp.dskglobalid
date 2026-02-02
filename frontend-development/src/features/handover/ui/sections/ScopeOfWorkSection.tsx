import { Input } from '../../../../components/ui/input';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent } from '../../../../components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { SectionHeader } from '../shared/SectionHeader';
import { RevisionComments } from '../shared/RevisionComments';
import type { RevisionComment } from '../../../../lib/projectWorkflowTypes';
import type { SectionId } from '../../model/types';

type Deliverable = {
  id?: string;
  name?: string;
  description?: string;
};

type Milestone = {
  id?: string;
  name?: string;
  targetDate?: string;
  description?: string;
};

interface ScopeOfWorkSectionProps {
  sectionId: SectionId;
  scopeIncluded: string[];
  scopeExclusions: string[];
  deliverables: Deliverable[];
  milestones: Milestone[];
  isScopeLocked: boolean;
  onScopeIncludedChange: (items: string[]) => void;
  onScopeExclusionsChange: (items: string[]) => void;
  onDeliverablesChange: (deliverables: Deliverable[]) => void;
  onMilestonesChange: (milestones: Milestone[]) => void;
  isExpanded: boolean;
  isComplete: boolean;
  hasRevision: boolean;
  showValidation: boolean;
  readOnly?: boolean;
  revisionComments: RevisionComment[];
  onToggle: () => void;
}

export function ScopeOfWorkSection({
  sectionId,
  scopeIncluded,
  scopeExclusions,
  deliverables,
  milestones,
  isScopeLocked,
  onScopeIncludedChange,
  onScopeExclusionsChange,
  onDeliverablesChange,
  onMilestonesChange,
  isExpanded,
  isComplete,
  hasRevision,
  showValidation,
  readOnly = false,
  revisionComments,
  onToggle
}: ScopeOfWorkSectionProps) {
  const isDisabled = readOnly || isScopeLocked;

  return (
    <Card className="mb-6">
      <SectionHeader
        sectionId={sectionId}
        title="FINALIZED SCOPE OF WORK"
        isExpanded={isExpanded}
        isComplete={isComplete}
        hasRevision={hasRevision}
        showValidation={showValidation}
        onToggle={onToggle}
      />
      {isExpanded && (
        <CardContent className="pt-0 space-y-6">
          <RevisionComments comments={revisionComments} sectionTitle="FINALIZED SCOPE OF WORK" />
          
          {/* 3.1 Scope Included */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">3.1 Scope Included</h3>
            {scopeIncluded.map((item, index) => (
              <div key={index} className="flex items-start gap-2 mb-3">
                <span className="text-gray-600 mt-2">•</span>
                <Input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const newItems = [...scopeIncluded];
                    newItems[index] = e.target.value;
                    onScopeIncludedChange(newItems);
                  }}
                  placeholder="e.g., Penyusunan Master File FY 2024"
                  disabled={isDisabled}
                  className={`flex-1 ${isDisabled ? 'disabled:opacity-100 disabled:text-gray-900' : ''}`}
                />
                {!isDisabled && scopeIncluded.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onScopeIncludedChange(scopeIncluded.filter((_, i) => i !== index))}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            {!isDisabled && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onScopeIncludedChange([...scopeIncluded, ''])}
                className="mt-4"
              >
                <Plus className="w-4 h-4" />
                Add Scope Item
              </Button>
            )}
          </div>
          
          {/* 3.2 Exclusions */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">3.2 Exclusions</h3>
            {scopeExclusions.map((item, index) => (
              <div key={index} className="flex items-start gap-2 mb-3">
                <span className="text-gray-600 mt-2">•</span>
                <Input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const newItems = [...scopeExclusions];
                    newItems[index] = e.target.value;
                    onScopeExclusionsChange(newItems);
                  }}
                  placeholder="e.g., Penyusunan CbC Report"
                  disabled={isDisabled}
                  className={`flex-1 ${isDisabled ? 'disabled:opacity-100 disabled:text-gray-900' : ''}`}
                />
                {!isDisabled && scopeExclusions.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onScopeExclusionsChange(scopeExclusions.filter((_, i) => i !== index))}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            {!isDisabled && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onScopeExclusionsChange([...scopeExclusions, ''])}
                className="mt-4"
              >
                <Plus className="w-4 h-4" />
                Add Exclusion
              </Button>
            )}
          </div>
          
          {/* 3.3 Deliverables */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">3.3 Deliverables</h3>
            <div className="space-y-3">
              {deliverables.map((del, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-gray-600 mt-2">•</span>
                  <div className="flex-1 flex gap-2">
                    <Input
                      type="text"
                      value={del.name || ''}
                      onChange={(e) => {
                        const newDeliverables = [...deliverables];
                        newDeliverables[index].name = e.target.value;
                        onDeliverablesChange(newDeliverables);
                      }}
                      placeholder="Deliverable name"
                      disabled={isDisabled}
                      className={`flex-1 ${isDisabled ? 'disabled:opacity-100 disabled:text-gray-900' : ''}`}
                    />
                    <Input
                      type="text"
                      value={del.description || ''}
                      onChange={(e) => {
                        const newDeliverables = [...deliverables];
                        newDeliverables[index].description = e.target.value;
                        onDeliverablesChange(newDeliverables);
                      }}
                      placeholder="Format/notes"
                      disabled={isDisabled}
                      className={`flex-1 ${isDisabled ? 'disabled:opacity-100 disabled:text-gray-900' : ''}`}
                    />
                  </div>
                  {!isDisabled && deliverables.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeliverablesChange(deliverables.filter((_, i) => i !== index))}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {!isDisabled && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDeliverablesChange([...deliverables, { id: `DEL-${Date.now()}`, name: '', description: '' }])}
                className="mt-4"
              >
                <Plus className="w-4 h-4" />
                Add Deliverable
              </Button>
            )}
          </div>
          
          {/* 3.4 Timeline & Milestones */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">3.4 Timeline & Milestones</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-3 py-2 border border-gray-300">Milestone</th>
                    <th className="text-left px-3 py-2 border border-gray-300">Target Date</th>
                    <th className="text-left px-3 py-2 border border-gray-300">Notes</th>
                    {!isDisabled && <th className="w-10 border border-gray-300"></th>}
                  </tr>
                </thead>
                <tbody>
                  {milestones.map((milestone, index) => (
                    <tr key={index}>
                      <td className="px-3 py-2 border border-gray-300">
                        <Input
                          type="text"
                          value={milestone.name || ''}
                          onChange={(e) => {
                            const newMilestones = [...milestones];
                            newMilestones[index].name = e.target.value;
                            onMilestonesChange(newMilestones);
                          }}
                          placeholder="Milestone name"
                          disabled={isDisabled}
                          className={`w-full ${isDisabled ? 'disabled:opacity-100 disabled:text-gray-900' : ''}`}
                        />
                      </td>
                      <td className="px-3 py-2 border border-gray-300">
                        <Input
                          type="date"
                          value={milestone.targetDate || ''}
                          onChange={(e) => {
                            const newMilestones = [...milestones];
                            newMilestones[index].targetDate = e.target.value;
                            onMilestonesChange(newMilestones);
                          }}
                          disabled={isDisabled}
                          className={`w-full ${isDisabled ? 'disabled:opacity-100 disabled:text-gray-900' : ''}`}
                        />
                      </td>
                      <td className="px-3 py-2 border border-gray-300">
                        <Input
                          type="text"
                          value={milestone.description || ''}
                          onChange={(e) => {
                            const newMilestones = [...milestones];
                            newMilestones[index].description = e.target.value;
                            onMilestonesChange(newMilestones);
                          }}
                          placeholder="Notes"
                          disabled={isDisabled}
                          className={`w-full ${isDisabled ? 'disabled:opacity-100 disabled:text-gray-900' : ''}`}
                        />
                      </td>
                      {!isDisabled && (
                        <td className="px-2 py-2 border border-gray-300 text-center">
                          {milestones.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onMilestonesChange(milestones.filter((_, i) => i !== index))}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!isDisabled && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onMilestonesChange([...milestones, { id: `MS-${Date.now()}`, name: '', targetDate: '', description: '' }])}
                className="mt-4"
              >
                <Plus className="w-4 h-4" />
                Add Milestone
              </Button>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
