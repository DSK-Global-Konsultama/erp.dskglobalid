/**
 * Mock Data for Lead Management System
 */

import type {
  Campaign,
  Form,
  FormField,
  BankDataEntry,
} from './leadManagementTypes';

// ==================== CAMPAIGNS ====================

export const mockCampaigns: Campaign[] = [
  {
    id: 'camp1',
    name: 'Webinar: Tax Planning 2026',
    type: 'WEBINAR',
    channel: 'EVENT',
    topicTag: 'TAX_PLANNING',
    dateRange: { start: '2025-12-01', end: '2025-12-15' },
    notes: 'Target: Corporate CFOs and finance managers',
    status: 'ACTIVE',
    createdBy: 'Sarah (MEO)',
    createdAt: '2025-11-25',
    updatedAt: '2025-11-25'
  },
  {
    id: 'camp2',
    name: 'IG Story: Transfer Pricing Awareness',
    type: 'SOCIAL',
    channel: 'IG',
    dateRange: { start: '2025-12-01', end: '2025-12-31' },
    notes: 'Carousel post + story series',
    status: 'ACTIVE',
    createdBy: 'Andi (MEO)',
    createdAt: '2025-12-05',
    updatedAt: '2025-12-05'
  },
  {
    id: 'camp3',
    name: 'Free Download: Tax Compliance Checklist',
    type: 'FREEBIE',
    channel: 'WEBSITE',
    dateRange: { start: '2025-11-20', end: '2026-01-31' },
    notes: 'Lead magnet - downloadable PDF checklist',
    status: 'ACTIVE',
    createdBy: 'Sarah (MEO)',
    createdAt: '2025-11-20',
    updatedAt: '2025-11-20'
  },
  {
    id: 'camp4',
    name: 'Webinar: Legal Entity Setup',
    type: 'WEBINAR',
    channel: 'EVENT',
    topicTag: 'LEGAL_SETUP',
    dateRange: { start: '2025-11-15', end: '2025-11-30' },
    notes: 'Webinar tentang setup legal entity untuk startup dan bisnis baru',
    status: 'ENDED',
    createdBy: 'Andi (MEO)',
    createdAt: '2025-11-10',
    updatedAt: '2025-12-01'
  },
  {
    id: 'camp5',
    name: 'LinkedIn Post: Financial Advisory Case Study',
    type: 'SOCIAL',
    channel: 'LINKEDIN',
    dateRange: { start: '2025-12-10', end: '2026-01-10' },
    notes: 'Case study success story',
    status: 'ACTIVE',
    createdBy: 'Sarah (MEO)',
    createdAt: '2025-12-10',
    updatedAt: '2025-12-10'
  },
  {
    id: 'camp6',
    name: 'Annual Tax Seminar 2026',
    type: 'EVENT',
    channel: 'EVENT',
    dateRange: { start: '2026-01-15', end: '2026-01-20' },
    notes: 'Annual tax seminar untuk corporate clients dengan topik update perpajakan 2026',
    status: 'ACTIVE',
    createdBy: 'Andi (MEO)',
    createdAt: '2025-12-20',
    updatedAt: '2025-12-20'
  }
];

// ==================== FORMS ====================

// Core fields (locked, always present)
const coreFields: FormField[] = [
  {
    id: 'core1',
    type: 'SHORT_TEXT',
    label: 'Nama Perusahaan / Client',
    required: true,
    isCore: true,
    placeholder: 'PT ABC Indonesia'
  },
  {
    id: 'core2',
    type: 'SHORT_TEXT',
    label: 'Nama PIC',
    required: true,
    isCore: true,
    placeholder: 'John Doe'
  },
  {
    id: 'core3',
    type: 'SHORT_TEXT',
    label: 'Email',
    required: true,
    isCore: true,
    placeholder: 'john@company.com'
  },
  {
    id: 'core4',
    type: 'SHORT_TEXT',
    label: 'Nomor Telepon / WhatsApp',
    required: true,
    isCore: true,
    placeholder: '+62 812-3456-7890'
  }
];

