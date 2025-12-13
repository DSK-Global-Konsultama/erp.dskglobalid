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

export interface PaymentTerm {
  id: string;
  termNumber: number;
  percentage: number;
  amount: number;
  description: string; // e.g., "Saat EL", "Saat Selesai", "Progress 50%"
  status: 'pending' | 'paid' | 'overdue';
  dueDate?: string;
  paidDate?: string;
}

export interface Invoice {
  id: string;
  projectId: string;
  clientName: string;
  paymentTerms: PaymentTerm[]; // flexible payment schedule
  totalAmount: number;
  createdDate: string;
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
  status: 'DRAFT' | 'WAITING_CEO_APPROVAL' | 'APPROVED' | 'REJECTED';
  createdBy: string;
  createdAt: string;
}

export interface Proposal {
  id: string;
  leadId: string;
  service: string;
  proposalFee: number;
  agreeFee?: number;
  paymentType: string;
  hasSubcon: boolean;
  sentAt?: string;
  elStatus?: 'DRAFT' | 'SENT' | 'SIGNED' | 'REJECTED';
  elSignedDate?: string;
  status: 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED';
  createdAt: string;
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
    id: 'INV001',
    projectId: 'P001',
    clientName: 'Budi Santoso - PT Maju Jaya',
    totalAmount: 30000000,
    paymentTerms: [
      {
        id: 'PT001',
        termNumber: 1,
        percentage: 50,
        amount: 15000000,
        description: 'Saat EL disetujui',
        status: 'paid',
        dueDate: '2025-10-10',
        paidDate: '2025-10-09',
      },
      {
        id: 'PT002',
        termNumber: 2,
        percentage: 50,
        amount: 15000000,
        description: 'Saat project selesai',
        status: 'pending',
        dueDate: '2025-12-15',
      },
    ],
    createdDate: '2025-10-05',
  },
  {
    id: 'INV002',
    projectId: 'P002',
    clientName: 'Siti Rahayu - CV Berkah Sentosa',
    totalAmount: 45000000,
    paymentTerms: [
      {
        id: 'PT003',
        termNumber: 1,
        percentage: 50,
        amount: 22500000,
        description: 'Saat EL disetujui',
        status: 'paid',
        dueDate: '2025-10-12',
        paidDate: '2025-10-12',
      },
      {
        id: 'PT004',
        termNumber: 2,
        percentage: 50,
        amount: 22500000,
        description: 'Saat project selesai',
        status: 'pending', // Waiting final payment
        dueDate: '2025-10-20',
      },
    ],
    createdDate: '2025-10-08',
  },
  // P003 belum ada invoice karena belum assign PM
  // Audit and Assurance - 3 invoices
  {
    id: 'INV003',
    projectId: 'P004',
    clientName: 'Hendra Gunawan - PT Global Mandiri',
    totalAmount: 50000000,
    paymentTerms: [
      {
        id: 'PT005',
        termNumber: 1,
        percentage: 50,
        amount: 25000000,
        description: 'Saat EL disetujui',
        status: 'paid',
        dueDate: '2025-09-05',
        paidDate: '2025-09-05',
      },
      {
        id: 'PT006',
        termNumber: 2,
        percentage: 50,
        amount: 25000000,
        description: 'Saat project selesai',
        status: 'overdue', // Overdue
        dueDate: '2025-10-15',
      },
    ],
    createdDate: '2025-08-30',
  },
  {
    id: 'INV004',
    projectId: 'P005',
    clientName: 'Rudi Hartono - PT Cahaya Abadi',
    totalAmount: 40000000,
    paymentTerms: [
      {
        id: 'PT007',
        termNumber: 1,
        percentage: 50,
        amount: 20000000,
        description: 'Saat EL disetujui',
        status: 'paid',
        dueDate: '2025-10-12',
        paidDate: '2025-10-12',
      },
      {
        id: 'PT008',
        termNumber: 2,
        percentage: 50,
        amount: 20000000,
        description: 'Saat project selesai',
        status: 'pending',
        dueDate: '2025-10-28', // Dekat deadline
      },
    ],
    createdDate: '2025-10-08',
  },
  // P006 belum ada invoice karena belum assign PM
  // Tax Compliance - 3 invoices
  {
    id: 'INV005',
    projectId: 'P007',
    clientName: 'Dewi Lestari - UD Makmur Sejahtera',
    totalAmount: 25000000,
    paymentTerms: [
      {
        id: 'PT009',
        termNumber: 1,
        percentage: 50,
        amount: 12500000,
        description: 'Saat EL disetujui',
        status: 'paid',
        dueDate: '2025-07-28',
        paidDate: '2025-07-28',
      },
      {
        id: 'PT010',
        termNumber: 2,
        percentage: 50,
        amount: 12500000,
        description: 'Saat project selesai',
        status: 'pending', // Waiting final payment
        dueDate: '2025-09-30',
      },
    ],
    createdDate: '2025-07-20',
  },
  {
    id: 'INV006',
    projectId: 'P008',
    clientName: 'Bambang Suryadi - PT Sejahtera Makmur',
    totalAmount: 30000000,
    paymentTerms: [
      {
        id: 'PT011',
        termNumber: 1,
        percentage: 50,
        amount: 15000000,
        description: 'Saat EL disetujui',
        status: 'paid',
        dueDate: '2025-09-15',
        paidDate: '2025-09-15',
      },
      {
        id: 'PT012',
        termNumber: 2,
        percentage: 50,
        amount: 15000000,
        description: 'Saat project selesai',
        status: 'pending',
        dueDate: '2025-11-05', // Dekat deadline
      },
    ],
    createdDate: '2025-09-10',
  },
  {
    id: 'INV007',
    projectId: 'P009',
    clientName: 'Sari Indrawati - PT Indah Permai',
    totalAmount: 20000000,
    paymentTerms: [
      {
        id: 'PT013',
        termNumber: 1,
        percentage: 50,
        amount: 10000000,
        description: 'Saat EL disetujui',
        status: 'paid',
        dueDate: '2025-10-05',
        paidDate: '2025-10-05',
      },
      {
        id: 'PT014',
        termNumber: 2,
        percentage: 50,
        amount: 10000000,
        description: 'Saat project selesai',
        status: 'overdue', // Overdue
        dueDate: '2025-10-10',
      },
    ],
    createdDate: '2025-10-01',
  },
  // Tax Dispute - 3 invoices
  {
    id: 'INV008',
    projectId: 'P010',
    clientName: 'Agus Setiawan - PT Bumi Nusantara',
    totalAmount: 60000000,
    paymentTerms: [
      {
        id: 'PT015',
        termNumber: 1,
        percentage: 50,
        amount: 30000000,
        description: 'Saat EL disetujui',
        status: 'paid',
        dueDate: '2025-08-20',
        paidDate: '2025-08-20',
      },
      {
        id: 'PT016',
        termNumber: 2,
        percentage: 35,
        amount: 21000000,
        description: 'Progress 50% pengerjaan',
        status: 'paid',
        dueDate: '2025-09-20',
        paidDate: '2025-09-18',
      },
      {
        id: 'PT017',
        termNumber: 3,
        percentage: 15,
        amount: 9000000,
        description: 'Pelunasan saat project selesai',
        status: 'pending',
        dueDate: '2025-11-20',
      },
    ],
    createdDate: '2025-08-15',
  },
  {
    id: 'INV009',
    projectId: 'P011',
    clientName: 'Ratna Dewi - PT Harmoni Jaya',
    totalAmount: 80000000,
    paymentTerms: [
      {
        id: 'PT018',
        termNumber: 1,
        percentage: 50,
        amount: 40000000,
        description: 'Saat EL disetujui',
        status: 'paid',
        dueDate: '2025-09-25',
        paidDate: '2025-09-25',
      },
      {
        id: 'PT019',
        termNumber: 2,
        percentage: 35,
        amount: 28000000,
        description: 'Progress 50% pengerjaan',
        status: 'paid',
        dueDate: '2025-09-28',
        paidDate: '2025-09-27',
      },
      {
        id: 'PT020',
        termNumber: 3,
        percentage: 15,
        amount: 12000000,
        description: 'Pelunasan saat project selesai',
        status: 'paid', // Sudah dibayar semua
        dueDate: '2025-10-01',
        paidDate: '2025-10-01',
      },
    ],
    createdDate: '2025-09-20',
  },
  {
    id: 'INV010',
    projectId: 'P012',
    clientName: 'Bambang Wijaya - PT Sentosa Abadi',
    totalAmount: 70000000,
    paymentTerms: [
      {
        id: 'PT021',
        termNumber: 1,
        percentage: 50,
        amount: 35000000,
        description: 'Saat EL disetujui',
        status: 'paid',
        dueDate: '2025-10-15',
        paidDate: '2025-10-15',
      },
      {
        id: 'PT022',
        termNumber: 2,
        percentage: 35,
        amount: 24500000,
        description: 'Progress 50% pengerjaan',
        status: 'pending',
        dueDate: '2025-11-01', // Dekat deadline
      },
      {
        id: 'PT023',
        termNumber: 3,
        percentage: 15,
        amount: 10500000,
        description: 'Pelunasan saat project selesai',
        status: 'pending',
        dueDate: '2025-11-20',
      },
    ],
    createdDate: '2025-10-10',
  },
  // Transfer Pricing - 3 invoices
  {
    id: 'INV011',
    projectId: 'P013',
    clientName: 'Ahmad Kurniawan - PT Alam Lestari',
    totalAmount: 55000000,
    paymentTerms: [
      {
        id: 'PT024',
        termNumber: 1,
        percentage: 50,
        amount: 27500000,
        description: 'Saat EL disetujui',
        status: 'paid',
        dueDate: '2025-08-30',
        paidDate: '2025-08-30',
      },
      {
        id: 'PT025',
        termNumber: 2,
        percentage: 50,
        amount: 27500000,
        description: 'Saat project selesai',
        status: 'pending',
        dueDate: '2025-11-15',
      },
    ],
    createdDate: '2025-08-25',
  },
  {
    id: 'INV012',
    projectId: 'P014',
    clientName: 'Siti Nurhaliza - PT Karya Mandiri',
    totalAmount: 65000000,
    paymentTerms: [
      {
        id: 'PT026',
        termNumber: 1,
        percentage: 50,
        amount: 32500000,
        description: 'Saat EL disetujui',
        status: 'paid',
        dueDate: '2025-09-20',
        paidDate: '2025-09-20',
      },
      {
        id: 'PT027',
        termNumber: 2,
        percentage: 50,
        amount: 32500000,
        description: 'Saat project selesai',
        status: 'paid', // Sudah dibayar semua
        dueDate: '2025-10-05',
        paidDate: '2025-10-05',
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
      status: 'MEETING_SCHEDULED' as any,
      createdDate: '2025-01-08',
      notes: 'Meeting dijadwalkan tanggal 20 Januari 2025',
      createdBy: userName,
      service: 'Audit Services',
      lastActivity: 'Meeting scheduled for 2025-01-20',
    },
    {
      id: 'L104',
      clientName: 'Dewi Lestari',
      company: 'PT Global Mandiri',
      email: 'dewi@globalmandiri.com',
      phone: '084567890123',
      source: 'Facebook',
      status: 'NEED_PROPOSAL' as any,
      createdDate: '2025-01-05',
      notes: 'Setelah meeting, client meminta proposal untuk Financial Advisory',
      createdBy: userName,
      service: 'Financial Advisory',
      lastActivity: 'Notulensi approved by CEO - 2025-01-10',
    },
    {
      id: 'L105',
      clientName: 'Rudi Hartono',
      company: 'PT Cahaya Abadi',
      email: 'rudi@cahayaabadi.com',
      phone: '085678901234',
      source: 'Instagram',
      status: 'IN_PROPOSAL' as any,
      createdDate: '2025-01-28',
      notes: 'Proposal sedang dalam proses review oleh client',
      createdBy: userName,
      service: 'Web Development',
      lastActivity: 'Proposal sent to client - 2025-02-05',
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
      status: 'IN_PROPOSAL' as any,
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
  ];
}

