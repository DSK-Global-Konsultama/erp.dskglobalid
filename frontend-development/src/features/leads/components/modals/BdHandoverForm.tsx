import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Send, 
  AlertCircle, 
  Plus, 
  Trash2,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Lock
} from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Textarea } from '../../../../components/ui/textarea';
import { Label } from '../../../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
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

interface BdHandoverFormProps {
  handoverId?: string;
  proposalId?: string;
  leadId?: string;
  onBack: () => void;
  onSaveDraft: (handover: Partial<ExtendedHandover>) => void;
  onSubmit: (handover: Partial<ExtendedHandover>) => void;
  existingHandover?: ExtendedHandover;
  leadData?: {
    clientName: string;
    service: string;
    picName: string;
    picEmail: string;
    picPhone: string;
    source: string;
  };
}

type SectionId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export function BdHandoverForm({ 
  handoverId, 
  proposalId,
  leadId,
  onBack, 
  onSaveDraft, 
  onSubmit,
  existingHandover,
  leadData
}: BdHandoverFormProps) {
  // Default: semua section terbuka
  const [expandedSections, setExpandedSections] = useState<Set<SectionId>>(
    new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as SectionId[])
  );
  
  // Document Header
  const [documentCode, setDocumentCode] = useState(existingHandover?.documentCode || '');
  const classification = "Strictly Confidential – Internal Use Only";
  
  // CEO Revision
  const isRevisionRequested = existingHandover?.workflowStatus === 'REVISION_REQUESTED';
  const revisionComments = existingHandover?.revisionComments || [];
  
  // Section 3 Locking
  const isScopeLocked = existingHandover?.scopeLocked || false;
  
  // Section 1: PROJECT INFORMATION
  const [projectName, setProjectName] = useState(existingHandover?.projectName || '');
  const [clientName, setClientName] = useState(existingHandover?.clientName || leadData?.clientName || '');
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
  const [engagementLetterStatus, setEngagementLetterStatus] = useState(existingHandover?.engagementLetterStatus || '');
  const [proposalReference, setProposalReference] = useState(existingHandover?.proposalReference || '');
  
  // Section 2: BACKGROUND SUMMARY
  const [background, setBackground] = useState(existingHandover?.background || '');
  
  // Section 3: FINALIZED SCOPE OF WORK
  const [scopeIncluded, setScopeIncluded] = useState<string[]>(
    existingHandover?.scopeIncluded || [
      'Penyusunan Master File FY 2024.',
      'Penyusunan Local File FY 2024.',
      'Penyusunan Benchmarking Study baru.',
      'Review transaksi afiliasi dan analisis risiko TP.',
      'Sesi presentasi internal kepada manajemen PT MSM.'
    ]
  );
  const [scopeExclusions, setScopeExclusions] = useState<string[]>(
    existingHandover?.scopeExclusions || [
      'Penyusunan CbC Report.',
      'Penyusunan dokumentasi tahun sebelumnya.',
      'Layanan konsultasi tambahan di luar scope (misal: litigasi, keberatan, banding).'
    ]
  );
  const [deliverables, setDeliverables] = useState<Partial<Deliverable>[]>(
    existingHandover?.deliverables || [
      { name: 'Master File final', description: 'PDF & Word' },
      { name: 'Local File final', description: 'PDF & Word' },
      { name: 'Benchmarking Study', description: 'Excel + PDF' },
      { name: 'Management Presentation Slide', description: 'PPT' }
    ]
  );
  const [milestones, setMilestones] = useState<Partial<Milestone>[]>(
    existingHandover?.milestones || [
      { name: 'Kick-Off Meeting', targetDate: '2025-01-30', description: 'Setelah data awal diterima' },
      { name: 'Data Collection Completed', targetDate: '2025-02-05', description: 'Bergantung kelengkapan klien' },
      { name: 'Draft Master & Local File', targetDate: '2025-02-28', description: 'Draf awal' },
      { name: 'Review Session', targetDate: '2025-03-07', description: 'Bersama klien' },
      { name: 'Final Deliverables', targetDate: '2025-03-15', description: 'Deadline disepakati' }
    ]
  );
  
  // Section 4: FEE STRUCTURE & PAYMENT TERMS
  const [feeStructure, setFeeStructure] = useState<Partial<FeeStructureItem>[]>(
    existingHandover?.feeStructure || [
      { description: 'Professional Fee', amount: 165000000 },
      { description: 'DP / Initial Payment', amount: 80000000 },
      { description: 'Progress Billing', amount: 0 },
      { description: 'Final Payment', amount: 85000000 }
    ]
  );
  const [paymentTermsText, setPaymentTermsText] = useState(
    existingHandover?.paymentTermsText || 
    'Invoice DP telah diterbitkan 26 Januari 2025.\nPekerjaan dimulai setelah DP diterima (estimasi 27–29 Januari 2025).'
  );
  
  // Section 5: CLIENT-PROVIDED DOCUMENTS
  const [documentsReceived, setDocumentsReceived] = useState<string[]>(
    existingHandover?.documentsReceived?.map(d => d.fileName) || [
      'Financial statements FY 2023',
      'Draft TB FY 2024 (preliminary)',
      'Organizational structure',
      'List of related-party transactions',
      'Intercompany agreements (menunggu dari klien)',
      'Final audited FS 2024 (estimasi 5 Februari 2025)'
    ]
  );
  const [storageLocation, setStorageLocation] = useState(
    existingHandover?.storageLocation || '/DSK Global/Clients/PT MSM/Project Files/Raw Data/'
  );
  
  // Section 6: DATA REQUIREMENTS (OUTSTANDING)
  const [dataRequirements, setDataRequirements] = useState<string[]>(
    existingHandover?.dataRequirements?.map(d => d.itemName) || [
      'Laporan keuangan audited FY 2024',
      'Trial balance final FY 2024',
      'Final list transaksi afiliasi',
      'Contract purchase dengan entitas Singapura',
      'Service agreement dengan entitas Thailand',
      'Cost breakdown komponen bahan baku',
      'Struktur kepemilikan grup terbaru'
    ]
  );
  
  // Section 7: KEY RISKS / RED FLAGS
  const [risks, setRisks] = useState<string[]>(
    existingHandover?.risks?.map(r => r.description) || [
      'Data klien belum lengkap (intercompany agreement pending).',
      'Timeline ketat – final deliverable harus diselesaikan sebelum 15 Maret.',
      'Risiko scope creep apabila klien meminta analisis tambahan.',
      'Potensi risiko pajak karena review KPP sebelumnya.',
      '(Catatan internal: Divisi teknis harus memastikan dokumentasi konsisten, konservatif, dan defensible.)'
    ]
  );
  
  // Section 8: COMMUNICATION PROTOCOL
  const [communicationInternal, setCommunicationInternal] = useState(
    existingHandover?.communicationInternal || 
    'Semua komunikasi dilakukan melalui grup internal proyek di WhatsApp Business dan email internal.\nCEO harus di-cc untuk isu strategis atau risiko material.'
  );
  const [communicationExternal, setCommunicationExternal] = useState(
    existingHandover?.communicationExternal || 
    'Semua komunikasi eksternal harus diarsipkan oleh Business Strategist.'
  );
  const [externalContacts, setExternalContacts] = useState<Partial<ExternalContact>[]>(
    existingHandover?.externalContacts || [
      { role: 'Primary PIC', name: 'Andi Prasetyo', email: 'andi@client.com', phone: '+62 812 xxxx xxxx', company: '' },
      { role: 'Secondary PIC', name: 'Dina Lestari', email: 'dina@client.com', phone: '+62 813 xxxx xxxx', company: '' }
    ]
  );
  
  // Section 9: PROJECT TEAM ASSIGNMENT
  const [preliminaryTeam, setPreliminaryTeam] = useState<Partial<TeamMember>[]>(
    existingHandover?.preliminaryTeam || [
      { role: 'Project Lead', name: 'Senior TP Specialist', allocation: 'Koordinasi teknis & analisis utama' },
      { role: 'Reviewer', name: 'Manager TP', allocation: 'Review teknis & kualitas' },
      { role: 'Team Member(s)', name: '2 Junior TP Staff', allocation: 'Penyusunan deliverables' },
      { role: 'Admin Support', name: 'Admin DSK', allocation: 'Invoice, dokumen, folder management' },
      { role: 'BD Contact', name: 'Business Strategist', allocation: 'Koordinasi klien & eskalasi' }
    ]
  );
  
  // Section 10: HANDOVER CHECKLIST
  const [handoverChecklist, setHandoverChecklist] = useState<Partial<ChecklistItem>[]>(
    existingHandover?.handoverChecklist || [
      { description: 'Proposal final tersimpan', status: 'Completed' },
      { description: 'Engagement Letter ditandatangani', status: 'Completed' },
      { description: 'DP sudah diterima', status: 'Pending' },
      { description: 'Folder project dibuat', status: 'Completed' },
      { description: 'Dokumen klien diterima', status: 'Pending' },
      { description: 'Data request disiapkan', status: 'Completed' },
      { description: 'Kick-off meeting dijadwalkan', status: 'Completed' }
    ]
  );
  
  // Section 11: SIGN-OFF
  const [signOffs, setSignOffs] = useState<Partial<SignOff>[]>(
    existingHandover?.signOffs || [
      { role: 'Chief Executive Officer', name: 'Galih Gumilang', signedAt: '2025-01-26' },
      { role: 'Business Strategist', name: '[Nama Strategist]', signedAt: '2025-01-26' },
      { role: 'Project Lead', name: '[Nama Senior TP]', signedAt: '2025-01-26' }
    ]
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
  
  // Section completion tracking
  const getSectionCompletion = (sectionId: SectionId): boolean => {
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
        return documentsReceived.filter(d => d.trim()).length > 0;
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
  };
  
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
    if (!background || background.length < 20) newErrors.background = 'Background summary is required (min 20 characters)';
    
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
      deliverables: deliverables.filter(d => d.name) as Deliverable[],
      milestones: milestones.filter(m => m.name && m.targetDate) as Milestone[],
      feeStructure: feeStructure.filter(f => f.description && f.amount) as FeeStructureItem[],
      paymentTermsText,
      documentsReceived: [],
      storageLocation,
      dataRequirements: [],
      risks: risks.filter(r => r.trim()).map((r, i) => ({
        id: `RISK-${i}`,
        description: r,
        impact: 'Medium' as const,
        mitigation: ''
      })),
      communicationInternal,
      communicationExternal,
      externalContacts: externalContacts.filter(c => c.name) as ExternalContact[],
      preliminaryTeam: preliminaryTeam.filter(t => t.role && t.name) as TeamMember[],
      handoverChecklist: handoverChecklist.filter(c => c.description) as ChecklistItem[],
      signOffs: signOffs.filter(s => s.role && s.name) as SignOff[],
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
      documentsReceived: [],
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
  
  const toggleSection = (sectionId: SectionId) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };
  
  const renderRevisionComments = (sectionTitle: string) => {
    const comments = revisionComments.filter(r => 
      r.sectionName === sectionTitle || 
      r.sectionName.includes(sectionTitle)
    );
    
    if (comments.length === 0) return null;
    
    return (
      <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-semibold text-amber-900 mb-2">CEO Revision Request</h4>
            {comments.map((comment) => (
              <div key={comment.id} className="text-sm text-amber-800 mb-2">
                <p className="font-medium">{comment.comment}</p>
                <p className="text-xs text-amber-700 mt-1">
                  — {comment.requestedBy} • {new Date(comment.requestedAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  const renderSectionHeader = (sectionId: SectionId, title: string, locked?: boolean) => {
    const isExpanded = expandedSections.has(sectionId);
    const isComplete = getSectionCompletion(sectionId);
    const fullTitle = `${sectionId}. ${title}`;
    const hasRevision = revisionComments.some(r => 
      r.sectionName === fullTitle || 
      r.sectionName === title ||
      r.sectionName.includes(title)
    );
    
    return (
      <button
        onClick={() => toggleSection(sectionId)}
        className={`w-full flex items-center justify-between p-4 transition-colors rounded-lg ${
          hasRevision ? 'bg-yellow-50 hover:bg-yellow-100' : 'bg-gray-50 hover:bg-gray-100'
        }`}
      >
        <div className="flex items-center gap-3">
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-600" />
          )}
          <span className="font-semibold text-gray-900">
            {sectionId}. {title}
          </span>
          {locked && (
            <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
              <Lock className="w-3 h-3" />
              Locked by CEO approval
            </div>
          )}
          {hasRevision && (
            <div className="flex items-center gap-1 text-xs text-amber-700 bg-amber-100 px-2 py-1 rounded">
              <AlertCircle className="w-3 h-3" />
              Revision requested
            </div>
          )}
        </div>
        {isComplete ? (
          <CheckCircle className="w-5 h-5 text-green-600" />
        ) : showValidation ? (
          <AlertCircle className="w-5 h-5 text-red-600" />
        ) : (
          <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
        )}
      </button>
    );
  };
  
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
        
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl mb-2">DSK GLOBAL – PROJECT HANDOVER MEMO</CardTitle>
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
                  className={showValidation && errors.documentCode ? 'border-red-300' : ''}
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
                  className="bg-gray-50"
                />
              </div>
            </div>
            
            {isRevisionRequested && revisionComments.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-amber-900 mb-2">CEO Revision Notes</h3>
                    <div className="space-y-2">
                      {revisionComments.map((comment) => (
                        <div key={comment.id} className="text-sm">
                          <div className="font-medium text-amber-800">{comment.sectionName}</div>
                          <div className="text-amber-700">{comment.comment}</div>
                          <div className="text-xs text-amber-600 mt-1">
                            {comment.requestedBy} • {new Date(comment.requestedAt).toLocaleDateString('id-ID', { 
                              day: 'numeric', 
                              month: 'long', 
                              year: 'numeric' 
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
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
          </CardContent>
        </Card>
      </div>
      
      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Form Completion</span>
            <span className="text-sm font-medium text-gray-900">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].filter(id => getSectionCompletion(id as SectionId)).length} / 11 Sections
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ 
                width: `${([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].filter(id => getSectionCompletion(id as SectionId)).length / 11) * 100}%` 
              }}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Form Sections - I'll continue with the sections in the next part due to length */}
      {/* Section 1: PROJECT INFORMATION */}
      <Card>
        {renderSectionHeader(1, 'PROJECT INFORMATION')}
        {expandedSections.has(1) && (
          <CardContent className="pt-0">
            {renderRevisionComments('PROJECT INFORMATION')}
            
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
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="PT MSM Indonesia"
                        className={showValidation && errors.clientName ? 'border-red-300' : ''}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border border-gray-300 font-medium">Company Group</td>
                    <td className="px-4 py-2 border border-gray-300">
                      <Input
                        type="text"
                        value={companyGroup}
                        onChange={(e) => setCompanyGroup(e.target.value)}
                        placeholder="MSM Group"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border border-gray-300 font-medium">Project Title</td>
                    <td className="px-4 py-2 border border-gray-300">
                      <Input
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        placeholder="Transfer Pricing Documentation FY 2024"
                        className={showValidation && errors.projectName ? 'border-red-300' : ''}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border border-gray-300 font-medium">Service Line</td>
                    <td className="px-4 py-2 border border-gray-300">
                      <Input
                        type="text"
                        value={serviceLine}
                        onChange={(e) => setServiceLine(e.target.value)}
                        placeholder="Transfer Pricing / Tax / Legal"
                        className={showValidation && errors.serviceLine ? 'border-red-300' : ''}
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
                            onChange={(e) => setProjectStartDate(e.target.value)}
                            className={showValidation && errors.projectStartDate ? 'border-red-300' : ''}
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
                            onChange={(e) => setProjectEndDate(e.target.value)}
                            className={showValidation && errors.projectEndDate ? 'border-red-300' : ''}
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
                        onChange={(e) => setClientPic(e.target.value)}
                        placeholder="Andi Prasetyo"
                        className={showValidation && errors.clientPic ? 'border-red-300' : ''}
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
                          onChange={(e) => setClientEmail(e.target.value)}
                          placeholder="andi@ptmsm.com"
                          className={showValidation && errors.clientEmail ? 'border-red-300' : ''}
                        />
                        <Input
                          type="tel"
                          value={clientPhone}
                          onChange={(e) => setClientPhone(e.target.value)}
                          placeholder="+62 812 xxxx xxxx"
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
                        onChange={(e) => setEngagementLetterStatus(e.target.value)}
                        placeholder="Signed – 26 Januari 2025"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border border-gray-300 font-medium">Proposal Reference</td>
                    <td className="px-4 py-2 border border-gray-300">
                      <Input
                        type="text"
                        value={proposalReference}
                        onChange={(e) => setProposalReference(e.target.value)}
                        placeholder="PROP-TP-MSM-2025-001"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        )}
      </Card>
      
      {/* Section 2: BACKGROUND SUMMARY */}
      <Card>
        {renderSectionHeader(2, 'BACKGROUND SUMMARY')}
        {expandedSections.has(2) && (
          <CardContent className="pt-0">
            <Label htmlFor="background" className="mb-3 block">
              Background Summary <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="background"
              value={background}
              onChange={(e) => setBackground(e.target.value)}
              placeholder="Describe the project background, client situation, context, and key objectives..."
              rows={6}
              className={showValidation && errors.background ? 'border-red-300' : ''}
            />
            {showValidation && errors.background && (
              <p className="text-xs text-red-600 mt-1">{errors.background}</p>
            )}
          </CardContent>
        )}
      </Card>
      
      {/* Section 3: FINALIZED SCOPE OF WORK */}
      <Card>
        {renderSectionHeader(3, 'FINALIZED SCOPE OF WORK', isScopeLocked)}
        {expandedSections.has(3) && (
          <CardContent className="pt-0 space-y-6">
            {renderRevisionComments('FINALIZED SCOPE OF WORK')}
            
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
                      setScopeIncluded(newItems);
                    }}
                    disabled={isScopeLocked}
                    className="flex-1"
                  />
                  {!isScopeLocked && scopeIncluded.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setScopeIncluded(scopeIncluded.filter((_, i) => i !== index))}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              {!isScopeLocked && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setScopeIncluded([...scopeIncluded, ''])}
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
                      setScopeExclusions(newItems);
                    }}
                    disabled={isScopeLocked}
                    className="flex-1"
                  />
                  {!isScopeLocked && scopeExclusions.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setScopeExclusions(scopeExclusions.filter((_, i) => i !== index))}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              {!isScopeLocked && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setScopeExclusions([...scopeExclusions, ''])}
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
                          setDeliverables(newDeliverables);
                        }}
                        placeholder="Deliverable name"
                        disabled={isScopeLocked}
                        className="flex-1"
                      />
                      <Input
                        type="text"
                        value={del.description || ''}
                        onChange={(e) => {
                          const newDeliverables = [...deliverables];
                          newDeliverables[index].description = e.target.value;
                          setDeliverables(newDeliverables);
                        }}
                        placeholder="Format/notes"
                        disabled={isScopeLocked}
                        className="flex-1"
                      />
                    </div>
                    {!isScopeLocked && deliverables.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeliverables(deliverables.filter((_, i) => i !== index))}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              {!isScopeLocked && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeliverables([...deliverables, { name: '', description: '' }])}
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
                      {!isScopeLocked && <th className="w-10 border border-gray-300"></th>}
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
                              setMilestones(newMilestones);
                            }}
                            placeholder="Milestone name"
                            disabled={isScopeLocked}
                            className="w-full"
                          />
                        </td>
                        <td className="px-3 py-2 border border-gray-300">
                          <Input
                            type="date"
                            value={milestone.targetDate || ''}
                            onChange={(e) => {
                              const newMilestones = [...milestones];
                              newMilestones[index].targetDate = e.target.value;
                              setMilestones(newMilestones);
                            }}
                            disabled={isScopeLocked}
                            className="w-full"
                          />
                        </td>
                        <td className="px-3 py-2 border border-gray-300">
                          <Input
                            type="text"
                            value={milestone.description || ''}
                            onChange={(e) => {
                              const newMilestones = [...milestones];
                              newMilestones[index].description = e.target.value;
                              setMilestones(newMilestones);
                            }}
                            placeholder="Notes"
                            disabled={isScopeLocked}
                            className="w-full"
                          />
                        </td>
                        {!isScopeLocked && (
                          <td className="px-2 py-2 border border-gray-300 text-center">
                            {milestones.length > 1 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setMilestones(milestones.filter((_, i) => i !== index))}
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
              {!isScopeLocked && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMilestones([...milestones, { name: '', targetDate: '', description: '' }])}
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
      
      {/* Section 4: FEE STRUCTURE & PAYMENT TERMS */}
      <Card>
        {renderSectionHeader(4, 'FEE STRUCTURE & PAYMENT TERMS')}
        {expandedSections.has(4) && (
          <CardContent className="pt-0 space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
              <p className="text-sm text-amber-800">
                Section ini HANYA tampil untuk BD/CEO/COO/Finance. PM tidak dapat melihat section ini.
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-3 py-2 border border-gray-300">Item</th>
                    <th className="text-left px-3 py-2 border border-gray-300">Amount (Rp)</th>
                    <th className="text-left px-3 py-2 border border-gray-300">Notes</th>
                    <th className="w-10 border border-gray-300"></th>
                  </tr>
                </thead>
                <tbody>
                  {feeStructure.map((fee, index) => (
                    <tr key={index}>
                      <td className="px-3 py-2 border border-gray-300">
                        <Input
                          type="text"
                          value={fee.description || ''}
                          onChange={(e) => {
                            const newFees = [...feeStructure];
                            newFees[index].description = e.target.value;
                            setFeeStructure(newFees);
                          }}
                          placeholder="Item description"
                          className="w-full"
                        />
                      </td>
                      <td className="px-3 py-2 border border-gray-300">
                        <Input
                          type="number"
                          value={fee.amount || ''}
                          onChange={(e) => {
                            const newFees = [...feeStructure];
                            newFees[index].amount = Number(e.target.value);
                            setFeeStructure(newFees);
                          }}
                          placeholder="0"
                          className="w-full"
                        />
                      </td>
                      <td className="px-3 py-2 border border-gray-300">
                        <Input
                          type="text"
                          value={fee.percentage ? `${fee.percentage}%` : ''}
                          onChange={(e) => {
                            const newFees = [...feeStructure];
                            const val = e.target.value.replace('%', '');
                            newFees[index].percentage = val ? Number(val) : undefined;
                            setFeeStructure(newFees);
                          }}
                          placeholder="Notes"
                          className="w-full"
                        />
                      </td>
                      <td className="px-2 py-2 border border-gray-300 text-center">
                        {feeStructure.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setFeeStructure(feeStructure.filter((_, i) => i !== index))}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFeeStructure([...feeStructure, { description: '', amount: 0 }])}
              className="mt-4"
            >
              <Plus className="w-4 h-4" />
              Add Fee Item
            </Button>
            
            <div className="mt-3">
              <Label htmlFor="paymentTerms" className="mb-3 block">Payment Terms:</Label>
              <Textarea
                id="paymentTerms"
                value={paymentTermsText}
                onChange={(e) => setPaymentTermsText(e.target.value)}
                placeholder="Invoice details, payment schedule, work start conditions..."
                rows={3}
              />
            </div>
          </CardContent>
        )}
      </Card>
      
      {/* Section 5: CLIENT-PROVIDED DOCUMENTS */}
      <Card>
        {renderSectionHeader(5, 'CLIENT-PROVIDED DOCUMENTS')}
        {expandedSections.has(5) && (
          <CardContent className="pt-0 space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Documents Received (as of Handover):</h3>
              {documentsReceived.map((doc, index) => (
                <div key={index} className="flex items-start gap-2 mb-3">
                  <span className="text-gray-600 mt-2">•</span>
                  <Input
                    type="text"
                    value={doc}
                    onChange={(e) => {
                      const newDocs = [...documentsReceived];
                      newDocs[index] = e.target.value;
                      setDocumentsReceived(newDocs);
                    }}
                    placeholder="Document name/description"
                    className="flex-1"
                  />
                  {documentsReceived.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDocumentsReceived(documentsReceived.filter((_, i) => i !== index))}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDocumentsReceived([...documentsReceived, ''])}
                className="mt-4"
              >
                <Plus className="w-4 h-4" />
                Add Document
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
      
      {/* Section 6: DATA REQUIREMENTS (OUTSTANDING) */}
      <Card>
        {renderSectionHeader(6, 'DATA REQUIREMENTS (OUTSTANDING)')}
        {expandedSections.has(6) && (
          <CardContent className="pt-0 space-y-4">
            <p className="text-sm text-gray-600 italic mb-4">
              (Sudah dikirimkan kepada klien dalam Data Request List)
            </p>
            
            {dataRequirements.map((req, index) => (
              <div key={index} className="flex items-start gap-2 mb-3">
                <span className="text-gray-600 mt-2">•</span>
                <Input
                  type="text"
                  value={req}
                  onChange={(e) => {
                    const newReqs = [...dataRequirements];
                    newReqs[index] = e.target.value;
                    setDataRequirements(newReqs);
                  }}
                  placeholder="Requirement description"
                  className="flex-1"
                />
                {dataRequirements.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDataRequirements(dataRequirements.filter((_, i) => i !== index))}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDataRequirements([...dataRequirements, ''])}
                className="mt-4"
              >
                <Plus className="w-4 h-4" />
                Add Requirement
              </Button>
          </CardContent>
        )}
      </Card>
      
      {/* Section 7: KEY RISKS / RED FLAGS */}
      <Card>
        {renderSectionHeader(7, 'KEY RISKS / RED FLAGS')}
        {expandedSections.has(7) && (
          <CardContent className="pt-0">
            <div>
              {risks.map((risk, index) => (
              <div key={index} className="flex items-start gap-2 mb-3">
                <span className="text-gray-600 mt-2">•</span>
                <Input
                  type="text"
                  value={risk}
                  onChange={(e) => {
                    const newRisks = [...risks];
                    newRisks[index] = e.target.value;
                    setRisks(newRisks);
                  }}
                  placeholder="Risk description"
                  className="flex-1"
                />
                {risks.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setRisks(risks.filter((_, i) => i !== index))}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRisks([...risks, ''])}
              className="mt-4"
            >
              <Plus className="w-4 h-4" />
              Add Risk
            </Button>
          </CardContent>
        )}
      </Card>
      
      {/* Section 8: COMMUNICATION PROTOCOL */}
      <Card>
        {renderSectionHeader(8, 'COMMUNICATION PROTOCOL')}
        {expandedSections.has(8) && (
          <CardContent className="pt-0 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">8.1 Internal</h3>
              <Textarea
                value={communicationInternal}
                onChange={(e) => setCommunicationInternal(e.target.value)}
                placeholder="Internal communication guidelines..."
                rows={3}
                className={showValidation && errors.communicationInternal ? 'border-red-300' : ''}
              />
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">8.2 External (Client)</h3>
              <Label htmlFor="communicationExternal" className="mb-3 block">Catatan:</Label>
              <Textarea
                id="communicationExternal"
                value={communicationExternal}
                onChange={(e) => setCommunicationExternal(e.target.value)}
                placeholder="External communication guidelines..."
                rows={2}
                className="mt-2"
              />
              
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-3 py-2 border border-gray-300">Role</th>
                      <th className="text-left px-3 py-2 border border-gray-300">Name</th>
                      <th className="text-left px-3 py-2 border border-gray-300">Contact</th>
                      <th className="text-left px-3 py-2 border border-gray-300">Instruction</th>
                      <th className="w-10 border border-gray-300"></th>
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
                              setExternalContacts(newContacts);
                            }}
                            placeholder="Role"
                            className="w-full"
                          />
                        </td>
                        <td className="px-3 py-2 border border-gray-300">
                          <Input
                            type="text"
                            value={contact.name || ''}
                            onChange={(e) => {
                              const newContacts = [...externalContacts];
                              newContacts[index].name = e.target.value;
                              setExternalContacts(newContacts);
                            }}
                            placeholder="Name"
                            className="w-full"
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
                              setExternalContacts(newContacts);
                            }}
                            placeholder="email / phone"
                            className="w-full"
                          />
                        </td>
                        <td className="px-3 py-2 border border-gray-300">
                          <Input
                            type="text"
                            value={contact.company || ''}
                            onChange={(e) => {
                              const newContacts = [...externalContacts];
                              newContacts[index].company = e.target.value;
                              setExternalContacts(newContacts);
                            }}
                            placeholder="Instruction"
                            className="w-full"
                          />
                        </td>
                        <td className="px-2 py-2 border border-gray-300 text-center">
                          {externalContacts.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setExternalContacts(externalContacts.filter((_, i) => i !== index))}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExternalContacts([...externalContacts, { role: '', name: '', email: '', phone: '', company: '' }])}
                  className="mt-4"
                >
                <Plus className="w-4 h-4" />
                Add Contact
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
      
      {/* Section 9: PROJECT TEAM ASSIGNMENT */}
      <Card>
        {renderSectionHeader(9, 'PROJECT TEAM ASSIGNMENT')}
        {expandedSections.has(9) && (
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-3 py-2 border border-gray-300">Role</th>
                    <th className="text-left px-3 py-2 border border-gray-300">Name</th>
                    <th className="text-left px-3 py-2 border border-gray-300">Responsibilities</th>
                    <th className="w-10 border border-gray-300"></th>
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
                            setPreliminaryTeam(newTeam);
                          }}
                          placeholder="Role"
                          className="w-full"
                        />
                      </td>
                      <td className="px-3 py-2 border border-gray-300">
                        <Input
                          type="text"
                          value={member.name || ''}
                          onChange={(e) => {
                            const newTeam = [...preliminaryTeam];
                            newTeam[index].name = e.target.value;
                            setPreliminaryTeam(newTeam);
                          }}
                          placeholder="Name"
                          className="w-full"
                        />
                      </td>
                      <td className="px-3 py-2 border border-gray-300">
                        <Input
                          type="text"
                          value={member.allocation || ''}
                          onChange={(e) => {
                            const newTeam = [...preliminaryTeam];
                            newTeam[index].allocation = e.target.value;
                            setPreliminaryTeam(newTeam);
                          }}
                          placeholder="Responsibilities"
                          className="w-full"
                        />
                      </td>
                      <td className="px-2 py-2 border border-gray-300 text-center">
                        {preliminaryTeam.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setPreliminaryTeam(preliminaryTeam.filter((_, i) => i !== index))}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreliminaryTeam([...preliminaryTeam, { role: '', name: '', allocation: '' }])}
                className="mt-4"
              >
              <Plus className="w-4 h-4" />
              Add Team Member
            </Button>
          </CardContent>
        )}
      </Card>
      
      {/* Section 10: HANDOVER CHECKLIST */}
      <Card>
        {renderSectionHeader(10, 'HANDOVER CHECKLIST')}
        {expandedSections.has(10) && (
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-3 py-2 border border-gray-300">Item</th>
                    <th className="text-left px-3 py-2 border border-gray-300 w-40">Status</th>
                    <th className="w-10 border border-gray-300"></th>
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
                            setHandoverChecklist(newChecklist);
                          }}
                          placeholder="Checklist item"
                          className="w-full"
                        />
                      </td>
                      <td className="px-3 py-2 border border-gray-300">
                        <Select
                          value={item.status || 'Pending'}
                          onValueChange={(value) => {
                            const newChecklist = [...handoverChecklist];
                            newChecklist[index].status = value as 'Pending' | 'Completed';
                            setHandoverChecklist(newChecklist);
                          }}
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
                      <td className="px-2 py-2 border border-gray-300 text-center">
                        {handoverChecklist.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setHandoverChecklist(handoverChecklist.filter((_, i) => i !== index))}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setHandoverChecklist([...handoverChecklist, { description: '', status: 'Pending' }])}
                className="mt-4"
              >
              <Plus className="w-4 h-4" />
              Add Checklist Item
            </Button>
          </CardContent>
        )}
      </Card>
      
      {/* Section 11: SIGN-OFF */}
      <Card>
        {renderSectionHeader(11, 'SIGN-OFF')}
        {expandedSections.has(11) && (
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-3 py-2 border border-gray-300">Name</th>
                    <th className="text-left px-3 py-2 border border-gray-300">Position</th>
                    <th className="text-left px-3 py-2 border border-gray-300">Signature</th>
                    <th className="text-left px-3 py-2 border border-gray-300">Date</th>
                    <th className="w-10 border border-gray-300"></th>
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
                            setSignOffs(newSignOffs);
                          }}
                          placeholder="Name"
                          className="w-full"
                        />
                      </td>
                      <td className="px-3 py-2 border border-gray-300">
                        <Input
                          type="text"
                          value={signOff.role || ''}
                          onChange={(e) => {
                            const newSignOffs = [...signOffs];
                            newSignOffs[index].role = e.target.value;
                            setSignOffs(newSignOffs);
                          }}
                          placeholder="Position"
                          className="w-full"
                        />
                      </td>
                      <td className="px-3 py-2 border border-gray-300">
                        <Input
                          type="text"
                          value={signOff.notes || ''}
                          onChange={(e) => {
                            const newSignOffs = [...signOffs];
                            newSignOffs[index].notes = e.target.value;
                            setSignOffs(newSignOffs);
                          }}
                          placeholder="(signature field)"
                          className="w-full bg-gray-50 italic"
                        />
                      </td>
                      <td className="px-3 py-2 border border-gray-300">
                        <Input
                          type="date"
                          value={signOff.signedAt || ''}
                          onChange={(e) => {
                            const newSignOffs = [...signOffs];
                            newSignOffs[index].signedAt = e.target.value;
                            setSignOffs(newSignOffs);
                          }}
                          className="w-full"
                        />
                      </td>
                      <td className="px-2 py-2 border border-gray-300 text-center">
                        {signOffs.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSignOffs(signOffs.filter((_, i) => i !== index))}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSignOffs([...signOffs, { role: '', name: '', signedAt: '' }])}
                className="mt-4"
              >
              <Plus className="w-4 h-4" />
              Add Sign-Off
            </Button>
          </CardContent>
        )}
      </Card>
      
    </div>
  );
}

