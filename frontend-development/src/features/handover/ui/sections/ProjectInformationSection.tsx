import { Input } from '../../../../components/ui/input';
import { Card, CardContent } from '../../../../components/ui/card';
import { SectionHeader } from '../shared/SectionHeader';
import { RevisionComments } from '../shared/RevisionComments';
import type { RevisionComment } from '../../../../lib/projectWorkflowTypes';
import type { SectionId } from '../../model/types';

interface ProjectInformationSectionProps {
  sectionId: SectionId;
  projectName: string;
  clientName: string;
  companyGroup: string;
  serviceLine: string;
  projectStartDate: string;
  projectEndDate: string;
  clientPic: string;
  clientEmail: string;
  clientPhone: string;
  engagementLetterStatus: string;
  proposalReference: string;
  onProjectNameChange: (value: string) => void;
  onClientNameChange: (value: string) => void;
  onCompanyGroupChange: (value: string) => void;
  onServiceLineChange: (value: string) => void;
  onProjectStartDateChange: (value: string) => void;
  onProjectEndDateChange: (value: string) => void;
  onClientPicChange: (value: string) => void;
  onClientEmailChange: (value: string) => void;
  onClientPhoneChange: (value: string) => void;
  onEngagementLetterStatusChange: (value: string) => void;
  onProposalReferenceChange: (value: string) => void;
  isExpanded: boolean;
  isComplete: boolean;
  hasRevision: boolean;
  showValidation: boolean;
  errors: Record<string, string>;
  readOnly?: boolean;
  revisionComments: RevisionComment[];
  onToggle: () => void;
}

