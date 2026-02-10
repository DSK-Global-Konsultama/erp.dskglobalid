import { Input } from '../../../../components/ui/input';
import { Textarea } from '../../../../components/ui/textarea';
import { Label } from '../../../../components/ui/label';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent } from '../../../../components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { SectionHeader } from '../shared/SectionHeader';
import { RevisionComments } from '../shared/RevisionComments';
import type { RevisionComment } from '../../../../lib/projectWorkflowTypes';
import type { SectionId } from '../../model/types';

type ExternalContact = {
  id?: string;
  role?: string;
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
};

interface CommunicationProtocolSectionProps {
  sectionId: SectionId;
  displayNumber?: number;
  communicationInternal: string;
  communicationExternal: string;
  externalContacts: ExternalContact[];
  onCommunicationInternalChange: (value: string) => void;
  onCommunicationExternalChange: (value: string) => void;
  onExternalContactsChange: (contacts: ExternalContact[]) => void;
  isExpanded: boolean;
  isComplete: boolean;
  hasRevision: boolean;
  showValidation: boolean;
  error?: string;
  readOnly?: boolean;
  revisionComments: RevisionComment[];
  onToggle: () => void;
}

export function CommunicationProtocolSection({
  sectionId,
  displayNumber,
  communicationInternal,
  communicationExternal,
  externalContacts,
  onCommunicationInternalChange,
  onCommunicationExternalChange,
  onExternalContactsChange,
  isExpanded,
  isComplete,
  hasRevision,
  showValidation,
  error,
  readOnly = false,
  revisionComments,
  onToggle
}: CommunicationProtocolSectionProps) {
  return (
    <Card className="mb-6">
      <SectionHeader
        sectionId={sectionId}
        displayNumber={displayNumber}
        title="COMMUNICATION PROTOCOL"
        isExpanded={isExpanded}
        isComplete={isComplete}
        hasRevision={hasRevision}
        showValidation={showValidation}
        onToggle={onToggle}
      />
      {isExpanded && (
        <CardContent className="pt-0 space-y-6">
          <RevisionComments comments={revisionComments} sectionTitle="COMMUNICATION PROTOCOL" />
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">8.1 Internal</h3>
            <Textarea
              value={communicationInternal}
              onChange={(e) => onCommunicationInternalChange(e.target.value)}
              placeholder="Internal communication guidelines..."
              rows={3}
              disabled={readOnly}
              className={`${showValidation && error ? 'border-red-300' : ''} ${readOnly ? 'disabled:opacity-100 disabled:text-gray-900' : ''}`}
            />
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">8.2 External (Client)</h3>
            <Label htmlFor="communicationExternal" className="mb-3 block">Catatan:</Label>
            <Textarea
              id="communicationExternal"
              value={communicationExternal}
              onChange={(e) => onCommunicationExternalChange(e.target.value)}
              placeholder="External communication guidelines..."
              rows={2}
              disabled={readOnly}
              className={`mt-2 ${readOnly ? 'disabled:opacity-100 disabled:text-gray-900' : ''}`}
            />
            
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-3 py-2 border border-gray-300">Role</th>
                    <th className="text-left px-3 py-2 border border-gray-300">Name</th>
                    <th className="text-left px-3 py-2 border border-gray-300">Contact</th>
                    <th className="text-left px-3 py-2 border border-gray-300">Instruction</th>
                    {!readOnly && <th className="w-10 border border-gray-300"></th>}
                  </tr>
                </thead>
                <tbody>
                  {externalContacts.map((contact, index) => (
                    <tr key={index}>
                      <td className="px-3 py-2 border border-gray-300">
                        <Input
                          type="text"
                          value={contact.role || ''}
                          onChange={(e) => {
                            const newContacts = [...externalContacts];
                            newContacts[index].role = e.target.value;
                            onExternalContactsChange(newContacts);
                          }}
                          placeholder="Role"
                          disabled={readOnly}
                          className={`w-full ${readOnly ? 'disabled:opacity-100 disabled:text-gray-900' : ''}`}
                        />
                      </td>
                      <td className="px-3 py-2 border border-gray-300">
                        <Input
                          type="text"
                          value={contact.name || ''}
                          onChange={(e) => {
                            const newContacts = [...externalContacts];
                            newContacts[index].name = e.target.value;
                            onExternalContactsChange(newContacts);
                          }}
                          placeholder="Name"
                          disabled={readOnly}
                          className={`w-full ${readOnly ? 'disabled:opacity-100 disabled:text-gray-900' : ''}`}
                        />
                      </td>
                      <td className="px-3 py-2 border border-gray-300">
                        <Input
                          type="text"
                          value={`${contact.email || ''} / ${contact.phone || ''}`}
                          onChange={(e) => {
                            const parts = e.target.value.split('/');
                            const newContacts = [...externalContacts];
                            newContacts[index].email = parts[0]?.trim() || '';
                            newContacts[index].phone = parts[1]?.trim() || '';
                            onExternalContactsChange(newContacts);
                          }}
                          placeholder="email / phone"
                          disabled={readOnly}
                          className={`w-full ${readOnly ? 'disabled:opacity-100 disabled:text-gray-900' : ''}`}
                        />
                      </td>
                      <td className="px-3 py-2 border border-gray-300">
                        <Input
                          type="text"
                          value={contact.company || ''}
                          onChange={(e) => {
                            const newContacts = [...externalContacts];
                            newContacts[index].company = e.target.value;
                            onExternalContactsChange(newContacts);
                          }}
                          placeholder="Instruction"
                          disabled={readOnly}
                          className={`w-full ${readOnly ? 'disabled:opacity-100 disabled:text-gray-900' : ''}`}
                        />
                      </td>
                      {!readOnly && (
                        <td className="px-2 py-2 border border-gray-300 text-center">
                          {externalContacts.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onExternalContactsChange(externalContacts.filter((_, i) => i !== index))}
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
                onClick={() => onExternalContactsChange([...externalContacts, { id: `CONT-${Date.now()}`, role: '', name: '', email: '', phone: '', company: '' }])}
                className="mt-4"
              >
                <Plus className="w-4 h-4" />
                Add Contact
              </Button>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
