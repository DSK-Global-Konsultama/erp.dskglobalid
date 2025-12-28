/**
 * Lead Management System - Extended Types
 * Integration with existing BD Pipeline system
 */

// Campaign & Form Types
export type CampaignType = 'WEBINAR' | 'SOCIAL' | 'FREEBIE' | 'EVENT';
export type Channel = 'IG' | 'LINKEDIN' | 'WEBSITE' | 'EVENT';
export type CampaignStatus = 'ACTIVE' | 'PAUSED' | 'ENDED';

export interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  channel: Channel;
  topicTag?: string; // only for WEBINAR
  dateRange?: { start: string; end: string };
  notes?: string;
  status: CampaignStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type FormFieldType = 
  | 'SHORT_TEXT' 
  | 'LONG_TEXT' 
  | 'DROPDOWN' 
  | 'RADIO' 
  | 'CHECKBOX' 
  | 'DATE';

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  required: boolean;
  options?: string[]; // for dropdown/radio/checkbox
  isCore?: boolean; // locked fields (Client Name, PIC, Email, Phone)
  placeholder?: string;
}

export interface Form {
  id: string;
  campaignId: string;
  title: string;
  description?: string;
  fields: FormField[];
  status: 'DRAFT' | 'PUBLISHED';
  publicLink?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

// Bank Data Types
export type BankDataTriageStatus = 
  | 'RAW_NEW' 
  | 'REJECTED' 
  | 'PROMOTED_TO_LEAD';

export interface BankDataEntry {
  id: string;
  campaignId: string;
  formId: string;
  
  // Core fields (always present)
  clientName: string;
  picName: string;
  email: string;
  phone: string;
  
  // Metadata
  sourceChannel: Channel;
  campaignName: string;
  topicTag?: string; // inherited from campaign (webinar only)
  triageStatus: BankDataTriageStatus;
  
  // Extra form answers (dynamic fields)
  extraAnswers: Record<string, any>;
  
  // Data cleaning & processing
  notes?: string;
  cleanedBy?: string;
  cleanedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectedReason?: string;
  promotedToLeadId?: string;
  promotedBy?: string;
  promotedAt?: string;
  
  // Timestamps
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

// Lead Pipeline Status (2-dimensional system)
// A) followup_status (CEO/BOD actions)
export type FollowUpStatus = 
  | 'FOLLOWUP_PENDING'
  | 'FOLLOWED_UP' 
  | 'DROP';

// B) pipeline_status (BD Admin + BOD approval)
export type PipelineStatus = 
  // Gate awal
  | 'WAITING_CEO_FOLLOWUP'
  
  // Prepitching (wajib + approval BOD)
  | 'NEED_PREPITCHING'
  | 'PREPITCHING_IN_PROGRESS'
  | 'PREPITCHING_SUBMITTED'
  | 'PREPITCHING_APPROVED'
  
  // Meeting
  | 'MEETING_SCHEDULED'
  | 'MEETING_DONE'
  
  // Notulensi
  | 'NEED_NOTULEN'
  | 'NOTULEN_SUBMITTED'
  | 'NOTULEN_APPROVED'
  
  // Proposal
  | 'NEED_PROPOSAL'
  | 'IN_PROPOSAL'
  | 'PROPOSAL_APPROVED'
  | 'PROPOSAL_SENT'
  | 'PROPOSAL_ACCEPTED'
  | 'PROPOSAL_EXPIRED'
  
  // Engagement Letter (EL)
  | 'NEED_EL'
  | 'EL_SUBMITTED'
  | 'EL_APPROVED'
  | 'EL_SENT'
  | 'EL_SIGNED'
  
  // Handover Memo
  | 'NEED_HANDOVER'
  | 'HANDOVER_SUBMITTED'
  | 'HANDOVER_APPROVED'
  | 'HANDOVER_SENT_TO_PM'
  
  // Terminal
  | 'DONE'
  | 'DROPPED';

// Legacy alias for backward compatibility
export type LeadPipelineStatus = PipelineStatus;

// CEO Follow-up Status (Legacy alias)
export type CEOFollowUpStatus = FollowUpStatus;

// Source Type
export type LeadSourceType = 'CAMPAIGN_FORM' | 'MANUAL';

// Prepitching Data
export interface Prepitching {
  content: string;
  attachments?: string[];
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED';
  submittedAt?: string;
  submittedBy?: string;
  approvedAt?: string;
  approvedBy?: string;
  approvalNotes?: string;
}

// Extended Lead Interface (merged with existing Lead type)
export interface ExtendedLeadData {
  // New fields for integrated system
  pipelineStatus: LeadPipelineStatus;
  ceoFollowUpStatus: CEOFollowUpStatus;
  sourceType: LeadSourceType;
  sourceCampaignId?: string;
  sourceCampaignName?: string;
  bankDataId?: string;
  
  // Prepitching stage
  prepitching?: Prepitching;
  
  // CEO follow-up notes
  ceoFollowUpNotes?: string;
  ceoFollowUpDate?: string;
  
  // Next action label (computed)
  nextAction?: string;
}

// Analytics Types
export interface CampaignAnalytics {
  campaignId: string;
  campaignName: string;
  totalSubmissions: number;
  rawNew: number;
  promoted: number;
  rejected: number;
  promotionRate: number;
  topicTag?: string;
}

export interface ChannelAnalytics {
  channel: Channel;
  totalSubmissions: number;
  totalCampaigns: number;
  promotionRate: number;
}

export interface TopicTagAnalytics {
  topicTag: string;
  totalSubmissions: number;
  promotionRate: number;
  campaigns: number;
}

