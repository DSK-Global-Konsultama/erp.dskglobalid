export interface Lead {
  id: string;
  clientName: string;
  company: string;
  email: string;
  phone: string;
  source: 'Facebook' | 'Instagram' | 'LinkedIn' | 'Website' | 'Referral' | 'Cold Call' | 'Event' | 'Other';
  status: 'available' | 'claimed' | 'follow-up' | 'deal' | 'lost';
  claimedBy?: string; // BD Executive yang claim
  createdDate: string;
  claimedDate?: string;
  lastFollowUp?: string;
  lastActivity?: string; // Last activity description (e.g., "Meeting scheduled for 2025-12-15")
  notes: string;
  createdBy: string; // BD Content Creator
}

export interface Service {
  id: string;
  name: string;
  description: string;
  estimatedValue: number;
  elId?: string; // reference to EL if separate
}

export interface EL {
  id: string;
  serviceIds: string[]; // bisa untuk 1 layanan atau multiple layanan
  status: 'draft' | 'submitted' | 'approved';
  submittedDate?: string;
  approvedDate?: string;
  paymentTerms?: {
    scheme: '50-50' | '50-35-15' | '40-30-30' | 'custom';
    terms: {
      percentage: number;
      description: string;
    }[];
  };
}

export interface Deal {
  id: string;
  leadId: string;
  clientName: string;
  company: string;
  services: Service[]; // multiple services
  totalDealValue: number;
  proposalStatus: 'draft' | 'submitted' | 'approved';
  proposalSubmittedDate?: string;
  proposalApprovedDate?: string;
  els: EL[]; // bisa multiple EL (1 EL all services atau 1 EL per service)
  elStrategy: 'single' | 'separate'; // satu EL untuk semua atau terpisah per layanan
  bdExecutive: string; // BD Executive yang handle
  createdDate: string;
  clientNeeds: string;
}

export interface Project {
  id: string;
  dealId: string;
  serviceId: string; // reference to service in deal
  elId: string; // reference to EL
  projectName: string;
  serviceName: string;
  clientName: string;
  assignedPM?: string; // CEO/COO yang assign PM
  assignedConsultant?: string; // PM yang assign Consultant
  status: 'waiting-assignment' | 'waiting-pm' | 'waiting-el' | 'waiting-first-payment' | 'in-progress' | 'waiting-final-payment' | 'completed';
  dueDate: string;
  startDate?: string;
  completionDate?: string;
  pmNotified: boolean;
  progressPercentage?: number; // Progress percentage (0-100) yang diisi oleh PM
}

/** Status pembayaran per termin pada daftar termin (legacy, prefer processStatus/paymentStatus) */
export type PaymentTermStatus =
  | 'draft'
  | 'waiting approval'
  | 'approve'
  | 'sent'
  | 'paid'
  | 'revision';

/** Alur proses termin: draft -> upload -> submit CEO -> approve -> kirim klien */
export type ProcessStatus =
  | 'DRAFT'
  | 'READY_FOR_APPROVAL'
  | 'PENDING_CEO_APPROVAL'
  | 'CEO_APPROVED'
  | 'CEO_REJECTED'
  | 'SENT_TO_CLIENT';

/** Status pembayaran setelah dikirim ke klien */
export type PaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID' | 'OVERDUE';

export interface TermPayment {
  id: string;
  amount: number;
  date: string;
  proofUrl: string;
  note?: string;
}

export interface PaymentTerm {
  id: string;
  termNumber: number;
  percentage: number;
  amount: number;
  description: string;
  /** @deprecated Use processStatus + paymentStatus */
  status?: PaymentTermStatus;
  processStatus: ProcessStatus;
  paymentStatus: PaymentStatus;
  invoiceNumber?: string | null;
  invoiceDate?: string | null;
  sentAt?: string | null;
  dueDate?: string | null;
  invoiceFileUrl?: string | null;
  ceoRejectReason?: string | null;
  paidDate?: string | null;
  paidAmount?: number;
  payments?: TermPayment[];
  /** Tax config */
  vatEnabled?: boolean;
  vatRate?: number;
  vatMode?: 'EXCLUSIVE' | 'INCLUSIVE';
  withholdingEnabled?: boolean;
  withholdingRate?: number;
  withholdingBase?: 'DPP' | 'GROSS';
  subtotal?: number;
  total?: number;
  withholdingTax?: number;
  /** Legacy / preview fields */
  issueDate?: string;
  billToName?: string;
  billToAddress?: string;
  invoiceDescription?: string;
  taxRate?: number;
  other?: number;
}

export interface Invoice {
  id: string;
  projectId: string;
  /** Judul proyek (dari handover); untuk tampilan kolom "Nama proyek" */
  projectTitle?: string;
  /** Nama layanan (untuk kolom Layanan) */
  service?: string;
  clientName: string;
  /** Nama perusahaan (fallback untuk ringkasan invoice) */
  companyName?: string;
  /** Email kontak klien */
  clientEmail?: string;
  /** Telepon kontak klien */
  clientPhone?: string;
  /** Alamat klien */
  clientAddress?: string;
  /** No. invoice (fallback untuk ringkasan) */
  invoiceNumber?: string;
  /** Tanggal terbit (fallback: createdDate) */
  issueDate?: string;
  /** Deskripsi invoice */
  description?: string;
  paymentTerms: PaymentTerm[]; // flexible payment schedule
  totalAmount: number;
  createdDate: string;
  /** Tax rate decimal atau persen (fallback ringkasan) */
  taxRate?: number;
  /** Withholding rate (fallback) */
  withholdingRate?: number;
  /** PPh dipotong (fallback) */
  withholdingTax?: number;
  /** Biaya lain (fallback) */
  other?: number;
  /** Total (fallback) */
  total?: number;
}

export interface Meeting {
  id: string;
  leadId: string;
  name?: string;
  dateTime: string;
  location: string;
  status: 'SCHEDULED' | 'DONE' | 'CANCELLED';
  notes?: string;
}

export interface Notulensi {
  id: string;
  leadId: string;
  meetingId: string;
  clientName: string;
  meetingInfo: {
    date: string;
    time: string;
    location: string;
  };
  participants: {
    internal: string[];
    client: string[];
  };
  objectives: string;
  discussionSummary: {
    background: string;
    issuesDiscussed: string;
    clientInfo: string;
    firmInfo: string;
    risks: string;
  };
  agreements: Array<{
    item: string;
    details: string;
  }>;
  actionItems: Array<{
    action: string;
    pic: string;
    deadline: string;
  }>;
  nextSteps: string;
  notes: string;
  status: 'DRAFT' | 'WAITING_CEO_APPROVAL' | 'REVISION' | 'APPROVED';
  createdBy: string;
  createdAt: string;
  /** Catatan revisi dari CEO ketika status = REVISION */
  revisionNotes?: {
    sections: string[];
    note: string;
    createdAt: string;
    createdBy?: string;
  };
}

export interface Proposal {
  id: string;
  leadId: string;
  service: string;
  proposalFee: number;
  agreeFee?: number;
  paymentType: string;
  paymentTypeFinal?: string;
  dealDate?: string;
  hasSubcon: boolean;
  sentAt?: string;
  fileUrl?: string;
  status:
  | 'DRAFT'
  | 'WAITING_APPROVAL'
  | 'WAITING_CEO_APPROVAL'
  | 'REVISION'
  | 'APPROVED'
  | 'SENT'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'PROPOSAL_EXPIRED';
  revisionNotes?: string;
  createdAt: string;
  createdBy?: string;
  clientName?: string;
}

export interface EngagementLetter {
  id: string;
  leadId: string;
  service: string;
  agreeFee?: number;
  hasSubcon: boolean;
  paymentType: string;
  paymentTypeFinal?: string;
  status: 'DRAFT' | 'WAITING_APPROVAL' | 'REVISION' | 'APPROVED' | 'SENT' | 'SIGNED';
  clientName: string;
  createdAt?: string;
  signedDate?: string;
  sentAt?: string;
  fileUrl?: string;
  submittedDate?: string;
  approvedDate?: string;
}

export interface Handover {
  id: string;
  leadId: string;
  projectId?: string;
  clientName: string;
  projectTitle: string;
  pm: string;
  status: 'DRAFT' | 'WAITING_CEO_APPROVAL' | 'REVISION' | 'APPROVED' | 'SENT_TO_PM' | 'CONVERTED';
  createdBy: string;
  createdAt: string;
  summary?: string;
  deliverables?: string[];
  notes?: string;
}

// Master data
export const bdContentCreators = [
  'Sarah Wijaya',
  'Tommy Budiman',
];

export const bdExecutives = [
  'Andi Wijaya',
  'Rina Kusuma',
  'Dedi Supriyanto',
  'Fitri Handayani',
];

export const projectManagers = [
  'Diana Putri',
  'Eko Prasetyo',
  'Farhan Rahman',
  'Gita Sari',
];

export const consultants = [
  'Bambang Hermawan',
  'Citra Dewi',
  'Hadi Purnomo',
  'Indah Permata',
  'Joko Santoso',
];

export const leadSources = [
  'Facebook',
  'Instagram',
  'LinkedIn',
  'Website',
  'Referral',
  'Cold Call',
  'Event',
  'Other',
] as const;

export const mockLeads: Lead[] = [
  // Leads untuk 5 layanan (15 project total)
  // Web Dev - 3 leads
  {
    id: 'L001',
    clientName: 'Budi Santoso',
    company: 'PT Maju Jaya',
    email: 'budi@majujaya.com',
    phone: '081234567890',
    source: 'Facebook',
    status: 'deal',
    claimedBy: 'Andi Wijaya',
    createdDate: '2025-09-15',
    claimedDate: '2025-09-16',
    lastFollowUp: '2025-10-10',
    notes: 'Tertarik dengan paket premium, akan diskusi dengan tim',
    createdBy: 'Sarah Wijaya',
  },
  {
    id: 'L002',
    clientName: 'Siti Rahayu',
    company: 'CV Berkah Sentosa',
    email: 'siti@berkahsentosa.com',
    phone: '082345678901',
    source: 'Instagram',
    status: 'deal',
    claimedBy: 'Rina Kusuma',
    createdDate: '2025-09-20',
    claimedDate: '2025-09-21',
    lastFollowUp: '2025-10-05',
    notes: 'Deal closed untuk Web Dev',
    createdBy: 'Sarah Wijaya',
  },
  {
    id: 'L003',
    clientName: 'Ahmad Fauzi',
    company: 'PT Teknologi Nusantara',
    email: 'ahmad@teknusantara.com',
    phone: '083456789012',
    source: 'LinkedIn',
    status: 'deal',
    claimedBy: 'Andi Wijaya',
    createdDate: '2025-10-18',
    claimedDate: '2025-10-19',
    notes: 'Deal untuk Web Dev',
    createdBy: 'Tommy Budiman',
  },
  // Audit and Assurance - 3 leads
  {
    id: 'L004',
    clientName: 'Hendra Gunawan',
    company: 'PT Global Mandiri',
    email: 'hendra@globalmandiri.com',
    phone: '085678901234',
    source: 'Website',
    status: 'deal',
    claimedBy: 'Rina Kusuma',
    createdDate: '2025-08-05',
    claimedDate: '2025-08-06',
    lastFollowUp: '2025-09-01',
    notes: 'Deal untuk Audit and Assurance',
    createdBy: 'Tommy Budiman',
  },
  {
    id: 'L005',
    clientName: 'Rudi Hartono',
    company: 'PT Cahaya Abadi',
    email: 'rudi@cahayaabadi.com',
    phone: '086789012345',
    source: 'Event',
    status: 'deal',
    claimedBy: 'Andi Wijaya',
    createdDate: '2025-10-08',
    claimedDate: '2025-10-09',
    notes: 'Ketemu di tech expo untuk Audit',
    createdBy: 'Sarah Wijaya',
  },
  {
    id: 'L006',
    clientName: 'Linda Wijayanti',
    company: 'CV Surya Gemilang',
    email: 'linda@suryagemilang.com',
    phone: '087890123456',
    source: 'Instagram',
    status: 'deal',
    claimedBy: 'Rina Kusuma',
    createdDate: '2025-10-05',
    claimedDate: '2025-10-06',
    notes: 'DM Instagram untuk Audit',
    createdBy: 'Tommy Budiman',
  },
  // Tax Compliance - 3 leads
  {
    id: 'L007',
    clientName: 'Dewi Lestari',
    company: 'UD Makmur Sejahtera',
    email: 'dewi@makmursejahtera.com',
    phone: '084567890123',
    source: 'Referral',
    status: 'deal',
    claimedBy: 'Rina Kusuma',
    createdDate: '2025-07-10',
    claimedDate: '2025-07-11',
    lastFollowUp: '2025-07-25',
    notes: 'Deal untuk Tax Compliance',
    createdBy: 'Sarah Wijaya',
  },
  {
    id: 'L008',
    clientName: 'Bambang Suryadi',
    company: 'PT Sejahtera Makmur',
    email: 'bambang@sejahteramakmur.com',
    phone: '088901234567',
    source: 'LinkedIn',
    status: 'deal',
    claimedBy: 'Andi Wijaya',
    createdDate: '2025-09-10',
    claimedDate: '2025-09-11',
    notes: 'Deal untuk Tax Compliance',
    createdBy: 'Sarah Wijaya',
  },
  {
    id: 'L009',
    clientName: 'Sari Indrawati',
    company: 'PT Indah Permai',
    email: 'sari@indahpermai.com',
    phone: '089012345678',
    source: 'Website',
    status: 'deal',
    claimedBy: 'Rina Kusuma',
    createdDate: '2025-10-01',
    claimedDate: '2025-10-02',
    notes: 'Deal untuk Tax Compliance',
    createdBy: 'Tommy Budiman',
  },
  // Tax Dispute - 3 leads
  {
    id: 'L010',
    clientName: 'Agus Setiawan',
    company: 'PT Bumi Nusantara',
    email: 'agus@buminusantara.com',
    phone: '081123456789',
    source: 'Referral',
    status: 'deal',
    claimedBy: 'Andi Wijaya',
    createdDate: '2025-08-15',
    claimedDate: '2025-08-16',
    notes: 'Deal untuk Tax Dispute',
    createdBy: 'Sarah Wijaya',
  },
  {
    id: 'L011',
    clientName: 'Ratna Dewi',
    company: 'PT Harmoni Jaya',
    email: 'ratna@harmonijaya.com',
    phone: '082234567890',
    source: 'Facebook',
    status: 'deal',
    claimedBy: 'Rina Kusuma',
    createdDate: '2025-09-20',
    claimedDate: '2025-09-21',
    notes: 'Deal untuk Tax Dispute',
    createdBy: 'Tommy Budiman',
  },
  {
    id: 'L012',
    clientName: 'Bambang Wijaya',
    company: 'PT Sentosa Abadi',
    email: 'bambang@sentosaabadi.com',
    phone: '083345678901',
    source: 'Event',
    status: 'deal',
    claimedBy: 'Andi Wijaya',
    createdDate: '2025-10-10',
    claimedDate: '2025-10-11',
    notes: 'Deal untuk Tax Dispute',
    createdBy: 'Sarah Wijaya',
  },
  // Transfer Pricing - 3 leads
  {
    id: 'L013',
    clientName: 'Ahmad Kurniawan',
    company: 'PT Alam Lestari',
    email: 'ahmad@alamlestari.com',
    phone: '084456789012',
    source: 'LinkedIn',
    status: 'deal',
    claimedBy: 'Rina Kusuma',
    createdDate: '2025-08-25',
    claimedDate: '2025-08-26',
    notes: 'Deal untuk Transfer Pricing',
    createdBy: 'Tommy Budiman',
  },
  {
    id: 'L014',
    clientName: 'Siti Nurhaliza',
    company: 'PT Karya Mandiri',
    email: 'siti@karyamandiri.com',
    phone: '085567890123',
    source: 'Instagram',
    status: 'deal',
    claimedBy: 'Andi Wijaya',
    createdDate: '2025-09-15',
    claimedDate: '2025-09-16',
    notes: 'Deal untuk Transfer Pricing',
    createdBy: 'Sarah Wijaya',
  },
  {
    id: 'L015',
    clientName: 'Dedi Kurniawan',
    company: 'PT Sejahtera Bersama',
    email: 'dedi@sejahterabersama.com',
    phone: '086678901234',
    source: 'Website',
    status: 'deal',
    claimedBy: 'Rina Kusuma',
    createdDate: '2025-10-05',
    claimedDate: '2025-10-06',
    notes: 'Deal untuk Transfer Pricing',
    createdBy: 'Tommy Budiman',
  },
  // Dummy leads untuk CEO Approval
  {
    id: 'L201',
    clientName: 'Ahmad Pratama',
    company: 'PT Teknologi Maju',
    email: 'ahmad@teknologimaju.com',
    phone: '081111111111',
    source: 'Website',
    status: 'follow-up',
    claimedBy: 'Andi Wijaya',
    createdDate: '2025-11-15',
    claimedDate: '2025-11-16',
    notes: 'Lead untuk Tax Compliance',
    createdBy: 'Sarah Wijaya',
  },
  {
    id: 'L202',
    clientName: 'Budi Santoso',
    company: 'PT Maju Jaya',
    email: 'budi@majujaya.com',
    phone: '082222222222',
    source: 'LinkedIn',
    status: 'follow-up',
    claimedBy: 'Rina Kusuma',
    createdDate: '2025-11-10',
    claimedDate: '2025-11-11',
    notes: 'Lead untuk Audit and Assurance',
    createdBy: 'Tommy Budiman',
  },
  {
    id: 'L203',
    clientName: 'Sari Indrawati',
    company: 'PT Indah Permai',
    email: 'sari@indahpermai.com',
    phone: '083333333333',
    source: 'Referral',
    status: 'follow-up',
    claimedBy: 'Dedi Supriyanto',
    createdDate: '2025-11-12',
    claimedDate: '2025-11-13',
    notes: 'Lead untuk Transfer Pricing',
    createdBy: 'Sarah Wijaya',
  },
  {
    id: 'L204',
    clientName: 'Rudi Kurniawan',
    company: 'PT Digital Nusantara',
    email: 'rudi@digitalnusantara.com',
    phone: '084444444444',
    source: 'Facebook',
    status: 'follow-up',
    claimedBy: 'Fitri Handayani',
    createdDate: '2025-11-14',
    claimedDate: '2025-11-15',
    notes: 'Lead untuk Web Development dengan subcon',
    createdBy: 'Tommy Budiman',
  },
  {
    id: 'L205',
    clientName: 'Hendra Gunawan',
    company: 'PT Bumi Nusantara',
    email: 'hendra@buminusantara.com',
    phone: '085555555555',
    source: 'Event',
    status: 'follow-up',
    claimedBy: 'Andi Wijaya',
    createdDate: '2025-11-05',
    claimedDate: '2025-11-06',
    notes: 'Lead untuk Tax Dispute',
    createdBy: 'Sarah Wijaya',
  },
  {
    id: 'L206',
    clientName: 'Linda Wijayanti',
    company: 'PT Harmoni Jaya',
    email: 'linda@harmonijaya.com',
    phone: '086666666666',
    source: 'Instagram',
    status: 'follow-up',
    claimedBy: 'Rina Kusuma',
    createdDate: '2025-11-08',
    claimedDate: '2025-11-09',
    notes: 'Lead untuk Strategic Tax Advisory',
    createdBy: 'Tommy Budiman',
  },
];