export const mockForms: Form[] = [
  {
    id: 'form1',
    campaignId: 'camp1',
    title: 'Webinar Registration: Tax Planning 2026',
    description: 'Daftar untuk mengikuti webinar gratis tentang Tax Planning 2026',
    fields: [
      ...coreFields,
      {
        id: 'f1',
        type: 'DROPDOWN',
        label: 'Bidang Usaha',
        required: true,
        options: ['Manufacturing', 'Trading', 'Services', 'Technology', 'Real Estate', 'Other']
      },
      {
        id: 'f2',
        type: 'DROPDOWN',
        label: 'Ukuran Perusahaan (Revenue)',
        required: false,
        options: ['< IDR 5B', 'IDR 5-50B', 'IDR 50-500B', '> IDR 500B']
      },
      {
        id: 'f3',
        type: 'LONG_TEXT',
        label: 'Topik apa yang paling ingin Anda pelajari?',
        required: false,
        placeholder: 'e.g., Transfer pricing, tax incentives, compliance...'
      }
    ],
    status: 'PUBLISHED',
    publicLink: 'https://forms.company.com/webinar-tax-planning-2026',
    createdBy: 'Sarah (MEO)',
    createdAt: '2025-11-25',
    updatedAt: '2025-11-26',
    publishedAt: '2025-11-26'
  },
  {
    id: 'form2',
    campaignId: 'camp2',
    title: 'IG Story Swipe-Up: TP Consultation Interest',
    description: 'Quick form untuk yang tertarik konsultasi Transfer Pricing',
    fields: [
      ...coreFields,
      {
        id: 'f4',
        type: 'RADIO',
        label: 'Apakah perusahaan Anda sudah punya dokumentasi TP?',
        required: true,
        options: ['Sudah', 'Belum', 'Tidak Tahu']
      },
      {
        id: 'f5',
        type: 'CHECKBOX',
        label: 'Layanan apa yang Anda butuhkan?',
        required: false,
        options: [
          'Transfer Pricing Documentation',
          'TP Advisory',
          'TP Audit Defense',
          'APA (Advance Pricing Agreement)'
        ]
      }
    ],
    status: 'PUBLISHED',
    publicLink: 'https://forms.company.com/tp-consultation',
    createdBy: 'Andi (MEO)',
    createdAt: '2025-12-05',
    updatedAt: '2025-12-06',
    publishedAt: '2025-12-06'
  },
  {
    id: 'form3',
    campaignId: 'camp3',
    title: 'Download Free: Tax Compliance Checklist 2026',
    description: 'Dapatkan checklist lengkap tax compliance untuk 2026',
    fields: [
      ...coreFields,
      {
        id: 'f6',
        type: 'DROPDOWN',
        label: 'Posisi Anda di perusahaan',
        required: true,
        options: ['CFO', 'Finance Manager', 'Tax Manager', 'Accountant', 'Business Owner', 'Other']
      }
    ],
    status: 'PUBLISHED',
    publicLink: 'https://forms.company.com/tax-checklist-download',
    createdBy: 'Sarah (MEO)',
    createdAt: '2025-11-20',
    updatedAt: '2025-11-21',
    publishedAt: '2025-11-21'
  },
  {
    id: 'form4',
    campaignId: 'camp4',
    title: 'Webinar Registration: Legal Entity Setup',
    description: 'Panduan lengkap setup PT/PMA/PMDN',
    fields: [
      ...coreFields,
      {
        id: 'f7',
        type: 'RADIO',
        label: 'Apakah Anda berencana mendirikan perusahaan baru?',
        required: true,
        options: ['Ya, dalam 3 bulan', 'Ya, dalam 6 bulan', 'Belum pasti', 'Hanya ingin belajar']
      },
      {
        id: 'f8',
        type: 'DROPDOWN',
        label: 'Jenis badan usaha yang diinginkan',
        required: false,
        options: ['PT (PMDN)', 'PT (PMA)', 'CV', 'Belum tahu']
      }
    ],
    status: 'PUBLISHED',
    publicLink: 'https://forms.company.com/webinar-legal-entity',
    createdBy: 'Andi (MEO)',
    createdAt: '2025-11-10',
    updatedAt: '2025-11-11',
    publishedAt: '2025-11-11'
  },
  {
    id: 'form5',
    campaignId: 'camp6',
    title: 'Registration: Annual Tax Seminar 2026',
    description: 'Daftar untuk mengikuti Annual Tax Seminar 2026 - Update Perpajakan Terbaru',
    fields: [
      ...coreFields,
      {
        id: 'f9',
        type: 'DROPDOWN',
        label: 'Jenis Perusahaan',
        required: true,
        options: ['PT (PMDN)', 'PT (PMA)', 'CV', 'Firma', 'Perseroan Terbatas', 'Lainnya']
      },
      {
        id: 'f10',
        type: 'DROPDOWN',
        label: 'Bidang Usaha',
        required: true,
        options: ['Manufacturing', 'Trading', 'Services', 'Technology', 'Real Estate', 'Finance', 'Other']
      },
      {
        id: 'f11',
        type: 'RADIO',
        label: 'Apakah Anda ingin mengikuti sesi Q&A?',
        required: false,
        options: ['Ya', 'Tidak']
      },
      {
        id: 'f12',
        type: 'LONG_TEXT',
        label: 'Pertanyaan atau topik yang ingin dibahas',
        required: false,
        placeholder: 'Tuliskan pertanyaan atau topik yang ingin Anda pelajari...'
      }
    ],
    status: 'PUBLISHED',
    publicLink: 'https://forms.company.com/annual-tax-seminar-2026',
    createdBy: 'Andi (MEO)',
    createdAt: '2025-12-20',
    updatedAt: '2025-12-21',
    publishedAt: '2025-12-21'
  }
];