export function ProjectInformationSection({
  sectionId,
  projectName,
  clientName,
  companyGroup,
  serviceLine,
  projectStartDate,
  projectEndDate,
  clientPic,
  clientEmail,
  clientPhone,
  engagementLetterStatus,
  proposalReference,
  onProjectNameChange,
  onClientNameChange,
  onCompanyGroupChange,
  onServiceLineChange,
  onProjectStartDateChange,
  onProjectEndDateChange,
  onClientPicChange,
  onClientEmailChange,
  onClientPhoneChange,
  onEngagementLetterStatusChange,
  onProposalReferenceChange,
  isExpanded,
  isComplete,
  hasRevision,
  showValidation,
  errors,
  readOnly = false,
  revisionComments,
  onToggle
}: ProjectInformationSectionProps) {
  return (
    <Card className="mb-6">
      <SectionHeader
        sectionId={sectionId}
        title="PROJECT INFORMATION"
        isExpanded={isExpanded}
        isComplete={isComplete}
        hasRevision={hasRevision}
        showValidation={showValidation}
        onToggle={onToggle}
      />
      {isExpanded && (
        <CardContent className="pt-0">
          <RevisionComments comments={revisionComments} sectionTitle="PROJECT INFORMATION" />
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-2 border border-gray-300 w-1/3">Item</th>
                  <th className="text-left px-4 py-2 border border-gray-300">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-2 border border-gray-300 font-medium">Client Name</td>
                  <td className="px-4 py-2 border border-gray-300">
                    <Input
                      type="text"
                      value={clientName}
                      onChange={(e) => onClientNameChange(e.target.value)}
                      placeholder="PT MSM Indonesia"
                      disabled={readOnly}
                      className={`${showValidation && errors.clientName ? 'border-red-300' : ''} ${readOnly ? 'disabled:opacity-100 disabled:text-gray-900' : ''}`}
                    />
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border border-gray-300 font-medium">Company Group</td>
                  <td className="px-4 py-2 border border-gray-300">
                    <Input
                      type="text"
                      value={companyGroup}
                      onChange={(e) => onCompanyGroupChange(e.target.value)}
                      placeholder="MSM Group"
                      disabled={readOnly}
                      className={readOnly ? 'disabled:opacity-100 disabled:text-gray-900' : ''}
                    />
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border border-gray-300 font-medium">Project Title</td>
                  <td className="px-4 py-2 border border-gray-300">
                    <Input
                      type="text"
                      value={projectName}
                      onChange={(e) => onProjectNameChange(e.target.value)}
                      placeholder="Transfer Pricing Documentation FY 2024"
                      disabled={readOnly}
                      className={`${showValidation && errors.projectName ? 'border-red-300' : ''} ${readOnly ? 'disabled:opacity-100 disabled:text-gray-900' : ''}`}
                    />
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border border-gray-300 font-medium">Service Line</td>
                  <td className="px-4 py-2 border border-gray-300">
                    <Input
                      type="text"
                      value={serviceLine}
                      onChange={(e) => onServiceLineChange(e.target.value)}
                      placeholder="Transfer Pricing / Tax / Legal"
                      disabled={readOnly}
                      className={`${showValidation && errors.serviceLine ? 'border-red-300' : ''} ${readOnly ? 'disabled:opacity-100 disabled:text-gray-900' : ''}`}
                    />
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border border-gray-300 font-medium">Project Period</td>
                  <td className="px-4 py-2 border border-gray-300">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Input
                          type="date"
                          value={projectStartDate}
                          onChange={(e) => onProjectStartDateChange(e.target.value)}
                          disabled={readOnly}
                          className={`${showValidation && errors.projectStartDate ? 'border-red-300' : ''} ${readOnly ? 'disabled:opacity-100 disabled:text-gray-900' : ''}`}
                        />
                        {showValidation && errors.projectStartDate && (
                          <p className="text-xs text-red-600 mt-1">{errors.projectStartDate}</p>
                        )}
                      </div>
                      <span className="self-center text-gray-500">–</span>
                      <div className="flex-1">
                        <Input
                          type="date"
                          value={projectEndDate}
                          onChange={(e) => onProjectEndDateChange(e.target.value)}
                          disabled={readOnly}
                          className={`${showValidation && errors.projectEndDate ? 'border-red-300' : ''} ${readOnly ? 'disabled:opacity-100 disabled:text-gray-900' : ''}`}
                        />
                        {showValidation && errors.projectEndDate && (
                          <p className="text-xs text-red-600 mt-1">{errors.projectEndDate}</p>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border border-gray-300 font-medium">PIC Client</td>
                  <td className="px-4 py-2 border border-gray-300">
                    <Input
                      type="text"
                      value={clientPic}
                      onChange={(e) => onClientPicChange(e.target.value)}
                      placeholder="Andi Prasetyo"
                      disabled={readOnly}
                      className={`${showValidation && errors.clientPic ? 'border-red-300' : ''} ${readOnly ? 'disabled:opacity-100 disabled:text-gray-900' : ''}`}
                    />
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border border-gray-300 font-medium">Client Contact</td>
                  <td className="px-4 py-2 border border-gray-300">
                    <div className="flex gap-2">
                      <Input
                        type="email"
                        value={clientEmail}
                        onChange={(e) => onClientEmailChange(e.target.value)}
                        placeholder="andi@ptmsm.com"
                        disabled={readOnly}
                        className={`${showValidation && errors.clientEmail ? 'border-red-300' : ''} ${readOnly ? 'disabled:opacity-100 disabled:text-gray-900' : ''}`}
                      />
                      <Input
                        type="tel"
                        value={clientPhone}
                        onChange={(e) => onClientPhoneChange(e.target.value)}
                        placeholder="+62 812 xxxx xxxx"
                        disabled={readOnly}
                        className={readOnly ? 'disabled:opacity-100 disabled:text-gray-900' : ''}
                      />
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border border-gray-300 font-medium">Engagement Letter Status</td>
                  <td className="px-4 py-2 border border-gray-300">
                    <Input
                      type="text"
                      value={engagementLetterStatus}
                      onChange={(e) => onEngagementLetterStatusChange(e.target.value)}
                      placeholder="Signed – 26 Januari 2025"
                      disabled={readOnly}
                      className={readOnly ? 'disabled:opacity-100 disabled:text-gray-900' : ''}
                    />
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border border-gray-300 font-medium">Proposal Reference</td>
                  <td className="px-4 py-2 border border-gray-300">
                    <Input
                      type="text"
                      value={proposalReference}
                      onChange={(e) => onProposalReferenceChange(e.target.value)}
                      placeholder="PROP-TP-MSM-2025-001"
                      disabled={readOnly}
                      className={readOnly ? 'disabled:opacity-100 disabled:text-gray-900' : ''}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