export const mockDeals: Deal[] = [
  // Web Dev - 3 deals
  {
    id: 'D001',
    leadId: 'L001',
    clientName: 'Budi Santoso',
    company: 'PT Maju Jaya',
    services: [
      {
        id: 'S001',
        name: 'Web Dev',
        description: 'Company profile website dengan CMS',
        estimatedValue: 30000000,
        elId: 'EL001',
      },
    ],
    totalDealValue: 30000000,
    proposalStatus: 'approved',
    proposalApprovedDate: '2025-10-06',
    els: [
      {
        id: 'EL001',
        serviceIds: ['S001'],
        status: 'approved',
        approvedDate: '2025-10-09',
        paymentTerms: {
          scheme: '50-50',
          terms: [
            { percentage: 50, description: 'Pembayaran awal saat EL disetujui' },
            { percentage: 50, description: 'Pelunasan saat project selesai' },
          ],
        },
      },
    ],
    elStrategy: 'single',
    bdExecutive: 'Andi Wijaya',
    createdDate: '2025-10-05',
    clientNeeds: 'Client butuh website company profile dengan CMS untuk manage konten.',
  },
  {
    id: 'D002',
    leadId: 'L002',
    clientName: 'Siti Rahayu',
    company: 'CV Berkah Sentosa',
    services: [
      {
        id: 'S002',
        name: 'Web Dev',
        description: 'E-commerce website dengan payment gateway',
        estimatedValue: 45000000,
        elId: 'EL002',
      },
    ],
    totalDealValue: 45000000,
    proposalStatus: 'approved',
    proposalApprovedDate: '2025-10-10',
    els: [
      {
        id: 'EL002',
        serviceIds: ['S002'],
        status: 'approved',
        approvedDate: '2025-10-12',
        paymentTerms: {
          scheme: '50-50',
          terms: [
            { percentage: 50, description: 'Pembayaran awal saat EL disetujui' },
            { percentage: 50, description: 'Pelunasan saat project selesai' },
          ],
        },
      },
    ],
    elStrategy: 'single',
    bdExecutive: 'Rina Kusuma',
    createdDate: '2025-10-08',
    clientNeeds: 'Client butuh e-commerce website untuk jualan online dengan payment gateway terintegrasi.',
  },
  {
    id: 'D003',
    leadId: 'L003',
    clientName: 'Ahmad Fauzi',
    company: 'PT Teknologi Nusantara',
    services: [
      {
        id: 'S003',
        name: 'Web Dev',
        description: 'Custom web application dengan dashboard',
        estimatedValue: 60000000,
        elId: 'EL003',
      },
    ],
    totalDealValue: 60000000,
    proposalStatus: 'approved',
    proposalApprovedDate: '2025-10-20',
    els: [
      {
        id: 'EL003',
        serviceIds: ['S003'],
        status: 'approved',
        approvedDate: '2025-10-22',
        paymentTerms: {
          scheme: '50-50',
          terms: [
            { percentage: 50, description: 'Pembayaran awal saat EL disetujui' },
            { percentage: 50, description: 'Pelunasan saat project selesai' },
          ],
        },
      },
    ],
    elStrategy: 'single',
    bdExecutive: 'Andi Wijaya',
    createdDate: '2025-10-18',
    clientNeeds: 'Client butuh custom web application dengan dashboard untuk manage bisnis.',
  },
  // Audit and Assurance - 3 deals
  {
    id: 'D004',
    leadId: 'L004',
    clientName: 'Hendra Gunawan',
    company: 'PT Global Mandiri',
    services: [
      {
        id: 'S004',
        name: 'Audit and Assurance',
        description: 'Financial audit tahunan',
        estimatedValue: 50000000,
        elId: 'EL004',
      },
    ],
    totalDealValue: 50000000,
    proposalStatus: 'approved',
    proposalApprovedDate: '2025-09-01',
    els: [
      {
        id: 'EL004',
        serviceIds: ['S004'],
        status: 'approved',
        approvedDate: '2025-09-05',
        paymentTerms: {
          scheme: '50-50',
          terms: [
            { percentage: 50, description: 'Pembayaran awal saat EL disetujui' },
            { percentage: 50, description: 'Pelunasan saat project selesai' },
          ],
        },
      },
    ],
    elStrategy: 'single',
    bdExecutive: 'Rina Kusuma',
    createdDate: '2025-08-30',
    clientNeeds: 'Client butuh financial audit tahunan untuk compliance.',
  },
  {
    id: 'D005',
    leadId: 'L005',
    clientName: 'Rudi Hartono',
    company: 'PT Cahaya Abadi',
    services: [
      {
        id: 'S005',
        name: 'Audit and Assurance',
        description: 'Internal audit dan risk assessment',
        estimatedValue: 40000000,
        elId: 'EL005',
      },
    ],
    totalDealValue: 40000000,
    proposalStatus: 'approved',
    proposalApprovedDate: '2025-10-10',
    els: [
      {
        id: 'EL005',
        serviceIds: ['S005'],
        status: 'approved',
        approvedDate: '2025-10-12',
        paymentTerms: {
          scheme: '50-50',
          terms: [
            { percentage: 50, description: 'Pembayaran awal saat EL disetujui' },
            { percentage: 50, description: 'Pelunasan saat project selesai' },
          ],
        },
      },
    ],
    elStrategy: 'single',
    bdExecutive: 'Andi Wijaya',
    createdDate: '2025-10-08',
    clientNeeds: 'Client butuh internal audit dan risk assessment untuk improve internal control.',
  },
  {
    id: 'D006',
    leadId: 'L006',
    clientName: 'Linda Wijayanti',
    company: 'CV Surya Gemilang',
    services: [
      {
        id: 'S006',
        name: 'Audit and Assurance',
        description: 'Compliance audit',
        estimatedValue: 35000000,
        elId: 'EL006',
      },
    ],
    totalDealValue: 35000000,
    proposalStatus: 'approved',
    proposalApprovedDate: '2025-10-06',
    els: [
      {
        id: 'EL006',
        serviceIds: ['S006'],
        status: 'approved',
        approvedDate: '2025-10-08',
        paymentTerms: {
          scheme: '50-50',
          terms: [
            { percentage: 50, description: 'Pembayaran awal saat EL disetujui' },
            { percentage: 50, description: 'Pelunasan saat project selesai' },
          ],
        },
      },
    ],
    elStrategy: 'single',
    bdExecutive: 'Rina Kusuma',
    createdDate: '2025-10-05',
    clientNeeds: 'Client butuh compliance audit untuk memastikan sesuai regulasi.',
  },
  // Tax Compliance - 3 deals
  {
    id: 'D007',
    leadId: 'L007',
    clientName: 'Dewi Lestari',
    company: 'UD Makmur Sejahtera',
    services: [
      {
        id: 'S007',
        name: 'Tax Compliance',
        description: 'Tax planning dan compliance tahunan',
        estimatedValue: 25000000,
        elId: 'EL007',
      },
    ],
    totalDealValue: 25000000,
    proposalStatus: 'approved',
    proposalApprovedDate: '2025-07-25',
    els: [
      {
        id: 'EL007',
        serviceIds: ['S007'],
        status: 'approved',
        approvedDate: '2025-07-28',
        paymentTerms: {
          scheme: '50-50',
          terms: [
            { percentage: 50, description: 'Pembayaran awal saat EL disetujui' },
            { percentage: 50, description: 'Pelunasan saat project selesai' },
          ],
        },
      },
    ],
    elStrategy: 'single',
    bdExecutive: 'Rina Kusuma',
    createdDate: '2025-07-20',
    clientNeeds: 'Client butuh tax planning dan compliance untuk optimize tax burden.',
  },
  {
    id: 'D008',
    leadId: 'L008',
    clientName: 'Bambang Suryadi',
    company: 'PT Sejahtera Makmur',
    services: [
      {
        id: 'S008',
        name: 'Tax Compliance',
        description: 'Tax return preparation dan filing',
        estimatedValue: 30000000,
        elId: 'EL008',
      },
    ],
    totalDealValue: 30000000,
    proposalStatus: 'approved',
    proposalApprovedDate: '2025-09-12',
    els: [
      {
        id: 'EL008',
        serviceIds: ['S008'],
        status: 'approved',
        approvedDate: '2025-09-15',
        paymentTerms: {
          scheme: '50-50',
          terms: [
            { percentage: 50, description: 'Pembayaran awal saat EL disetujui' },
            { percentage: 50, description: 'Pelunasan saat project selesai' },
          ],
        },
      },
    ],
    elStrategy: 'single',
    bdExecutive: 'Andi Wijaya',
    createdDate: '2025-09-10',
    clientNeeds: 'Client butuh tax return preparation dan filing untuk tahun pajak.',
  },
  {
    id: 'D009',
    leadId: 'L009',
    clientName: 'Sari Indrawati',
    company: 'PT Indah Permai',
    services: [
      {
        id: 'S009',
        name: 'Tax Compliance',
        description: 'Tax advisory dan consultation',
        estimatedValue: 20000000,
        elId: 'EL009',
      },
    ],
    totalDealValue: 20000000,
    proposalStatus: 'approved',
    proposalApprovedDate: '2025-10-03',
    els: [
      {
        id: 'EL009',
        serviceIds: ['S009'],
        status: 'approved',
        approvedDate: '2025-10-05',
        paymentTerms: {
          scheme: '50-50',
          terms: [
            { percentage: 50, description: 'Pembayaran awal saat EL disetujui' },
            { percentage: 50, description: 'Pelunasan saat project selesai' },
          ],
        },
      },
    ],
    elStrategy: 'single',
    bdExecutive: 'Rina Kusuma',
    createdDate: '2025-10-01',
    clientNeeds: 'Client butuh tax advisory dan consultation untuk strategi tax optimization.',
  },
  // Tax Dispute - 3 deals
  {
    id: 'D010',
    leadId: 'L010',
    clientName: 'Agus Setiawan',
    company: 'PT Bumi Nusantara',
    services: [
      {
        id: 'S010',
        name: 'Tax Dispute',
        description: 'Tax objection dan appeal',
        estimatedValue: 60000000,
        elId: 'EL010',
      },
    ],
    totalDealValue: 60000000,
    proposalStatus: 'approved',
    proposalApprovedDate: '2025-08-18',
    els: [
      {
        id: 'EL010',
        serviceIds: ['S010'],
        status: 'approved',
        approvedDate: '2025-08-20',
        paymentTerms: {
          scheme: '50-35-15',
          terms: [
            { percentage: 50, description: 'Pembayaran awal saat EL disetujui' },
            { percentage: 35, description: 'Progress 50% pengerjaan' },
            { percentage: 15, description: 'Pelunasan saat project selesai' },
          ],
        },
      },
    ],
    elStrategy: 'single',
    bdExecutive: 'Andi Wijaya',
    createdDate: '2025-08-15',
    clientNeeds: 'Client butuh bantuan untuk tax objection dan appeal terhadap SKP yang diterima.',
  },
  {
    id: 'D011',
    leadId: 'L011',
    clientName: 'Ratna Dewi',
    company: 'PT Harmoni Jaya',
    services: [
      {
        id: 'S011',
        name: 'Tax Dispute',
        description: 'Tax litigation dan representation',
        estimatedValue: 80000000,
        elId: 'EL011',
      },
    ],
    totalDealValue: 80000000,
    proposalStatus: 'approved',
    proposalApprovedDate: '2025-09-22',
    els: [
      {
        id: 'EL011',
        serviceIds: ['S011'],
        status: 'approved',
        approvedDate: '2025-09-25',
        paymentTerms: {
          scheme: '50-35-15',
          terms: [
            { percentage: 50, description: 'Pembayaran awal saat EL disetujui' },
            { percentage: 35, description: 'Progress 50% pengerjaan' },
            { percentage: 15, description: 'Pelunasan saat project selesai' },
          ],
        },
      },
    ],
    elStrategy: 'single',
    bdExecutive: 'Rina Kusuma',
    createdDate: '2025-09-20',
    clientNeeds: 'Client butuh tax litigation dan representation di pengadilan pajak.',
  },
  {
    id: 'D012',
    leadId: 'L012',
    clientName: 'Bambang Wijaya',
    company: 'PT Sentosa Abadi',
    services: [
      {
        id: 'S012',
        name: 'Tax Dispute',
        description: 'Tax audit defense',
        estimatedValue: 70000000,
        elId: 'EL012',
      },
    ],
    totalDealValue: 70000000,
    proposalStatus: 'approved',
    proposalApprovedDate: '2025-10-12',
    els: [
      {
        id: 'EL012',
        serviceIds: ['S012'],
        status: 'approved',
        approvedDate: '2025-10-15',
        paymentTerms: {
          scheme: '50-35-15',
          terms: [
            { percentage: 50, description: 'Pembayaran awal saat EL disetujui' },
            { percentage: 35, description: 'Progress 50% pengerjaan' },
            { percentage: 15, description: 'Pelunasan saat project selesai' },
          ],
        },
      },
    ],
    elStrategy: 'single',
    bdExecutive: 'Andi Wijaya',
    createdDate: '2025-10-10',
    clientNeeds: 'Client butuh tax audit defense untuk menghadapi pemeriksaan pajak.',
  },
  // Transfer Pricing - 3 deals
  {
    id: 'D013',
    leadId: 'L013',
    clientName: 'Ahmad Kurniawan',
    company: 'PT Alam Lestari',
    services: [
      {
        id: 'S013',
        name: 'Transfer Pricing',
        description: 'Transfer pricing documentation',
        estimatedValue: 55000000,
        elId: 'EL013',
      },
    ],
    totalDealValue: 55000000,
    proposalStatus: 'approved',
    proposalApprovedDate: '2025-08-28',
    els: [
      {
        id: 'EL013',
        serviceIds: ['S013'],
        status: 'approved',
        approvedDate: '2025-08-30',
        paymentTerms: {
          scheme: '50-50',
          terms: [
            { percentage: 50, description: 'Pembayaran awal saat EL disetujui' },
            { percentage: 50, description: 'Pelunasan saat project selesai' },
          ],
        },
      },
    ],
    elStrategy: 'single',
    bdExecutive: 'Rina Kusuma',
    createdDate: '2025-08-25',
    clientNeeds: 'Client butuh transfer pricing documentation untuk compliance.',
  },
  {
    id: 'D014',
    leadId: 'L014',
    clientName: 'Siti Nurhaliza',
    company: 'PT Karya Mandiri',
    services: [
      {
        id: 'S014',
        name: 'Transfer Pricing',
        description: 'Transfer pricing study dan analysis',
        estimatedValue: 65000000,
        elId: 'EL014',
      },
    ],
    totalDealValue: 65000000,
    proposalStatus: 'approved',
    proposalApprovedDate: '2025-09-17',
    els: [
      {
        id: 'EL014',
        serviceIds: ['S014'],
        status: 'approved',
        approvedDate: '2025-09-20',
        paymentTerms: {
          scheme: '50-50',
          terms: [
            { percentage: 50, description: 'Pembayaran awal saat EL disetujui' },
            { percentage: 50, description: 'Pelunasan saat project selesai' },
          ],
        },
      },
    ],
    elStrategy: 'single',
    bdExecutive: 'Andi Wijaya',
    createdDate: '2025-09-15',
    clientNeeds: 'Client butuh transfer pricing study dan analysis untuk intercompany transactions.',
  },
  {
    id: 'D015',
    leadId: 'L015',
    clientName: 'Dedi Kurniawan',
    company: 'PT Sejahtera Bersama',
    services: [
      {
        id: 'S015',
        name: 'Transfer Pricing',
        description: 'Transfer pricing policy development',
        estimatedValue: 50000000,
        elId: 'EL015',
      },
    ],
    totalDealValue: 50000000,
    proposalStatus: 'approved',
    proposalApprovedDate: '2025-10-07',
    els: [
      {
        id: 'EL015',
        serviceIds: ['S015'],
        status: 'approved',
        approvedDate: '2025-10-10',
        paymentTerms: {
          scheme: '50-50',
          terms: [
            { percentage: 50, description: 'Pembayaran awal saat EL disetujui' },
            { percentage: 50, description: 'Pelunasan saat project selesai' },
          ],
        },
      },
    ],
    elStrategy: 'single',
    bdExecutive: 'Rina Kusuma',
    createdDate: '2025-10-05',
    clientNeeds: 'Client butuh transfer pricing policy development untuk group companies.',
  },
  // Deal untuk L103 - PT Teknologi Nusantara (Transfer Pricing Documentation) - handover CEO approved, converted to project
  {
    id: 'D103',
    leadId: 'L103',
    clientName: 'Ahmad Fauzi',
    company: 'PT Teknologi Nusantara',
    services: [
      {
        id: 'S103',
        name: 'Transfer Pricing Documentation',
        description: 'Transfer Pricing Master File, Local File, Comparability Analysis',
        estimatedValue: 65000000,
        elId: 'EL-L103-001',
      },
    ],
    totalDealValue: 65000000,
    proposalStatus: 'approved',
    proposalApprovedDate: '2025-02-05',
    els: [
      {
        id: 'EL-L103-001',
        serviceIds: ['S103'],
        status: 'approved',
        approvedDate: '2025-02-07',
        paymentTerms: {
          scheme: '50-50',
          terms: [
            { percentage: 50, description: 'DP saat EL signed' },
            { percentage: 50, description: 'Pelunasan saat project selesai' },
          ],
        },
      },
    ],
    elStrategy: 'single',
    bdExecutive: 'Andi Wijaya',
    createdDate: '2025-01-25',
    clientNeeds: 'Client butuh Transfer Pricing Documentation untuk compliance regulasi perpajakan.',
  },
];

export const mockProjects: Project[] = [
  // Web Dev - 3 projects
  {
    id: 'P001',
    dealId: 'D001',
    serviceId: 'S001',
    elId: 'EL001',
    projectName: 'Web Dev - PT Maju Jaya',
    serviceName: 'Web Dev',
    clientName: 'Budi Santoso - PT Maju Jaya',
    assignedPM: 'Diana Putri',
    assignedConsultant: 'Bambang Hermawan',
    status: 'in-progress',
    dueDate: '2025-12-15', // Normal deadline (masih jauh)
    startDate: '2025-10-10',
    pmNotified: true,
    progressPercentage: 65,
  },
  {
    id: 'P002',
    dealId: 'D002',
    serviceId: 'S002',
    elId: 'EL002',
    projectName: 'Web Dev - CV Berkah Sentosa',
    serviceName: 'Web Dev',
    clientName: 'Siti Rahayu - CV Berkah Sentosa',
    assignedPM: 'Eko Prasetyo',
    assignedConsultant: 'Citra Dewi',
    status: 'waiting-final-payment',
    dueDate: '2025-10-20',
    startDate: '2025-08-01',
    completionDate: '2025-10-18',
    pmNotified: true,
    progressPercentage: 100,
  },
  {
    id: 'P003',
    dealId: 'D003',
    serviceId: 'S003',
    elId: 'EL003',
    projectName: 'Web Dev - PT Teknologi Nusantara',
    serviceName: 'Web Dev',
    clientName: 'Ahmad Fauzi - PT Teknologi Nusantara',
    status: 'waiting-assignment', // CEO belum assign
    dueDate: '2026-02-28',
    pmNotified: false,
    progressPercentage: 0,
  },
  // Audit and Assurance - 3 projects
  {
    id: 'P004',
    dealId: 'D004',
    serviceId: 'S004',
    elId: 'EL004',
    projectName: 'Audit and Assurance - PT Global Mandiri',
    serviceName: 'Audit and Assurance',
    clientName: 'Hendra Gunawan - PT Global Mandiri',
    assignedPM: 'Farhan Rahman',
    assignedConsultant: 'Indah Permata',
    status: 'in-progress',
    dueDate: '2025-12-20', // Dekat deadline (10 hari lagi, dalam 15 hari)
    startDate: '2025-09-05',
    pmNotified: true,
    progressPercentage: 85,
  },
  {
    id: 'P005',
    dealId: 'D005',
    serviceId: 'S005',
    elId: 'EL005',
    projectName: 'Audit and Assurance - PT Cahaya Abadi',
    serviceName: 'Audit and Assurance',
    clientName: 'Rudi Hartono - PT Cahaya Abadi',
    assignedPM: 'Gita Sari',
    assignedConsultant: 'Hadi Purnomo',
    status: 'in-progress',
    dueDate: '2025-12-25', // Dekat deadline (15 hari lagi, dalam 15 hari)
    startDate: '2025-10-12',
    pmNotified: true,
    progressPercentage: 60,
  },
  {
    id: 'P006',
    dealId: 'D006',
    serviceId: 'S006',
    elId: 'EL006',
    projectName: 'Audit and Assurance - CV Surya Gemilang',
    serviceName: 'Audit and Assurance',
    clientName: 'Linda Wijayanti - CV Surya Gemilang',
    status: 'waiting-assignment', // COO-Tax-Audit belum assign
    dueDate: '2026-01-20',
    pmNotified: false,
    progressPercentage: 0,
  },
  // L103 - PT Teknologi Nusantara (Transfer Pricing Documentation) - converted from handover CEO approved
  {
    id: 'P016',
    dealId: 'D103',
    serviceId: 'S103',
    elId: 'EL-L103-001',
    projectName: 'Transfer Pricing Documentation - PT Teknologi Nusantara',
    serviceName: 'Transfer Pricing Documentation',
    clientName: 'Ahmad Fauzi - PT Teknologi Nusantara',
    assignedPM: 'Diana Putri',
    status: 'waiting-first-payment',
    dueDate: '2025-05-15',
    pmNotified: true,
    progressPercentage: 0,
  },
  // Tax Compliance - 3 projects
  {
    id: 'P007',
    dealId: 'D007',
    serviceId: 'S007',
    elId: 'EL007',
    projectName: 'Tax Compliance - UD Makmur Sejahtera',
    serviceName: 'Tax Compliance',
    clientName: 'Dewi Lestari - UD Makmur Sejahtera',
    assignedPM: 'Diana Putri',
    assignedConsultant: 'Joko Santoso',
    status: 'waiting-final-payment',
    dueDate: '2025-09-30',
    startDate: '2025-07-28',
    completionDate: '2025-09-25',
    pmNotified: true,
    progressPercentage: 100,
  },
  {
    id: 'P008',
    dealId: 'D008',
    serviceId: 'S008',
    elId: 'EL008',
    projectName: 'Tax Compliance - PT Sejahtera Makmur',
    serviceName: 'Tax Compliance',
    clientName: 'Bambang Suryadi - PT Sejahtera Makmur',
    assignedPM: 'Eko Prasetyo',
    assignedConsultant: 'Bambang Hermawan',
    status: 'in-progress',
    dueDate: '2025-12-31', // Normal deadline (masih jauh)
    startDate: '2025-09-15',
    pmNotified: true,
    progressPercentage: 70,
  },
  {
    id: 'P009',
    dealId: 'D009',
    serviceId: 'S009',
    elId: 'EL009',
    projectName: 'Tax Compliance - PT Indah Permai',
    serviceName: 'Tax Compliance',
    clientName: 'Sari Indrawati - PT Indah Permai',
    assignedPM: 'Farhan Rahman',
    assignedConsultant: 'Citra Dewi',
    status: 'in-progress',
    dueDate: '2026-03-05', // Normal deadline (masih jauh)
    startDate: '2025-10-05',
    pmNotified: true,
    progressPercentage: 40,
  },
  // Tax Dispute - 3 projects
  {
    id: 'P010',
    dealId: 'D010',
    serviceId: 'S010',
    elId: 'EL010',
    projectName: 'Tax Dispute - PT Bumi Nusantara',
    serviceName: 'Tax Dispute',
    clientName: 'Agus Setiawan - PT Bumi Nusantara',
    assignedPM: 'Gita Sari',
    assignedConsultant: 'Indah Permata',
    status: 'in-progress',
    dueDate: '2025-10-02', // Overdue >15 hari (19 hari yang lalu)
    startDate: '2025-08-20',
    pmNotified: true,
    progressPercentage: 75,
  },
  {
    id: 'P011',
    dealId: 'D011',
    serviceId: 'S011',
    elId: 'EL011',
    projectName: 'Tax Dispute - PT Harmoni Jaya',
    serviceName: 'Tax Dispute',
    clientName: 'Ratna Dewi - PT Harmoni Jaya',
    assignedPM: 'Diana Putri',
    assignedConsultant: 'Hadi Purnomo',
    status: 'completed', // Sudah selesai dan sudah dibayar semua
    dueDate: '2025-10-01',
    startDate: '2025-09-25',
    completionDate: '2025-09-28',
    pmNotified: true,
    progressPercentage: 100,
  },
  {
    id: 'P012',
    dealId: 'D012',
    serviceId: 'S012',
    elId: 'EL012',
    projectName: 'Tax Dispute - PT Sentosa Abadi',
    serviceName: 'Tax Dispute',
    clientName: 'Bambang Wijaya - PT Sentosa Abadi',
    assignedPM: 'Eko Prasetyo',
    assignedConsultant: 'Joko Santoso',
    status: 'in-progress',
    dueDate: '2025-12-20', // Normal deadline (masih jauh)
    startDate: '2025-10-15',
    pmNotified: true,
    progressPercentage: 50,
  },
  // Transfer Pricing - 3 projects
  {
    id: 'P013',
    dealId: 'D013',
    serviceId: 'S013',
    elId: 'EL013',
    projectName: 'Transfer Pricing - PT Alam Lestari',
    serviceName: 'Transfer Pricing',
    clientName: 'Ahmad Kurniawan - PT Alam Lestari',
    assignedPM: 'Farhan Rahman',
    assignedConsultant: 'Citra Dewi',
    status: 'in-progress',
    dueDate: '2025-10-03', // Overdue >15 hari (18 hari yang lalu)
    startDate: '2025-08-30',
    pmNotified: true,
    progressPercentage: 80,
  },
  {
    id: 'P014',
    dealId: 'D014',
    serviceId: 'S014',
    elId: 'EL014',
    projectName: 'Transfer Pricing - PT Karya Mandiri',
    serviceName: 'Transfer Pricing',
    clientName: 'Siti Nurhaliza - PT Karya Mandiri',
    assignedPM: 'Gita Sari',
    assignedConsultant: 'Bambang Hermawan',
    status: 'completed', // Sudah selesai dan sudah dibayar semua
    dueDate: '2025-10-05',
    startDate: '2025-09-20',
    completionDate: '2025-10-02',
    pmNotified: true,
    progressPercentage: 100,
  },
  {
    id: 'P015',
    dealId: 'D015',
    serviceId: 'S015',
    elId: 'EL015',
    projectName: 'Transfer Pricing - PT Sejahtera Bersama',
    serviceName: 'Transfer Pricing',
    clientName: 'Dedi Kurniawan - PT Sejahtera Bersama',
    status: 'waiting-assignment', // COO-Legal-TP-SR belum assign
    dueDate: '2026-02-25',
    pmNotified: false,
    progressPercentage: 0,
  },
];

