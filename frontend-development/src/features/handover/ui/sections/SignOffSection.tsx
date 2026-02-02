import { Input } from '../../../../components/ui/input';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent } from '../../../../components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { SectionHeader } from '../shared/SectionHeader';
import { RevisionComments } from '../shared/RevisionComments';
import type { RevisionComment } from '../../../../lib/projectWorkflowTypes';
import type { SectionId } from '../../model/types';

type SignOff = {
  id?: string;
  role?: string;
  name?: string;
  signedAt?: string;
  notes?: string;
};

interface SignOffSectionProps {
  sectionId: SectionId;
  signOffs: SignOff[];
  onSignOffsChange: (signOffs: SignOff[]) => void;
  isExpanded: boolean;
  isComplete: boolean;
  hasRevision: boolean;
  showValidation: boolean;
  readOnly?: boolean;
  revisionComments: RevisionComment[];
  onToggle: () => void;
}

export function SignOffSection({
  sectionId,
  signOffs,
  onSignOffsChange,
  isExpanded,
  isComplete,
  hasRevision,
  showValidation,
  readOnly = false,
  revisionComments,
  onToggle
}: SignOffSectionProps) {
  return (
    <Card className="mb-6">
      <SectionHeader
        sectionId={sectionId}
        title="SIGN-OFF"
        isExpanded={isExpanded}
        isComplete={isComplete}
        hasRevision={hasRevision}
        showValidation={showValidation}
        onToggle={onToggle}
      />
      {isExpanded && (
        <CardContent className="pt-0">
          <RevisionComments comments={revisionComments} sectionTitle="SIGN-OFF" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-3 py-2 border border-gray-300">Name</th>
                  <th className="text-left px-3 py-2 border border-gray-300">Position</th>
                  <th className="text-left px-3 py-2 border border-gray-300">Signature</th>
                  <th className="text-left px-3 py-2 border border-gray-300">Date</th>
                  {!readOnly && <th className="w-10 border border-gray-300"></th>}
                </tr>
              </thead>
              <tbody>
                {signOffs.map((signOff, index) => (
                  <tr key={index}>
                    <td className="px-3 py-2 border border-gray-300">
                      <Input
                        type="text"
                        value={signOff.name || ''}
                        onChange={(e) => {
                          const newSignOffs = [...signOffs];
                          newSignOffs[index].name = e.target.value;
                          onSignOffsChange(newSignOffs);
                        }}
                        placeholder="Name"
                        disabled={readOnly}
                        className={`w-full ${readOnly ? 'disabled:opacity-100 disabled:text-gray-900' : ''}`}
                      />
                    </td>
                    <td className="px-3 py-2 border border-gray-300">
                      <Input
                        type="text"
                        value={signOff.role || ''}
                        onChange={(e) => {
                          const newSignOffs = [...signOffs];
                          newSignOffs[index].role = e.target.value;
                          onSignOffsChange(newSignOffs);
                        }}
                        placeholder="Position"
                        disabled={readOnly}
                        className={`w-full ${readOnly ? 'disabled:opacity-100 disabled:text-gray-900' : ''}`}
                      />
                    </td>
                    <td className="px-3 py-2 border border-gray-300">
                      <Input
                        type="text"
                        value={signOff.notes || ''}
                        onChange={(e) => {
                          const newSignOffs = [...signOffs];
                          newSignOffs[index].notes = e.target.value;
                          onSignOffsChange(newSignOffs);
                        }}
                        placeholder="(signature field)"
                        disabled={readOnly}
                        className={`w-full bg-gray-50 italic ${readOnly ? 'disabled:opacity-100 disabled:text-gray-900' : ''}`}
                      />
                    </td>
                    <td className="px-3 py-2 border border-gray-300">
                      <Input
                        type="date"
                        value={signOff.signedAt || ''}
                        onChange={(e) => {
                          const newSignOffs = [...signOffs];
                          newSignOffs[index].signedAt = e.target.value;
                          onSignOffsChange(newSignOffs);
                        }}
                        disabled={readOnly}
                        className={`w-full ${readOnly ? 'disabled:opacity-100 disabled:text-gray-900' : ''}`}
                      />
                    </td>
                    {!readOnly && (
                      <td className="px-2 py-2 border border-gray-300 text-center">
                        {signOffs.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onSignOffsChange(signOffs.filter((_, i) => i !== index))}
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
              onClick={() => onSignOffsChange([...signOffs, { id: `SIGN-${Date.now()}`, role: '', name: '', signedAt: '' }])}
              className="mt-4"
            >
              <Plus className="w-4 h-4" />
              Add Sign-Off
            </Button>
          )}
        </CardContent>
      )}
    </Card>
  );
}