// ==================== BANK DATA ENTRIES ====================

export const mockBankData: BankDataEntry[] = [
  // RAW_NEW entries (need to be processed)
  {
    id: 'bd1',
    campaignId: 'camp1',
    formId: 'form1',
    clientName: 'PT Mitra Teknologi',
    picName: 'Budi Hartono',
    email: 'budi@mitratekno.com',
    phone: '+62 811-2233-4455',
    sourceChannel: 'EVENT',
    campaignName: 'Webinar: Tax Planning 2026',
    topicTag: 'TAX_PLANNING',
    triageStatus: 'RAW_NEW',
    extraAnswers: {
      'Bidang Usaha': 'Technology',
      'Ukuran Perusahaan (Revenue)': 'IDR 5-50B',
      'Topik apa yang paling ingin Anda pelajari?': 'Transfer pricing dan tax incentives untuk startup teknologi'
    },
    submittedAt: '2025-12-12 09:15:00',
    createdAt: '2025-12-12 09:15:00',
    updatedAt: '2025-12-12 09:15:00'
  },
  {
    id: 'bd2',
    campaignId: 'camp2',
    formId: 'form2',
    clientName: 'CV Karya Mandiri',
    picName: 'Siti Nurhaliza',
    email: 'siti@karyamandiri.id',
    phone: '+62 812-9988-7766',
    sourceChannel: 'IG',
    campaignName: 'IG Story: Transfer Pricing Awareness',
    triageStatus: 'RAW_NEW',
    extraAnswers: {
      'Apakah perusahaan Anda sudah punya dokumentasi TP?': 'Belum',
      'Layanan apa yang Anda butuhkan?': ['Transfer Pricing Documentation', 'TP Advisory']
    },
    submittedAt: '2025-12-13 14:30:00',
    createdAt: '2025-12-13 14:30:00',
    updatedAt: '2025-12-13 14:30:00'
  },
  {
    id: 'bd3',
    campaignId: 'camp3',
    formId: 'form3',
    clientName: 'PT Sinar Jaya Abadi',
    picName: 'Ahmad Yusuf',
    email: 'ahmad@sinarjaya.com',
    phone: '+62 813-5544-3322',
    sourceChannel: 'WEBSITE',
    campaignName: 'Free Download: Tax Compliance Checklist',
    triageStatus: 'RAW_NEW',
    extraAnswers: {
      'Posisi Anda di perusahaan': 'Finance Manager'
    },
    submittedAt: '2025-12-14 10:45:00',
    createdAt: '2025-12-14 10:45:00',
    updatedAt: '2025-12-14 10:45:00'
  },
  {
    id: 'bd4',
    campaignId: 'camp1',
    formId: 'form1',
    clientName: 'PT Global Trading Indonesia',
    picName: 'Linda Wijaya',
    email: 'linda@globaltrading.co.id',
    phone: '+62 821-1122-3344',
    sourceChannel: 'EVENT',
    campaignName: 'Webinar: Tax Planning 2026',
    topicTag: 'TAX_PLANNING',
    triageStatus: 'RAW_NEW',
    extraAnswers: {
      'Bidang Usaha': 'Trading',
      'Ukuran Perusahaan (Revenue)': '> IDR 500B',
      'Topik apa yang paling ingin Anda pelajari?': 'International tax dan customs'
    },
    submittedAt: '2025-12-15 16:20:00',
    createdAt: '2025-12-15 16:20:00',
    updatedAt: '2025-12-15 16:20:00'
  },
  
  // PROMOTED_TO_LEAD (already promoted)
  {
    id: 'bd5',
    campaignId: 'camp4',
    formId: 'form4',
    clientName: 'PT Sentosa Property',
    picName: 'Bambang Sutrisno',
    email: 'bambang@sentosa-property.id',
    phone: '+62 823-9999-0000',
    sourceChannel: 'EVENT',
    campaignName: 'Webinar: Legal Entity Setup',
    topicTag: 'LEGAL_SETUP',
    triageStatus: 'PROMOTED_TO_LEAD',
    extraAnswers: {
      'Apakah Anda berencana mendirikan perusahaan baru?': 'Ya, dalam 3 bulan',
      'Jenis badan usaha yang diinginkan': 'PT (PMDN)'
    },
    notes: 'Good lead - planning to setup 3 new subsidiaries for property projects',
    cleanedBy: 'John (BD Admin)',
    cleanedAt: '2025-12-03',
    promotedToLeadId: '11',
    promotedBy: 'John (BD Admin)',
    promotedAt: '2025-12-03',
    submittedAt: '2025-12-02 11:30:00',
    createdAt: '2025-12-02 11:30:00',
    updatedAt: '2025-12-03 09:15:00'
  },
  
  // REJECTED (low quality)
  {
    id: 'bd6',
    campaignId: 'camp3',
    formId: 'form3',
    clientName: 'Test Company',
    picName: 'Test User',
    email: 'test@test.com',
    phone: '081234567890',
    sourceChannel: 'WEBSITE',
    campaignName: 'Free Download: Tax Compliance Checklist',
    triageStatus: 'REJECTED',
    extraAnswers: {
      'Posisi Anda di perusahaan': 'Other'
    },
    notes: 'Fake submission - test data',
    rejectedBy: 'John (BD Admin)',
    rejectedAt: '2025-12-11',
    rejectedReason: 'Test/fake submission',
    submittedAt: '2025-12-10 23:45:00',
    createdAt: '2025-12-10 23:45:00',
    updatedAt: '2025-12-11 08:00:00'
  },
  
  // Another REJECTED example (incomplete data)
  {
    id: 'bd7',
    campaignId: 'camp2',
    formId: 'form2',
    clientName: 'PT ABC',
    picName: 'John',
    email: 'john@abc',
    phone: '08123456',
    sourceChannel: 'IG',
    campaignName: 'IG Story: Transfer Pricing Awareness',
    triageStatus: 'REJECTED',
    extraAnswers: {
      'Apakah perusahaan Anda sudah punya dokumentasi TP?': 'Tidak Tahu',
      'Layanan apa yang Anda butuhkan?': []
    },
    notes: 'Invalid email format, incomplete phone number',
    rejectedBy: 'Sarah (BD Admin)',
    rejectedAt: '2025-12-13',
    rejectedReason: 'Incomplete contact information - cannot verify',
    cleanedBy: 'Sarah (BD Admin)',
    cleanedAt: '2025-12-13',
    submittedAt: '2025-12-13 08:15:00',
    createdAt: '2025-12-13 08:15:00',
    updatedAt: '2025-12-13 09:00:00'
  },
  
  // More RAW_NEW for variety
  {
    id: 'bd8',
    campaignId: 'camp1',
    formId: 'form1',
    clientName: 'CV Maju Bersama',
    picName: 'Dewi Sartika',
    email: 'dewi@majubersama.com',
    phone: '+62 815-6677-8899',
    sourceChannel: 'EVENT',
    campaignName: 'Webinar: Tax Planning 2026',
    topicTag: 'TAX_PLANNING',
    triageStatus: 'RAW_NEW',
    extraAnswers: {
      'Bidang Usaha': 'Manufacturing',
      'Ukuran Perusahaan (Revenue)': 'IDR 50-500B',
      'Topik apa yang paling ingin Anda pelajari?': 'Tax compliance dan reporting requirements untuk manufaktur'
    },
    submittedAt: '2025-12-16 11:00:00',
    createdAt: '2025-12-16 11:00:00',
    updatedAt: '2025-12-16 11:00:00'
  },
  {
    id: 'bd9',
    campaignId: 'camp5',
    formId: 'form3', // Reusing freebie form
    clientName: 'PT Berkah Sejahtera',
    picName: 'Ahmad Yani',
    email: 'ahmad@berkahsejahtera.com',
    phone: '+62 816-1357-2468',
    sourceChannel: 'LINKEDIN',
    campaignName: 'LinkedIn Post: Financial Advisory Case Study',
    triageStatus: 'RAW_NEW',
    extraAnswers: {
      'Posisi Anda di perusahaan': 'CFO'
    },
    submittedAt: '2025-12-17 09:30:00',
    createdAt: '2025-12-17 09:30:00',
    updatedAt: '2025-12-17 09:30:00'
  },
  // EVENT campaign submissions
  {
    id: 'bd10',
    campaignId: 'camp6',
    formId: 'form5',
    clientName: 'PT Maju Bersama',
    picName: 'Dewi Sartika',
    email: 'dewi@majubersama.co.id',
    phone: '+62 812-3456-7890',
    sourceChannel: 'EVENT',
    campaignName: 'Annual Tax Seminar 2026',
    triageStatus: 'RAW_NEW',
    extraAnswers: {
      'Jenis Perusahaan': 'PT (PMDN)',
      'Bidang Usaha': 'Manufacturing',
      'Apakah Anda ingin mengikuti sesi Q&A?': 'Ya',
      'Pertanyaan atau topik yang ingin dibahas': 'Update PPh 21 dan PPh 23 untuk tahun 2026'
    },
    submittedAt: '2026-01-05 10:15:00',
    createdAt: '2026-01-05 10:15:00',
    updatedAt: '2026-01-05 10:15:00'
  },
  {
    id: 'bd11',
    campaignId: 'camp6',
    formId: 'form5',
    clientName: 'PT Sejahtera Abadi',
    picName: 'Rudi Hartono',
    email: 'rudi@sejahteraabadi.com',
    phone: '+62 813-4567-8901',
    sourceChannel: 'EVENT',
    campaignName: 'Annual Tax Seminar 2026',
    triageStatus: 'RAW_NEW',
    extraAnswers: {
      'Jenis Perusahaan': 'PT (PMA)',
      'Bidang Usaha': 'Technology',
      'Apakah Anda ingin mengikuti sesi Q&A?': 'Ya',
      'Pertanyaan atau topik yang ingin dibahas': 'Tax incentives untuk perusahaan teknologi'
    },
    submittedAt: '2026-01-06 14:30:00',
    createdAt: '2026-01-06 14:30:00',
    updatedAt: '2026-01-06 14:30:00'
  },
  {
    id: 'bd12',
    campaignId: 'camp6',
    formId: 'form5',
    clientName: 'CV Mandiri Jaya',
    picName: 'Sari Indrawati',
    email: 'sari@mandirijaya.id',
    phone: '+62 814-5678-9012',
    sourceChannel: 'EVENT',
    campaignName: 'Annual Tax Seminar 2026',
    triageStatus: 'RAW_NEW',
    extraAnswers: {
      'Jenis Perusahaan': 'CV',
      'Bidang Usaha': 'Services',
      'Apakah Anda ingin mengikuti sesi Q&A?': 'Tidak',
      'Pertanyaan atau topik yang ingin dibahas': 'Perubahan tarif PPN dan cara menghitungnya'
    },
    submittedAt: '2026-01-07 11:45:00',
    createdAt: '2026-01-07 11:45:00',
    updatedAt: '2026-01-07 11:45:00'
  },
  {
    id: 'bd13',
    campaignId: 'camp6',
    formId: 'form5',
    clientName: 'PT Global Finance',
    picName: 'Bambang Wijaya',
    email: 'bambang@globalfinance.co.id',
    phone: '+62 815-6789-0123',
    sourceChannel: 'EVENT',
    campaignName: 'Annual Tax Seminar 2026',
    triageStatus: 'RAW_NEW',
    extraAnswers: {
      'Jenis Perusahaan': 'PT (PMDN)',
      'Bidang Usaha': 'Finance',
      'Apakah Anda ingin mengikuti sesi Q&A?': 'Ya',
      'Pertanyaan atau topik yang ingin dibahas': 'Tax planning untuk perusahaan finance dan investment'
    },
    submittedAt: '2026-01-08 09:20:00',
    createdAt: '2026-01-08 09:20:00',
    updatedAt: '2026-01-08 09:20:00'
  },
  {
    id: 'bd14',
    campaignId: 'camp6',
    formId: 'form5',
    clientName: 'PT Properti Nusantara',
    picName: 'Indra Gunawan',
    email: 'indra@propertinusantara.id',
    phone: '+62 816-7890-1234',
    sourceChannel: 'EVENT',
    campaignName: 'Annual Tax Seminar 2026',
    triageStatus: 'RAW_NEW',
    extraAnswers: {
      'Jenis Perusahaan': 'PT (PMDN)',
      'Bidang Usaha': 'Real Estate',
      'Apakah Anda ingin mengikuti sesi Q&A?': 'Ya',
      'Pertanyaan atau topik yang ingin dibahas': 'Tax treatment untuk penjualan property dan PPh final'
    },
    submittedAt: '2026-01-09 15:10:00',
    createdAt: '2026-01-09 15:10:00',
    updatedAt: '2026-01-09 15:10:00'
  }
];