export const mockInvoices: Invoice[] = [
  // Web Dev - 3 invoices
  {
    id: 'INV-001/DSK Global/WD/2025',
    projectId: 'P001',
    projectTitle: 'Pembangunan Website Company Profile PT Maju Jaya',
    service: 'Web Dev',
    clientName: 'PT Maju Jaya',
    clientEmail: 'budi.santoso@majujaya.co.id',
    clientPhone: '021-55678901',
    clientAddress: 'Jl. Sudirman No. 45, Jakarta Pusat 10220',
    totalAmount: 30000000,
    paymentTerms: [
      {
        id: 'PT001',
        termNumber: 1,
        percentage: 50,
        amount: 15000000,
        description: 'Saat EL disetujui',
        processStatus: 'SENT_TO_CLIENT',
        paymentStatus: 'PAID',
        dueDate: '2025-10-10',
        invoiceDate: '2025-10-05',
        sentAt: '2025-10-05',
        paidDate: '2025-10-09',
        paidAmount: 15000000,
        invoiceNumber: 'INV-001/DSK Global/WD/2025',
        invoiceFileUrl: '/files/inv-001-pt1.pdf',
        payments: [{ id: 'pay1', amount: 15000000, date: '2025-10-09', proofUrl: '/proof/1.pdf' }],
        vatEnabled: false,
        withholdingEnabled: true,
        withholdingRate: 0.02,
        withholdingBase: 'DPP',
      },
      {
        id: 'PT002',
        termNumber: 2,
        percentage: 50,
        amount: 15000000,
        description: 'Saat project selesai',
        processStatus: 'DRAFT',
        paymentStatus: 'UNPAID',
        invoiceNumber: null,
        invoiceDate: null,
        sentAt: null,
        dueDate: null,
        invoiceFileUrl: null,
        paidAmount: 0,
      },
    ],
    createdDate: '2025-10-05',
  },
  {
    id: 'INV-002/DSK Global/WD/2025',
    projectId: 'P002',
    projectTitle: 'Pengembangan Portal E-Commerce CV Berkah Sentosa',
    service: 'Web Dev',
    clientName: 'CV Berkah Sentosa',
    clientEmail: 'siti.rahayu@berkahsentosa.com',
    clientPhone: '031-78901234',
    clientAddress: 'Jl. Ahmad Yani No. 88, Surabaya 60234',
    totalAmount: 45000000,
    paymentTerms: [
      {
        id: 'PT003',
        termNumber: 1,
        percentage: 50,
        amount: 22500000,
        description: 'Saat EL disetujui',
        processStatus: 'SENT_TO_CLIENT',
        paymentStatus: 'PAID',
        dueDate: '2025-10-12',
        invoiceDate: '2025-10-08',
        sentAt: '2025-10-08',
        paidDate: '2025-10-12',
        paidAmount: 22500000,
        invoiceNumber: 'INV-002/DSK Global/WD/2025',
        invoiceFileUrl: '/files/inv-002-pt1.pdf',
      },
      {
        id: 'PT004',
        termNumber: 2,
        percentage: 50,
        amount: 22500000,
        description: 'Saat project selesai',
        processStatus: 'CEO_APPROVED',
        paymentStatus: 'UNPAID',
        dueDate: '2025-11-20',
        invoiceDate: '2025-10-08',
        sentAt: null,
        invoiceNumber: 'INV-002/DSK Global/WD/2025',
        invoiceFileUrl: '/files/inv-002-pt2.pdf',
        paidAmount: 0,
      },
    ],
    createdDate: '2025-10-08',
  },
  // P003 belum ada invoice karena belum assign PM
  // Audit and Assurance - 3 invoices
  {
    id: 'INV-003/DSK Global/AA/2025',
    projectId: 'P004',
    projectTitle: 'Audit Laporan Keuangan Tahunan PT Global Mandiri',
    service: 'Audit and Assurance',
    clientName: 'PT Global Mandiri',
    clientEmail: 'hendra.gunawan@globalmandiri.co.id',
    clientPhone: '021-77889900',
    clientAddress: 'Gedung Global Tower Lt. 12, Jl. Thamrin, Jakarta 10350',
    totalAmount: 50000000,
    paymentTerms: [
      {
        id: 'PT005',
        termNumber: 1,
        percentage: 50,
        amount: 25000000,
        description: 'Saat EL disetujui',
        processStatus: 'SENT_TO_CLIENT',
        paymentStatus: 'PAID',
        dueDate: '2025-09-05',
        invoiceDate: '2025-08-30',
        sentAt: '2025-08-30',
        paidDate: '2025-09-05',
        paidAmount: 25000000,
        invoiceNumber: 'INV-003/DSK Global/AA/2025',
        invoiceFileUrl: '/files/inv-003-pt1.pdf',
      },
      {
        id: 'PT006',
        termNumber: 2,
        percentage: 50,
        amount: 25000000,
        description: 'Saat project selesai',
        processStatus: 'SENT_TO_CLIENT',
        paymentStatus: 'OVERDUE',
        dueDate: '2025-10-15',
        invoiceDate: '2025-09-01',
        sentAt: '2025-09-01',
        invoiceNumber: 'INV-003/DSK Global/AA/2025',
        invoiceFileUrl: '/files/inv-003-pt2.pdf',
        paidAmount: 0,
      },
    ],
    createdDate: '2025-08-30',
  },
  {
    id: 'INV-004/DSK Global/AA/2025',
    projectId: 'P005',
    projectTitle: 'Audit dan Assurance Laporan Keuangan PT Cahaya Abadi',
    service: 'Audit and Assurance',
    clientName: 'PT Cahaya Abadi',
    clientEmail: 'rudi.hartono@cahayaabadi.com',
    clientPhone: '022-87654321',
    clientAddress: 'Kawasan Industri Cikarang, Bekasi 17530',
    totalAmount: 40000000,
    paymentTerms: [
      {
        id: 'PT007',
        termNumber: 1,
        percentage: 50,
        amount: 20000000,
        description: 'Saat EL disetujui',
        processStatus: 'SENT_TO_CLIENT',
        paymentStatus: 'PAID',
        dueDate: '2025-10-12',
        invoiceDate: '2025-10-08',
        sentAt: '2025-10-08',
        paidDate: '2025-10-12',
        paidAmount: 20000000,
        invoiceNumber: 'INV-004/DSK Global/AA/2025',
        invoiceFileUrl: '/files/inv-004-pt1.pdf',
      },
      {
        id: 'PT008',
        termNumber: 2,
        percentage: 50,
        amount: 20000000,
        description: 'Saat project selesai',
        processStatus: 'DRAFT',
        paymentStatus: 'UNPAID',
        dueDate: '2025-10-28',
        paidAmount: 0,
      },
    ],
    createdDate: '2025-10-08',
  },
  // P006 belum ada invoice karena belum assign PM
  // Tax Compliance - 3 invoices
  {
    id: 'INV-005/DSK Global/TC/2025',
    projectId: 'P007',
    projectTitle: 'Konsultasi Tax Compliance UD Makmur Sejahtera',
    service: 'Tax Compliance',
    clientName: 'UD Makmur Sejahtera',
    clientEmail: 'dewi.lestari@udmakmur.com',
    clientPhone: '0274-5566778',
    clientAddress: 'Jl. Solo No. 123, Yogyakarta 55281',
    totalAmount: 25000000,
    paymentTerms: [
      {
        id: 'PT009',
        termNumber: 1,
        percentage: 50,
        amount: 12500000,
        description: 'Saat EL disetujui',
        processStatus: 'SENT_TO_CLIENT',
        paymentStatus: 'PAID',
        dueDate: '2025-07-28',
        invoiceDate: '2025-07-20',
        sentAt: '2025-07-20',
        paidDate: '2025-07-28',
        paidAmount: 12500000,
        invoiceNumber: 'INV-005/DSK Global/TC/2025',
        invoiceFileUrl: '/files/inv-005-pt1.pdf',
      },
      {
        id: 'PT010',
        termNumber: 2,
        percentage: 50,
        amount: 12500000,
        description: 'Saat project selesai',
        processStatus: 'DRAFT',
        paymentStatus: 'UNPAID',
        dueDate: '2025-09-30',
        paidAmount: 0,
      },
    ],
    createdDate: '2025-07-20',
  },
  {
    id: 'INV-006/DSK Global/TC/2025',
    projectId: 'P008',
    projectTitle: 'Review dan Compliance Pajak PT Sejahtera Makmur',
    service: 'Tax Compliance',
    clientName: 'PT Sejahtera Makmur',
    clientEmail: 'bambang.suryadi@sejahteramakmur.co.id',
    clientPhone: '021-65432109',
    clientAddress: 'Jl. Gatot Subroto Kav. 21, Jakarta Selatan 12190',
    totalAmount: 30000000,
    paymentTerms: [
      {
        id: 'PT011',
        termNumber: 1,
        percentage: 50,
        amount: 15000000,
        description: 'Saat EL disetujui',
        processStatus: 'SENT_TO_CLIENT',
        paymentStatus: 'PAID',
        dueDate: '2025-09-15',
        invoiceDate: '2025-09-10',
        sentAt: '2025-09-10',
        paidDate: '2025-09-15',
        paidAmount: 15000000,
        invoiceNumber: 'INV-006/DSK Global/TC/2025',
        invoiceFileUrl: '/files/inv-006-pt1.pdf',
      },
      {
        id: 'PT012',
        termNumber: 2,
        percentage: 50,
        amount: 15000000,
        description: 'Saat project selesai',
        processStatus: 'DRAFT',
        paymentStatus: 'UNPAID',
        dueDate: '2025-11-05',
        paidAmount: 0,
      },
    ],
    createdDate: '2025-09-10',
  },
  {
    id: 'INV-007/DSK Global/TC/2025',
    projectId: 'P009',
    projectTitle: 'Layanan Tax Compliance Tahunan PT Indah Permai',
    service: 'Tax Compliance',
    clientName: 'PT Indah Permai',
    clientEmail: 'sari.indrawati@indahpermai.com',
    clientPhone: '031-98765432',
    clientAddress: 'Jl. Basuki Rahmat 77, Surabaya 60271',
    totalAmount: 20000000,
    paymentTerms: [
      {
        id: 'PT013',
        termNumber: 1,
        percentage: 50,
        amount: 10000000,
        description: 'Saat EL disetujui',
        processStatus: 'SENT_TO_CLIENT',
        paymentStatus: 'PAID',
        dueDate: '2025-10-05',
        invoiceDate: '2025-10-01',
        sentAt: '2025-10-01',
        paidDate: '2025-10-05',
        paidAmount: 10000000,
        invoiceNumber: 'INV-007/DSK Global/TC/2025',
        invoiceFileUrl: '/files/inv-007-pt1.pdf',
      },
      {
        id: 'PT014',
        termNumber: 2,
        percentage: 50,
        amount: 10000000,
        description: 'Saat project selesai',
        processStatus: 'SENT_TO_CLIENT',
        paymentStatus: 'OVERDUE',
        dueDate: '2025-10-10',
        invoiceDate: '2025-10-01',
        sentAt: '2025-10-01',
        invoiceNumber: 'INV-007/DSK Global/TC/2025',
        invoiceFileUrl: '/files/inv-007-pt2.pdf',
        paidAmount: 0,
      },
    ],
    createdDate: '2025-10-01',
  },
  // Tax Dispute - 3 invoices
  {
    id: 'INV-008/DSK Global/TD/2025',
    projectId: 'P010',
    projectTitle: 'Pendampingan Tax Dispute dan Banding PT Bumi Nusantara',
    service: 'Tax Dispute',
    clientName: 'PT Bumi Nusantara',
    clientEmail: 'agus.setiawan@buminusantara.co.id',
    clientPhone: '021-76543210',
    clientAddress: 'Wisma Bumi Nusantara, Jl. Kuningan Barat, Jakarta 12920',
    totalAmount: 60000000,
    paymentTerms: [
      {
        id: 'PT015',
        termNumber: 1,
        percentage: 50,
        amount: 30000000,
        description: 'Saat EL disetujui',
        processStatus: 'SENT_TO_CLIENT',
        paymentStatus: 'PAID',
        dueDate: '2025-08-20',
        invoiceDate: '2025-08-15',
        sentAt: '2025-08-15',
        paidDate: '2025-08-20',
        paidAmount: 30000000,
        invoiceNumber: 'INV-008/DSK Global/TD/2025',
        invoiceFileUrl: '/files/inv-008-pt1.pdf',
      },
      {
        id: 'PT016',
        termNumber: 2,
        percentage: 35,
        amount: 21000000,
        description: 'Progress 50% pengerjaan',
        processStatus: 'SENT_TO_CLIENT',
        paymentStatus: 'PAID',
        dueDate: '2025-09-20',
        invoiceDate: '2025-08-15',
        sentAt: '2025-08-15',
        paidDate: '2025-09-18',
        paidAmount: 21000000,
        invoiceNumber: 'INV-008/DSK Global/TD/2025',
        invoiceFileUrl: '/files/inv-008-pt2.pdf',
      },
      {
        id: 'PT017',
        termNumber: 3,
        percentage: 15,
        amount: 9000000,
        description: 'Pelunasan saat project selesai',
        processStatus: 'DRAFT',
        paymentStatus: 'UNPAID',
        dueDate: '2025-11-20',
        paidAmount: 0,
      },
    ],
    createdDate: '2025-08-15',
  },
  {
    id: 'INV-009/DSK Global/TD/2025',
    projectId: 'P011',
    projectTitle: 'Penyelesaian Sengketa Pajak PT Harmoni Jaya',
    service: 'Tax Dispute',
    clientName: 'PT Harmoni Jaya',
    clientEmail: 'ratna.dewi@harmonijaya.com',
    clientPhone: '021-88990011',
    clientAddress: 'Jl. Rasuna Said Kav. B-1, Jakarta 12920',
    totalAmount: 80000000,
    paymentTerms: [
      {
        id: 'PT018',
        termNumber: 1,
        percentage: 50,
        amount: 40000000,
        description: 'Saat EL disetujui',
        processStatus: 'SENT_TO_CLIENT',
        paymentStatus: 'PAID',
        dueDate: '2025-09-25',
        invoiceDate: '2025-09-20',
        sentAt: '2025-09-20',
        paidDate: '2025-09-25',
        paidAmount: 40000000,
        invoiceNumber: 'INV-009/DSK Global/TD/2025',
        invoiceFileUrl: '/files/inv-009-pt1.pdf',
      },
      {
        id: 'PT019',
        termNumber: 2,
        percentage: 35,
        amount: 28000000,
        description: 'Progress 50% pengerjaan',
        processStatus: 'SENT_TO_CLIENT',
        paymentStatus: 'PAID',
        dueDate: '2025-09-28',
        invoiceDate: '2025-09-20',
        sentAt: '2025-09-20',
        paidDate: '2025-09-27',
        paidAmount: 28000000,
        invoiceNumber: 'INV-009/DSK Global/TD/2025',
        invoiceFileUrl: '/files/inv-009-pt2.pdf',
      },
      {
        id: 'PT020',
        termNumber: 3,
        percentage: 15,
        amount: 12000000,
        description: 'Pelunasan saat project selesai',
        processStatus: 'SENT_TO_CLIENT',
        paymentStatus: 'PAID',
        dueDate: '2025-10-01',
        invoiceDate: '2025-09-20',
        sentAt: '2025-09-20',
        paidDate: '2025-10-01',
        paidAmount: 12000000,
        invoiceNumber: 'INV-009/DSK Global/TD/2025',
        invoiceFileUrl: '/files/inv-009-pt3.pdf',
      },
    ],
    createdDate: '2025-09-20',
  },
  {
    id: 'INV-010/DSK Global/TD/2025',
    projectId: 'P012',
    projectTitle: 'Konsultasi dan Pendampingan Tax Dispute PT Sentosa Abadi',
    service: 'Tax Dispute',
    clientName: 'PT Sentosa Abadi',
    clientEmail: 'bambang.wijaya@sentosabadi.co.id',
    clientPhone: '021-55667788',
    clientAddress: 'Plaza Sentosa Lt. 5, Jl. HR Rasuna Said, Jakarta 12940',
    totalAmount: 70000000,
    paymentTerms: [
      {
        id: 'PT021',
        termNumber: 1,
        percentage: 50,
        amount: 35000000,
        description: 'Saat EL disetujui',
        processStatus: 'SENT_TO_CLIENT',
        paymentStatus: 'PAID',
        dueDate: '2025-10-15',
        invoiceDate: '2025-10-10',
        sentAt: '2025-10-10',
        paidDate: '2025-10-15',
        paidAmount: 35000000,
        invoiceNumber: 'INV-010/DSK Global/TD/2025',
        invoiceFileUrl: '/files/inv-010-pt1.pdf',
      },
      {
        id: 'PT022',
        termNumber: 2,
        percentage: 35,
        amount: 24500000,
        description: 'Progress 50% pengerjaan',
        processStatus: 'DRAFT',
        paymentStatus: 'UNPAID',
        dueDate: '2025-11-01',
        paidAmount: 0,
      },
      {
        id: 'PT023',
        termNumber: 3,
        percentage: 15,
        amount: 10500000,
        description: 'Pelunasan saat project selesai',
        processStatus: 'DRAFT',
        paymentStatus: 'UNPAID',
        dueDate: '2025-11-20',
        paidAmount: 0,
      },
    ],
    createdDate: '2025-10-10',
  },
  // Transfer Pricing - 3 invoices
  {
    id: 'INV-011/DSK Global/TP/2025',
    projectId: 'P013',
    projectTitle: 'Dokumentasi Transfer Pricing PT Alam Lestari',
    service: 'Transfer Pricing',
    clientName: 'PT Alam Lestari',
    clientEmail: 'ahmad.kurniawan@alamlestari.co.id',
    clientPhone: '022-77889900',
    clientAddress: 'Jl. Raya Bandung No. 200, Bandung 40123',
    totalAmount: 55000000,
    paymentTerms: [
      {
        id: 'PT024',
        termNumber: 1,
        percentage: 50,
        amount: 27500000,
        description: 'Saat EL disetujui',
        processStatus: 'SENT_TO_CLIENT',
        paymentStatus: 'PAID',
        dueDate: '2025-08-30',
        invoiceDate: '2025-08-25',
        sentAt: '2025-08-25',
        paidDate: '2025-08-30',
        paidAmount: 27500000,
        invoiceNumber: 'INV-011/DSK Global/TP/2025',
        invoiceFileUrl: '/files/inv-011-pt1.pdf',
      },
      {
        id: 'PT025',
        termNumber: 2,
        percentage: 50,
        amount: 27500000,
        description: 'Saat project selesai',
        processStatus: 'DRAFT',
        paymentStatus: 'UNPAID',
        dueDate: '2025-11-15',
        paidAmount: 0,
      },
    ],
    createdDate: '2025-08-25',
  },
  {
    id: 'INV-012/DSK Global/TP/2025',
    projectId: 'P014',
    projectTitle: 'Transfer Pricing Documentation dan Policy PT Karya Mandiri',
    service: 'Transfer Pricing',
    clientName: 'PT Karya Mandiri',
    clientEmail: 'siti.nurhaliza@karyamandiri.com',
    clientPhone: '021-99887766',
    clientAddress: 'Gedung Karya Mandiri, Jl. Sudirman Kav. 52-53, Jakarta 12190',
    totalAmount: 65000000,
    paymentTerms: [
      {
        id: 'PT026',
        termNumber: 1,
        percentage: 50,
        amount: 32500000,
        description: 'Saat EL disetujui',
        processStatus: 'SENT_TO_CLIENT',
        paymentStatus: 'PAID',
        dueDate: '2025-09-20',
        invoiceDate: '2025-09-15',
        sentAt: '2025-09-15',
        paidDate: '2025-09-20',
        paidAmount: 32500000,
        invoiceNumber: 'INV-012/DSK Global/TP/2025',
        invoiceFileUrl: '/files/inv-012-pt1.pdf',
      },
      {
        id: 'PT027',
        termNumber: 2,
        percentage: 50,
        amount: 32500000,
        description: 'Saat project selesai',
        processStatus: 'SENT_TO_CLIENT',
        paymentStatus: 'PAID',
        dueDate: '2025-10-05',
        invoiceDate: '2025-09-15',
        sentAt: '2025-09-15',
        paidDate: '2025-10-05',
        paidAmount: 32500000,
        invoiceNumber: 'INV-012/DSK Global/TP/2025',
        invoiceFileUrl: '/files/inv-012-pt2.pdf',
      },
    ],
    createdDate: '2025-09-15',
  },
  // P015 belum ada invoice karena belum assign PM
];

// Ticket Types
export interface TicketResponse {
  id: string;
  ticketId: string;
  message: string;
  createdBy: string;
  createdByRole: 'IT' | 'Other';
  createdDate: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: 'Technical Issue' | 'Access Request' | 'Bug Report' | 'Feature Request' | 'Account Issue' | 'Other';
  priority: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  createdBy: string;
  createdByRole: 'IT' | 'Other';
  createdDate: string;
  assignedTo?: string;
  updatedDate?: string;
  resolvedDate?: string;
  notes?: string;
  responses: TicketResponse[];
}

export const itStaff = [
  'IT Specialist',
  'IT Support 1',
  'IT Support 2',
];

// User Management Types
export interface User {
  id: string;
  name: string;
  email: string;
  role?: 'Super Admin' | 'CEO' | 'COO-Tax-Audit' | 'COO-Legal-TP-SR' | 'BD Content Creator' | 'BD Executive' | 'PM' | 'Consultant' | 'Admin' | 'IT';
  createdDate: string;
  lastLogin?: string;
}

export const mockUsers: User[] = [
  {
    id: 'U001',
    name: 'Galih Gumilang',
    email: 'ceo@dskglobal.com',
    role: 'CEO',
    createdDate: '2025-01-01',
    lastLogin: '2025-10-20',
  },
  {
    id: 'U002',
    name: 'Admin',
    email: 'admin@dskglobal.com',
    role: 'Admin',
    createdDate: '2025-01-01',
    lastLogin: '2025-10-20',
  },
  {
    id: 'U003',
    name: 'Sarah Wijaya',
    email: 'sarah@dskglobal.com',
    role: 'BD Content Creator',
    createdDate: '2025-01-05',
    lastLogin: '2025-10-19',
  },
  {
    id: 'U004',
    name: 'Tommy Budiman',
    email: 'tommy@dskglobal.com',
    role: 'BD Content Creator',
    createdDate: '2025-01-05',
    lastLogin: '2025-10-18',
  },
  {
    id: 'U005',
    name: 'Andi Wijaya',
    email: 'andi@dskglobal.com',
    role: 'BD Executive',
    createdDate: '2025-01-10',
    lastLogin: '2025-10-20',
  },
  {
    id: 'U006',
    name: 'Rina Kusuma',
    email: 'rina@dskglobal.com',
    role: 'BD Executive',
    createdDate: '2025-01-10',
    lastLogin: '2025-10-19',
  },
  {
    id: 'U009',
    name: 'Diana Putri',
    email: 'diana@dskglobal.com',
    role: 'PM',
    createdDate: '2025-01-15',
    lastLogin: '2025-10-20',
  },
  {
    id: 'U013',
    name: 'IT Specialist',
    email: 'it@dskglobal.com',
    role: 'IT',
    createdDate: '2025-01-15',
    lastLogin: '2025-10-20',
  },
  // Users without role (pending assignment)
  {
    id: 'U014',
    name: 'Budi Santoso',
    email: 'budi@dskglobal.com',
    createdDate: '2025-10-20',
  },
  {
    id: 'U015',
    name: 'Siti Rahayu',
    email: 'siti@dskglobal.com',
    createdDate: '2025-10-21',
  },
  {
    id: 'U016',
    name: 'Ahmad Fauzi',
    email: 'ahmad@dskglobal.com',
    createdDate: '2025-10-22',
  },
];

