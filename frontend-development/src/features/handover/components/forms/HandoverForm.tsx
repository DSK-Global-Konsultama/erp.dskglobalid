import { useState, useEffect, useCallback } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Send,
  ArrowRight
} from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import type { 
  ExtendedHandover, 
  Deliverable, 
  Milestone, 
  TeamMember,
  FeeStructureItem,
  ChecklistItem,
  SignOff,
  ExternalContact
} from '../../../../lib/projectWorkflowTypes';
import type { SectionId } from '../../types';
import { ALL_SECTIONS, TOTAL_SECTIONS } from '../../types';
import { HANDOVER_CONSTANTS, SECTION_NAMES } from '../../constants';
import { ProjectInformationSection } from '../sections/ProjectInformationSection';
import { BackgroundSummarySection } from '../sections/BackgroundSummarySection';
import { ScopeOfWorkSection } from '../sections/ScopeOfWorkSection';
import { FeeStructureSection } from '../sections/FeeStructureSection';
import { ClientDocumentsSection } from '../sections/ClientDocumentsSection';
import { DataRequirementsSection } from '../sections/DataRequirementsSection';
import { RisksSection } from '../sections/RisksSection';
import { CommunicationProtocolSection } from '../sections/CommunicationProtocolSection';
import { TeamAssignmentSection } from '../sections/TeamAssignmentSection';
import { HandoverChecklistSection } from '../sections/HandoverChecklistSection';
import { SignOffSection } from '../sections/SignOffSection';

interface HandoverFormProps {
  handoverId?: string;
  proposalId?: string;
  leadId?: string;
  onBack: () => void;
  onSaveDraft: (handover: Partial<ExtendedHandover>) => void;
  onSubmit: (handover: Partial<ExtendedHandover>) => void;
  existingHandover?: ExtendedHandover;
  readOnly?: boolean;
  onConvertToProject?: (handoverId: string) => void;
  leadData?: {
    clientName: string;
    companyName?: string; // Nama perusahaan
    service: string;
    picName: string;
    picEmail: string;
    picPhone: string;
    source: string;
  };
  engagementLetter?: {
    signedDate?: string;
    status?: string;
  };
}