// Helper function to get form by campaign
export function getFormByCampaign(campaignId: string): Form | undefined {
  return mockForms.find(f => f.campaignId === campaignId);
}

// Helper function to get bank data by campaign
export function getBankDataByCampaign(campaignId: string): BankDataEntry[] {
  return mockBankData.filter(bd => bd.campaignId === campaignId);
}

// Helper function to get bank data statistics
export function getBankDataStats() {
  return {
    total: mockBankData.length,
    rawNew: mockBankData.filter(bd => bd.triageStatus === 'RAW_NEW').length,
    promoted: mockBankData.filter(bd => bd.triageStatus === 'PROMOTED_TO_LEAD').length,
    rejected: mockBankData.filter(bd => bd.triageStatus === 'REJECTED').length,
  };
}

// ==================== CEO LEADS (Promoted from Bank Data) ====================

export interface CEOLead {
  id: string;
  clientName: string;
  picName: string;
  email: string;
  phone: string;
  sourceType: 'CAMPAIGN_FORM' | 'MANUAL';
  sourceCampaignName?: string;
  topicTag?: string;
  /** Source channel of the lead (copied from bank_data_entries.source_channel when promoted). */
  sourceChannel?: import('./leadManagementTypes').Channel;
  ceoFollowUpStatus: 'FOLLOWUP_PENDING' | 'FOLLOWED_UP' | 'DROP';
  promotedAt: string;
  promotedBy: string;
  ceoFollowUpDate?: string;
  ceoFollowUpNotes?: string;
  pipelineStatus: string;
  /** Backend-derived tracker meta (should mirror FE deriveLeadTrackerRowMeta outputs) */
  commercialStage?: string;
  activeDocumentLabel?: string;
  lastActivity?: string;
  extraData?: Record<string, any>;
  bankDataNotes?: string;
  bankDataId?: string;
}

