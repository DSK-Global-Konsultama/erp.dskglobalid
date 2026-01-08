import { useState } from 'react';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Label } from '../../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { toast } from 'sonner';
import { HandoverForm } from '../../../handover/components/forms/HandoverForm';
import type { Project } from '../../../../lib/mock-data';
import { mockDeals, mockLeads, mockHandovers, mockProposals, mockEngagementLetters } from '../../../../lib/mock-data';
import type { ExtendedHandover } from '../../../../lib/projectWorkflowTypes';

interface CooProjectViewProps {
  project: Project;
  availablePMs: string[];
  onAssignPM: (projectId: string, pmName: string) => void;
  onBack: () => void;
}

/**
 * COO Project View
 * Allows COO to review project details and assign PM
 */
export function CooProjectView({
  project,
  availablePMs,
  onAssignPM,
  onBack
}: CooProjectViewProps) {
  const [selectedPM, setSelectedPM] = useState<string>('');

  const handleAssignPM = () => {
    if (!selectedPM) {
      toast.error('Please select a Project Manager');
      return;
    }
    onAssignPM(project.id, selectedPM);
    toast.success(`PM ${selectedPM} berhasil di-assign untuk project ${project.projectName}`);
  };

  // Get deal and lead information if available
  const deal = mockDeals.find(d => d.id === project.dealId);
  const lead = deal ? mockLeads.find(l => l.id === deal.leadId) : null;
  
  // Get proposal and engagement letter
  const proposal = lead ? mockProposals.find(p => p.leadId === lead.id) : undefined;
  const engagementLetter = lead ? mockEngagementLetters.find(el => el.leadId === lead.id) : undefined;
  
  // Get handover memo related to this project
  // First try to find by projectId, if not found, try by leadId and service name match
  let handoverRaw = mockHandovers.find(h => h.projectId === project.id);
  
  if (!handoverRaw && lead) {
    // Try to find handover by leadId and check if service matches
    const handoversForLead = mockHandovers.filter(h => h.leadId === lead.id);
    handoverRaw = handoversForLead.find(h => {
      const serviceLine = (h as any).serviceLine || '';
      return serviceLine.toLowerCase().includes(project.serviceName.toLowerCase()) ||
             project.serviceName.toLowerCase().includes(serviceLine.toLowerCase());
    });
    
    // If still not found, get the most recent handover for this lead
    if (!handoverRaw && handoversForLead.length > 0) {
      handoverRaw = handoversForLead[handoversForLead.length - 1];
    }
  }
  
  // Cast to ExtendedHandover with all fields including deliverablesExtended
  const handoverRawAny = handoverRaw as any;
  const handover: ExtendedHandover | undefined = handoverRaw ? {
    ...handoverRaw,
    // Keep all original fields
    ...handoverRawAny,
    // Ensure deliverablesExtended is preserved
    deliverablesExtended: handoverRawAny?.deliverablesExtended || handoverRawAny?.deliverables || [],
    // Map deliverables for compatibility (if deliverablesExtended exists, use it, otherwise convert deliverables string array to object array)
    deliverables: handoverRawAny?.deliverablesExtended || (
      handoverRawAny?.deliverables && Array.isArray(handoverRawAny.deliverables) && handoverRawAny.deliverables.length > 0 && typeof handoverRawAny.deliverables[0] === 'string'
        ? (handoverRawAny.deliverables as string[]).map((name: string, index: number) => ({
            id: `DEL-${index + 1}`,
            name,
            description: ''
          }))
        : handoverRawAny?.deliverables || []
    )
  } as ExtendedHandover : undefined;

  // If handover not found, show error
  if (!handover) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={onBack}
            className="px-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
          Handover memo belum tersedia untuk project ini
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Handover Memo Form - Read Only */}
      <HandoverForm
        handoverId={handover.id}
        proposalId={proposal?.id}
        leadId={handover.leadId}
        onBack={onBack}
        onSaveDraft={() => {}} // Not used in read-only mode
        onSubmit={() => {}} // Not used in read-only mode
        existingHandover={handover}
        readOnly={true}
        showConvertButton={false} // Hide convert to project button for COO
        leadData={{
          clientName: lead?.clientName || handover.clientName || '',
          companyName: lead?.company || handover.clientName || '',
          service: proposal?.service || project.serviceName || '',
          picName: lead?.clientName || '',
          picEmail: lead?.email || '',
          picPhone: lead?.phone || '',
          source: lead?.source || 'Other'
        }}
        engagementLetter={engagementLetter ? {
          signedDate: engagementLetter.signedDate,
          status: engagementLetter.status
        } : undefined}
      />
      
      {/* PM Assignment Section */}
      <div className="bg-white border-t border-gray-200 pt-6 mt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="pm-select" className="text-base font-semibold">Assign Project Manager</Label>
          <Select value={selectedPM} onValueChange={setSelectedPM}>
            <SelectTrigger id="pm-select" className="w-full max-w-md">
              <SelectValue placeholder="Pilih Project Manager" />
            </SelectTrigger>
            <SelectContent>
              {availablePMs.map(pm => (
                <SelectItem key={pm} value={pm}>{pm}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-500 mt-1">
            Pilih Project Manager yang akan ditugaskan untuk project ini
          </p>
        </div>
        
        {/* COO Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="px-6"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssignPM}
            disabled={!selectedPM}
            className="px-6 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Assign PM
          </Button>
        </div>
      </div>
    </div>
  );
}