export const mockTickets: Ticket[] = [
  {
    id: 'T001',
    title: 'Error saat login ke sistem',
    description: 'Saya tidak bisa login dengan akun saya, muncul error "Invalid credentials" padahal password sudah benar.',
    category: 'Technical Issue',
    priority: 'High',
    status: 'Open',
    createdBy: 'Andi Wijaya',
    createdByRole: 'Other',
    createdDate: '2025-10-18',
    responses: [],
  },
  {
    id: 'T002',
    title: 'Request fitur baru untuk dashboard',
    description: 'Bisa ditambahkan filter berdasarkan tanggal untuk reports? Ini akan sangat membantu untuk analisis data.',
    category: 'Feature Request',
    priority: 'Medium',
    status: 'In Progress',
    createdBy: 'Rina Kusuma',
    createdByRole: 'Other',
    createdDate: '2025-10-15',
    assignedTo: 'IT Specialist',
    updatedDate: '2025-10-16',
    responses: [
      {
        id: 'TR001',
        ticketId: 'T002',
        message: 'Terima kasih atas requestnya. Kami akan review dan implementasikan di update berikutnya.',
        createdBy: 'IT Specialist',
        createdByRole: 'IT',
        createdDate: '2025-10-16',
      },
    ],
  },
  {
    id: 'T003',
    title: 'Request akses ke module Projects',
    description: 'Saya sebagai PM perlu akses penuh ke module Projects untuk mengelola project yang ditugaskan ke saya.',
    category: 'Access Request',
    priority: 'Medium',
    status: 'Resolved',
    createdBy: 'Diana Putri',
    createdByRole: 'Other',
    createdDate: '2025-10-10',
    assignedTo: 'IT Specialist',
    updatedDate: '2025-10-11',
    resolvedDate: '2025-10-11',
    responses: [
      {
        id: 'TR002',
        ticketId: 'T003',
        message: 'Akses sudah diberikan. Silakan logout dan login kembali untuk melihat perubahan.',
        createdBy: 'IT Specialist',
        createdByRole: 'IT',
        createdDate: '2025-10-11',
      },
    ],
  },
  {
    id: 'T004',
    title: 'Bug: Data tidak tersimpan saat submit form',
    description: 'Ketika saya submit form untuk create lead baru, data tidak tersimpan dan tidak ada error message yang muncul.',
    category: 'Bug Report',
    priority: 'High',
    status: 'In Progress',
    createdBy: 'Sarah Wijaya',
    createdByRole: 'Other',
    createdDate: '2025-10-17',
    assignedTo: 'IT Specialist',
    updatedDate: '2025-10-17',
    responses: [
      {
        id: 'TR003',
        ticketId: 'T004',
        message: 'Kami sedang investigasi masalah ini. Apakah bisa kirim screenshot atau detail lebih lanjut?',
        createdBy: 'IT Specialist',
        createdByRole: 'IT',
        createdDate: '2025-10-17',
      },
    ],
  },
  {
    id: 'T005',
    title: 'Lupa password akun',
    description: 'Saya lupa password untuk akun saya. Bisa tolong reset password?',
    category: 'Account Issue',
    priority: 'Low',
    status: 'Closed',
    createdBy: 'Tommy Budiman',
    createdByRole: 'Other',
    createdDate: '2025-10-12',
    assignedTo: 'IT Specialist',
    updatedDate: '2025-10-12',
    resolvedDate: '2025-10-12',
    notes: 'Password sudah direset dan dikirim ke email user.',
    responses: [
      {
        id: 'TR004',
        ticketId: 'T005',
        message: 'Password sudah direset. Silakan cek email Anda untuk password baru.',
        createdBy: 'IT Specialist',
        createdByRole: 'IT',
        createdDate: '2025-10-12',
      },
    ],
  },
];

// Reimbursement Types
export interface Reimbursement {
  id: string;
  title: string;
  description: string;
  category: 'Transport' | 'Meals' | 'Office Supplies' | 'Client Meeting' | 'Equipment' | 'Training' | 'Other';
  amount: number;
  requestDate: string;
  expenseDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  submittedBy: string;
  submittedByRole: string;
  notes?: string;
  receiptUrl?: string;
  approvedDate?: string;
  rejectedReason?: string;
  approvedBy?: string;
}

export const mockReimbursements: Reimbursement[] = [
  {
    id: 'R001',
    title: 'Bensin untuk meeting client',
    description: 'Bensin untuk perjalanan ke meeting dengan client PT Maju Jaya',
    category: 'Transport',
    amount: 50000,
    requestDate: '2025-10-16',
    expenseDate: '2025-10-15',
    status: 'Pending',
    submittedBy: 'Andi Wijaya',
    submittedByRole: 'BD Executive',
  },
  {
    id: 'R002',
    title: 'Makan siang dengan client',
    description: 'Makan siang dengan client saat presentasi proposal',
    category: 'Meals',
    amount: 150000,
    requestDate: '2025-10-11',
    expenseDate: '2025-10-10',
    status: 'Approved',
    submittedBy: 'Rina Kusuma',
    submittedByRole: 'BD Executive',
    approvedDate: '2025-10-12',
    approvedBy: 'Admin',
  },
  {
    id: 'R003',
    title: 'Pembelian peralatan kantor',
    description: 'Pembelian mouse dan keyboard untuk tim',
    category: 'Office Supplies',
    amount: 500000,
    requestDate: '2025-10-19',
    expenseDate: '2025-10-18',
    status: 'Pending',
    submittedBy: 'Diana Putri',
    submittedByRole: 'PM',
  },
  {
    id: 'R004',
    title: 'Training course online',
    description: 'Pembelian course online untuk skill development',
    category: 'Training',
    amount: 750000,
    requestDate: '2025-10-20',
    expenseDate: '2025-10-19',
    status: 'Rejected',
    submittedBy: 'Sarah Wijaya',
    submittedByRole: 'BD Content',
    rejectedReason: 'Training tidak sesuai dengan kebutuhan tim',
    approvedDate: '2025-10-21',
    approvedBy: 'Admin',
  },
];

// Function to generate dummy leads for BD-MEO (January - June 2025)
export function generateDummyLeadsBDMEO(userName: string): (Lead & { service?: string })[] {
  return [
    {
      id: 'L101',
      clientName: 'Budi Santoso',
      company: 'PT Maju Jaya Abadi',
      email: 'budi@majujaya.com',
      phone: '081234567890',
      source: 'Website',
      status: 'NEW' as any,
      createdDate: '2025-01-15',
      notes: 'Lead baru dari website, tertarik dengan Tax Consulting',
      createdBy: userName,
      service: 'Tax Consulting',
    },
    {
      id: 'L102',
      clientName: 'Siti Rahayu',
      company: 'CV Berkah Sentosa',
      email: 'siti@berkahsentosa.com',
      phone: '082345678901',
      source: 'LinkedIn',
      status: 'TO_BE_MEET' as any,
      createdDate: '2025-01-10',
      notes: 'Sudah dihubungi, janji meeting minggu depan',
      createdBy: userName,
      service: 'Legal Consulting',
      lastActivity: 'CEO moved to To Be Meet - 2025-01-12',
    },
    {
      id: 'L103',
      clientName: 'Ahmad Fauzi',
      company: 'PT Teknologi Nusantara',
      email: 'ahmad@teknusantara.com',
      phone: '083456789012',
      source: 'Referral',
      status: 'IN_HANDOVER' as any,
      createdDate: '2025-01-08',
      notes: 'Handover memo telah disetujui CEO dan siap untuk diserahkan ke PM',
      createdBy: userName,
      service: 'Transfer Pricing Documentation',
      lastActivity: 'Handover approved - 2025-02-15',
    },
    {
      id: 'L104',
      clientName: 'Dewi Lestari',
      company: 'PT Global Mandiri',
      email: 'dewi@globalmandiri.com',
      phone: '084567890123',
      source: 'Facebook',
      status: 'IN_HANDOVER' as any,
      createdDate: '2025-01-05',
      notes: 'Proposal accepted, Engagement Letter signed, Handover memo waiting approval',
      createdBy: userName,
      service: 'Financial Advisory',
      lastActivity: 'Handover memo submitted - waiting CEO approval',
    },
    {
      id: 'L105',
      clientName: 'Rudi Hartono',
      company: 'PT Cahaya Abadi',
      email: 'rudi@cahayaabadi.com',
      phone: '085678901234',
      source: 'Instagram',
      status: 'IN_HANDOVER' as any,
      createdDate: '2025-01-28',
      notes: 'Proposal accepted, Engagement Letter signed, Handover memo submitted for CEO approval',
      createdBy: userName,
      service: 'Web Development',
      lastActivity: 'Handover memo submitted - 2025-02-20',
    },
    {
      id: 'L106',
      clientName: 'Linda Wijayanti',
      company: 'CV Surya Gemilang',
      email: 'linda@suryagemilang.com',
      phone: '086789012345',
      source: 'Cold Call',
      status: 'DEAL_WON' as any,
      createdDate: '2025-01-20',
      notes: 'Deal closed! Client setuju dengan proposal Tax Consulting',
      createdBy: userName,
      service: 'Tax Consulting',
      lastActivity: 'EL signed - 2025-02-10',
    },
    {
      id: 'L107',
      clientName: 'Bambang Suryadi',
      company: 'PT Sejahtera Makmur',
      email: 'bambang@sejahteramakmur.com',
      phone: '087890123456',
      source: 'Event',
      status: 'ON_HOLD' as any,
      createdDate: '2025-01-12',
      notes: 'Client minta ditunda karena sedang fokus ke project lain',
      createdBy: userName,
      service: 'Legal Consulting',
      lastActivity: 'CEO put on hold - budget constraints - 2025-01-15',
    },
    {
      id: 'L108',
      clientName: 'Sari Indrawati',
      company: 'PT Indah Permai',
      email: 'sari@indahpermai.com',
      phone: '088901234567',
      source: 'Website',
      status: 'DROP' as any,
      createdDate: '2025-01-15',
      notes: 'Client tidak tertarik setelah meeting, budget tidak mencukupi',
      createdBy: userName,
      service: 'Audit Services',
    },
    // Februari 2025
    {
      id: 'L109',
      clientName: 'Ari Wijaya',
      company: 'PT Cipta Karya',
      email: 'ari@ciptakarya.com',
      phone: '081112233445',
      source: 'LinkedIn',
      status: 'NEW' as any,
      createdDate: '2025-02-05',
      notes: 'Inquiry melalui LinkedIn untuk Tax Consulting',
      createdBy: userName,
      service: 'Tax Consulting',
    },
    {
      id: 'L110',
      clientName: 'Ratna Sari',
      company: 'CV Makmur Jaya',
      email: 'ratna@makmurjaya.com',
      phone: '082223344556',
      source: 'Website',
      status: 'TO_BE_MEET' as any,
      createdDate: '2025-02-12',
      notes: 'Menunggu konfirmasi jadwal meeting',
      createdBy: userName,
      service: 'Legal Consulting',
      lastActivity: 'CEO moved to To Be Meet - 2025-02-14',
    },
    {
      id: 'L111',
      clientName: 'Eko Prasetyo',
      company: 'PT Nusantara Abadi',
      email: 'eko@nusantaraabadi.com',
      phone: '083334455667',
      source: 'Referral',
      status: 'MEETING_SCHEDULED' as any,
      createdDate: '2025-02-18',
      notes: 'Meeting dijadwalkan awal Maret',
      createdBy: userName,
      service: 'Audit Services',
      lastActivity: 'Meeting scheduled for 2025-03-05',
    },
    {
      id: 'L112',
      clientName: 'Sinta Dewi',
      company: 'PT Bumi Sejahtera',
      email: 'sinta@bumisejahtera.com',
      phone: '084445566778',
      source: 'Instagram',
      status: 'NEED_PROPOSAL' as any,
      createdDate: '2025-02-20',
      notes: 'Permintaan proposal untuk Financial Advisory',
      createdBy: userName,
      service: 'Financial Advisory',
      lastActivity: 'Notulensi approved by CEO - 2025-02-25',
    },
    // Maret 2025
    {
      id: 'L113',
      clientName: 'Hendra Kurniawan',
      company: 'CV Karya Mandiri',
      email: 'hendra@karyamandiri.com',
      phone: '085556677889',
      source: 'Facebook',
      status: 'NEW' as any,
      createdDate: '2025-03-03',
      notes: 'Lead baru dari Facebook ads',
      createdBy: userName,
      service: 'Tax Consulting',
    },
    {
      id: 'L114',
      clientName: 'Dina Kartika',
      company: 'PT Sumber Rezeki',
      email: 'dina@sumberrezeki.com',
      phone: '086667788990',
      source: 'Website',
      status: 'IN_PROPOSAL' as any,
      createdDate: '2025-03-10',
      notes: 'Proposal sedang direview',
      createdBy: userName,
      service: 'Web Development',
      lastActivity: 'Proposal sent to client - 2025-03-15',
    },
    {
      id: 'L115',
      clientName: 'Bambang Wijaya',
      company: 'PT Adi Jaya',
      email: 'bambang@adijaya.com',
      phone: '087778899001',
      source: 'Cold Call',
      status: 'DEAL_WON' as any,
      createdDate: '2025-03-15',
      notes: 'Deal closed untuk Legal Consulting',
      createdBy: userName,
      service: 'Legal Consulting',
      lastActivity: 'EL signed - 2025-03-25',
    },
    {
      id: 'L116',
      clientName: 'Lina Sari',
      company: 'CV Gemilang',
      email: 'lina@gemilang.com',
      phone: '088889900112',
      source: 'LinkedIn',
      status: 'ON_HOLD' as any,
      createdDate: '2025-03-22',
      notes: 'Ditunda sampai Q2',
      createdBy: userName,
      service: 'Audit Services',
    },
    // April 2025
    {
      id: 'L117',
      clientName: 'Agus Setiawan',
      company: 'PT Jaya Makmur',
      email: 'agus@jayamakmur.com',
      phone: '089990011223',
      source: 'Website',
      status: 'NEW' as any,
      createdDate: '2025-04-02',
      notes: 'Lead dari landing page',
      createdBy: userName,
      service: 'Tax Consulting',
    },
    {
      id: 'L118',
      clientName: 'Siti Nurhaliza',
      company: 'PT Sejahtera Bersama',
      email: 'siti@sejahterabersama.com',
      phone: '081234509876',
      source: 'Event',
      status: 'TO_BE_MEET' as any,
      createdDate: '2025-04-08',
      notes: 'Ketemu di pameran bisnis',
      createdBy: userName,
      service: 'Financial Advisory',
    },
    {
      id: 'L119',
      clientName: 'Rizki Pratama',
      company: 'CV Mandiri Jaya',
      email: 'rizki@mandirijaya.com',
      phone: '082345610987',
      source: 'Referral',
      status: 'MEETING_SCHEDULED' as any,
      createdDate: '2025-04-14',
      notes: 'Meeting akhir April',
      createdBy: userName,
      service: 'Web Development',
    },
    {
      id: 'L120',
      clientName: 'Melati Indira',
      company: 'PT Harmoni Bangun',
      email: 'melati@harmonibangun.com',
      phone: '083456721098',
      source: 'Instagram',
      status: 'NEED_PROPOSAL' as any,
      createdDate: '2025-04-20',
      notes: 'Minta proposal untuk Audit Services',
      createdBy: userName,
      service: 'Audit Services',
    },
    {
      id: 'L121',
      clientName: 'Ferdy Sambo',
      company: 'PT Nusantara Indah',
      email: 'ferdy@nusantaraindah.com',
      phone: '084567832109',
      source: 'Facebook',
      status: 'DEAL_WON' as any,
      createdDate: '2025-04-25',
      notes: 'Deal untuk Tax Consulting',
      createdBy: userName,
      service: 'Tax Consulting',
    },
    // Mei 2025
    {
      id: 'L122',
      clientName: 'Nurul Hidayati',
      company: 'CV Berkah Abadi',
      email: 'nurul@berkahabadi.com',
      phone: '085678943210',
      source: 'Website',
      status: 'NEW' as any,
      createdDate: '2025-05-05',
      notes: 'Lead baru dari website',
      createdBy: userName,
      service: 'Legal Consulting',
    },
    {
      id: 'L123',
      clientName: 'Indra Gunawan',
      company: 'PT Cahaya Terang',
      email: 'indra@cahayaterang.com',
      phone: '086789054321',
      source: 'LinkedIn',
      status: 'PROPOSAL_EXPIRED' as any,
      createdDate: '2025-05-10',
      notes: 'Proposal untuk Financial Advisory',
      createdBy: userName,
      service: 'Financial Advisory',
    },
    {
      id: 'L124',
      clientName: 'Rina Kartika',
      company: 'PT Makmur Sentosa',
      email: 'rina@makmursentosa.com',
      phone: '087890165432',
      source: 'Cold Call',
      status: 'MEETING_SCHEDULED' as any,
      createdDate: '2025-05-15',
      notes: 'Meeting pertengahan Mei',
      createdBy: userName,
      service: 'Web Development',
    },
    {
      id: 'L125',
      clientName: 'Ahmad Yani',
      company: 'CV Jaya Makmur',
      email: 'ahmad@jayamakmur.com',
      phone: '088901276543',
      source: 'Referral',
      status: 'TO_BE_MEET' as any,
      createdDate: '2025-05-18',
      notes: 'Tunggu konfirmasi jadwal',
      createdBy: userName,
      service: 'Audit Services',
    },
    {
      id: 'L126',
      clientName: 'Sari Dewi',
      company: 'PT Bumi Karya',
      email: 'sari@bumikarya.com',
      phone: '089012387654',
      source: 'Event',
      status: 'DEAL_WON' as any,
      createdDate: '2025-05-22',
      notes: 'Deal closed untuk Legal Consulting',
      createdBy: userName,
      service: 'Legal Consulting',
    },
    {
      id: 'L127',
      clientName: 'Budi Santosa',
      company: 'PT Nusantara Jaya',
      email: 'budi@nusantarajaya.com',
      phone: '081923498765',
      source: 'Instagram',
      status: 'ON_HOLD' as any,
      createdDate: '2025-05-28',
      notes: 'Ditunda sampai Juni',
      createdBy: userName,
      service: 'Tax Consulting',
    },
    // Juni 2025
    {
      id: 'L128',
      clientName: 'Putri Maharani',
      company: 'PT Sentosa Abadi',
      email: 'putri@sentosaabadi.com',
      phone: '082934509876',
      source: 'Website',
      status: 'NEW' as any,
      createdDate: '2025-06-03',
      notes: 'Inquiry baru untuk Web Development',
      createdBy: userName,
      service: 'Web Development',
    },
    {
      id: 'L129',
      clientName: 'Rizki Ramadhan',
      company: 'CV Mandiri Sejahtera',
      email: 'rizki@mandirisejahtera.com',
      phone: '083945610987',
      source: 'LinkedIn',
      status: 'TO_BE_MEET' as any,
      createdDate: '2025-06-08',
      notes: 'Mengatur jadwal meeting',
      createdBy: userName,
      service: 'Financial Advisory',
    },
    {
      id: 'L130',
      clientName: 'Dewi Lestari',
      company: 'PT Harmoni Bersama',
      email: 'dewi@harmonibersama.com',
      phone: '084956721098',
      source: 'Facebook',
      status: 'MEETING_SCHEDULED' as any,
      createdDate: '2025-06-12',
      notes: 'Meeting akhir Juni',
      createdBy: userName,
      service: 'Audit Services',
    },
    {
      id: 'L131',
      clientName: 'Hari Setiawan',
      company: 'PT Jaya Karya',
      email: 'hari@jayakarya.com',
      phone: '085967832109',
      source: 'Referral',
      status: 'NEED_PROPOSAL' as any,
      createdDate: '2025-06-15',
      notes: 'Butuh proposal untuk Tax Consulting',
      createdBy: userName,
      service: 'Tax Consulting',
    },
    {
      id: 'L132',
      clientName: 'Sinta Maharani',
      company: 'CV Berkah Makmur',
      email: 'sinta@berkahmakmur.com',
      phone: '086978943210',
      source: 'Website',
      status: 'IN_PROPOSAL' as any,
      createdDate: '2025-06-18',
      notes: 'Proposal sedang direview client',
      createdBy: userName,
      service: 'Legal Consulting',
    },
    {
      id: 'L133',
      clientName: 'Arief Wijaya',
      company: 'PT Nusantara Makmur',
      email: 'arief@nusantaramakmur.com',
      phone: '087989054321',
      source: 'Cold Call',
      status: 'DEAL_WON' as any,
      createdDate: '2025-06-20',
      notes: 'Deal untuk Web Development',
      createdBy: userName,
      service: 'Web Development',
    },
    {
      id: 'L134',
      clientName: 'Lia Kartika',
      company: 'PT Sejahtera Karya',
      email: 'lia@sejahterakarya.com',
      phone: '088090165432',
      source: 'Event',
      status: 'NEW' as any,
      createdDate: '2025-06-25',
      notes: 'Lead dari event bisnis',
      createdBy: userName,
      service: 'Financial Advisory',
    },
    {
      id: 'L135',
      clientName: 'Fajar Pratama',
      company: 'CV Gemilang Jaya',
      email: 'fajar@gemilangjaya.com',
      phone: '089101276543',
      source: 'Instagram',
      status: 'ON_HOLD' as any,
      createdDate: '2025-06-28',
      notes: 'Client minta ditunda',
      createdBy: userName,
      service: 'Audit Services',
    },
    // Lead dengan status NEED_NOTULEN - meeting sudah selesai
    {
      id: 'L136',
      clientName: 'Bambang Santoso',
      company: 'PT Maju Bersama',
      email: 'bambang@majubersama.com',
      phone: '081234567890',
      source: 'Website',
      status: 'NEED_NOTULEN' as any,
      createdDate: '2025-01-10',
      notes: 'Meeting sudah selesai, menunggu notulensi dibuat',
      createdBy: userName,
      service: 'Tax Consulting',
      lastActivity: 'Meeting selesai - 2025-01-15',
    },
  ];
}

// Mock data for meetings
export const mockMeetings: Meeting[] = [
  {
    id: 'M001',
    leadId: 'L103', // Ahmad Fauzi - IN_HANDOVER
    name: 'Initial Consultation Meeting',
    dateTime: '2025-01-20T10:00:00',
    location: 'https://zoom.us/j/123456789',
    status: 'DONE',
    notes: 'Meeting untuk diskusi kebutuhan Transfer Pricing Documentation',
  },
  {
    id: 'M002',
    leadId: 'L111', // Eko Prasetyo - MEETING_SCHEDULED
    name: 'Project Discussion',
    dateTime: '2025-03-05T14:00:00',
    location: 'Office PT Nusantara Abadi, Jakarta',
    status: 'SCHEDULED',
    notes: 'Presentasi layanan Audit Services',
  },
  {
    id: 'M003',
    leadId: 'L119', // Rizki Pratama - MEETING_SCHEDULED
    name: 'Client Meeting',
    dateTime: '2025-04-28T09:30:00',
    location: 'Google Meet - meet.google.com/abc-defg-hij',
    status: 'SCHEDULED',
    notes: 'Meeting untuk Web Development project',
  },
  {
    id: 'M004',
    leadId: 'L124', // Rina Kartika - MEETING_SCHEDULED
    name: 'Consultation Session',
    dateTime: '2025-05-18T11:00:00',
    location: 'Office CV Mandiri Jaya, Bandung',
    status: 'SCHEDULED',
    notes: 'Diskusi kebutuhan Web Development',
  },
  {
    id: 'M005',
    leadId: 'L130', // Dewi Lestari - MEETING_SCHEDULED
    name: 'Service Presentation',
    dateTime: '2025-06-28T13:00:00',
    location: 'https://zoom.us/j/987654321',
    status: 'SCHEDULED',
    notes: 'Presentasi Audit Services',
  },
  // Meeting untuk PT Global Mandiri (L104) - sudah selesai
  {
    id: 'M010',
    leadId: 'L104', // Dewi Lestari - PT Global Mandiri - NEED_PROPOSAL
    name: 'Initial Consultation - Financial Advisory',
    dateTime: '2025-01-10T10:00:00',
    location: 'Office PT Global Mandiri, Jakarta',
    status: 'DONE',
    notes: 'Meeting untuk diskusi kebutuhan Financial Advisory',
  },
  // Meeting untuk PT Cahaya Abadi (L105) - sudah selesai
  {
    id: 'M011',
    leadId: 'L105', // Rudi Hartono - PT Cahaya Abadi - IN_PROPOSAL
    name: 'Project Discussion - Web Development',
    dateTime: '2025-01-30T14:00:00',
    location: 'https://zoom.us/j/111222333',
    status: 'DONE',
    notes: 'Meeting untuk diskusi kebutuhan Web Development',
  },
  // Meeting untuk NEED_NOTULEN status - sudah selesai
  {
    id: 'M012',
    leadId: 'L136', // Client dengan status NEED_NOTULEN
    name: 'Consultation Meeting',
    dateTime: '2025-01-15T09:00:00',
    location: 'Office PT Maju Bersama, Jakarta',
    status: 'DONE',
    notes: 'Meeting sudah selesai, menunggu notulensi',
  },
  // Meeting untuk Dina Kartika (L114) - sudah selesai
  {
    id: 'M013',
    leadId: 'L114', // Dina Kartika - IN_PROPOSAL
    name: 'Web Development Consultation',
    dateTime: '2025-03-05T14:00:00',
    location: 'Office PT Sumber Rezeki, Jakarta',
    status: 'DONE',
    notes: 'Meeting untuk diskusi kebutuhan Web Development',
  },
  // Meeting untuk Indra Gunawan (L123) - sudah selesai
  {
    id: 'M014',
    leadId: 'L123', // Indra Gunawan - IN_PROPOSAL
    name: 'Financial Advisory Consultation - Subcon Project',
    dateTime: '2025-05-05T10:00:00',
    location: 'Office PT Cahaya Terang, Jakarta',
    status: 'DONE',
    notes: 'Meeting untuk diskusi kebutuhan Financial Advisory dengan subcon partner',
  },
];

