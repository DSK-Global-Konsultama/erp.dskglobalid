import { useState } from 'react';
import { Plus } from 'lucide-react';
import { StatusChip } from '../shared/StatusChip';
import { BdHandoverForm } from '../modals/BdHandoverForm';
import type { Handover, Lead, Proposal, EngagementLetter } from '../../../../lib/mock-data';
import type { ExtendedHandover } from '../../../../lib/projectWorkflowTypes';
import type { LeadStatus } from '../management/LeadTrackerDetail';

interface HandoverMemoTabProps {
  leadId: string;
  leads: Lead[];
  handovers: Handover[];
  proposals?: Proposal[];
  engagementLetters?: EngagementLetter[];
  onAddHandover: (handover: Handover) => void;
  onUpdateHandover: (id: string, updates: Partial<Handover>) => void;
  onUpdateLeadStatus: (leadId: string, status: LeadStatus) => void;
}

export function HandoverMemoTab({ 
  leadId, 
  leads, 
  handovers, 
  proposals = [],
  engagementLetters = [],
  onAddHandover, 
  onUpdateHandover,
  onUpdateLeadStatus 
}: HandoverMemoTabProps) {
  const [showHandoverForm, setShowHandoverForm] = useState(false);
  const [showHandoverDetail, setShowHandoverDetail] = useState(false);
  const [selectedHandover, setSelectedHandover] = useState<Handover | null>(null);
  const [editingHandover, setEditingHandover] = useState<ExtendedHandover | undefined>(undefined);
  const leadHandovers = handovers.filter(h => h.leadId === leadId);
  const lead = leads.find(l => l.id === leadId);
  const leadProposal = proposals.find(p => p.leadId === leadId);
  const leadEL = engagementLetters.find(el => el.leadId === leadId);

  const handleSaveDraft = (handoverData: Partial<ExtendedHandover>) => {
    // Convert ExtendedHandover to Handover format for storage
    const handover: Handover = {
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
      notes: handoverData.background
    };
    
    if (editingHandover) {
      onUpdateHandover(handover.id, handover);
    } else {
      onAddHandover(handover);
    }
    setShowHandoverForm(false);
    setEditingHandover(undefined);
  };

  const handleSubmit = (handoverData: Partial<ExtendedHandover>) => {
    // Convert ExtendedHandover to Handover format for storage
    const handover: Handover = {
      id: handoverData.id || `ho-${Date.now()}`,
      leadId: leadId,
      clientName: handoverData.clientName || lead?.clientName || '',
      projectTitle: handoverData.projectName || lead?.company || 'Project',
      pm: handoverData.preliminaryTeam?.[0]?.name || '',
      status: 'WAITING_CEO_APPROVAL',
      createdBy: 'Current User',
      createdAt: handoverData.createdAt || new Date().toISOString().split('T')[0],
      summary: handoverData.background,
      deliverables: handoverData.deliverables?.map(d => d.name) || [],
      notes: handoverData.background
    };
    
    if (editingHandover) {
      onUpdateHandover(handover.id, handover);
    } else {
      onAddHandover(handover);
    }
    setShowHandoverForm(false);
    setEditingHandover(undefined);
    onUpdateLeadStatus(leadId, 'HANDOVER_SUBMITTED' as LeadStatus);
  };

  if (showHandoverForm) {
    return (
      <BdHandoverForm
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
        leadData={{
          clientName: lead?.clientName || '',
          service: leadProposal?.service || (lead as any)?.service || '',
          picName: lead?.clientName || '',
          picEmail: lead?.email || '',
          picPhone: lead?.phone || '',
          source: lead?.source || 'Other'
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3>Handover Memo</h3>
        <button 
          onClick={() => {
            setEditingHandover(undefined);
            setShowHandoverForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Buat Handover Memo
        </button>
      </div>
      {leadHandovers.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">Belum ada Handover Memo</p>
          <p className="text-sm text-gray-500 mt-1">Handover Memo dibuat setelah Engagement Letter ditandatangani</p>
        </div>
      ) : (
        <div className="space-y-4">
          {leadHandovers.map((handover) => (
            <div 
              key={handover.id} 
              className="border rounded-lg p-4 border-gray-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4>{handover.projectTitle}</h4>
                    <StatusChip status={handover.status} />
                  </div>
                  <p className="text-sm text-gray-600">Client: {handover.clientName}</p>
                  {handover.pm && (
                    <p className="text-sm text-gray-600">PM: {handover.pm}</p>
                  )}
                  <p className="text-sm text-gray-600">Created: {handover.createdAt}</p>
                </div>
              </div>
              {handover.summary && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">Summary</p>
                  <p className="text-gray-700">{handover.summary}</p>
                </div>
              )}
              {handover.deliverables && handover.deliverables.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">Deliverables</p>
                  <ul className="list-disc list-inside text-gray-700">
                    {handover.deliverables.map((deliverable, idx) => (
                      <li key={idx}>{deliverable}</li>
                    ))}
                  </ul>
                </div>
              )}
              {handover.notes && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">Notes</p>
                  <p className="text-gray-700">{handover.notes}</p>
                </div>
              )}
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                <button 
                  onClick={() => {
                    setSelectedHandover(handover);
                    setShowHandoverDetail(true);
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                >
                  View Details
                </button>
                <button 
                  onClick={() => {
                    // Convert Handover to ExtendedHandover for editing
                    const extendedHandover: ExtendedHandover = {
                      id: handover.id,
                      leadId: handover.leadId,
                      clientName: handover.clientName,
                      projectName: handover.projectTitle,
                      background: handover.summary || handover.notes,
                      workflowStatus: handover.status === 'WAITING_CEO_APPROVAL' ? 'SUBMITTED_TO_CEO' : 'HANDOVER_DRAFT',
                      createdAt: handover.createdAt
                    };
                    setEditingHandover(extendedHandover);
                    setShowHandoverForm(true);
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Handover Detail Modal */}
      {showHandoverDetail && selectedHandover && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Handover Memo Detail</h2>
              <button 
                onClick={() => {
                  setShowHandoverDetail(false);
                  setSelectedHandover(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Client Name</label>
                <p className="font-medium">{selectedHandover.clientName}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Project Title</label>
                <p className="font-medium">{selectedHandover.projectTitle}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Project Manager</label>
                <p className="font-medium">{selectedHandover.pm || '-'}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Status</label>
                <StatusChip status={selectedHandover.status} />
              </div>
              {selectedHandover.summary && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Summary</label>
                  <p className="font-medium">{selectedHandover.summary}</p>
                </div>
              )}
              {selectedHandover.deliverables && selectedHandover.deliverables.length > 0 && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Deliverables</label>
                  <ul className="list-disc list-inside">
                    {selectedHandover.deliverables.map((deliverable, idx) => (
                      <li key={idx} className="font-medium">{deliverable}</li>
                    ))}
                  </ul>
                </div>
              )}
              {selectedHandover.notes && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Notes</label>
                  <p className="font-medium">{selectedHandover.notes}</p>
                </div>
              )}
              <div>
                <label className="block text-sm text-gray-600 mb-1">Created By</label>
                <p className="font-medium">{selectedHandover.createdBy}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Created At</label>
                <p className="font-medium">
                  {new Date(selectedHandover.createdAt).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