export function HandoverForm({ 
  handoverId, 
  proposalId,
  leadId,
  onBack, 
  onSaveDraft, 
  onSubmit,
  existingHandover,
  readOnly = false,
  leadData,
  engagementLetter,
  onConvertToProject
}: HandoverFormProps) {
  // Default: semua section terbuka
  const [expandedSections, setExpandedSections] = useState<Set<SectionId>>(
    new Set(ALL_SECTIONS)
  );
  
  // Document Header
  const [documentCode, setDocumentCode] = useState(existingHandover?.documentCode || '');
  const classification = HANDOVER_CONSTANTS.CLASSIFICATION;
  
  // CEO Revision
  const isRevisionRequested = existingHandover?.workflowStatus === 'REVISION_REQUESTED';
  const revisionComments = existingHandover?.revisionComments || [];
  
  // Check if handover is approved
  const isApproved = existingHandover?.workflowStatus === 'APPROVED_BY_CEO';
  
  // When approved, all sections are locked (read-only)
  const effectiveReadOnly = readOnly || isApproved;
  
  // Section 3 Locking
  const isScopeLocked = existingHandover?.scopeLocked || false;
  
  // Section 1: PROJECT INFORMATION
  const [projectName, setProjectName] = useState(existingHandover?.projectName || '');
  const [clientName, setClientName] = useState(existingHandover?.clientName || leadData?.companyName || leadData?.clientName || '');
  const [companyGroup, setCompanyGroup] = useState(existingHandover?.companyGroup || '');
  const [serviceLine, setServiceLine] = useState(existingHandover?.serviceLine || leadData?.service || '');
  const [projectStartDate, setProjectStartDate] = useState(
    existingHandover?.projectPeriod?.split(' – ')[0] || ''
  );
  const [projectEndDate, setProjectEndDate] = useState(
    existingHandover?.projectPeriod?.split(' – ')[1] || ''
  );
  const [clientPic, setClientPic] = useState(existingHandover?.clientPic || leadData?.picName || '');
  const [clientEmail, setClientEmail] = useState(existingHandover?.clientEmail || leadData?.picEmail || '');
  const [clientPhone, setClientPhone] = useState(existingHandover?.clientPhone || leadData?.picPhone || '');
  const [engagementLetterStatus, setEngagementLetterStatus] = useState(
    existingHandover?.engagementLetterStatus || 
    (engagementLetter?.signedDate 
      ? `Signed on ${new Date(engagementLetter.signedDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`
      : '')
  );
  const [proposalReference, setProposalReference] = useState(existingHandover?.proposalReference || '');
  
  // Section 2: BACKGROUND SUMMARY
  const [background, setBackground] = useState(existingHandover?.background || '');
  
  // Section 3: FINALIZED SCOPE OF WORK
  const [scopeIncluded, setScopeIncluded] = useState<string[]>(
    existingHandover?.scopeIncluded || ['']
  );
  const [scopeExclusions, setScopeExclusions] = useState<string[]>(
    existingHandover?.scopeExclusions || ['']
  );
  const [deliverables, setDeliverables] = useState<Partial<Deliverable>[]>(
    existingHandover?.deliverables || 
    (existingHandover as any)?.deliverablesExtended || 
    [{ name: '', description: '' }]
  );
  const [milestones, setMilestones] = useState<Partial<Milestone>[]>(
    existingHandover?.milestones || [{ name: '', targetDate: '', description: '' }]
  );
  
  // Section 4: FEE STRUCTURE & PAYMENT TERMS
  const [feeStructure, setFeeStructure] = useState<Partial<FeeStructureItem>[]>(
    existingHandover?.feeStructure || [{ description: '', amount: 0 }]
  );
  const [paymentTermsText, setPaymentTermsText] = useState(
    existingHandover?.paymentTermsText || ''
  );
  
  // Section 5: CLIENT-PROVIDED DOCUMENTS
  const [documentsReceived, setDocumentsReceived] = useState<Array<{ 
    fileName: string; 
    file?: File; 
    fileUrl?: string; 
    uploadedAt?: string;
    uploadedBy?: string;
    uploadDate?: string;
  }>>(
    existingHandover?.documentsReceived?.map(d => ({
      fileName: d.fileName,
      fileUrl: d.fileUrl,
      uploadedAt: (d as any).uploadedAt || d.receivedDate,
      uploadedBy: d.uploadedBy,
      uploadDate: d.uploadDate || d.receivedDate
    })) || [{ fileName: '' }]
  );
  const storageLocation = existingHandover?.storageLocation || '';
  
  // Section 6: DATA REQUIREMENTS (OUTSTANDING)
  const [dataRequirements, setDataRequirements] = useState<string[]>(
    existingHandover?.dataRequirements?.map(d => d.itemName) || ['']
  );
  
  // Section 7: KEY RISKS / RED FLAGS
  const [risks, setRisks] = useState<string[]>(
    existingHandover?.risks?.map(r => r.description) || ['']
  );
  
  // Section 8: COMMUNICATION PROTOCOL
  const [communicationInternal, setCommunicationInternal] = useState(
    existingHandover?.communicationInternal || ''
  );
  const [communicationExternal, setCommunicationExternal] = useState(
    existingHandover?.communicationExternal || ''
  );
  const [externalContacts, setExternalContacts] = useState<Partial<ExternalContact>[]>(
    existingHandover?.externalContacts || [{ role: '', name: '', email: '', phone: '', company: '' }]
  );
  
  // Section 9: PROJECT TEAM ASSIGNMENT
  const [preliminaryTeam, setPreliminaryTeam] = useState<Partial<TeamMember>[]>(
    existingHandover?.preliminaryTeam || [{ role: '', name: '', allocation: '' }]
  );
  
  // Section 10: HANDOVER CHECKLIST
  const [handoverChecklist, setHandoverChecklist] = useState<Partial<ChecklistItem>[]>(
    existingHandover?.handoverChecklist || [{ description: '', status: 'Pending' }]
  );
  
  // Section 11: SIGN-OFF
  const [signOffs, setSignOffs] = useState<Partial<SignOff>[]>(
    existingHandover?.signOffs || [{ role: '', name: '', signedAt: '', notes: '' }]
  );
  
  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showValidation, setShowValidation] = useState(false);
  
  // Auto-expand first revision section on mount
  useEffect(() => {
    if (isRevisionRequested && revisionComments.length > 0) {
      const firstComment = revisionComments[0];
      const sectionName = firstComment.sectionName;
      
      // Map section name to section ID
      let sectionId: SectionId = 1;
      if (sectionName.includes('PROJECT INFORMATION')) sectionId = 1;
      else if (sectionName.includes('BACKGROUND')) sectionId = 2;
      else if (sectionName.includes('SCOPE')) sectionId = 3;
      else if (sectionName.includes('FEE')) sectionId = 4;
      else if (sectionName.includes('DOCUMENTS')) sectionId = 5;
      else if (sectionName.includes('DATA REQUIREMENTS')) sectionId = 6;
      else if (sectionName.includes('RISKS')) sectionId = 7;
      else if (sectionName.includes('COMMUNICATION')) sectionId = 8;
      else if (sectionName.includes('TEAM')) sectionId = 9;
      else if (sectionName.includes('CHECKLIST')) sectionId = 10;
      else if (sectionName.includes('SIGN-OFF')) sectionId = 11;
      
      // Ensure the section with revision is expanded
      setExpandedSections(prev => new Set([...prev, sectionId]));
    }
  }, [isRevisionRequested, revisionComments]);
  
  // Section completion tracking - memoized for performance
  const getSectionCompletion = useCallback((sectionId: SectionId): boolean => {
    switch (sectionId) {
      case 1:
        return !!(projectName && clientName && clientPic && clientEmail && projectStartDate && projectEndDate && serviceLine);
      case 2:
        return !!(background && background.length > 20);
      case 3:
        return scopeIncluded.filter(s => s.trim()).length > 0 && 
               deliverables.filter(d => d.name).length > 0 &&
               milestones.filter(m => m.name && m.targetDate).length > 0;
      case 4:
        return feeStructure.filter(f => f.description && f.amount).length > 0;
      case 5:
        return documentsReceived.filter(d => d.fileName.trim()).length > 0;
      case 6:
        return dataRequirements.filter(d => d.trim()).length > 0;
      case 7:
        return risks.filter(r => r.trim()).length > 0;
      case 8:
        return !!(communicationInternal && externalContacts.filter(c => c.name).length > 0);
      case 9:
        return preliminaryTeam.filter(t => t.role && t.name).length > 0;
      case 10:
        return handoverChecklist.filter(c => c.description).length > 0;
      case 11:
        return signOffs.filter(s => s.role && s.name).length > 0;
      default:
        return false;
    }
  }, [
    projectName, clientName, clientPic, clientEmail, projectStartDate, projectEndDate, serviceLine,
    background, scopeIncluded, deliverables, milestones, feeStructure, documentsReceived,
    dataRequirements, risks, communicationInternal, externalContacts, preliminaryTeam,
    handoverChecklist, signOffs
  ]);
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Section 1
    if (!documentCode) newErrors.documentCode = 'Document code is required';
    if (!projectName) newErrors.projectName = 'Project name is required';
    if (!clientName) newErrors.clientName = 'Client name is required';
    if (!serviceLine) newErrors.serviceLine = 'Service line is required';
    if (!clientPic) newErrors.clientPic = 'Client PIC is required';
    if (!clientEmail) newErrors.clientEmail = 'Client email is required';
    if (!projectStartDate) newErrors.projectStartDate = 'Project start date is required';
    if (!projectEndDate) newErrors.projectEndDate = 'Project end date is required';
    
    // Section 2
    if (!background || background.length < HANDOVER_CONSTANTS.MIN_BACKGROUND_LENGTH) {
      newErrors.background = `Background summary is required (min ${HANDOVER_CONSTANTS.MIN_BACKGROUND_LENGTH} characters)`;
    }
    
    // Section 3
    if (scopeIncluded.filter(s => s.trim()).length === 0) {
      newErrors.scopeIncluded = 'At least one scope item is required';
    }
    if (deliverables.filter(d => d.name).length === 0) {
      newErrors.deliverables = 'At least one deliverable is required';
    }
    if (milestones.filter(m => m.name && m.targetDate).length === 0) {
      newErrors.milestones = 'At least one milestone is required';
    }
    
    // Section 4
    if (feeStructure.filter(f => f.description && f.amount).length === 0) {
      newErrors.feeStructure = 'Fee structure is required';
    }
    
    // Section 8
    if (!communicationInternal) newErrors.communicationInternal = 'Internal communication protocol is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSaveDraft = () => {
    const handoverData: Partial<ExtendedHandover> = {
      id: handoverId,
      documentCode,
      classification,
      projectName,
      clientName,
      companyGroup,
      serviceLine,
      projectPeriod: projectStartDate && projectEndDate ? `${projectStartDate} – ${projectEndDate}` : '',
      clientPic,
      clientEmail,
      clientPhone,
      engagementLetterStatus,
      proposalReference,
      background,
      scopeIncluded: scopeIncluded.filter(s => s.trim()),
      scopeExclusions: scopeExclusions.filter(s => s.trim()),
      deliverables: deliverables.filter(d => d.name).map((d, i) => ({
        id: d.id || `DEL-${Date.now()}-${i}`,
        name: d.name!,
        description: d.description || '',
        quantity: d.quantity || 1,
        dueDate: d.dueDate,
        assignedTo: d.assignedTo
      })),
      milestones: milestones.filter(m => m.name && m.targetDate).map((m, i) => ({
        id: m.id || `MS-${Date.now()}-${i}`,
        name: m.name!,
        targetDate: m.targetDate!,
        description: m.description
      })),
      feeStructure: feeStructure.filter(f => f.description && f.amount).map((f, i) => ({
        id: f.id || `FEE-${Date.now()}-${i}`,
        description: f.description!,
        amount: f.amount!,
        percentage: f.percentage,
        dueDate: f.dueDate,
        status: f.status || 'Pending'
      })),
      paymentTermsText,
      documentsReceived: documentsReceived.filter(d => d.fileName.trim() || d.file || d.fileUrl).map(d => ({
        fileName: d.fileName,
        fileUrl: d.fileUrl,
        receivedDate: d.uploadedAt || new Date().toISOString().split('T')[0],
        uploadedBy: d.uploadedBy || 'Current User', // TODO: Replace with actual user from auth context
        uploadDate: d.uploadDate || d.uploadedAt || new Date().toISOString()
      })),
      storageLocation,
      dataRequirements: [],
      risks: risks.filter(r => r.trim()).map((r, i) => ({
        id: `RISK-${Date.now()}-${i}`,
        description: r,
        impact: 'Medium' as const,
        mitigation: ''
      })),
      communicationInternal,
      communicationExternal,
      externalContacts: externalContacts.filter(c => c.name).map((c, i) => ({
        id: c.id || `CONT-${Date.now()}-${i}`,
        role: c.role!,
        name: c.name!,
        email: c.email || '',
        phone: c.phone || '',
        company: c.company || ''
      })),
      preliminaryTeam: preliminaryTeam.filter(t => t.role && t.name).map((t, i) => ({
        id: t.id || `TM-${Date.now()}-${i}`,
        role: t.role!,
        name: t.name!,
        allocation: t.allocation
      })),
      handoverChecklist: handoverChecklist.filter(c => c.description).map((c, i) => ({
        id: c.id || `CHK-${Date.now()}-${i}`,
        description: c.description!,
        status: c.status || 'Pending'
      })),
      signOffs: signOffs.filter(s => s.role && s.name).map((s, i) => ({
        id: s.id || `SIGN-${Date.now()}-${i}`,
        role: s.role!,
        name: s.name!,
        signedAt: s.signedAt,
        notes: s.notes
      })),
      workflowStatus: 'HANDOVER_DRAFT',
      communicationProtocol: '',
      escalationPath: '',
      leadId
    };
    
    onSaveDraft(handoverData);
  };
  
  const handleSubmit = () => {
    setShowValidation(true);
    
    if (!validateForm()) {
      // TODO: Replace with toast notification
      // toast.error('Mohon lengkapi semua field yang wajib diisi');
      alert('Mohon lengkapi semua field yang wajib diisi');
      const firstErrorSection = Object.keys(errors)[0];
      if (firstErrorSection) {
        let errorSectionId: SectionId = 1;
        if (firstErrorSection.includes('document') || firstErrorSection.includes('project') || firstErrorSection.includes('client')) errorSectionId = 1;
        else if (firstErrorSection.includes('background')) errorSectionId = 2;
        else if (firstErrorSection.includes('scope') || firstErrorSection.includes('deliverables') || firstErrorSection.includes('milestones')) errorSectionId = 3;
        else if (firstErrorSection.includes('fee')) errorSectionId = 4;
        else if (firstErrorSection.includes('communication')) errorSectionId = 8;
        setExpandedSections(prev => new Set([...prev, errorSectionId]));
      }
      return;
    }
    
    const handoverData: Partial<ExtendedHandover> = {
      id: handoverId || `HO-${Date.now()}`,
      documentCode,
      classification,
      projectName,
      clientName,
      companyGroup,
      serviceLine,
      projectPeriod: projectStartDate && projectEndDate ? `${projectStartDate} – ${projectEndDate}` : '',
      clientPic,
      clientEmail,
      clientPhone,
      engagementLetterStatus,
      proposalReference,
      background,
      scopeIncluded: scopeIncluded.filter(s => s.trim()),
      scopeExclusions: scopeExclusions.filter(s => s.trim()),
      deliverables: deliverables.filter(d => d.name).map((d, i) => ({
        id: d.id || `DEL-${Date.now()}-${i}`,
        name: d.name!,
        description: d.description || '',
        quantity: d.quantity || 1,
        dueDate: d.dueDate,
        assignedTo: d.assignedTo
      })),
      milestones: milestones.filter(m => m.name && m.targetDate).map((m, i) => ({
        id: m.id || `MS-${Date.now()}-${i}`,
        name: m.name!,
        targetDate: m.targetDate!,
        description: m.description
      })),
      feeStructure: feeStructure.filter(f => f.description && f.amount).map((f, i) => ({
        id: f.id || `FEE-${Date.now()}-${i}`,
        description: f.description!,
        amount: f.amount!,
        percentage: f.percentage,
        dueDate: f.dueDate,
        status: f.status || 'Pending'
      })),
      paymentTermsText,
      documentsReceived: documentsReceived.filter(d => d.fileName.trim() || d.file || d.fileUrl).map(d => ({
        fileName: d.fileName,
        fileUrl: d.fileUrl,
        receivedDate: d.uploadedAt || new Date().toISOString().split('T')[0],
        uploadedBy: d.uploadedBy || 'Current User', // TODO: Replace with actual user from auth context
        uploadDate: d.uploadDate || d.uploadedAt || new Date().toISOString()
      })),
      storageLocation,
      dataRequirements: [],
      risks: risks.filter(r => r.trim()).map((r, i) => ({
        id: `RISK-${Date.now()}-${i}`,
        description: r,
        impact: 'Medium' as const,
        mitigation: ''
      })),
      communicationInternal,
      communicationExternal,
      externalContacts: externalContacts.filter(c => c.name).map((c, i) => ({
        id: c.id || `CONT-${Date.now()}-${i}`,
        role: c.role!,
        name: c.name!,
        email: c.email || '',
        phone: c.phone || '',
        company: c.company || ''
      })),
      preliminaryTeam: preliminaryTeam.filter(t => t.role && t.name).map((t, i) => ({
        id: t.id || `TM-${Date.now()}-${i}`,
        role: t.role!,
        name: t.name!,
        allocation: t.allocation
      })),
      handoverChecklist: handoverChecklist.filter(c => c.description).map((c, i) => ({
        id: c.id || `CHK-${Date.now()}-${i}`,
        description: c.description!,
        status: c.status || 'Pending'
      })),
      signOffs: signOffs.filter(s => s.role && s.name).map((s, i) => ({
        id: s.id || `SIGN-${Date.now()}-${i}`,
        role: s.role!,
        name: s.name!,
        signedAt: s.signedAt,
        notes: s.notes
      })),
      workflowStatus: 'SUBMITTED_TO_CEO',
      submittedToCeoAt: new Date().toISOString(),
      createdAt: existingHandover?.createdAt || new Date().toISOString(),
      lastModifiedAt: new Date().toISOString(),
      communicationProtocol: communicationInternal,
      escalationPath: communicationExternal,
      leadId,
      proposalId
    };
    
    onSubmit(handoverData);
  };
  
  const toggleSection = useCallback((sectionId: SectionId) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  }, []);
  
  // Memoized helper to check revision for a section
  const getHasRevision = useCallback((sectionId: SectionId) => {
    const sectionName = SECTION_NAMES[sectionId];
    return revisionComments.some(r => 
      r.sectionName === `${sectionId}. ${sectionName}` || 
      r.sectionName === sectionName ||
      r.sectionName.includes(sectionName)
    );
  }, [revisionComments]);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Pipeline
        </Button>
        
        <div className={effectiveReadOnly ? 'pointer-events-none' : ''}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center text-2xl mb-2">{HANDOVER_CONSTANTS.DOCUMENT_TITLE}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="documentCode" className="mb-2 block">
                  Document Code <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="documentCode"
                  type="text"
                  value={documentCode}
                  onChange={(e) => setDocumentCode(e.target.value)}
                  placeholder="e.g., BD-HO-PT-MSM-2025-003"
                  disabled={effectiveReadOnly}
                  className={`${showValidation && errors.documentCode ? 'border-red-300' : ''} ${effectiveReadOnly ? 'disabled:opacity-100 disabled:text-gray-900' : ''}`}
                />
                {showValidation && errors.documentCode && (
                  <p className="text-xs text-red-600 mt-1">{errors.documentCode}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="classification" className="mb-2 block">Classification</Label>
                <Input
                  id="classification"
                  type="text"
                  value={classification}
                  disabled
                  className="bg-gray-50 disabled:opacity-100 disabled:text-gray-900"
                />
              </div>
            </div>
            
            {!effectiveReadOnly && !isApproved && (
              <div className="flex items-center justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={handleSaveDraft}
                >
                  <Save className="w-4 h-4" />
                  Save Draft
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="w-4 h-4" />
                  {isRevisionRequested ? 'Ajukan Ulang ke CEO' : 'Ajukan ke CEO'}
                </Button>
              </div>
            )}
            {isApproved && (
              <div className="flex items-center justify-end gap-3 pt-4">
                <Button
                  onClick={() => {
                    if (onConvertToProject && handoverId) {
                      onConvertToProject(handoverId);
                    } else {
                      // TODO: Implement convert to project logic
                      console.log('Convert to project:', handoverId);
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Convert to Project
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Progress Bar */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Form Completion</span>
            <span className="text-sm font-medium text-gray-900">
              {ALL_SECTIONS.filter(id => getSectionCompletion(id)).length} / {TOTAL_SECTIONS} Sections
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ 
                width: `${(ALL_SECTIONS.filter(id => getSectionCompletion(id)).length / TOTAL_SECTIONS) * 100}%` 
              }}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Form Sections */}
      {/* Section 1: PROJECT INFORMATION */}
      <ProjectInformationSection
        sectionId={1}
        projectName={projectName}
        clientName={clientName}
        companyGroup={companyGroup}
        serviceLine={serviceLine}
        projectStartDate={projectStartDate}
        projectEndDate={projectEndDate}
        clientPic={clientPic}
        clientEmail={clientEmail}
        clientPhone={clientPhone}
        engagementLetterStatus={engagementLetterStatus}
        proposalReference={proposalReference}
        onProjectNameChange={setProjectName}
        onClientNameChange={setClientName}
        onCompanyGroupChange={setCompanyGroup}
        onServiceLineChange={setServiceLine}
        onProjectStartDateChange={setProjectStartDate}
        onProjectEndDateChange={setProjectEndDate}
        onClientPicChange={setClientPic}
        onClientEmailChange={setClientEmail}
        onClientPhoneChange={setClientPhone}
        onEngagementLetterStatusChange={setEngagementLetterStatus}
        onProposalReferenceChange={setProposalReference}
        isExpanded={expandedSections.has(1)}
        isComplete={getSectionCompletion(1)}
        hasRevision={getHasRevision(1)}
        showValidation={showValidation}
        errors={errors}
        readOnly={effectiveReadOnly}
        revisionComments={revisionComments}
        onToggle={() => toggleSection(1)}
      />
      
      {/* Section 2: BACKGROUND SUMMARY */}
      <BackgroundSummarySection
        sectionId={2}
        background={background}
        onBackgroundChange={setBackground}
        isExpanded={expandedSections.has(2)}
        isComplete={getSectionCompletion(2)}
        hasRevision={getHasRevision(2)}
        showValidation={showValidation}
        error={errors.background}
        readOnly={effectiveReadOnly}
        revisionComments={revisionComments}
        onToggle={() => toggleSection(2)}
      />
      
      {/* Section 3: FINALIZED SCOPE OF WORK */}
      <ScopeOfWorkSection
        sectionId={3}
        scopeIncluded={scopeIncluded}
        scopeExclusions={scopeExclusions}
        deliverables={deliverables}
        milestones={milestones}
        isScopeLocked={isScopeLocked}
        onScopeIncludedChange={setScopeIncluded}
        onScopeExclusionsChange={setScopeExclusions}
        onDeliverablesChange={setDeliverables}
        onMilestonesChange={setMilestones}
        isExpanded={expandedSections.has(3)}
        isComplete={getSectionCompletion(3)}
        hasRevision={getHasRevision(3)}
        showValidation={showValidation}
        readOnly={effectiveReadOnly}
        revisionComments={revisionComments}
        onToggle={() => toggleSection(3)}
      />
      
      {/* Section 4: FEE STRUCTURE & PAYMENT TERMS */}
      <FeeStructureSection
        sectionId={4}
        feeStructure={feeStructure}
        paymentTermsText={paymentTermsText}
        onFeeStructureChange={setFeeStructure}
        onPaymentTermsTextChange={setPaymentTermsText}
        isExpanded={expandedSections.has(4)}
        isComplete={getSectionCompletion(4)}
        hasRevision={getHasRevision(4)}
        showValidation={showValidation}
        readOnly={effectiveReadOnly}
        revisionComments={revisionComments}
        onToggle={() => toggleSection(4)}
      />
      
      {/* Section 5: CLIENT-PROVIDED DOCUMENTS */}
      <ClientDocumentsSection
        sectionId={5}
        documentsReceived={documentsReceived}
        onDocumentsReceivedChange={setDocumentsReceived}
        isExpanded={expandedSections.has(5)}
        isComplete={getSectionCompletion(5)}
        hasRevision={getHasRevision(5)}
        showValidation={showValidation}
        readOnly={effectiveReadOnly}
        revisionComments={revisionComments}
        onToggle={() => toggleSection(5)}
      />
      
      {/* Section 6: DATA REQUIREMENTS (OUTSTANDING) */}
      <DataRequirementsSection
        sectionId={6}
        dataRequirements={dataRequirements}
        onDataRequirementsChange={setDataRequirements}
        isExpanded={expandedSections.has(6)}
        isComplete={getSectionCompletion(6)}
        hasRevision={getHasRevision(6)}
        showValidation={showValidation}
        readOnly={effectiveReadOnly}
        revisionComments={revisionComments}
        onToggle={() => toggleSection(6)}
      />
      
      {/* Section 7: KEY RISKS / RED FLAGS */}
      <RisksSection
        sectionId={7}
        risks={risks}
        onRisksChange={setRisks}
        isExpanded={expandedSections.has(7)}
        isComplete={getSectionCompletion(7)}
        hasRevision={getHasRevision(7)}
        showValidation={showValidation}
        readOnly={effectiveReadOnly}
        revisionComments={revisionComments}
        onToggle={() => toggleSection(7)}
      />
      
      {/* Section 8: COMMUNICATION PROTOCOL */}
      <CommunicationProtocolSection
        sectionId={8}
        communicationInternal={communicationInternal}
        communicationExternal={communicationExternal}
        externalContacts={externalContacts}
        onCommunicationInternalChange={setCommunicationInternal}
        onCommunicationExternalChange={setCommunicationExternal}
        onExternalContactsChange={setExternalContacts}
        isExpanded={expandedSections.has(8)}
        isComplete={getSectionCompletion(8)}
        hasRevision={getHasRevision(8)}
        showValidation={showValidation}
        error={errors.communicationInternal}
        readOnly={effectiveReadOnly}
        revisionComments={revisionComments}
        onToggle={() => toggleSection(8)}
      />
      
      {/* Section 9: PROJECT TEAM ASSIGNMENT */}
      <TeamAssignmentSection
        sectionId={9}
        preliminaryTeam={preliminaryTeam}
        onPreliminaryTeamChange={setPreliminaryTeam}
        isExpanded={expandedSections.has(9)}
        isComplete={getSectionCompletion(9)}
        hasRevision={getHasRevision(9)}
        showValidation={showValidation}
        readOnly={effectiveReadOnly}
        revisionComments={revisionComments}
        onToggle={() => toggleSection(9)}
      />
      
      {/* Section 10: HANDOVER CHECKLIST */}
      <HandoverChecklistSection
        sectionId={10}
        handoverChecklist={handoverChecklist}
        onHandoverChecklistChange={setHandoverChecklist}
        isExpanded={expandedSections.has(10)}
        isComplete={getSectionCompletion(10)}
        hasRevision={getHasRevision(10)}
        showValidation={showValidation}
        readOnly={effectiveReadOnly}
        revisionComments={revisionComments}
        onToggle={() => toggleSection(10)}
      />
      
      {/* Section 11: SIGN-OFF */}
      <SignOffSection
        sectionId={11}
        signOffs={signOffs}
        onSignOffsChange={setSignOffs}
        isExpanded={expandedSections.has(11)}
        isComplete={getSectionCompletion(11)}
        hasRevision={getHasRevision(11)}
        showValidation={showValidation}
        readOnly={effectiveReadOnly}
        revisionComments={revisionComments}
        onToggle={() => toggleSection(11)}
      />
      </div>
      
    </div>
  );
}