// Mock data for notulensi
export const mockNotulensi: Notulensi[] = [
  {
    id: 'N002',
    leadId: 'L112', // Sinta Dewi - NEED_PROPOSAL
    meetingId: 'M007',
    clientName: 'Sinta Dewi',
    meetingInfo: {
      date: '2025-02-25',
      time: '14:00 - 15:30',
      location: 'https://zoom.us/j/555666777',
    },
    participants: {
      internal: ['Rina Kusuma'],
      client: ['Sinta Dewi', 'Ari Wijaya'],
    },
    objectives: 'Presentasi layanan Financial Advisory dan diskusi kebutuhan',
    discussionSummary: {
      background: 'PT Bumi Sejahtera membutuhkan konsultasi financial untuk ekspansi bisnis',
      issuesDiscussed: 'Membahas strategi pendanaan, financial planning, dan risk management',
      clientInfo: 'Perusahaan retail dengan rencana ekspansi ke 5 kota baru',
      firmInfo: 'Kami menawarkan Financial Advisory dengan fokus pada business expansion',
      risks: 'Client perlu memastikan cash flow cukup untuk ekspansi',
    },
    agreements: [
      {
        item: 'Service Package',
        details: 'Financial Advisory package untuk business expansion planning',
      },
    ],
    actionItems: [
      {
        action: 'Siapkan proposal Financial Advisory',
        pic: 'Rina Kusuma',
        deadline: '2025-03-01',
      },
    ],
    nextSteps: 'Kirim proposal dan tunggu feedback dari client',
    notes: 'Client meminta proposal dengan detail pricing',
    status: 'APPROVED',
    createdBy: 'Rina Kusuma',
    createdAt: '2025-02-25T16:00:00',
  },
  {
    id: 'N003',
    leadId: 'L120', // Melati Indira - NEED_PROPOSAL
    meetingId: 'M008',
    clientName: 'Melati Indira',
    meetingInfo: {
      date: '2025-04-25',
      time: '09:00 - 10:30',
      location: 'Office PT Harmoni Bangun, Surabaya',
    },
    participants: {
      internal: ['Andi Wijaya'],
      client: ['Melati Indira', 'Hendra Kurniawan'],
    },
    objectives: 'Diskusi kebutuhan Audit Services untuk compliance',
    discussionSummary: {
      background: 'PT Harmoni Bangun membutuhkan audit untuk compliance dengan regulasi baru',
      issuesDiscussed: 'Membahas scope audit, timeline, dan deliverables',
      clientInfo: 'Perusahaan konstruksi dengan multiple projects',
      firmInfo: 'Kami menawarkan Audit Services dengan comprehensive approach',
      risks: 'Tidak ada risiko, client sudah siap dengan dokumentasi',
    },
    agreements: [
      {
        item: 'Audit Scope',
        details: 'Financial audit dan compliance audit untuk tahun 2024',
      },
    ],
    actionItems: [
      {
        action: 'Buat proposal Audit Services',
        pic: 'Andi Wijaya',
        deadline: '2025-04-30',
      },
    ],
    nextSteps: 'Proposal akan dikirim dan menunggu approval',
    notes: 'Client meminta proposal dengan breakdown biaya',
    status: 'APPROVED',
    createdBy: 'Andi Wijaya',
    createdAt: '2025-04-25T11:00:00',
  },
  {
    id: 'N004',
    leadId: 'L131', // Hari Setiawan - NEED_PROPOSAL
    meetingId: 'M009',
    clientName: 'Hari Setiawan',
    meetingInfo: {
      date: '2025-06-20',
      time: '13:00 - 14:30',
      location: 'Google Meet - meet.google.com/xyz-abcde-fgh',
    },
    participants: {
      internal: ['Rina Kusuma'],
      client: ['Hari Setiawan'],
    },
    objectives: 'Konsultasi Tax Consulting untuk optimasi pajak',
    discussionSummary: {
      background: 'PT Jaya Karya membutuhkan konsultasi untuk tax optimization',
      issuesDiscussed: 'Membahas strategi tax planning, compliance, dan optimization',
      clientInfo: 'Perusahaan trading dengan multiple transactions',
      firmInfo: 'Kami menawarkan Tax Consulting dengan focus pada optimization',
      risks: 'Minimal, client sudah memiliki sistem yang baik',
    },
    agreements: [
      {
        item: 'Service Scope',
        details: 'Tax Consulting untuk tax planning dan compliance',
      },
    ],
    actionItems: [
      {
        action: 'Siapkan proposal Tax Consulting',
        pic: 'Rina Kusuma',
        deadline: '2025-06-25',
      },
    ],
    nextSteps: 'Kirim proposal dan follow up dengan client',
    notes: 'Client tertarik dengan layanan kami',
    status: 'APPROVED',
    createdBy: 'Rina Kusuma',
    createdAt: '2025-06-20T15:00:00',
  },
  // Notulensi untuk PT Global Mandiri (L104) - sudah approved
  {
    id: 'N005',
    leadId: 'L104', // Dewi Lestari - PT Global Mandiri - NEED_PROPOSAL
    meetingId: 'M010',
    clientName: 'Dewi Lestari',
    meetingInfo: {
      date: '2025-01-10',
      time: '10:00 - 11:30',
      location: 'Office PT Global Mandiri, Jakarta',
    },
    participants: {
      internal: ['Rina Kusuma', 'Andi Wijaya'],
      client: ['Dewi Lestari', 'Hendra Gunawan'],
    },
    objectives: 'Diskusi kebutuhan Financial Advisory untuk optimasi keuangan perusahaan',
    discussionSummary: {
      background: 'PT Global Mandiri membutuhkan konsultasi financial untuk optimasi keuangan dan strategi investasi',
      issuesDiscussed: 'Membahas struktur keuangan perusahaan, cash flow management, investment strategy, dan financial planning',
      clientInfo: 'PT Global Mandiri adalah perusahaan manufaktur dengan omset 50M per tahun, memiliki 3 cabang',
      firmInfo: 'Kami menawarkan layanan Financial Advisory dengan paket comprehensive termasuk analisis keuangan dan investment planning',
      risks: 'Tidak ada risiko signifikan, client sudah memiliki budget yang cukup dan komitmen untuk improvement',
    },
    agreements: [
      {
        item: 'Scope of Work',
        details: 'Financial Advisory meliputi analisis keuangan komprehensif, cash flow optimization, investment planning, dan financial strategy',
      },
      {
        item: 'Timeline',
        details: 'Project akan dimulai setelah proposal disetujui, estimasi durasi 3 bulan dengan progress review bulanan',
      },
      {
        item: 'Budget',
        details: 'Client menyetujui budget range 40-50 juta untuk project ini',
      },
    ],
    actionItems: [
      {
        action: 'Buat proposal Financial Advisory dengan detail scope dan pricing',
        pic: 'Rina Kusuma',
        deadline: '2025-01-15',
      },
      {
        action: 'Siapkan case study dan portfolio untuk presentasi',
        pic: 'Andi Wijaya',
        deadline: '2025-01-12',
      },
    ],
    nextSteps: 'Menunggu approval proposal dari client, kemudian proceed ke tahap EL dan kick-off meeting',
    notes: 'Client sangat tertarik dan meminta proposal segera. Meeting berjalan dengan baik dan semua pihak puas',
    status: 'APPROVED',
    createdBy: 'Rina Kusuma',
    createdAt: '2025-01-10T12:00:00',
  },
  // Notulensi untuk PT Cahaya Abadi (L105) - DRAFT
  {
    id: 'N006',
    leadId: 'L105', // Rudi Hartono - PT Cahaya Abadi - IN_PROPOSAL
    meetingId: 'M011',
    clientName: 'Rudi Hartono',
    meetingInfo: {
      date: '2025-01-30',
      time: '14:00 - 16:00',
      location: 'https://zoom.us/j/111222333',
    },
    participants: {
      internal: ['Andi Wijaya'],
      client: ['Rudi Hartono', 'Siti Rahayu'],
    },
    objectives: 'Diskusi kebutuhan Web Development untuk company profile dan e-commerce',
    discussionSummary: {
      background: 'PT Cahaya Abadi membutuhkan website company profile dan platform e-commerce untuk bisnis mereka',
      issuesDiscussed: 'Membahas fitur website, design requirements, payment gateway integration, dan timeline development',
      clientInfo: 'PT Cahaya Abadi adalah perusahaan retail dengan produk fashion, memiliki 5 store offline',
      firmInfo: 'Kami menawarkan layanan Web Development dengan teknologi modern dan responsive design',
      risks: 'Client perlu memastikan konten dan produk ready untuk diupload ke website',
    },
    agreements: [
      {
        item: 'Project Scope',
        details: 'Web Development meliputi company profile website dan e-commerce platform dengan payment gateway',
      },
    ],
    actionItems: [
      {
        action: 'Buat proposal Web Development dengan detail fitur dan pricing',
        pic: 'Andi Wijaya',
        deadline: '2025-02-05',
      },
    ],
    nextSteps: 'Proposal akan dikirim dan menunggu feedback dari client',
    notes: 'Client tertarik dengan layanan kami, perlu follow up untuk proposal',
    status: 'APPROVED',
    createdBy: 'Andi Wijaya',
    createdAt: '2025-01-30T16:30:00',
  },
  // Notulensi untuk PT Teknologi Nusantara (L103) - APPROVED
  {
    id: 'N008',
    leadId: 'L103', // Ahmad Fauzi - PT Teknologi Nusantara - IN_HANDOVER
    meetingId: 'M001',
    clientName: 'Ahmad Fauzi',
    meetingInfo: {
      date: '2025-01-20',
      time: '10:00 - 12:00',
      location: 'https://zoom.us/j/123456789',
    },
    participants: {
      internal: ['Andi Wijaya', 'Rina Kusuma'],
      client: ['Ahmad Fauzi', 'Budi Santoso'],
    },
    objectives: 'Diskusi kebutuhan Transfer Pricing Documentation untuk compliance dengan regulasi perpajakan',
    discussionSummary: {
      background: 'PT Teknologi Nusantara adalah perusahaan teknologi yang memiliki transaksi related party dengan perusahaan afiliasi di luar negeri. Perusahaan perlu menyiapkan Transfer Pricing Documentation untuk memenuhi kewajiban perpajakan dan menghindari risiko koreksi fiskal.',
      issuesDiscussed: 'Membahas struktur transaksi related party, metode transfer pricing yang sesuai, dan dokumen yang diperlukan untuk compliance',
      clientInfo: 'PT Teknologi Nusantara memiliki transaksi jasa teknologi dan lisensi dengan perusahaan afiliasi di Singapura dan Malaysia. Omset tahunan sekitar 80 miliar rupiah dengan 150 karyawan.',
      firmInfo: 'Kami menawarkan layanan Transfer Pricing Documentation yang komprehensif termasuk analisis comparability, penyusunan dokumentasi, dan pendampingan saat pemeriksaan pajak',
      risks: 'Risiko koreksi fiskal jika dokumentasi tidak lengkap atau tidak sesuai dengan regulasi terbaru',
    },
    agreements: [
      {
        item: 'Project Scope',
        details: 'Transfer Pricing Documentation meliputi analisis comparability, penyusunan Master File dan Local File, serta pendampingan saat pemeriksaan pajak',
      },
      {
        item: 'Timeline',
        details: 'Project akan dimulai setelah Engagement Letter ditandatangani, estimasi selesai dalam 3 bulan',
      },
    ],
    actionItems: [
      {
        action: 'Buat proposal Transfer Pricing Documentation dengan detail scope dan pricing',
        pic: 'Andi Wijaya',
        deadline: '2025-01-25',
      },
    ],
    nextSteps: 'Proposal akan dikirim dan menunggu feedback dari client, kemudian proceed ke tahap EL dan kick-off meeting',
    notes: 'Client sangat tertarik dan meminta proposal segera. Meeting berjalan dengan baik dan semua pihak puas',
    status: 'APPROVED',
    createdBy: 'Andi Wijaya',
    createdAt: '2025-01-20T12:00:00',
  },
  // Notulensi untuk Dina Kartika (L114) - sudah approved
  {
    id: 'N007',
    leadId: 'L114', // Dina Kartika - IN_PROPOSAL
    meetingId: 'M013',
    clientName: 'Dina Kartika',
    meetingInfo: {
      date: '2025-03-05',
      time: '14:00 - 15:30',
      location: 'Office PT Sumber Rezeki, Jakarta',
    },
    participants: {
      internal: ['Andi Wijaya', 'Rina Kusuma'],
      client: ['Dina Kartika', 'Budi Santoso'],
    },
    objectives: 'Diskusi kebutuhan Web Development untuk website perusahaan dan sistem manajemen',
    discussionSummary: {
      background: 'PT Sumber Rezeki membutuhkan website company profile dan sistem manajemen internal untuk operasional perusahaan',
      issuesDiscussed: 'Membahas fitur website, design requirements, sistem manajemen inventory, user management, dan timeline development',
      clientInfo: 'PT Sumber Rezeki adalah perusahaan distribusi dengan 10 cabang di berbagai kota, membutuhkan sistem terintegrasi',
      firmInfo: 'Kami menawarkan layanan Web Development dengan teknologi modern, responsive design, dan sistem manajemen yang scalable',
      risks: 'Client perlu memastikan data dan konten ready untuk diupload, serta training untuk user sistem',
    },
    agreements: [
      {
        item: 'Project Scope',
        details: 'Web Development meliputi company profile website dan sistem manajemen internal dengan fitur inventory dan user management',
      },
      {
        item: 'Budget Range',
        details: 'Budget disetujui dalam range 30-40 juta untuk project ini',
      },
    ],
    actionItems: [
      {
        action: 'Buat proposal Web Development dengan detail fitur, pricing, dan timeline',
        pic: 'Andi Wijaya',
        deadline: '2025-03-10',
      },
      {
        action: 'Follow up dengan client untuk konfirmasi requirements',
        pic: 'Rina Kusuma',
        deadline: '2025-03-08',
      },
    ],
    nextSteps: 'Proposal akan dikirim dan menunggu approval dari client',
    notes: 'Client sangat tertarik dengan layanan kami, perlu segera follow up untuk proposal',
    status: 'APPROVED',
    createdBy: 'Andi Wijaya',
    createdAt: '2025-03-05T16:00:00',
  },
  // Notulensi untuk Indra Gunawan (L123) - sudah approved
  {
    id: 'N008',
    leadId: 'L123', // Indra Gunawan - IN_PROPOSAL
    meetingId: 'M014',
    clientName: 'Indra Gunawan',
    meetingInfo: {
      date: '2025-05-05',
      time: '10:00 - 11:30',
      location: 'Office PT Cahaya Terang, Jakarta',
    },
    participants: {
      internal: ['Rina Kusuma', 'Andi Wijaya'],
      client: ['Indra Gunawan', 'Siti Nurhaliza'],
    },
    objectives: 'Diskusi kebutuhan Financial Advisory dengan subcon partner untuk project client',
    discussionSummary: {
      background: 'PT Cahaya Terang membutuhkan konsultasi financial advisory, namun project ini akan dikerjakan melalui subcon partner (Asahi) dengan white kitchen model',
      issuesDiscussed: 'Membahas scope financial advisory, subcon arrangement dengan partner Asahi, payment terms, dan timeline project',
      clientInfo: 'PT Cahaya Terang adalah perusahaan manufaktur dengan omset 100M per tahun, membutuhkan financial planning dan advisory services',
      firmInfo: 'Kami menawarkan Financial Advisory melalui subcon model dengan partner Asahi, dimana kami akan handle project namun menggunakan bendera partner',
      risks: 'Perlu koordinasi dengan partner untuk memastikan kualitas deliverable sesuai standar',
    },
    agreements: [
      {
        item: 'Project Scope',
        details: 'Financial Advisory services meliputi financial planning, cash flow management, dan investment strategy',
      },
      {
        item: 'Subcon Arrangement',
        details: 'Project akan dikerjakan melalui subcon dengan partner Asahi menggunakan white kitchen model',
      },
      {
        item: 'Budget Range',
        details: 'Budget disetujui dalam range 35-45 juta untuk project ini',
      },
    ],
    actionItems: [
      {
        action: 'Buat proposal Financial Advisory dengan detail subcon arrangement dan pricing',
        pic: 'Rina Kusuma',
        deadline: '2025-05-08',
      },
      {
        action: 'Koordinasi dengan partner Asahi untuk konfirmasi arrangement',
        pic: 'Andi Wijaya',
        deadline: '2025-05-07',
      },
    ],
    nextSteps: 'Proposal akan dikirim dan menunggu approval dari client',
    notes: 'Client setuju dengan subcon arrangement, perlu segera follow up untuk proposal',
    status: 'APPROVED',
    createdBy: 'Rina Kusuma',
    createdAt: '2025-05-05T12:00:00',
  },
  // Dummy data untuk CEO Approval - Notulensi dengan status WAITING_CEO_APPROVAL
  {
    id: 'N101',
    leadId: 'L201',
    meetingId: 'M101',
    clientName: 'Ahmad Pratama',
    meetingInfo: {
      date: '2025-11-20',
      time: '10:00 - 11:30',
      location: 'Office PT Teknologi Maju, Jakarta',
    },
    participants: {
      internal: ['Andi Wijaya', 'Rina Kusuma'],
      client: ['Ahmad Pratama', 'Siti Nurhaliza'],
    },
    objectives: 'Diskusi kebutuhan Tax Compliance dan konsultasi perpajakan',
    discussionSummary: {
      background: 'PT Teknologi Maju membutuhkan konsultasi tax compliance untuk tahun 2025',
      issuesDiscussed: 'Membahas kewajiban perpajakan, tax planning, dan compliance requirements',
      clientInfo: 'Perusahaan teknologi dengan 50+ karyawan, revenue 5M per tahun',
      firmInfo: 'Kami menawarkan Tax Compliance service dengan comprehensive approach',
      risks: 'Client perlu memastikan semua dokumen lengkap untuk audit',
    },
    agreements: [
      {
        item: 'Service Package',
        details: 'Tax Compliance package untuk tahun 2025 dengan monthly consultation',
      },
    ],
    actionItems: [
      {
        action: 'Siapkan proposal Tax Compliance',
        pic: 'Andi Wijaya',
        deadline: '2025-11-25',
      },
    ],
    nextSteps: 'Proposal akan dikirim setelah approval dari CEO',
    notes: 'Client sangat tertarik dan meminta proposal secepatnya',
    status: 'WAITING_CEO_APPROVAL',
    createdBy: 'Andi Wijaya',
    createdAt: '2025-11-20T12:00:00',
  },
  {
    id: 'N102',
    leadId: 'L202',
    meetingId: 'M102',
    clientName: 'Budi Santoso',
    meetingInfo: {
      date: '2025-11-18',
      time: '14:00 - 15:30',
      location: 'https://zoom.us/j/123456789',
    },
    participants: {
      internal: ['Rina Kusuma'],
      client: ['Budi Santoso', 'Dewi Lestari'],
    },
    objectives: 'Presentasi layanan Audit and Assurance untuk compliance',
    discussionSummary: {
      background: 'PT Maju Jaya membutuhkan audit untuk compliance dengan regulasi baru',
      issuesDiscussed: 'Membahas scope audit, timeline, deliverables, dan pricing',
      clientInfo: 'Perusahaan manufaktur dengan multiple divisions',
      firmInfo: 'Kami menawarkan Audit and Assurance dengan comprehensive approach',
      risks: 'Tidak ada risiko signifikan, client sudah siap dengan dokumentasi',
    },
    agreements: [
      {
        item: 'Audit Scope',
        details: 'Financial audit dan compliance audit untuk tahun 2024 dan Q1 2025',
      },
    ],
    actionItems: [
      {
        action: 'Buat proposal Audit and Assurance',
        pic: 'Rina Kusuma',
        deadline: '2025-11-22',
      },
    ],
    nextSteps: 'Proposal akan dikirim setelah approval dari CEO',
    notes: 'Client meminta proposal dengan detail breakdown biaya per service',
    status: 'WAITING_CEO_APPROVAL',
    createdBy: 'Rina Kusuma',
    createdAt: '2025-11-18T16:00:00',
  },
  {
    id: 'N103',
    leadId: 'L203',
    meetingId: 'M103',
    clientName: 'Sari Indrawati',
    meetingInfo: {
      date: '2025-11-15',
      time: '09:00 - 10:30',
      location: 'Office PT Indah Permai, Bandung',
    },
    participants: {
      internal: ['Dedi Supriyanto'],
      client: ['Sari Indrawati'],
    },
    objectives: 'Konsultasi Transfer Pricing untuk intercompany transactions',
    discussionSummary: {
      background: 'PT Indah Permai membutuhkan transfer pricing documentation untuk compliance',
      issuesDiscussed: 'Membahas intercompany transactions, pricing methodology, dan documentation requirements',
      clientInfo: 'Perusahaan retail dengan multiple subsidiaries',
      firmInfo: 'Kami menawarkan Transfer Pricing service dengan comprehensive documentation',
      risks: 'Client perlu memastikan semua intercompany transactions terdokumentasi dengan baik',
    },
    agreements: [
      {
        item: 'Service Package',
        details: 'Transfer Pricing documentation dan consultation package',
      },
    ],
    actionItems: [
      {
        action: 'Siapkan proposal Transfer Pricing',
        pic: 'Dedi Supriyanto',
        deadline: '2025-11-20',
      },
    ],
    nextSteps: 'Proposal akan dikirim setelah approval dari CEO',
    notes: 'Client sangat tertarik dan meminta proposal dengan detail pricing',
    status: 'WAITING_CEO_APPROVAL',
    createdBy: 'Dedi Supriyanto',
    createdAt: '2025-11-15T11:00:00',
  },
];