export const mockCEOLeads: CEOLead[] = [
  // FOLLOWUP_PENDING (need CEO review)
  {
    id: 'lead1',
    clientName: 'PT Sentosa Property',
    picName: 'Bambang Sutrisno',
    email: 'bambang@sentosa-property.id',
    phone: '+62 823-9999-0000',
    sourceType: 'CAMPAIGN_FORM',
    sourceCampaignName: 'Webinar: Legal Entity Setup',
    topicTag: 'LEGAL_SETUP',
    sourceChannel: 'EVENT',
    ceoFollowUpStatus: 'FOLLOWUP_PENDING',
    promotedAt: '2025-12-03 09:15:00',
    promotedBy: 'John (BD Admin)',
    pipelineStatus: 'NEED_PREPITCHING',
    extraData: {
      'Apakah Anda berencana mendirikan perusahaan baru?': 'Ya, dalam 3 bulan',
      'Jenis badan usaha yang diinginkan': 'PT (PMDN)'
    },
    bankDataNotes: 'Good lead - planning to setup 3 new subsidiaries for property projects',
    bankDataId: 'bd5'
  },
  {
    id: 'lead2',
    clientName: 'PT Mitra Teknologi',
    picName: 'Budi Hartono',
    email: 'budi@mitratekno.com',
    phone: '+62 811-2233-4455',
    sourceType: 'CAMPAIGN_FORM',
    sourceCampaignName: 'Webinar: Tax Planning 2026',
    topicTag: 'TAX_PLANNING',
    sourceChannel: 'EVENT',
    ceoFollowUpStatus: 'FOLLOWUP_PENDING',
    promotedAt: '2025-12-18 14:30:00',
    promotedBy: 'John (BD Admin)',
    pipelineStatus: 'NEED_PREPITCHING',
    extraData: {
      'Bidang Usaha': 'Technology',
      'Ukuran Perusahaan (Revenue)': 'IDR 5-50B',
      'Topik apa yang paling ingin Anda pelajari?': 'Transfer pricing dan tax incentives untuk startup teknologi'
    },
    bankDataNotes: 'Tech startup interested in TP - high potential',
    bankDataId: 'bd1'
  },
  {
    id: 'lead3',
    clientName: 'CV Karya Mandiri',
    picName: 'Siti Nurhaliza',
    email: 'siti@karyamandiri.id',
    phone: '+62 812-9988-7766',
    sourceType: 'CAMPAIGN_FORM',
    sourceCampaignName: 'IG Story: Transfer Pricing Awareness',
    sourceChannel: 'IG',
    ceoFollowUpStatus: 'FOLLOWUP_PENDING',
    promotedAt: '2025-12-19 10:00:00',
    promotedBy: 'Sarah (BD Admin)',
    pipelineStatus: 'NEED_PREPITCHING',
    extraData: {
      'Apakah perusahaan Anda sudah punya dokumentasi TP?': 'Belum',
      'Layanan apa yang Anda butuhkan?': ['Transfer Pricing Documentation', 'TP Advisory']
    },
    bankDataNotes: 'New to TP - needs comprehensive documentation',
    bankDataId: 'bd2'
  },
  
  // FOLLOWED_UP (CEO already reviewed)
  {
    id: 'lead4',
    clientName: 'PT Global Resources',
    picName: 'Michael Tan',
    email: 'michael@globalresources.co.id',
    phone: '+62 821-5555-6666',
    sourceType: 'CAMPAIGN_FORM',
    sourceCampaignName: 'Webinar: Tax Planning 2026',
    topicTag: 'TAX_PLANNING',
    sourceChannel: 'EVENT',
    ceoFollowUpStatus: 'FOLLOWED_UP',
    promotedAt: '2025-11-28 11:20:00',
    promotedBy: 'John (BD Admin)',
    ceoFollowUpDate: '2025-12-01 15:30:00',
    ceoFollowUpNotes: 'Spoke with Michael on Dec 1. Very interested in comprehensive tax planning for 2026. Company expanding to 3 new regions. Agreed to meet next week for detailed discussion. High priority - potential 6-month engagement.',
    pipelineStatus: 'PREPITCHING_APPROVED',
    extraData: {
      'Bidang Usaha': 'Manufacturing',
      'Ukuran Perusahaan (Revenue)': '> IDR 500B',
      'Topik apa yang paling ingin Anda pelajari?': 'Regional expansion tax strategy'
    },
    bankDataNotes: 'Large manufacturer, high revenue - premium client potential'
  },
  {
    id: 'lead5',
    clientName: 'PT Indah Jaya',
    picName: 'Rina Kusuma',
    email: 'rina@indahjaya.com',
    phone: '+62 813-7777-8888',
    sourceType: 'CAMPAIGN_FORM',
    sourceCampaignName: 'Free Download: Tax Compliance Checklist',
    sourceChannel: 'WEBSITE',
    ceoFollowUpStatus: 'FOLLOWED_UP',
    promotedAt: '2025-11-25 09:45:00',
    promotedBy: 'Sarah (BD Admin)',
    ceoFollowUpDate: '2025-11-27 10:00:00',
    ceoFollowUpNotes: 'Quick call with Rina. They downloaded checklist and found gaps in their compliance. Interested in audit support. Finance team will review internally first, follow up in 2 weeks.',
    pipelineStatus: 'MEETING_SCHEDULED',
    extraData: {
      'Posisi Anda di perusahaan': 'CFO'
    },
    bankDataNotes: 'CFO direct contact - decision maker'
  },
  
  // DROP (CEO decided not to pursue)
  {
    id: 'lead6',
    clientName: 'CV Kecil Mandiri',
    picName: 'Agus Wijaya',
    email: 'agus@kecilmandiri.id',
    phone: '+62 819-1111-2222',
    sourceType: 'CAMPAIGN_FORM',
    sourceCampaignName: 'IG Story: Transfer Pricing Awareness',
    sourceChannel: 'IG',
    ceoFollowUpStatus: 'DROP',
    promotedAt: '2025-11-20 14:15:00',
    promotedBy: 'John (BD Admin)',
    ceoFollowUpDate: '2025-11-22 16:00:00',
    ceoFollowUpNotes: 'Called Agus. Company too small (< 10 employees, revenue < 1B). Not target market for our TP services. Politely declined and provided some free resources.',
    pipelineStatus: 'DROP',
    extraData: {
      'Apakah perusahaan Anda sudah punya dokumentasi TP?': 'Belum',
      'Layanan apa yang Anda butuhkan?': ['Transfer Pricing Documentation']
    },
    bankDataNotes: 'Small CV - may not meet minimum threshold'
  },
  
  // Manual Entry Leads
  {
    id: 'lead7',
    clientName: 'PT Internasional Trade',
    picName: 'Robert Chen',
    email: 'robert@intltrade.com',
    phone: '+62 821-9999-1111',
    sourceType: 'MANUAL',
    ceoFollowUpStatus: 'FOLLOWUP_PENDING',
    promotedAt: '2025-12-20 08:00:00',
    promotedBy: 'John (BD Admin)',
    pipelineStatus: 'NEED_PREPITCHING',
    bankDataNotes: 'Referral from existing client PT Global Resources. Import/export business, needs customs and TP advisory.'
  },
  {
    id: 'lead8',
    clientName: 'PT Digital Indonesia',
    picName: 'Sarah Putri',
    email: 'sarah@digitalindo.id',
    phone: '+62 812-3333-4444',
    sourceType: 'MANUAL',
    ceoFollowUpStatus: 'FOLLOWED_UP',
    promotedAt: '2025-12-10 13:30:00',
    promotedBy: 'Sarah (BD Admin)',
    ceoFollowUpDate: '2025-12-12 11:00:00',
    ceoFollowUpNotes: 'Met Sarah at networking event. Digital agency looking for tax optimization strategies for remote team. Good fit for our digital economy tax practice. Sending proposal this week.',
    pipelineStatus: 'IN_PROPOSAL',
    bankDataNotes: 'Met at Tech Conference Jakarta 2025 - warm lead'
  }
];

// Helper: Get CEO leads by status
export function getCEOLeadsByStatus(status: 'FOLLOWUP_PENDING' | 'FOLLOWED_UP' | 'DROP' | 'ALL') {
  if (status === 'ALL') return mockCEOLeads;
  return mockCEOLeads.filter(lead => lead.ceoFollowUpStatus === status);
}

// Helper: Get CEO lead stats
export function getCEOLeadStats() {
  return {
    total: mockCEOLeads.length,
    pending: mockCEOLeads.filter(l => l.ceoFollowUpStatus === 'FOLLOWUP_PENDING').length,
    followedUp: mockCEOLeads.filter(l => l.ceoFollowUpStatus === 'FOLLOWED_UP').length,
    dropped: mockCEOLeads.filter(l => l.ceoFollowUpStatus === 'DROP').length,
  };
}

