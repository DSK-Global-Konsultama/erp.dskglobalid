export interface Deliverable {
  id: string;
  name: string;
  description?: string;
  quantity?: number;
  dueDate?: string;
  assignedTo?: string;
}

export interface Milestone {
  id: string;
  name: string;
  targetDate: string;
  description?: string;
}

export interface Risk {
  id: string;
  description: string;
  impact: 'Low' | 'Medium' | 'High' | 'Critical';
  mitigation?: string;
}

export interface TeamMember {
  id: string;
  role: string;
  name: string;
  allocation?: string;
}

export interface FeeStructureItem {
  id: string;
  description: string;
  amount: number;
  percentage?: number;
  dueDate?: string;
  status?: 'Pending' | 'Paid' | 'Overdue';
}

export interface ChecklistItem {
  id: string;
  description: string;
  status: 'Pending' | 'Completed';
}

export interface SignOff {
  id: string;
  role: string;
  name: string;
  signedAt?: string;
  notes?: string;
}

export interface ExternalContact {
  id: string;
  role: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
}

export interface RevisionComment {
  id: string;
  sectionName: string;
  comment: string;
  requestedBy: string;
  requestedAt: string;
  role?: string; // Optional role (e.g., "CEO", "COO")
}

export interface ExtendedHandover {
  id?: string;
  documentCode?: string;
  classification?: string;
  projectName?: string;
  clientName?: string;
  companyGroup?: string;
  serviceLine?: string;
  projectPeriod?: string;
  clientPic?: string;
  clientEmail?: string;
  clientPhone?: string;
  engagementLetterStatus?: string;
  proposalReference?: string;
  internalPicBd?: string;
  priority?: 'Critical' | 'High' | 'Medium' | 'Low';
  background?: string;
  scopeIncluded?: string[];
  scopeExclusions?: string[];
  deliverables?: Deliverable[];
  milestones?: Milestone[];
  feeStructure?: FeeStructureItem[];
  paymentTermsText?: string;
  documentsReceived?: Array<{ 
    fileName: string; 
    fileUrl?: string;
    receivedDate?: string;
    uploadedBy?: string; // User ID or name who uploaded the document
    uploadDate?: string; // ISO date string when document was uploaded
  }>;
  storageLocation?: string;
  dataRequirements?: Array<{ itemName: string; status?: string }>;
  risks?: Risk[];
  communicationInternal?: string;
  communicationExternal?: string;
  externalContacts?: ExternalContact[];
  preliminaryTeam?: TeamMember[];
  handoverChecklist?: ChecklistItem[];
  signOffs?: SignOff[];
  workflowStatus?: 'HANDOVER_DRAFT' | 'SUBMITTED_TO_CEO' | 'APPROVED_BY_CEO' | 'REVISION_REQUESTED' | 'REJECTED' | 'SENT_TO_PM';
  submittedToCeoAt?: string;
  createdAt?: string;
  lastModifiedAt?: string;
  communicationProtocol?: string;
  escalationPath?: string;
  revisionComments?: RevisionComment[];
  scopeLocked?: boolean;
  leadId?: string;
  proposalId?: string;
}