// Mock data for proposals
export const mockProposals: Proposal[] = [
  {
    id: 'P108',
    leadId: 'L103', // Ahmad Fauzi - PT Teknologi Nusantara - IN_HANDOVER
    service: 'Transfer Pricing Documentation',
    proposalFee: 65000000,
    agreeFee: 65000000,
    paymentType: 'Termin 1: 50% (IDR 32.5M) - DP saat EL signed | Termin 2: 50% (IDR 32.5M) - Pelunasan saat project selesai',
    paymentTypeFinal: 'Termin 1: 50% (IDR 32.5M) - DP saat EL signed | Termin 2: 50% (IDR 32.5M) - Pelunasan saat project selesai',
    dealDate: '2025-02-05',
    hasSubcon: false,
    sentAt: '2025-01-26',
    status: 'ACCEPTED',
    createdAt: '2025-01-25',
    createdBy: 'Andi Wijaya',
    clientName: 'Ahmad Fauzi',
  },
  {
    id: 'P001',
    leadId: 'L105', // Rudi Hartono - IN_PROPOSAL
    service: 'Web Development',
    proposalFee: 45000000,
    agreeFee: 45000000,
    paymentType: 'Termin 1: 50% (IDR 25M) - DP saat EL signed | Termin 2: 50% (IDR 25M) - Pelunasan saat project selesai',
    paymentTypeFinal: 'Termin 1: 50% (IDR 25M) - DP saat EL signed | Termin 2: 50% (IDR 25M) - Pelunasan saat project selesai',
    dealDate: '2025-02-10',
    hasSubcon: false,
    sentAt: '2025-02-05',
    status: 'ACCEPTED',
    createdAt: '2025-02-01',
  },
  {
    id: 'P002',
    leadId: 'L114', // Dina Kartika - IN_PROPOSAL
    service: 'Web Development',
    proposalFee: 35000000,
    paymentType: 'Termin 1: 50% (IDR 17.5M) - DP saat kontrak ditandatangani | Termin 2: 50% (IDR 17.5M) - Pelunasan saat project selesai',
    hasSubcon: false,
    status: 'APPROVED',
    createdAt: '2025-03-10T10:00:00',
  },
  {
    id: 'P003',
    leadId: 'L123', // Indra Gunawan - IN_PROPOSAL
    service: 'Financial Advisory',
    proposalFee: 40000000,
    paymentType: 'Subkon dengan Asahi: pembayaran 100% di awal oleh partner',
    hasSubcon: true,
    sentAt: '2024-12-10T11:00:00', // Updated to be expired (>30 days ago)
    status: 'PROPOSAL_EXPIRED',
    createdAt: '2024-12-05T09:00:00',
  },
  {
    id: 'P004',
    leadId: 'L132', // Sinta Maharani - IN_PROPOSAL
    service: 'Legal Consulting',
    proposalFee: 30000000,
    paymentType: '50-50',
    hasSubcon: false,
    sentAt: '2025-06-20T13:00:00',
    status: 'SENT',
    createdAt: '2025-06-18T10:00:00',
  },
  // Dummy data untuk CEO Approval - Proposal dengan status WAITING_CEO_APPROVAL
  {
    id: 'P101',
    leadId: 'L201',
    service: 'Tax Compliance',
    proposalFee: 25000000,
    paymentType: 'Termin 1: 50% (IDR 12.5M) - DP saat kontrak ditandatangani | Termin 2: 50% (IDR 12.5M) - Pelunasan saat project selesai',
    hasSubcon: false,
    status: 'WAITING_CEO_APPROVAL',
    createdAt: '2025-11-20T14:00:00',
    createdBy: 'Andi Wijaya',
    clientName: 'Ahmad Pratama',
  },
  {
    id: 'P102',
    leadId: 'L202',
    service: 'Audit and Assurance',
    proposalFee: 50000000,
    paymentType: 'Termin 1: 40% (IDR 20M) - DP saat kontrak ditandatangani | Termin 2: 35% (IDR 17.5M) - Progress 50% | Termin 3: 25% (IDR 12.5M) - Pelunasan saat project selesai',
    hasSubcon: false,
    status: 'WAITING_CEO_APPROVAL',
    createdAt: '2025-11-18T16:00:00',
    createdBy: 'Rina Kusuma',
    clientName: 'Budi Santoso',
  },
  {
    id: 'P103',
    leadId: 'L203',
    service: 'Transfer Pricing',
    proposalFee: 35000000,
    paymentType: 'Termin 1: 50% (IDR 17.5M) - DP saat kontrak ditandatangani | Termin 2: 50% (IDR 17.5M) - Pelunasan saat project selesai',
    hasSubcon: false,
    status: 'WAITING_CEO_APPROVAL',
    createdAt: '2025-11-15T11:00:00',
    createdBy: 'Dedi Supriyanto',
    clientName: 'Sari Indrawati',
  },
  {
    id: 'P104',
    leadId: 'L204',
    service: 'Web Development',
    proposalFee: 60000000,
    paymentType: 'Subkon dengan Asahi: pembayaran 100% di awal oleh partner',
    hasSubcon: true,
    status: 'WAITING_CEO_APPROVAL',
    createdAt: '2025-11-19T10:00:00',
    createdBy: 'Fitri Handayani',
    clientName: 'Rudi Kurniawan',
  },
  // Dummy data untuk CEO Approval - Proposal yang sudah ACCEPTED
  {
    id: 'P105',
    leadId: 'L205',
    service: 'Tax Dispute',
    proposalFee: 80000000,
    agreeFee: 75000000,
    paymentType: 'Termin 1: 50% (IDR 37.5M) - DP saat EL signed | Termin 2: 50% (IDR 37.5M) - Pelunasan saat project selesai',
    paymentTypeFinal: 'Termin 1: 50% (IDR 37.5M) - DP saat EL signed | Termin 2: 50% (IDR 37.5M) - Pelunasan saat project selesai',
    dealDate: '2025-11-10',
    hasSubcon: false,
    status: 'ACCEPTED',
    createdAt: '2025-11-05T09:00:00',
    createdBy: 'Andi Wijaya',
    clientName: 'Hendra Gunawan',
  },
  {
    id: 'P106',
    leadId: 'L206',
    service: 'Strategic Tax Advisory',
    proposalFee: 120000000,
    agreeFee: 115000000,
    paymentType: 'Retainer bulanan: IDR 9.58M per bulan untuk periode 12 bulan (Jan 2025 - Des 2025); Penagihan: Awal bulan',
    paymentTypeFinal: 'Retainer bulanan: IDR 9.58M per bulan untuk periode 12 bulan (Jan 2025 - Des 2025); Penagihan: Awal bulan',
    dealDate: '2025-11-12',
    hasSubcon: false,
    status: 'ACCEPTED',
    createdAt: '2025-11-08T10:00:00',
    createdBy: 'Rina Kusuma',
    clientName: 'Linda Wijayanti',
  },
  // Proposal untuk PT Global Mandiri (L104) - Financial Advisory - ACCEPTED
  {
    id: 'P107',
    leadId: 'L104',
    service: 'Financial Advisory',
    proposalFee: 75000000,
    agreeFee: 75000000,
    paymentType: 'Termin 1: 50% (IDR 37.5M) - DP saat EL signed | Termin 2: 50% (IDR 37.5M) - Pelunasan saat project selesai',
    paymentTypeFinal: 'Termin 1: 50% (IDR 37.5M) - DP saat EL signed | Termin 2: 50% (IDR 37.5M) - Pelunasan saat project selesai',
    dealDate: '2025-01-20',
    hasSubcon: false,
    sentAt: '2025-01-15',
    status: 'ACCEPTED',
    createdAt: '2025-01-12T10:00:00',
    createdBy: 'Andi Wijaya',
    clientName: 'Dewi Lestari',
  },
];

// Mock data for engagement letters
export const mockEngagementLetters: EngagementLetter[] = [
  // Engagement Letter untuk PT Teknologi Nusantara (L103) - Transfer Pricing Documentation - SIGNED
  {
    id: 'EL-L103-001',
    leadId: 'L103',
    service: 'Transfer Pricing Documentation',
    agreeFee: 65000000,
    hasSubcon: false,
    paymentType: 'Termin 1: 50% (IDR 32.5M) - DP saat EL signed | Termin 2: 50% (IDR 32.5M) - Pelunasan saat project selesai',
    paymentTypeFinal: 'Termin 1: 50% (IDR 32.5M) - DP saat EL signed | Termin 2: 50% (IDR 32.5M) - Pelunasan saat project selesai',
    status: 'SIGNED',
    clientName: 'Ahmad Fauzi',
    createdAt: '2025-02-05',
    approvedDate: '2025-02-07',
    sentAt: '2025-02-08',
    signedDate: '2025-02-10',
  },
  // Engagement Letter untuk PT Cahaya Abadi (L105) - Proposal P001 sudah ACCEPTED
  {
    id: 'EL-L105-001',
    leadId: 'L105',
    service: 'Web Development',
    agreeFee: 55000000,
    hasSubcon: false,
    paymentType: 'Termin 1: 50% (IDR 25M) - DP saat EL signed | Termin 2: 50% (IDR 25M) - Pelunasan saat project selesai',
    paymentTypeFinal: 'Termin 1: 50% (IDR 25M) - DP saat EL signed | Termin 2: 50% (IDR 25M) - Pelunasan saat project selesai',
    status: 'SIGNED',
    clientName: 'Rudi Hartono',
    createdAt: '2025-02-10',
    approvedDate: '2025-02-12',
    sentAt: '2025-02-15',
    signedDate: '2025-02-18',
  },
  // Engagement Letter untuk PT Global Mandiri (L104) - Financial Advisory - SIGNED
  {
    id: 'EL-L104-001',
    leadId: 'L104',
    service: 'Financial Advisory',
    agreeFee: 75000000,
    hasSubcon: false,
    paymentType: 'Termin 1: 50% (IDR 37.5M) - DP saat EL signed | Termin 2: 50% (IDR 37.5M) - Pelunasan saat project selesai',
    paymentTypeFinal: 'Termin 1: 50% (IDR 37.5M) - DP saat EL signed | Termin 2: 50% (IDR 37.5M) - Pelunasan saat project selesai',
    status: 'SIGNED',
    clientName: 'Dewi Lestari',
    createdAt: '2025-01-22',
    approvedDate: '2025-01-24',
    sentAt: '2025-01-25',
    signedDate: '2025-01-28',
  },
];

