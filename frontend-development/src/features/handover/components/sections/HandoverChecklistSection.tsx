import { Input } from '../../../../components/ui/input';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent } from '../../../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { SectionHeader } from '../shared/SectionHeader';
import { RevisionComments } from '../shared/RevisionComments';
import type { RevisionComment } from '../../../../lib/projectWorkflowTypes';
import type { SectionId } from '../../types';

type ChecklistItem = {
  id?: string;
  description?: string;
  status?: 'Pending' | 'Completed';
};

interface HandoverChecklistSectionProps {
  sectionId: SectionId;
  handoverChecklist: ChecklistItem[];
  onHandoverChecklistChange: (checklist: ChecklistItem[]) => void;
  isExpanded: boolean;
  isComplete: boolean;
  hasRevision: boolean;
  showValidation: boolean;
  readOnly?: boolean;
  revisionComments: RevisionComment[];
  onToggle: () => void;
}

export function HandoverChecklistSection({
  sectionId,
  handoverChecklist,
  onHandoverChecklistChange,
  isExpanded,
  isComplete,
  hasRevision,
  showValidation,
  readOnly = false,
  revisionComments,
  onToggle
}: HandoverChecklistSectionProps) {
  return (
    <Card className="mb-6">
      <SectionHeader
        sectionId={sectionId}
        title="HANDOVER CHECKLIST"
        isExpanded={isExpanded}
        isComplete={isComplete}
        hasRevision={hasRevision}
        showValidation={showValidation}
        onToggle={onToggle}
      />
      {isExpanded && (
        <CardContent className="pt-0">
          <RevisionComments comments={revisionComments} sectionTitle="HANDOVER CHECKLIST" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-3 py-2 border border-gray-300">Item</th>
                  <th className="text-left px-3 py-2 border border-gray-300 w-40">Status</th>
                  {!readOnly && <th className="w-10 border border-gray-300"></th>}
                </tr>
              </thead>
              <tbody>
                {handoverChecklist.map((item, index) => (
                  <tr key={index}>
                    <td className="px-3 py-2 border border-gray-300">
                      <Input
                        type="text"
                        value={item.description || ''}
                        onChange={(e) => {
                          const newChecklist = [...handoverChecklist];
                          newChecklist[index].description = e.target.value;
                          onHandoverChecklistChange(newChecklist);
                        }}
                        placeholder="Checklist item"
                        disabled={readOnly}
                        className={`w-full ${readOnly ? 'disabled:opacity-100 disabled:text-gray-900' : ''}`}
                      />
                    </td>
                    <td className="px-3 py-2 border border-gray-300">
                      <Select
                        value={item.status || 'Pending'}
                        onValueChange={(value) => {
                          const newChecklist = [...handoverChecklist];
                          newChecklist[index].status = value as 'Pending' | 'Completed';
                          onHandoverChecklistChange(newChecklist);
                        }}
                        disabled={readOnly}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    {!readOnly && (
                      <td className="px-2 py-2 border border-gray-300 text-center">
                        {handoverChecklist.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onHandoverChecklistChange(handoverChecklist.filter((_, i) => i !== index))}
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
          {!readOnly && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onHandoverChecklistChange([...handoverChecklist, { id: `CHK-${Date.now()}`, description: '', status: 'Pending' }])}
              className="mt-4"
            >
              <Plus className="w-4 h-4" />
              Add Checklist Item
            </Button>
          )}
        </CardContent>
      )}
    </Card>
  );
}
