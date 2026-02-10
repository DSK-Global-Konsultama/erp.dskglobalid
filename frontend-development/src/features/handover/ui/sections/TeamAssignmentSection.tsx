import { Input } from '../../../../components/ui/input';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent } from '../../../../components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { SectionHeader } from '../shared/SectionHeader';
import { RevisionComments } from '../shared/RevisionComments';
import type { RevisionComment } from '../../../../lib/projectWorkflowTypes';
import type { SectionId } from '../../model/types';

type TeamMember = {
  id?: string;
  role?: string;
  name?: string;
  allocation?: string;
};

interface TeamAssignmentSectionProps {
  sectionId: SectionId;
  displayNumber?: number;
  preliminaryTeam: TeamMember[];
  onPreliminaryTeamChange: (team: TeamMember[]) => void;
  isExpanded: boolean;
  isComplete: boolean;
  hasRevision: boolean;
  showValidation: boolean;
  readOnly?: boolean;
  revisionComments: RevisionComment[];
  onToggle: () => void;
}

export function TeamAssignmentSection({
  sectionId,
  displayNumber,
  preliminaryTeam,
  onPreliminaryTeamChange,
  isExpanded,
  isComplete,
  hasRevision,
  showValidation,
  readOnly = false,
  revisionComments,
  onToggle
}: TeamAssignmentSectionProps) {
  return (
    <Card className="mb-6">
      <SectionHeader
        sectionId={sectionId}
        displayNumber={displayNumber}
        title="PROJECT TEAM ASSIGNMENT"
        isExpanded={isExpanded}
        isComplete={isComplete}
        hasRevision={hasRevision}
        showValidation={showValidation}
        onToggle={onToggle}
      />
      {isExpanded && (
        <CardContent className="pt-0">
          <RevisionComments comments={revisionComments} sectionTitle="PROJECT TEAM ASSIGNMENT" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-3 py-2 border border-gray-300">Role</th>
                  <th className="text-left px-3 py-2 border border-gray-300">Name</th>
                  <th className="text-left px-3 py-2 border border-gray-300">Responsibilities</th>
                  {!readOnly && <th className="w-10 border border-gray-300"></th>}
                </tr>
              </thead>
              <tbody>
                {preliminaryTeam.map((member, index) => (
                  <tr key={index}>
                    <td className="px-3 py-2 border border-gray-300">
                      <Input
                        type="text"
                        value={member.role || ''}
                        onChange={(e) => {
                          const newTeam = [...preliminaryTeam];
                          newTeam[index].role = e.target.value;
                          onPreliminaryTeamChange(newTeam);
                        }}
                        placeholder="Role"
                        disabled={readOnly}
                        className={`w-full ${readOnly ? 'disabled:opacity-100 disabled:text-gray-900' : ''}`}
                      />
                    </td>
                    <td className="px-3 py-2 border border-gray-300">
                      <Input
                        type="text"
                        value={member.name || ''}
                        onChange={(e) => {
                          const newTeam = [...preliminaryTeam];
                          newTeam[index].name = e.target.value;
                          onPreliminaryTeamChange(newTeam);
                        }}
                        placeholder="Name"
                        disabled={readOnly}
                        className={`w-full ${readOnly ? 'disabled:opacity-100 disabled:text-gray-900' : ''}`}
                      />
                    </td>
                    <td className="px-3 py-2 border border-gray-300">
                      <Input
                        type="text"
                        value={member.allocation || ''}
                        onChange={(e) => {
                          const newTeam = [...preliminaryTeam];
                          newTeam[index].allocation = e.target.value;
                          onPreliminaryTeamChange(newTeam);
                        }}
                        placeholder="Responsibilities"
                        disabled={readOnly}
                        className={`w-full ${readOnly ? 'disabled:opacity-100 disabled:text-gray-900' : ''}`}
                      />
                    </td>
                    {!readOnly && (
                      <td className="px-2 py-2 border border-gray-300 text-center">
                        {preliminaryTeam.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onPreliminaryTeamChange(preliminaryTeam.filter((_, i) => i !== index))}
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
              onClick={() => onPreliminaryTeamChange([...preliminaryTeam, { id: `TM-${Date.now()}`, role: '', name: '', allocation: '' }])}
              className="mt-4"
            >
              <Plus className="w-4 h-4" />
              Add Team Member
            </Button>
          )}
        </CardContent>
      )}
    </Card>
  );
}
