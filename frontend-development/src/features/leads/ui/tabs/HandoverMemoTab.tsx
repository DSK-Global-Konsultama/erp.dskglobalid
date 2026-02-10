import { useState } from 'react';
import { Plus, Edit, Eye, ArrowRight } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { StatusChip } from '../shared/StatusChip';
import { LeadActionGuard } from '../guards/LeadActionGuard';
import { BdExecutiveHandoverPage } from '../../../handover';
import { projectApi } from '../../../projects/api/projectApi';
import type { Handover, Lead, Proposal, EngagementLetter } from '../../../../lib/mock-data';
import type { ExtendedHandover } from '../../../../lib/projectWorkflowTypes';
import type { LeadStatus } from '../../model/types';

interface HandoverMemoTabProps {
  leadId: string;
  leads: Lead[];
  handovers: Handover[];
  proposals?: Proposal[];
  engagementLetters?: EngagementLetter[];
  readOnly?: boolean;
  onAddHandover: (handover: Handover) => void;
  onUpdateHandover: (id: string, updates: Partial<Handover>) => void;
  onUpdateLeadStatus: (leadId: string, status: LeadStatus) => void;
  onConvertToProject?: (handoverId: string) => void;
}

export function HandoverMemoTab({
  leadId,
  leads,
  handovers,
  proposals = [],
  engagementLetters = [],
  readOnly = false,
  onAddHandover,
  onUpdateHandover,
  onUpdateLeadStatus,
  onConvertToProject
}: HandoverMemoTabProps) {
  const [showHandoverForm, setShowHandoverForm] = useState(false);
  const [editingHandover, setEditingHandover] = useState<ExtendedHandover | undefined>(undefined);
  const leadHandovers = handovers.filter(h => h.leadId === leadId);
  const lead = leads.find(l => l.id === leadId);
  const leadProposal = proposals.find(p => p.leadId === leadId);
  const leadEngagementLetter = engagementLetters.find(el => el.leadId === leadId && el.signedDate);

  const convertToExtendedHandover = (handover: Handover, serviceLine: string, projectPeriod: string): ExtendedHandover => {
    const handoverWithExtras = handover as any;
    return {
      id: handover.id,
      leadId: handover.leadId,
      documentCode: handoverWithExtras.documentCode,
      classification: handoverWithExtras.classification,
      projectName: handoverWithExtras.projectName || handover.projectTitle,
      clientName: handover.clientName,
      companyGroup: handoverWithExtras.companyGroup,
      serviceLine: handoverWithExtras.serviceLine || serviceLine,
      projectPeriod: handoverWithExtras.projectPeriod || projectPeriod,
      clientPic: handoverWithExtras.clientPic,
      clientEmail: handoverWithExtras.clientEmail,
      clientPhone: handoverWithExtras.clientPhone,
      engagementLetterStatus: handoverWithExtras.engagementLetterStatus,
      proposalReference: handoverWithExtras.proposalReference,
      background: handoverWithExtras.background || handover.summary || handover.notes,
      scopeIncluded: handoverWithExtras.scopeIncluded,
      scopeExclusions: handoverWithExtras.scopeExclusions,
      deliverables: handoverWithExtras.deliverablesExtended,
      milestones: handoverWithExtras.milestones,
      feeStructure: handoverWithExtras.feeStructure,
      paymentTermsText: handoverWithExtras.paymentTermsText,
      documentsReceived: handoverWithExtras.documentsReceived,
      storageLocation: handoverWithExtras.storageLocation,
      dataRequirements: handoverWithExtras.dataRequirements,
      risks: handoverWithExtras.risks,
      communicationInternal: handoverWithExtras.communicationInternal,
      communicationExternal: handoverWithExtras.communicationExternal,
      externalContacts: handoverWithExtras.externalContacts,
      preliminaryTeam: handoverWithExtras.preliminaryTeam,
      handoverChecklist: handoverWithExtras.handoverChecklist,
      signOffs: handoverWithExtras.signOffs,
      workflowStatus: handoverWithExtras.workflowStatus || (handover.status === 'WAITING_CEO_APPROVAL' ? 'SUBMITTED_TO_CEO' : handover.status === 'APPROVED' || handover.status === 'CONVERTED' ? 'APPROVED_BY_CEO' : 'HANDOVER_DRAFT'),
      submittedToCeoAt: handoverWithExtras.submittedToCeoAt,
      createdAt: handover.createdAt,
      lastModifiedAt: handoverWithExtras.lastModifiedAt,
      scopeLocked: handoverWithExtras.scopeLocked,
      proposalId: handoverWithExtras.proposalId,
      revisionComments: handoverWithExtras.revisionComments || []
    };
  };

  const handleSaveDraft = (handoverData: Partial<ExtendedHandover>) => {
    const handover: Handover & { serviceLine?: string; projectPeriod?: string } = {
      id: handoverData.id || `ho-${Date.now()}`,
      leadId: leadId,
      clientName: handoverData.clientName || lead?.clientName || '',
      projectTitle: handoverData.projectName || lead?.company || 'Project',
      pm: handoverData.preliminaryTeam?.[0]?.name || '',
      status: handoverData.workflowStatus === 'SUBMITTED_TO_CEO' ? 'WAITING_CEO_APPROVAL' : 'DRAFT',
      createdBy: 'Current User',
      createdAt: handoverData.createdAt || new Date().toISOString().split('T')[0],
      summary: handoverData.background,
      deliverables: handoverData.deliverables?.map(d => d.name) || [],
      notes: handoverData.background,
      serviceLine: handoverData.serviceLine || leadProposal?.service || '',
      projectPeriod: handoverData.projectPeriod || ''
    };
    if (editingHandover) onUpdateHandover(handover.id, handover);
    else onAddHandover(handover);
    setShowHandoverForm(false);
    setEditingHandover(undefined);
  };

  const handleSubmit = (handoverData: Partial<ExtendedHandover>) => {
    const deliverablesArray: string[] = Array.isArray(handoverData.deliverables)
      ? (handoverData.deliverables as any[]).map((d: any) => (typeof d === 'string' ? d : d?.name || '')).filter(Boolean)
      : [];
    const handover: Handover & { serviceLine?: string; projectPeriod?: string; workflowStatus?: string; revisionComments?: any[]; [key: string]: any } = {
      id: handoverData.id || `ho-${Date.now()}`,
      leadId: leadId,
      clientName: handoverData.clientName || lead?.clientName || '',
      projectTitle: handoverData.projectName || lead?.company || 'Project',
      pm: handoverData.preliminaryTeam?.[0]?.name || '',
      status: 'WAITING_CEO_APPROVAL',
      createdBy: 'Current User',
      createdAt: handoverData.createdAt || new Date().toISOString().split('T')[0],
      summary: handoverData.background,
      deliverables: deliverablesArray,
      notes: handoverData.background,
      serviceLine: handoverData.serviceLine || leadProposal?.service || '',
      projectPeriod: handoverData.projectPeriod || '',
      ...(Object.fromEntries(Object.entries(handoverData).filter(([key]) => key !== 'deliverables')) as any),
      workflowStatus: 'SUBMITTED_TO_CEO',
      revisionComments: [],
      submittedToCeoAt: new Date().toISOString(),
      lastModifiedAt: new Date().toISOString()
    };
    if (editingHandover) onUpdateHandover(handover.id, handover);
    else onAddHandover(handover);
    setShowHandoverForm(false);
    setEditingHandover(undefined);
    onUpdateLeadStatus(leadId, 'HANDOVER_SUBMITTED' as LeadStatus);
  };

  const isEditingHandoverConverted = editingHandover?.id
    ? !!projectApi.getProjectIdByHandoverId(editingHandover.id)
    : false;

  if (showHandoverForm) {
    return (
      <BdExecutiveHandoverPage
        handoverId={editingHandover?.id}
        proposalId={leadProposal?.id}
        leadId={leadId}
        onBack={() => {
          setShowHandoverForm(false);
          setEditingHandover(undefined);
        }}
        onSaveDraft={handleSaveDraft}
        onSubmit={handleSubmit}
        existingHandover={editingHandover}
        readOnly={readOnly || (editingHandover ? (editingHandover.workflowStatus === 'SUBMITTED_TO_CEO' || editingHandover.workflowStatus === 'APPROVED_BY_CEO' || (handovers.find(h => h.id === editingHandover.id)?.status === 'WAITING_CEO_APPROVAL' && editingHandover.workflowStatus !== 'REVISION_REQUESTED')) : false)}
        leadData={{
          clientName: lead?.clientName || '',
          companyName: lead?.company || '',
          service: leadProposal?.service || (lead as any)?.service || '',
          picName: lead?.clientName || '',
          picEmail: lead?.email || '',
          picPhone: lead?.phone || '',
          source: lead?.source || 'Other'
        }}
        engagementLetter={leadEngagementLetter ? { signedDate: leadEngagementLetter.signedDate, status: leadEngagementLetter.status } : undefined}
        onConvertToProject={onConvertToProject}
        showConvertButton={!isEditingHandoverConverted}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3>Handover Memo</h3>
        <LeadActionGuard action="edit" readOnly={readOnly}>
          <Button
            onClick={() => {
              setEditingHandover(undefined);
              setShowHandoverForm(true);
            }}
            className="flex items-center gap-2 px-5 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Buat Handover Memo
          </Button>
        </LeadActionGuard>
      </div>

      {leadHandovers.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
          <p className="text-gray-600">Belum ada Handover Memo</p>
          <p className="text-sm text-gray-500 mt-1">Handover Memo dibuat setelah Engagement Letter ditandatangani</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leadHandovers.map((handover) => {
            const handoverWithExtras = handover as Handover & { serviceLine?: string; projectPeriod?: string };
            const serviceLine = handoverWithExtras.serviceLine || leadProposal?.service || '';
            const projectPeriod = handoverWithExtras.projectPeriod || '';
            const isConverted = !!projectApi.getProjectIdByHandoverId(handover.id);
            return (
              <div
                key={handover.id}
                className="border rounded-lg p-4 border-gray-200 hover:border-gray-300 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4>{handover.projectTitle}</h4>
                      <StatusChip status={isConverted ? 'CONVERTED' : handover.status} />
                    </div>
                    <p className="text-sm text-gray-600">
                      {lead?.company || handover.clientName}
                      {serviceLine && ` • ${serviceLine}`}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-gray-600">Project Period</p>
                    <p className="font-medium">{projectPeriod || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Created By</p>
                    <p className="font-medium">{handover.createdBy}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Created</p>
                    <p className="font-medium">
                      {handover.createdAt
                        ? new Date(handover.createdAt).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : '-'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                  {readOnly ? (
                    <button
                      onClick={() => {
                        setEditingHandover(convertToExtendedHandover(handover, serviceLine, projectPeriod));
                        setShowHandoverForm(true);
                      }}
                      className="flex-1 px-3 py-2 rounded-lg text-sm cursor-pointer border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 flex items-center justify-center"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </button>
                  ) : (
                  <LeadActionGuard action="edit" readOnly={readOnly}>
                  {(handover.status === 'APPROVED' || handover.status === 'CONVERTED') ? (
                    <>
                      <button
                        onClick={() => {
                          setEditingHandover(convertToExtendedHandover(handover, serviceLine, projectPeriod));
                          setShowHandoverForm(true);
                        }}
                        className="flex-1 px-3 py-2 rounded-lg text-sm cursor-pointer border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 flex items-center justify-center"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </button>
                      {handover.status === 'APPROVED' && !isConverted && (
                        <button
                          onClick={() => {
                            if (onConvertToProject) onConvertToProject(handover.id);
                            else console.log('Convert to project:', handover.id);
                          }}
                          className="flex-1 px-3 py-2 rounded-lg text-sm cursor-pointer border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center"
                        >
                          <ArrowRight className="w-4 h-4 mr-2" />
                          Convert to Project
                        </button>
                      )}
                    </>
                  ) : handover.status === 'WAITING_CEO_APPROVAL' && (handover as any).workflowStatus !== 'REVISION_REQUESTED' ? (
                    <button
                      onClick={() => {
                        setEditingHandover(convertToExtendedHandover(handover, serviceLine, projectPeriod));
                        setShowHandoverForm(true);
                      }}
                      className="flex-1 px-3 py-2 rounded-lg text-sm cursor-pointer border border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
                    >
                      <Eye className="w-4 h-4 mr-2 inline" />
                      View Details
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingHandover(convertToExtendedHandover(handover, serviceLine, projectPeriod));
                        setShowHandoverForm(true);
                      }}
                      className="flex-1 px-3 py-2 rounded-lg text-sm cursor-pointer border border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
                    >
                      <Edit className="w-4 h-4 mr-2 inline" />
                      Edit
                    </button>
                  )}
                  </LeadActionGuard>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