// Mock data for handover memos
export const mockHandovers: Handover[] = [
  // Handover Memo untuk PT Teknologi Nusantara (L103) - Transfer Pricing Documentation - Complete and APPROVED
  {
    id: 'HO-L103-001',
    leadId: 'L103',
    clientName: 'PT Teknologi Nusantara',
    projectTitle: 'Transfer Pricing Documentation - PT Teknologi Nusantara',
    pm: 'Diana Putri',
    status: 'CONVERTED',
    createdBy: 'Andi Wijaya',
    createdAt: '2025-02-12',
    summary: 'PT Teknologi Nusantara membutuhkan Transfer Pricing Documentation untuk compliance dengan regulasi perpajakan. Perusahaan memiliki transaksi related party dengan perusahaan afiliasi di Singapura dan Malaysia. Project ini akan mencakup analisis comparability, penyusunan Master File dan Local File, serta pendampingan saat pemeriksaan pajak.',
    deliverables: [
      'Transfer Pricing Master File',
      'Transfer Pricing Local File',
      'Comparability Analysis Report',
      'Transfer Pricing Documentation Summary',
      'Supporting Documentation Package'
    ],
    notes: 'Handover memo lengkap dengan semua informasi project. Proposal sudah accepted, Engagement Letter sudah signed. Handover telah disetujui CEO dan siap untuk diserahkan ke PM.',
    // Extended fields untuk data lengkap 11 sections
    documentCode: 'BD-HO-PT-TN-2025-001',
    classification: 'Strictly Confidential – Internal Use Only',
    projectName: 'Transfer Pricing Documentation - PT Teknologi Nusantara',
    companyGroup: 'Teknologi Nusantara Group',
    serviceLine: 'Transfer Pricing Documentation',
    projectPeriod: '2025-02-15 – 2025-05-15',
    clientPic: 'Ahmad Fauzi',
    clientEmail: 'ahmad@teknusantara.com',
    clientPhone: '083456789012',
    engagementLetterStatus: 'Signed on 10 February 2025',
    proposalReference: 'P108',
    background: 'PT Teknologi Nusantara adalah perusahaan teknologi yang telah beroperasi selama 12 tahun dengan omset tahunan sekitar 80 miliar rupiah. Perusahaan memiliki 150 karyawan dan memiliki transaksi related party dengan perusahaan afiliasi di Singapura dan Malaysia, termasuk transaksi jasa teknologi, lisensi, dan transfer teknologi. Dalam rangka compliance dengan regulasi perpajakan dan menghindari risiko koreksi fiskal, perusahaan membutuhkan Transfer Pricing Documentation yang komprehensif sesuai dengan ketentuan Peraturan Menteri Keuangan dan OECD Guidelines.',
    scopeIncluded: [
      'Analisis struktur transaksi related party dan identifikasi controlled transactions',
      'Penyusunan Transfer Pricing Master File sesuai dengan format yang ditentukan',
      'Penyusunan Transfer Pricing Local File dengan analisis detail untuk setiap controlled transaction',
      'Analisis comparability dengan mencari comparable companies dan melakukan comparability analysis',
      'Penentuan transfer pricing method yang sesuai (CUP, TNMM, atau Profit Split Method)',
      'Penyusunan supporting documentation dan working papers',
      'Pendampingan saat pemeriksaan pajak dan penyiapan response untuk permintaan data dari DJP'
    ],
    scopeExclusions: [
      'Audit keuangan atau verifikasi data historis',
      'Layanan konsultasi perpajakan umum atau tax planning',
      'Representasi di pengadilan atau proses banding',
      'Layanan legal atau corporate action',
      'Update dokumentasi untuk tahun fiskal berikutnya (diluar scope project ini)'
    ],
    deliverablesExtended: [
      { id: 'DEL-001', name: 'Transfer Pricing Master File', description: 'PDF & Word', quantity: 1, dueDate: '2025-03-15', assignedTo: 'Senior Tax Advisor' },
      { id: 'DEL-002', name: 'Transfer Pricing Local File', description: 'PDF & Word', quantity: 1, dueDate: '2025-04-15', assignedTo: 'Tax Advisor' },
      { id: 'DEL-003', name: 'Comparability Analysis Report', description: 'Excel + PDF', quantity: 1, dueDate: '2025-04-20', assignedTo: 'Tax Analyst' },
      { id: 'DEL-004', name: 'Transfer Pricing Documentation Summary', description: 'PDF & Word', quantity: 1, dueDate: '2025-04-25', assignedTo: 'Senior Tax Advisor' },
      { id: 'DEL-005', name: 'Supporting Documentation Package', description: 'PDF + Excel', quantity: 1, dueDate: '2025-05-05', assignedTo: 'Tax Advisor' }
    ],
    milestones: [
      { id: 'MS-001', name: 'Kick-Off Meeting', targetDate: '2025-02-20', description: 'Setelah DP diterima dan data awal dikumpulkan' },
      { id: 'MS-002', name: 'Data Collection Completed', targetDate: '2025-03-05', description: 'Bergantung kelengkapan data dari klien' },
      { id: 'MS-003', name: 'Draft Master File', targetDate: '2025-03-20', description: 'Draf awal untuk review internal' },
      { id: 'MS-004', name: 'Draft Local File', targetDate: '2025-04-10', description: 'Draf awal untuk review internal' },
      { id: 'MS-005', name: 'Final Deliverables', targetDate: '2025-05-10', description: 'Semua deliverables final diserahkan' }
    ],
    feeStructure: [
      { id: 'FEE-001', description: 'Professional Fee', amount: 65000000, percentage: 100, status: 'Pending' },
      { id: 'FEE-002', description: 'DP / Initial Payment', amount: 32500000, percentage: 50, dueDate: '2025-02-10', status: 'Pending' },
      { id: 'FEE-003', description: 'Final Payment', amount: 32500000, percentage: 50, dueDate: '2025-05-15', status: 'Pending' }
    ],
    paymentTermsText: 'Invoice DP telah diterbitkan 10 Februari 2025. Pekerjaan dimulai setelah DP diterima (estimasi 15-20 Februari 2025). Pelunasan dilakukan setelah semua deliverables final diserahkan dan mendapat approval dari management klien.',
    documentsReceived: [
      {
        fileName: 'Financial statements FY 2022-2024',
        receivedDate: '2025-02-08',
        fileUrl: '/uploads/PT-Teknologi-Nusantara/Financial-statements-FY-2022-2024.pdf',
        uploadedBy: 'Andi Wijaya',
        uploadDate: '2025-02-08T10:30:00.000Z'
      },
      {
        fileName: 'Intercompany transaction details',
        receivedDate: '2025-02-09',
        fileUrl: '/uploads/PT-Teknologi-Nusantara/Intercompany-transaction-details.xlsx',
        uploadedBy: 'Andi Wijaya',
        uploadDate: '2025-02-09T14:20:00.000Z'
      },
      {
        fileName: 'Organizational structure and group chart',
        receivedDate: '2025-02-10',
        fileUrl: '/uploads/PT-Teknologi-Nusantara/Organizational-structure-group-chart.pdf',
        uploadedBy: 'Andi Wijaya',
        uploadDate: '2025-02-10T09:15:00.000Z'
      },
      {
        fileName: 'Related party agreements',
        receivedDate: '2025-02-11',
        fileUrl: '/uploads/PT-Teknologi-Nusantara/Related-party-agreements.pdf',
        uploadedBy: 'Andi Wijaya',
        uploadDate: '2025-02-11T11:45:00.000Z'
      },
      {
        fileName: 'Tax returns and supporting documents',
        receivedDate: '2025-02-12',
        fileUrl: '/uploads/PT-Teknologi-Nusantara/Tax-returns-supporting-documents.pdf',
        uploadedBy: 'Andi Wijaya',
        uploadDate: '2025-02-12T16:30:00.000Z'
      }
    ],
    storageLocation: '/DSK Global/Clients/PT Teknologi Nusantara/Project Files/Transfer Pricing Documentation 2025/',
    dataRequirements: [
      { itemName: 'Complete intercompany transaction data for FY 2024', status: 'Received' },
      { itemName: 'Financial statements of related parties (Singapore & Malaysia)', status: 'Pending' },
      { itemName: 'Market analysis and industry data', status: 'Received' },
      { itemName: 'Functional analysis documentation', status: 'Pending' },
      { itemName: 'Previous transfer pricing documentation (if any)', status: 'Received' }
    ],
    risks: [
      { id: 'RISK-001', description: 'Data financial statements dari related parties di Singapura dan Malaysia mungkin belum lengkap, dapat mempengaruhi analisis comparability', impact: 'High', mitigation: 'Koordinasi intensif dengan klien untuk mendapatkan data terbaru, jika belum tersedia akan menggunakan data yang tersedia dan melakukan estimasi berdasarkan historical data' },
      { id: 'RISK-002', description: 'Regulasi transfer pricing dapat berubah di tengah project, memerlukan update dokumentasi', impact: 'Medium', mitigation: 'Memantau update regulasi secara berkala, menjaga fleksibilitas dalam dokumentasi untuk mengakomodasi perubahan regulasi' },
      { id: 'RISK-003', description: 'Timeline project cukup ketat dengan deadline final deliverables 10 Mei 2025', impact: 'Medium', mitigation: 'Memastikan data collection selesai sebelum 5 Maret 2025, melakukan parallel work untuk deliverables yang tidak dependent, dan melakukan regular check-in dengan klien' }
    ],
    communicationInternal: 'Semua komunikasi dilakukan melalui grup internal proyek di WhatsApp Business dan email internal. CEO harus di-cc untuk isu strategis atau risiko material. Weekly update meeting setiap Kamis pagi dengan tim project.',
    communicationExternal: 'Semua komunikasi eksternal harus diarsipkan oleh Business Strategist. Primary contact: Ahmad Fauzi (ahmad@teknusantara.com, 083456789012). Secondary contact: Budi Santoso (budi@teknusantara.com).',
    externalContacts: [
      { id: 'CONT-001', role: 'Primary PIC', name: 'Ahmad Fauzi', email: 'ahmad@teknusantara.com', phone: '083456789012', company: 'PT Teknologi Nusantara' },
      { id: 'CONT-002', role: 'Secondary PIC', name: 'Budi Santoso', email: 'budi@teknusantara.com', phone: '083456789013', company: 'PT Teknologi Nusantara' },
      { id: 'CONT-003', role: 'Finance Manager', name: 'Siti Nurhaliza', email: 'siti@teknusantara.com', phone: '083456789014', company: 'PT Teknologi Nusantara' }
    ],
    preliminaryTeam: [
      { id: 'TM-001', role: 'Project Lead', name: 'Senior Tax Advisor', allocation: 'Koordinasi teknis, analisis utama, dan presentasi ke management' },
      { id: 'TM-002', role: 'Tax Advisor', name: 'Tax Advisor Specialist', allocation: 'Penyusunan Master File dan Local File, analisis comparability' },
      { id: 'TM-003', role: 'Tax Analyst', name: 'Tax Analyst', allocation: 'Data collection, comparability analysis, dan supporting documentation' },
      { id: 'TM-004', role: 'Reviewer', name: 'Manager Tax Services', allocation: 'Review teknis & kualitas semua deliverables' },
      { id: 'TM-005', role: 'Admin Support', name: 'Admin DSK', allocation: 'Invoice, dokumen, folder management' },
      { id: 'TM-006', role: 'BD Contact', name: 'Business Strategist', allocation: 'Koordinasi klien & eskalasi' }
    ],
    handoverChecklist: [
      { id: 'CHK-001', description: 'Proposal final tersimpan', status: 'Completed' },
      { id: 'CHK-002', description: 'Engagement Letter ditandatangani', status: 'Completed' },
      { id: 'CHK-003', description: 'DP sudah diterima', status: 'Pending' },
      { id: 'CHK-004', description: 'Folder project dibuat', status: 'Completed' },
      { id: 'CHK-005', description: 'Dokumen klien diterima', status: 'Completed' },
      { id: 'CHK-006', description: 'Data request disiapkan', status: 'Completed' },
      { id: 'CHK-007', description: 'Kick-off meeting dijadwalkan', status: 'Completed' },
      { id: 'CHK-008', description: 'Tim project ditugaskan', status: 'Completed' }
    ],
    signOffs: [
      { id: 'SIGN-001', role: 'Chief Executive Officer', name: 'Galih Gumilang', signedAt: '2025-02-15', notes: '' },
      { id: 'SIGN-002', role: 'Business Strategist', name: 'Andi Wijaya', signedAt: '2025-02-12', notes: '' },
      { id: 'SIGN-003', role: 'Project Lead', name: 'Senior Tax Advisor', signedAt: '', notes: '' }
    ],
    workflowStatus: 'APPROVED_BY_CEO',
    submittedToCeoAt: '2025-02-12T10:00:00',
    lastModifiedAt: '2025-02-15T14:00:00',
    scopeLocked: true,
    proposalId: 'P108'
  } as any as Handover & {
    serviceLine?: string;
    projectPeriod?: string;
    documentCode?: string;
    classification?: string;
    projectName?: string;
    companyGroup?: string;
    clientPic?: string;
    clientEmail?: string;
    clientPhone?: string;
    engagementLetterStatus?: string;
    proposalReference?: string;
    background?: string;
    scopeIncluded?: string[];
    scopeExclusions?: string[];
    deliverables?: Array<{ id: string; name: string; description?: string; quantity?: number; dueDate?: string; assignedTo?: string; }>;
    deliverablesExtended?: Array<{ id: string; name: string; description?: string; quantity?: number; dueDate?: string; assignedTo?: string; }>;
    milestones?: Array<{ id: string; name: string; targetDate: string; description?: string; }>;
    feeStructure?: Array<{ id: string; description: string; amount: number; percentage?: number; dueDate?: string; status?: string; }>;
    paymentTermsText?: string;
    documentsReceived?: Array<{
      fileName: string;
      fileUrl?: string;
      receivedDate?: string;
      uploadedBy?: string;
      uploadDate?: string;
    }>;
    storageLocation?: string;
    dataRequirements?: Array<{ itemName: string; status?: string; }>;
    risks?: Array<{ id: string; description: string; impact: string; mitigation?: string; }>;
    communicationInternal?: string;
    communicationExternal?: string;
    externalContacts?: Array<{ id: string; role: string; name: string; email?: string; phone?: string; company?: string; }>;
    preliminaryTeam?: Array<{ id: string; role: string; name: string; allocation?: string; }>;
    handoverChecklist?: Array<{ id: string; description: string; status: string; }>;
    signOffs?: Array<{ id: string; role: string; name: string; signedAt?: string; notes?: string; }>;
    workflowStatus?: string;
    revisionComments?: Array<{ id: string; sectionName: string; comment: string; requestedBy: string; requestedAt: string; }>;
    scopeLocked?: boolean;
  },
  // Handover Memo untuk PT Global Mandiri (L104) - Financial Advisory - Complete and WAITING_CEO_APPROVAL
  {
    id: 'HO-L104-001',
    leadId: 'L104',
    clientName: 'PT Global Mandiri',
    projectTitle: 'Financial Advisory - PT Global Mandiri',
    pm: 'Diana Putri',
    status: 'WAITING_CEO_APPROVAL',
    createdBy: 'Andi Wijaya',
    createdAt: '2025-01-30',
    summary: 'PT Global Mandiri membutuhkan konsultasi financial advisory untuk optimasi keuangan dan strategi investasi. Perusahaan adalah manufaktur dengan omset 50M per tahun, memiliki 3 cabang. Project ini akan fokus pada financial planning, cash flow management, dan investment strategy untuk mendukung pertumbuhan bisnis.',
    deliverables: [
      'Financial Planning Report',
      'Cash Flow Management Strategy',
      'Investment Strategy Document',
      'Financial Advisory Presentation',
      'Implementation Roadmap'
    ],
    notes: 'Handover memo lengkap dengan semua informasi project. Proposal sudah accepted, Engagement Letter sudah signed. Siap untuk diserahkan ke PM setelah CEO approval.',
    // Extended fields untuk data lengkap 11 sections
    documentCode: 'BD-HO-PT-GM-2025-001',
    classification: 'Strictly Confidential – Internal Use Only',
    projectName: 'Financial Advisory - PT Global Mandiri',
    companyGroup: 'Global Mandiri Group',
    serviceLine: 'Financial Advisory',
    projectPeriod: '2025-02-01 – 2025-04-30',
    clientPic: 'Dewi Lestari',
    clientEmail: 'dewi@globalmandiri.com',
    clientPhone: '084567890123',
    engagementLetterStatus: 'Signed on 28 Januari 2025',
    proposalReference: 'P107',
    background: 'PT Global Mandiri adalah perusahaan manufaktur yang telah beroperasi selama 15 tahun dengan omset tahunan mencapai 50 miliar rupiah. Perusahaan memiliki 3 cabang di Jakarta, Bandung, dan Surabaya dengan total karyawan 250 orang. Dalam 2 tahun terakhir, perusahaan mengalami pertumbuhan yang signifikan namun menghadapi tantangan dalam pengelolaan cash flow dan perencanaan investasi untuk ekspansi bisnis. Management membutuhkan konsultasi financial advisory untuk mengoptimalkan struktur keuangan, meningkatkan efisiensi cash flow, dan merancang strategi investasi yang tepat untuk mendukung pertumbuhan bisnis jangka panjang.',
    scopeIncluded: [
      'Analisis struktur keuangan perusahaan dan identifikasi area improvement',
      'Penyusunan financial planning comprehensive untuk 3 tahun ke depan',
      'Pengembangan cash flow management strategy dengan forecasting bulanan',
      'Perancangan investment strategy untuk ekspansi bisnis dan diversifikasi',
      'Penyusunan financial advisory report dengan rekomendasi implementasi',
      'Sesi presentasi dan diskusi dengan management untuk alignment strategi'
    ],
    scopeExclusions: [
      'Audit keuangan atau verifikasi data historis',
      'Implementasi sistem akuntansi atau software keuangan',
      'Layanan konsultasi pajak atau compliance',
      'Layanan legal atau corporate action'
    ],
    deliverablesExtended: [
      { id: 'DEL-001', name: 'Financial Planning Report', description: 'PDF & Word', quantity: 1, dueDate: '2025-03-15', assignedTo: 'Senior Financial Advisor' },
      { id: 'DEL-002', name: 'Cash Flow Management Strategy', description: 'Excel + PDF', quantity: 1, dueDate: '2025-03-20', assignedTo: 'Financial Analyst' },
      { id: 'DEL-003', name: 'Investment Strategy Document', description: 'PDF & Word', quantity: 1, dueDate: '2025-03-25', assignedTo: 'Senior Financial Advisor' },
      { id: 'DEL-004', name: 'Financial Advisory Presentation', description: 'PPT', quantity: 1, dueDate: '2025-04-05', assignedTo: 'Senior Financial Advisor' },
      { id: 'DEL-005', name: 'Implementation Roadmap', description: 'Excel + PDF', quantity: 1, dueDate: '2025-04-10', assignedTo: 'Project Lead' }
    ],
    milestones: [
      { id: 'MS-001', name: 'Kick-Off Meeting', targetDate: '2025-02-05', description: 'Setelah DP diterima dan data awal dikumpulkan' },
      { id: 'MS-002', name: 'Data Collection Completed', targetDate: '2025-02-15', description: 'Bergantung kelengkapan data dari klien' },
      { id: 'MS-003', name: 'Draft Financial Planning Report', targetDate: '2025-03-10', description: 'Draf awal untuk review internal' },
      { id: 'MS-004', name: 'Review Session dengan Management', targetDate: '2025-03-25', description: 'Presentasi dan diskusi dengan management klien' },
      { id: 'MS-005', name: 'Final Deliverables', targetDate: '2025-04-15', description: 'Semua deliverables final diserahkan' }
    ],
    feeStructure: [
      { id: 'FEE-001', description: 'Professional Fee', amount: 75000000, percentage: 100, status: 'Pending' },
      { id: 'FEE-002', description: 'DP / Initial Payment', amount: 37500000, percentage: 50, dueDate: '2025-01-28', status: 'Pending' },
      { id: 'FEE-003', description: 'Final Payment', amount: 37500000, percentage: 50, dueDate: '2025-04-30', status: 'Pending' }
    ],
    paymentTermsText: 'Invoice DP telah diterbitkan 28 Januari 2025. Pekerjaan dimulai setelah DP diterima (estimasi 1-3 Februari 2025). Pelunasan dilakukan setelah semua deliverables final diserahkan dan mendapat approval dari management klien.',
    documentsReceived: [
      {
        fileName: 'Financial statements FY 2022-2024',
        receivedDate: '2025-01-25',
        fileUrl: '/uploads/PT-Global-Mandiri/Financial-statements-FY-2022-2024.pdf',
        uploadedBy: 'Andi Wijaya',
        uploadDate: '2025-01-25T14:30:00.000Z'
      },
      {
        fileName: 'Trial balance FY 2024',
        receivedDate: '2025-01-25',
        fileUrl: '/uploads/PT-Global-Mandiri/Trial-balance-FY-2024.xlsx',
        uploadedBy: 'Andi Wijaya',
        uploadDate: '2025-01-25T15:00:00.000Z'
      },
      {
        fileName: 'Organizational structure',
        receivedDate: '2025-01-26',
        fileUrl: '/uploads/PT-Global-Mandiri/Organizational-structure.pdf',
        uploadedBy: 'Andi Wijaya',
        uploadDate: '2025-01-26T09:15:00.000Z'
      },
      {
        fileName: 'Business plan 2025-2027',
        receivedDate: '2025-01-27',
        fileUrl: '/uploads/PT-Global-Mandiri/Business-plan-2025-2027.pdf',
        uploadedBy: 'Andi Wijaya',
        uploadDate: '2025-01-27T11:20:00.000Z'
      },
      {
        fileName: 'Investment proposals internal',
        receivedDate: '2025-01-28',
        fileUrl: '/uploads/PT-Global-Mandiri/Investment-proposals-internal.pdf',
        uploadedBy: 'Andi Wijaya',
        uploadDate: '2025-01-28T16:45:00.000Z'
      }
    ],
    storageLocation: '/DSK Global/Clients/PT Global Mandiri/Project Files/Financial Advisory 2025/',
    dataRequirements: [
      { itemName: 'Audited financial statements FY 2024', status: 'Received' },
      { itemName: 'Cash flow statement detail bulanan 2024', status: 'Received' },
      { itemName: 'Budget dan forecast 2025-2027', status: 'Pending' },
      { itemName: 'Detail investasi yang direncanakan', status: 'Received' },
      { itemName: 'Struktur permodalan dan debt schedule', status: 'Pending' }
    ],
    risks: [
      { id: 'RISK-001', description: 'Data budget dan forecast 2025-2027 belum lengkap dari klien, dapat mempengaruhi akurasi financial planning', impact: 'Medium', mitigation: 'Koordinasi intensif dengan klien untuk mendapatkan data terbaru, jika belum tersedia akan menggunakan estimasi berdasarkan historical data' },
      { id: 'RISK-002', description: 'Timeline project cukup ketat dengan deadline final deliverables 15 April 2025', impact: 'High', mitigation: 'Memastikan data collection selesai sebelum 15 Februari, melakukan parallel work untuk deliverables yang tidak dependent' },
      { id: 'RISK-003', description: 'Potensi perubahan strategi bisnis klien di tengah project dapat mempengaruhi investment strategy yang direkomendasikan', impact: 'Medium', mitigation: 'Melakukan regular check-in dengan management untuk update perubahan strategi, menjaga fleksibilitas dalam rekomendasi' }
    ],
    communicationInternal: 'Semua komunikasi dilakukan melalui grup internal proyek di WhatsApp Business dan email internal. CEO harus di-cc untuk isu strategis atau risiko material. Weekly update meeting setiap Senin pagi dengan tim project.',
    communicationExternal: 'Semua komunikasi eksternal harus diarsipkan oleh Business Strategist. Primary contact: Dewi Lestari (dewi@globalmandiri.com, 084567890123). Secondary contact: Hendra Gunawan (hendra@globalmandiri.com).',
    externalContacts: [
      { id: 'CONT-001', role: 'Primary PIC', name: 'Dewi Lestari', email: 'dewi@globalmandiri.com', phone: '084567890123', company: 'PT Global Mandiri' },
      { id: 'CONT-002', role: 'Secondary PIC', name: 'Hendra Gunawan', email: 'hendra@globalmandiri.com', phone: '085678901234', company: 'PT Global Mandiri' },
      { id: 'CONT-003', role: 'Finance Manager', name: 'Budi Santoso', email: 'budi@globalmandiri.com', phone: '086789012345', company: 'PT Global Mandiri' }
    ],
    preliminaryTeam: [
      { id: 'TM-001', role: 'Project Lead', name: 'Senior Financial Advisor', allocation: 'Koordinasi teknis, analisis utama, dan presentasi ke management' },
      { id: 'TM-002', role: 'Financial Analyst', name: 'Financial Analyst Specialist', allocation: 'Analisis cash flow, financial modeling, dan penyusunan deliverables' },
      { id: 'TM-003', role: 'Reviewer', name: 'Manager Financial Advisory', allocation: 'Review teknis & kualitas semua deliverables' },
      { id: 'TM-004', role: 'Admin Support', name: 'Admin DSK', allocation: 'Invoice, dokumen, folder management' },
      { id: 'TM-005', role: 'BD Contact', name: 'Business Strategist', allocation: 'Koordinasi klien & eskalasi' }
    ],
    handoverChecklist: [
      { id: 'CHK-001', description: 'Proposal final tersimpan', status: 'Completed' },
      { id: 'CHK-002', description: 'Engagement Letter ditandatangani', status: 'Completed' },
      { id: 'CHK-003', description: 'DP sudah diterima', status: 'Pending' },
      { id: 'CHK-004', description: 'Folder project dibuat', status: 'Completed' },
      { id: 'CHK-005', description: 'Dokumen klien diterima', status: 'Completed' },
      { id: 'CHK-006', description: 'Data request disiapkan', status: 'Completed' },
      { id: 'CHK-007', description: 'Kick-off meeting dijadwalkan', status: 'Completed' },
      { id: 'CHK-008', description: 'Tim project ditugaskan', status: 'Completed' }
    ],
    signOffs: [
      { id: 'SIGN-001', role: 'Chief Executive Officer', name: 'Galih Gumilang', signedAt: '2025-01-30', notes: '' },
      { id: 'SIGN-002', role: 'Business Strategist', name: 'Andi Wijaya', signedAt: '2025-01-30', notes: '' },
      { id: 'SIGN-003', role: 'Project Lead', name: 'Senior Financial Advisor', signedAt: '', notes: '' }
    ],
    workflowStatus: 'SUBMITTED_TO_CEO',
    submittedToCeoAt: '2025-01-30T10:00:00',
    lastModifiedAt: '2025-01-30T10:00:00',
    scopeLocked: false,
    proposalId: 'P107'
  } as any as Handover & {
    serviceLine?: string;
    projectPeriod?: string;
    documentCode?: string;
    classification?: string;
    projectName?: string;
    companyGroup?: string;
    clientPic?: string;
    clientEmail?: string;
    clientPhone?: string;
    engagementLetterStatus?: string;
    proposalReference?: string;
    background?: string;
    scopeIncluded?: string[];
    scopeExclusions?: string[];
    deliverables?: Array<{ id: string; name: string; description?: string; quantity?: number; dueDate?: string; assignedTo?: string; }>;
    deliverablesExtended?: Array<{ id: string; name: string; description?: string; quantity?: number; dueDate?: string; assignedTo?: string; }>;
    milestones?: Array<{ id: string; name: string; targetDate: string; description?: string; }>;
    feeStructure?: Array<{ id: string; description: string; amount: number; percentage?: number; dueDate?: string; status?: string; }>;
    paymentTermsText?: string;
    documentsReceived?: Array<{
      fileName: string;
      fileUrl?: string;
      receivedDate?: string;
      uploadedBy?: string;
      uploadDate?: string;
    }>;
    storageLocation?: string;
    dataRequirements?: Array<{ itemName: string; status?: string; }>;
    risks?: Array<{ id: string; description: string; impact: string; mitigation?: string; }>;
    communicationInternal?: string;
    communicationExternal?: string;
    externalContacts?: Array<{ id: string; role: string; name: string; email?: string; phone?: string; company?: string; }>;
    preliminaryTeam?: Array<{ id: string; role: string; name: string; allocation?: string; }>;
    handoverChecklist?: Array<{ id: string; description: string; status: string; }>;
    signOffs?: Array<{ id: string; role: string; name: string; signedAt?: string; notes?: string; }>;
    workflowStatus?: string;
    revisionComments?: Array<{ id: string; sectionName: string; comment: string; requestedBy: string; requestedAt: string; }>;
    scopeLocked?: boolean;
  },
  // Handover Memo untuk PT Cahaya Abadi (L105) - Web Development - Complete with REVISION_REQUESTED
  {
    id: 'HO-L105-001',
    leadId: 'L105',
    clientName: 'PT Cahaya Abadi',
    projectTitle: 'Web Development - PT Cahaya Abadi',
    pm: 'Diana Putri',
    status: 'REVISION_REQUESTED' as any,
    createdBy: 'Andi Wijaya',
    createdAt: '2025-02-20',
    summary: 'PT Cahaya Abadi membutuhkan website company profile dan platform e-commerce untuk bisnis fashion retail mereka. Perusahaan memiliki 5 store offline dan ingin mengembangkan online presence. Project ini akan mencakup pembuatan website responsive, integrasi payment gateway, dan sistem manajemen produk.',
    deliverables: [
      'Company Profile Website',
      'E-commerce Platform',
      'Product Management System',
      'Payment Gateway Integration',
      'Admin Dashboard'
    ],
    notes: 'Handover memo lengkap dengan semua informasi project. Proposal sudah accepted, Engagement Letter sudah signed. Handover telah disubmit ke CEO namun memerlukan revisi pada beberapa section.',
    // Extended fields untuk data lengkap 11 sections
    documentCode: 'BD-HO-PT-CA-2025-001',
    classification: 'Strictly Confidential – Internal Use Only',
    projectName: 'Web Development - PT Cahaya Abadi',
    companyGroup: 'Cahaya Abadi Group',
    serviceLine: 'Web Development',
    projectPeriod: '2025-02-25 – 2025-05-25',
    clientPic: 'Rudi Hartono',
    clientEmail: 'rudi@cahayaabadi.com',
    clientPhone: '085678901234',
    engagementLetterStatus: 'Signed on 18 February 2025',
    proposalReference: 'P001',
    background: 'PT Cahaya Abadi adalah perusahaan retail fashion yang telah beroperasi selama 8 tahun dengan 5 store offline di Jakarta, Bandung, Surabaya, Medan, dan Yogyakarta. Perusahaan memiliki omset tahunan sekitar 30 miliar rupiah dengan total karyawan 120 orang. Dalam 2 tahun terakhir, perusahaan melihat potensi besar dalam e-commerce dan ingin mengembangkan online presence untuk memperluas jangkauan pasar. Management membutuhkan website company profile yang profesional dan platform e-commerce yang terintegrasi untuk mendukung pertumbuhan bisnis online.',
    scopeIncluded: [
      'Pembuatan website company profile responsive dengan desain modern',
      'Pengembangan platform e-commerce dengan fitur lengkap (product catalog, shopping cart, checkout)',
      'Integrasi payment gateway (Midtrans/OVO/GoPay) untuk transaksi online',
      'Sistem manajemen produk dan inventory untuk admin',
      'Admin dashboard untuk monitoring penjualan dan analytics',
      'SEO optimization dan integrasi social media',
      'Mobile responsive design untuk semua device'
    ],
    scopeExclusions: [
      'Aplikasi mobile native (iOS/Android)',
      'Integrasi dengan sistem ERP atau accounting software',
      'Layanan maintenance setelah project selesai (diluar scope)',
      'Content creation atau copywriting untuk produk',
      'Photography atau video production untuk produk'
    ],
    deliverablesExtended: [
      { id: 'DEL-001', name: 'Company Profile Website', description: 'HTML/CSS/JS + CMS', quantity: 1, dueDate: '2025-03-20', assignedTo: 'Senior Web Developer' },
      { id: 'DEL-002', name: 'E-commerce Platform', description: 'Full Stack Web App', quantity: 1, dueDate: '2025-04-15', assignedTo: 'Full Stack Developer' },
      { id: 'DEL-003', name: 'Product Management System', description: 'Admin Panel', quantity: 1, dueDate: '2025-04-20', assignedTo: 'Backend Developer' },
      { id: 'DEL-004', name: 'Payment Gateway Integration', description: 'API Integration', quantity: 1, dueDate: '2025-04-25', assignedTo: 'Backend Developer' },
      { id: 'DEL-005', name: 'Admin Dashboard', description: 'Analytics & Reports', quantity: 1, dueDate: '2025-05-10', assignedTo: 'Full Stack Developer' }
    ],
    milestones: [
      { id: 'MS-001', name: 'Kick-Off Meeting', targetDate: '2025-02-28', description: 'Setelah DP diterima dan requirements final dikonfirmasi' },
      { id: 'MS-002', name: 'Design Mockup Approved', targetDate: '2025-03-10', description: 'UI/UX design untuk website dan e-commerce platform' },
      { id: 'MS-003', name: 'Company Profile Website Live', targetDate: '2025-03-25', description: 'Website company profile siap digunakan' },
      { id: 'MS-004', name: 'E-commerce Platform Beta', targetDate: '2025-04-30', description: 'Platform e-commerce siap untuk testing' },
      { id: 'MS-005', name: 'Final Deliverables & Go Live', targetDate: '2025-05-20', description: 'Semua deliverables final dan platform siap production' }
    ],
    feeStructure: [
      { id: 'FEE-001', description: 'Professional Fee', amount: 55000000, percentage: 100, status: 'Pending' },
      { id: 'FEE-002', description: 'DP / Initial Payment', amount: 27500000, percentage: 50, dueDate: '2025-02-18', status: 'Pending' },
      { id: 'FEE-003', description: 'Final Payment', amount: 27500000, percentage: 50, dueDate: '2025-05-25', status: 'Pending' }
    ],
    paymentTermsText: 'Invoice DP telah diterbitkan 18 Februari 2025. Pekerjaan dimulai setelah DP diterima (estimasi 25-28 Februari 2025). Pelunasan dilakukan setelah semua deliverables final diserahkan dan mendapat approval dari management klien.',
    documentsReceived: [
      {
        fileName: 'Company profile and brand guidelines',
        receivedDate: '2025-02-15',
        fileUrl: '/uploads/PT-Cahaya-Abadi/Company-profile-brand-guidelines.pdf',
        uploadedBy: 'Andi Wijaya',
        uploadDate: '2025-02-15T10:30:00.000Z'
      },
      {
        fileName: 'Product catalog and images',
        receivedDate: '2025-02-16',
        fileUrl: '/uploads/PT-Cahaya-Abadi/Product-catalog-images.zip',
        uploadedBy: 'Andi Wijaya',
        uploadDate: '2025-02-16T14:20:00.000Z'
      },
      {
        fileName: 'Business requirements document',
        receivedDate: '2025-02-17',
        fileUrl: '/uploads/PT-Cahaya-Abadi/Business-requirements-document.pdf',
        uploadedBy: 'Andi Wijaya',
        uploadDate: '2025-02-17T09:15:00.000Z'
      },
      {
        fileName: 'Logo and brand assets',
        receivedDate: '2025-02-18',
        fileUrl: '/uploads/PT-Cahaya-Abadi/Logo-brand-assets.zip',
        uploadedBy: 'Andi Wijaya',
        uploadDate: '2025-02-18T11:45:00.000Z'
      }
    ],
    storageLocation: '/DSK Global/Clients/PT Cahaya Abadi/Project Files/Web Development 2025/',
    dataRequirements: [
      { itemName: 'Complete product catalog with images and descriptions', status: 'Received' },
      { itemName: 'Company profile and brand guidelines', status: 'Received' },
      { itemName: 'Payment gateway account credentials', status: 'Pending' },
      { itemName: 'Domain and hosting information', status: 'Pending' },
      { itemName: 'Social media accounts for integration', status: 'Pending' }
    ],
    risks: [
      { id: 'RISK-001', description: 'Payment gateway account credentials belum disediakan klien, dapat mempengaruhi timeline integrasi payment', impact: 'Medium', mitigation: 'Koordinasi dengan klien untuk mendapatkan credentials sebelum milestone payment integration, jika belum tersedia akan menggunakan sandbox environment untuk development' },
      { id: 'RISK-002', description: 'Product catalog dan images mungkin belum lengkap, dapat mempengaruhi timeline development e-commerce platform', impact: 'High', mitigation: 'Memastikan product catalog lengkap sebelum 10 Maret 2025, melakukan parallel work untuk fitur yang tidak dependent pada product data' },
      { id: 'RISK-003', description: 'Perubahan requirements di tengah project dapat mempengaruhi timeline dan scope', impact: 'Medium', mitigation: 'Melakukan regular check-in dengan klien untuk konfirmasi requirements, menjaga fleksibilitas dalam development namun dengan change request process yang jelas' }
    ],
    communicationInternal: 'Semua komunikasi dilakukan melalui grup internal proyek di WhatsApp Business dan email internal. CEO harus di-cc untuk isu strategis atau perubahan scope. Weekly update meeting setiap Rabu pagi dengan tim project.',
    communicationExternal: 'Semua komunikasi eksternal harus diarsipkan oleh Business Strategist. Primary contact: Rudi Hartono (rudi@cahayaabadi.com, 085678901234). Secondary contact: Siti Rahayu (siti@cahayaabadi.com).',
    externalContacts: [
      { id: 'CONT-001', role: 'Primary PIC', name: 'Rudi Hartono', email: 'rudi@cahayaabadi.com', phone: '085678901234', company: 'PT Cahaya Abadi' },
      { id: 'CONT-002', role: 'Secondary PIC', name: 'Siti Rahayu', email: 'siti@cahayaabadi.com', phone: '085678901235', company: 'PT Cahaya Abadi' },
      { id: 'CONT-003', role: 'IT Manager', name: 'Budi Santoso', email: 'budi@cahayaabadi.com', phone: '085678901236', company: 'PT Cahaya Abadi' }
    ],
    preliminaryTeam: [
      { id: 'TM-001', role: 'Project Lead', name: 'Senior Web Developer', allocation: 'Koordinasi teknis, development utama, dan presentasi ke klien' },
      { id: 'TM-002', role: 'Full Stack Developer', name: 'Full Stack Developer Specialist', allocation: 'Development e-commerce platform, payment integration, dan admin dashboard' },
      { id: 'TM-003', role: 'UI/UX Designer', name: 'UI/UX Designer', allocation: 'Design mockup, user experience, dan visual design' },
      { id: 'TM-004', role: 'Backend Developer', name: 'Backend Developer', allocation: 'API development, database design, dan system integration' },
      { id: 'TM-005', role: 'Reviewer', name: 'Manager Web Development', allocation: 'Review teknis & kualitas semua deliverables' },
      { id: 'TM-006', role: 'Admin Support', name: 'Admin DSK', allocation: 'Invoice, dokumen, folder management' },
      { id: 'TM-007', role: 'BD Contact', name: 'Business Strategist', allocation: 'Koordinasi klien & eskalasi' }
    ],
    handoverChecklist: [
      { id: 'CHK-001', description: 'Proposal final tersimpan', status: 'Completed' },
      { id: 'CHK-002', description: 'Engagement Letter ditandatangani', status: 'Completed' },
      { id: 'CHK-003', description: 'DP sudah diterima', status: 'Pending' },
      { id: 'CHK-004', description: 'Folder project dibuat', status: 'Completed' },
      { id: 'CHK-005', description: 'Dokumen klien diterima', status: 'Completed' },
      { id: 'CHK-006', description: 'Data request disiapkan', status: 'Completed' },
      { id: 'CHK-007', description: 'Kick-off meeting dijadwalkan', status: 'Completed' },
      { id: 'CHK-008', description: 'Tim project ditugaskan', status: 'Completed' }
    ],
    signOffs: [
      { id: 'SIGN-001', role: 'Chief Executive Officer', name: 'Galih Gumilang', signedAt: '', notes: '' },
      { id: 'SIGN-002', role: 'Business Strategist', name: 'Andi Wijaya', signedAt: '2025-02-20', notes: '' },
      { id: 'SIGN-003', role: 'Project Lead', name: 'Senior Web Developer', signedAt: '', notes: '' }
    ],
    workflowStatus: 'REVISION_REQUESTED',
    submittedToCeoAt: '2025-02-20T10:00:00',
    lastModifiedAt: '2025-02-20T11:30:00',
    scopeLocked: false,
    proposalId: 'P001',
    revisionComments: [
      {
        id: 'REV-001',
        sectionName: 'FINALIZED SCOPE OF WORK',
        comment: 'Deliverables kurang spesifik. Tolong detailkan output untuk setiap fase development, termasuk format file, teknologi yang digunakan, dan dokumentasi yang akan diserahkan. Untuk e-commerce platform, perlu disebutkan fitur-fitur detail seperti user registration, product search & filter, shopping cart, checkout process, order tracking, dan customer account management.',
        requestedBy: 'Galih Gumilang',
        role: 'CEO',
        requestedAt: '2025-02-20T11:00:00'
      },
      {
        id: 'REV-002',
        sectionName: 'FEE STRUCTURE & PAYMENT TERMS',
        comment: 'Syarat pembayaran final perlu lebih jelas. Apakah pembayaran dilakukan setelah semua deliverables selesai atau setelah client acceptance? Juga perlu disebutkan proses jika ada change request di tengah development - apakah akan ada additional fee atau termasuk dalam scope? Tolong tambahkan juga timeline untuk invoice dan payment processing.',
        requestedBy: 'Galih Gumilang',
        role: 'CEO',
        requestedAt: '2025-02-20T11:15:00'
      },
      {
        id: 'REV-003',
        sectionName: 'KEY RISKS / RED FLAGS',
        comment: 'Strategi mitigasi risiko perlu lebih actionable. Untuk setiap risiko, tolong sebutkan: (1) indikator early warning yang akan dipantau, (2) langkah konkret yang akan diambil jika risiko terjadi, (3) timeline adjustment yang mungkin diperlukan, dan (4) resource backup plan. Khusus untuk risiko payment gateway credentials, perlu disebutkan alternatif payment gateway yang bisa digunakan.',
        requestedBy: 'Galih Gumilang',
        role: 'CEO',
        requestedAt: '2025-02-20T11:30:00'
      },
      {
        id: 'REV-004',
        sectionName: 'PROJECT TEAM ASSIGNMENT',
        comment: 'Alokasi tim terlalu umum. Tolong detailkan untuk setiap team member: (1) tugas spesifik per deliverable, (2) estimasi jam kerja atau persentase alokasi waktu, (3) dependencies antar team member, dan (4) escalation path jika ada blocker. Khusus untuk UI/UX Designer, perlu disebutkan deliverables design yang akan dibuat (wireframes, mockups, style guide, dll).',
        requestedBy: 'Galih Gumilang',
        role: 'CEO',
        requestedAt: '2025-02-20T11:45:00'
      },
      {
        id: 'REV-005',
        sectionName: 'CLIENT-PROVIDED DOCUMENTS',
        comment: 'Perlu ditambahkan informasi tentang format dan kualitas dokumen yang diterima. Apakah semua dokumen sudah dalam format digital yang siap digunakan? Apakah ada dokumen yang masih perlu dikonversi atau diolah terlebih dahulu? Juga perlu disebutkan jika ada dokumen yang masih pending dan timeline untuk mendapatkannya.',
        requestedBy: 'Galih Gumilang',
        role: 'CEO',
        requestedAt: '2025-02-20T12:00:00'
      }
    ]
  } as any as Handover & {
    serviceLine?: string;
    projectPeriod?: string;
    documentCode?: string;
    classification?: string;
    projectName?: string;
    companyGroup?: string;
    clientPic?: string;
    clientEmail?: string;
    clientPhone?: string;
    engagementLetterStatus?: string;
    proposalReference?: string;
    background?: string;
    scopeIncluded?: string[];
    scopeExclusions?: string[];
    deliverables?: Array<{ id: string; name: string; description?: string; quantity?: number; dueDate?: string; assignedTo?: string; }>;
    deliverablesExtended?: Array<{ id: string; name: string; description?: string; quantity?: number; dueDate?: string; assignedTo?: string; }>;
    milestones?: Array<{ id: string; name: string; targetDate: string; description?: string; }>;
    feeStructure?: Array<{ id: string; description: string; amount: number; percentage?: number; dueDate?: string; status?: string; }>;
    paymentTermsText?: string;
    documentsReceived?: Array<{
      fileName: string;
      fileUrl?: string;
      receivedDate?: string;
      uploadedBy?: string;
      uploadDate?: string;
    }>;
    storageLocation?: string;
    dataRequirements?: Array<{ itemName: string; status?: string; }>;
    risks?: Array<{ id: string; description: string; impact: string; mitigation?: string; }>;
    communicationInternal?: string;
    communicationExternal?: string;
    externalContacts?: Array<{ id: string; role: string; name: string; email?: string; phone?: string; company?: string; }>;
    preliminaryTeam?: Array<{ id: string; role: string; name: string; allocation?: string; }>;
    handoverChecklist?: Array<{ id: string; description: string; status: string; }>;
    signOffs?: Array<{ id: string; role: string; name: string; signedAt?: string; notes?: string; }>;
    workflowStatus?: string;
    revisionComments?: Array<{ id: string; sectionName: string; comment: string; requestedBy: string; requestedAt: string; }>;
    scopeLocked?: boolean;
  },
  // Handover Memo untuk PT Sejahtera Bersama (L015) - Transfer Pricing - Complete and APPROVED (waiting PM assignment)
  {
    id: 'HO-L015-001',
    leadId: 'L015',
    projectId: 'P015',
    clientName: 'PT Sejahtera Bersama',
    projectTitle: 'Transfer Pricing Policy Development - PT Sejahtera Bersama',
    pm: '', // Belum di-assign, COO akan assign
    status: 'APPROVED' as any,
    createdBy: 'Rina Kusuma',
    createdAt: '2025-10-12',
    summary: 'PT Sejahtera Bersama membutuhkan transfer pricing policy development untuk group companies. Perusahaan memiliki beberapa perusahaan afiliasi dalam grup dan melakukan transaksi related party. Project ini akan mencakup penyusunan transfer pricing policy, analisis controlled transactions, dan penyusunan dokumentasi transfer pricing.',
    deliverables: [
      'Transfer Pricing Policy Document',
      'Transfer Pricing Master File',
      'Transfer Pricing Local File',
      'Controlled Transaction Analysis',
      'Transfer Pricing Documentation Package'
    ],
    notes: 'Handover memo lengkap dengan semua informasi project. Proposal sudah accepted, Engagement Letter sudah signed. Handover telah disetujui CEO dan siap untuk di-assign PM oleh COO.',
    // Extended fields untuk data lengkap 11 sections
    documentCode: 'BD-HO-PT-SB-2025-001',
    classification: 'Strictly Confidential – Internal Use Only',
    projectName: 'Transfer Pricing Policy Development - PT Sejahtera Bersama',
    companyGroup: 'Sejahtera Bersama Group',
    serviceLine: 'Transfer Pricing',
    projectPeriod: '2025-10-15 – 2026-02-15',
    clientPic: 'Dedi Kurniawan',
    clientEmail: 'dedi@sejahterabersama.com',
    clientPhone: '086678901234',
    engagementLetterStatus: 'Signed on 10 October 2025',
    proposalReference: 'P115',
    background: 'PT Sejahtera Bersama adalah perusahaan holding yang telah beroperasi selama 8 tahun dengan omset tahunan sekitar 120 miliar rupiah. Perusahaan memiliki beberapa perusahaan afiliasi dalam grup dan melakukan berbagai transaksi related party termasuk transaksi jasa, penjualan barang, dan transaksi pendanaan. Dalam rangka compliance dengan regulasi perpajakan dan menghindari risiko koreksi fiskal, perusahaan membutuhkan Transfer Pricing Policy Development yang komprehensif sesuai dengan ketentuan Peraturan Menteri Keuangan dan OECD Guidelines.',
    scopeIncluded: [
      'Analisis struktur transaksi related party dan identifikasi controlled transactions',
      'Penyusunan Transfer Pricing Policy Document untuk group companies',
      'Penyusunan Transfer Pricing Master File sesuai dengan format yang ditentukan',
      'Penyusunan Transfer Pricing Local File dengan analisis detail untuk setiap controlled transaction',
      'Analisis comparability dengan mencari comparable companies dan melakukan comparability analysis',
      'Penentuan transfer pricing method yang sesuai (CUP, TNMM, atau Profit Split Method)',
      'Penyusunan supporting documentation dan working papers',
      'Pendampingan dalam implementasi policy dan penyiapan response untuk permintaan data dari DJP'
    ],
    scopeExclusions: [
      'Audit keuangan atau verifikasi data historis',
      'Layanan konsultasi perpajakan umum atau tax planning untuk transaksi non-related party',
      'Representasi di pengadilan atau proses banding',
      'Layanan legal atau corporate action',
      'Update dokumentasi untuk tahun fiskal berikutnya (diluar scope project ini)'
    ],
    deliverablesExtended: [
      { id: 'DEL-001', name: 'Transfer Pricing Policy Document', description: 'PDF & Word', quantity: 1, dueDate: '2025-12-15', assignedTo: 'Senior Tax Advisor' },
      { id: 'DEL-002', name: 'Transfer Pricing Master File', description: 'PDF & Word', quantity: 1, dueDate: '2026-01-15', assignedTo: 'Tax Advisor' },
      { id: 'DEL-003', name: 'Transfer Pricing Local File', description: 'PDF & Word', quantity: 1, dueDate: '2026-01-30', assignedTo: 'Tax Advisor' },
      { id: 'DEL-004', name: 'Controlled Transaction Analysis', description: 'Excel + PDF', quantity: 1, dueDate: '2026-01-20', assignedTo: 'Tax Analyst' },
      { id: 'DEL-005', name: 'Transfer Pricing Documentation Package', description: 'PDF + Excel', quantity: 1, dueDate: '2026-02-05', assignedTo: 'Tax Advisor' }
    ],
    milestones: [
      { id: 'MS-001', name: 'Kick-Off Meeting', targetDate: '2025-10-20', description: 'Setelah DP diterima dan data awal dikumpulkan' },
      { id: 'MS-002', name: 'Data Collection Completed', targetDate: '2025-11-05', description: 'Bergantung kelengkapan data dari klien' },
      { id: 'MS-003', name: 'Draft Transfer Pricing Policy', targetDate: '2025-12-05', description: 'Draf awal untuk review internal' },
      { id: 'MS-004', name: 'Draft Master File & Local File', targetDate: '2026-01-15', description: 'Draf awal untuk review internal' },
      { id: 'MS-005', name: 'Final Deliverables', targetDate: '2026-02-10', description: 'Semua deliverables final diserahkan' }
    ],
    feeStructure: [
      { id: 'FEE-001', description: 'Professional Fee', amount: 50000000, percentage: 100, status: 'Pending' },
      { id: 'FEE-002', description: 'DP / Initial Payment', amount: 25000000, percentage: 50, dueDate: '2025-10-10', status: 'Pending' },
      { id: 'FEE-003', description: 'Final Payment', amount: 25000000, percentage: 50, dueDate: '2026-02-15', status: 'Pending' }
    ],
    paymentTermsText: 'Invoice DP telah diterbitkan 10 Oktober 2025. Pekerjaan dimulai setelah DP diterima (estimasi 15-20 Oktober 2025). Pelunasan dilakukan setelah semua deliverables final diserahkan dan mendapat approval dari management klien.',
    documentsReceived: [
      {
        fileName: 'Financial statements FY 2022-2024',
        receivedDate: '2025-10-08',
        fileUrl: '/uploads/PT-Sejahtera-Bersama/Financial-statements-FY-2022-2024.pdf',
        uploadedBy: 'Rina Kusuma',
        uploadDate: '2025-10-08T10:30:00.000Z'
      },
      {
        fileName: 'Group structure and ownership chart',
        receivedDate: '2025-10-09',
        fileUrl: '/uploads/PT-Sejahtera-Bersama/Group-structure-ownership-chart.pdf',
        uploadedBy: 'Rina Kusuma',
        uploadDate: '2025-10-09T14:20:00.000Z'
      },
      {
        fileName: 'Intercompany transaction details',
        receivedDate: '2025-10-10',
        fileUrl: '/uploads/PT-Sejahtera-Bersama/Intercompany-transaction-details.xlsx',
        uploadedBy: 'Rina Kusuma',
        uploadDate: '2025-10-10T09:15:00.000Z'
      },
      {
        fileName: 'Related party agreements',
        receivedDate: '2025-10-11',
        fileUrl: '/uploads/PT-Sejahtera-Bersama/Related-party-agreements.pdf',
        uploadedBy: 'Rina Kusuma',
        uploadDate: '2025-10-11T11:45:00.000Z'
      },
      {
        fileName: 'Tax returns and supporting documents',
        receivedDate: '2025-10-12',
        fileUrl: '/uploads/PT-Sejahtera-Bersama/Tax-returns-supporting-documents.pdf',
        uploadedBy: 'Rina Kusuma',
        uploadDate: '2025-10-12T16:30:00.000Z'
      }
    ],
    storageLocation: '/DSK Global/Clients/PT Sejahtera Bersama/Project Files/Transfer Pricing Policy Development 2025-2026/',
    dataRequirements: [
      { itemName: 'Complete intercompany transaction data for FY 2024', status: 'Received' },
      { itemName: 'Financial statements of all related parties in the group', status: 'Received' },
      { itemName: 'Market analysis and industry data', status: 'Received' },
      { itemName: 'Functional analysis documentation', status: 'Pending' },
      { itemName: 'Previous transfer pricing documentation (if any)', status: 'Received' }
    ],
    risks: [
      { id: 'RISK-001', description: 'Data financial statements dari beberapa perusahaan afiliasi dalam grup mungkin belum lengkap, dapat mempengaruhi analisis comparability', impact: 'High', mitigation: 'Koordinasi intensif dengan klien untuk mendapatkan data terbaru dari semua perusahaan afiliasi, jika belum tersedia akan menggunakan data yang tersedia dan melakukan estimasi berdasarkan historical data' },
      { id: 'RISK-002', description: 'Regulasi transfer pricing dapat berubah di tengah project, memerlukan update dokumentasi dan policy', impact: 'Medium', mitigation: 'Memantau update regulasi secara berkala, menjaga fleksibilitas dalam dokumentasi untuk mengakomodasi perubahan regulasi' },
      { id: 'RISK-003', description: 'Project period cukup panjang dengan deadline final deliverables 10 Februari 2026, memerlukan koordinasi yang baik dengan klien', impact: 'Medium', mitigation: 'Memastikan data collection selesai sebelum 5 November 2025, melakukan parallel work untuk deliverables yang tidak dependent, dan melakukan regular check-in dengan klien setiap 2 minggu sekali' }
    ],
    communicationInternal: 'Semua komunikasi dilakukan melalui grup internal proyek di WhatsApp Business dan email internal. COO harus di-cc untuk isu strategis atau risiko material. Weekly update meeting setiap Jumat pagi dengan tim project.',
    communicationExternal: 'Semua komunikasi eksternal harus diarsipkan oleh Business Strategist. Primary contact: Dedi Kurniawan (dedi@sejahterabersama.com, 086678901234). Secondary contact: Finance Manager (finance@sejahterabersama.com).',
    externalContacts: [
      { id: 'CONT-001', role: 'Primary PIC', name: 'Dedi Kurniawan', email: 'dedi@sejahterabersama.com', phone: '086678901234', company: 'PT Sejahtera Bersama' },
      { id: 'CONT-002', role: 'Finance Manager', name: 'Finance Manager', email: 'finance@sejahterabersama.com', phone: '086678901235', company: 'PT Sejahtera Bersama' },
      { id: 'CONT-003', role: 'Tax Manager', name: 'Tax Manager', email: 'tax@sejahterabersama.com', phone: '086678901236', company: 'PT Sejahtera Bersama' }
    ],
    preliminaryTeam: [
      { id: 'TM-001', role: 'Project Lead', name: 'Senior Tax Advisor', allocation: 'Koordinasi teknis, analisis utama, dan presentasi ke management' },
      { id: 'TM-002', role: 'Tax Advisor', name: 'Tax Advisor Specialist', allocation: 'Penyusunan Transfer Pricing Policy, Master File dan Local File' },
      { id: 'TM-003', role: 'Tax Analyst', name: 'Tax Analyst', allocation: 'Data collection, controlled transaction analysis, dan supporting documentation' },
      { id: 'TM-004', role: 'Reviewer', name: 'Manager Tax Services', allocation: 'Review teknis & kualitas semua deliverables' },
      { id: 'TM-005', role: 'Admin Support', name: 'Admin DSK', allocation: 'Invoice, dokumen, folder management' },
      { id: 'TM-006', role: 'BD Contact', name: 'Business Strategist', allocation: 'Koordinasi klien & eskalasi' }
    ],
    handoverChecklist: [
      { id: 'CHK-001', description: 'Proposal final tersimpan', status: 'Completed' },
      { id: 'CHK-002', description: 'Engagement Letter ditandatangani', status: 'Completed' },
      { id: 'CHK-003', description: 'DP sudah diterima', status: 'Pending' },
      { id: 'CHK-004', description: 'Folder project dibuat', status: 'Completed' },
      { id: 'CHK-005', description: 'Dokumen klien diterima', status: 'Completed' },
      { id: 'CHK-006', description: 'Data request disiapkan', status: 'Completed' },
      { id: 'CHK-007', description: 'Kick-off meeting dijadwalkan', status: 'Completed' },
      { id: 'CHK-008', description: 'Tim project ditugaskan', status: 'Pending' }
    ],
    signOffs: [
      { id: 'SIGN-001', role: 'Chief Executive Officer', name: 'Galih Gumilang', signedAt: '2025-10-12', notes: '' },
      { id: 'SIGN-002', role: 'Business Strategist', name: 'Rina Kusuma', signedAt: '2025-10-12', notes: '' },
      { id: 'SIGN-003', role: 'Project Lead', name: 'Senior Tax Advisor', signedAt: '', notes: '' }
    ],
    workflowStatus: 'APPROVED_BY_CEO',
    submittedToCeoAt: '2025-10-12T10:00:00',
    lastModifiedAt: '2025-10-12T14:00:00',
    scopeLocked: true,
    proposalId: 'P115'
  } as any as Handover & {
    serviceLine?: string;
    projectPeriod?: string;
    documentCode?: string;
    classification?: string;
    projectName?: string;
    companyGroup?: string;
    clientPic?: string;
    clientEmail?: string;
    clientPhone?: string;
    engagementLetterStatus?: string;
    proposalReference?: string;
    background?: string;
    scopeIncluded?: string[];
    scopeExclusions?: string[];
    deliverables?: Array<{ id: string; name: string; description?: string; quantity?: number; dueDate?: string; assignedTo?: string; }>;
    deliverablesExtended?: Array<{ id: string; name: string; description?: string; quantity?: number; dueDate?: string; assignedTo?: string; }>;
    milestones?: Array<{ id: string; name: string; targetDate: string; description?: string; }>;
    feeStructure?: Array<{ id: string; description: string; amount: number; percentage?: number; dueDate?: string; status?: string; }>;
    paymentTermsText?: string;
    documentsReceived?: Array<{
      fileName: string;
      fileUrl?: string;
      receivedDate?: string;
      uploadedBy?: string;
      uploadDate?: string;
    }>;
    storageLocation?: string;
    dataRequirements?: Array<{ itemName: string; status?: string; }>;
    risks?: Array<{ id: string; description: string; impact: string; mitigation?: string; }>;
    communicationInternal?: string;
    communicationExternal?: string;
    externalContacts?: Array<{ id: string; role: string; name: string; email?: string; phone?: string; company?: string; }>;
    preliminaryTeam?: Array<{ id: string; role: string; name: string; allocation?: string; }>;
    handoverChecklist?: Array<{ id: string; description: string; status: string; }>;
    signOffs?: Array<{ id: string; role: string; name: string; signedAt?: string; notes?: string; }>;
    workflowStatus?: string;
    revisionComments?: Array<{ id: string; sectionName: string; comment: string; requestedBy: string; requestedAt: string; }>;
    scopeLocked?: boolean;
  },
];

