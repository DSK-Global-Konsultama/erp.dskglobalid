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
  {
    id: 'L001',
    clientName: 'Budi Santoso',
    company: 'PT Maju Jaya',
    email: 'budi@majujaya.com',
    phone: '081234567890',
    source: 'Facebook',
    status: 'follow-up',
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
    notes: 'Deal closed, butuh 2 layanan',
    createdBy: 'Sarah Wijaya',
  },
  {
    id: 'L003',
    clientName: 'Ahmad Fauzi',
    company: 'PT Teknologi Nusantara',
    email: 'ahmad@teknusantara.com',
    phone: '083456789012',
    source: 'LinkedIn',
    status: 'available',
    createdDate: '2025-10-18',
    notes: 'Baru masuk dari LinkedIn, belum ada yang claim',
    createdBy: 'Tommy Budiman',
  },
  {
    id: 'L004',
    clientName: 'Dewi Lestari',
    company: 'UD Makmur Sejahtera',
    email: 'dewi@makmursejahtera.com',
    phone: '084567890123',
    source: 'Referral',
    status: 'follow-up',
    claimedBy: 'Rina Kusuma',
    createdDate: '2025-07-10',
    claimedDate: '2025-07-11',
    lastFollowUp: '2025-07-25',
    notes: 'Sudah 3 bulan tidak ada update - MISS',
    createdBy: 'Sarah Wijaya',
  },
  {
    id: 'L005',
    clientName: 'Hendra Gunawan',
    company: 'PT Global Mandiri',
    email: 'hendra@globalmandiri.com',
    phone: '085678901234',
    source: 'Website',
    status: 'lost',
    claimedBy: 'Andi Wijaya',
    createdDate: '2025-08-05',
    claimedDate: '2025-08-06',
    lastFollowUp: '2025-09-01',
    notes: 'Client memilih kompetitor',
    createdBy: 'Tommy Budiman',
  },
  {
    id: 'L006',
    clientName: 'Rudi Hartono',
    company: 'PT Cahaya Abadi',
    email: 'rudi@cahayaabadi.com',
    phone: '086789012345',
    source: 'Event',
    status: 'deal',
    claimedBy: 'Andi Wijaya',
    createdDate: '2025-10-08',
    claimedDate: '2025-10-09',
    notes: 'Ketemu di tech expo',
    createdBy: 'Sarah Wijaya',
  },
  {
    id: 'L007',
    clientName: 'Linda Wijayanti',
    company: 'CV Surya Gemilang',
    email: 'linda@suryagemilang.com',
    phone: '087890123456',
    source: 'Instagram',
    status: 'deal',
    claimedBy: 'Rina Kusuma',
    createdDate: '2025-10-05',
    claimedDate: '2025-10-06',
    notes: 'DM Instagram',
    createdBy: 'Tommy Budiman',
  },
];

export const mockDeals: Deal[] = [
  {
    id: 'D001',
    leadId: 'L002',
    clientName: 'Siti Rahayu',
    company: 'CV Berkah Sentosa',
    services: [
      {
        id: 'S001',
        name: 'Website Development',
        description: 'Company profile website dengan CMS',
        estimatedValue: 30000000,
        elId: 'EL001',
      },
      {
        id: 'S002',
        name: 'Mobile App Development',
        description: 'E-commerce mobile app iOS & Android',
        estimatedValue: 45000000,
        elId: 'EL002',
      },
    ],
    totalDealValue: 75000000,
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
      {
        id: 'EL002',
        serviceIds: ['S002'],
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
    elStrategy: 'separate', // EL terpisah per layanan
    bdExecutive: 'Rina Kusuma',
    createdDate: '2025-10-05',
    clientNeeds: 'Client butuh website company profile dan mobile app untuk jualan online. Prioritas mobile app karena target market mayoritas mobile user.',
  },
  {
    id: 'D002',
    leadId: 'L006',
    clientName: 'Rudi Hartono',
    company: 'PT Cahaya Abadi',
    services: [
      {
        id: 'S003',
        name: 'ERP System',
        description: 'Custom ERP untuk inventory & accounting',
        estimatedValue: 120000000,
        elId: 'EL003',
      },
    ],
    totalDealValue: 120000000,
    proposalStatus: 'approved',
    proposalApprovedDate: '2025-10-13',
    els: [
      {
        id: 'EL003',
        serviceIds: ['S003'],
        status: 'submitted',
        submittedDate: '2025-10-14',
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
    createdDate: '2025-10-12',
    clientNeeds: 'Perusahaan manufacturing butuh sistem ERP untuk manage inventory, production, dan accounting terintegrasi.',
  },
  {
    id: 'D003',
    leadId: 'L007',
    clientName: 'Linda Wijayanti',
    company: 'CV Surya Gemilang',
    services: [
      {
        id: 'S004',
        name: 'Digital Marketing',
        description: 'SEO, SEM, Social Media Marketing - 6 bulan',
        estimatedValue: 36000000,
        elId: 'EL004',
      },
    ],
    totalDealValue: 36000000,
    proposalStatus: 'approved',
    proposalApprovedDate: '2025-10-09',
    els: [
      {
        id: 'EL004',
        serviceIds: ['S004'],
        status: 'approved',
        approvedDate: '2025-10-14',
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
    clientNeeds: 'Butuh boost online presence, fokus ke Instagram & Google Ads, target market B2C fashion.',
  },
];

export const mockProjects: Project[] = [
  // Audit and Assurance Projects
  {
    id: 'P001',
    dealId: 'D001',
    serviceId: 'S001',
    elId: 'EL001',
    projectName: 'Audit and Assurance - PT Maju Jaya',
    serviceName: 'Audit and Assurance',
    clientName: 'Budi Santoso - PT Maju Jaya',
    assignedPM: 'Diana Putri',
    assignedConsultant: 'Bambang Hermawan',
    status: 'in-progress',
    dueDate: '2025-12-15',
    startDate: '2025-10-01',
    pmNotified: true,
    progressPercentage: 65,
  },
  {
    id: 'P002',
    dealId: 'D002',
    serviceId: 'S002',
    elId: 'EL002',
    projectName: 'Audit and Assurance - PT Global Mandiri',
    serviceName: 'Audit and Assurance',
    clientName: 'Hendra Gunawan - PT Global Mandiri',
    assignedPM: 'Eko Prasetyo',
    assignedConsultant: 'Citra Dewi',
    status: 'in-progress',
    dueDate: '2025-11-30',
    startDate: '2025-09-15',
    pmNotified: true,
    progressPercentage: 80,
  },
  {
    id: 'P003',
    dealId: 'D003',
    serviceId: 'S003',
    elId: 'EL003',
    projectName: 'Audit and Assurance - CV Berkah Sentosa',
    serviceName: 'Audit and Assurance',
    clientName: 'Siti Rahayu - CV Berkah Sentosa',
    status: 'waiting-assignment',
    dueDate: '2026-01-20',
    pmNotified: false,
    progressPercentage: 0,
  },
  {
    id: 'P004',
    dealId: 'D004',
    serviceId: 'S004',
    elId: 'EL004',
    projectName: 'Audit and Assurance - PT Teknologi Nusantara',
    serviceName: 'Audit and Assurance',
    clientName: 'Ahmad Fauzi - PT Teknologi Nusantara',
    assignedPM: 'Farhan Rahman',
    status: 'waiting-first-payment',
    dueDate: '2026-02-10',
    pmNotified: true,
    progressPercentage: 0,
  },
  
  // Sustainability Report Projects
  {
    id: 'P005',
    dealId: 'D005',
    serviceId: 'S005',
    elId: 'EL005',
    projectName: 'Sustainability Report - PT Cahaya Abadi',
    serviceName: 'Sustainability Report',
    clientName: 'Rudi Hartono - PT Cahaya Abadi',
    assignedPM: 'Gita Sari',
    assignedConsultant: 'Hadi Purnomo',
    status: 'in-progress',
    dueDate: '2025-12-20',
    startDate: '2025-10-05',
    pmNotified: true,
    progressPercentage: 50,
  },
  {
    id: 'P006',
    dealId: 'D006',
    serviceId: 'S006',
    elId: 'EL006',
    projectName: 'Sustainability Report - CV Surya Gemilang',
    serviceName: 'Sustainability Report',
    clientName: 'Linda Wijayanti - CV Surya Gemilang',
    assignedPM: 'Diana Putri',
    status: 'waiting-first-payment',
    dueDate: '2026-01-15',
    pmNotified: true,
    progressPercentage: 0,
  },
  {
    id: 'P007',
    dealId: 'D007',
    serviceId: 'S007',
    elId: 'EL007',
    projectName: 'Sustainability Report - UD Makmur Sejahtera',
    serviceName: 'Sustainability Report',
    clientName: 'Dewi Lestari - UD Makmur Sejahtera',
    status: 'waiting-assignment',
    dueDate: '2026-03-10',
    pmNotified: false,
    progressPercentage: 0,
  },
  
  // Tax Compliance Projects
  {
    id: 'P008',
    dealId: 'D008',
    serviceId: 'S008',
    elId: 'EL008',
    projectName: 'Tax Compliance - PT Maju Jaya',
    serviceName: 'Tax Compliance',
    clientName: 'Budi Santoso - PT Maju Jaya',
    assignedPM: 'Eko Prasetyo',
    assignedConsultant: 'Indah Permata',
    status: 'in-progress',
    dueDate: '2025-11-25',
    startDate: '2025-09-20',
    pmNotified: true,
    progressPercentage: 70,
  },
  {
    id: 'P009',
    dealId: 'D009',
    serviceId: 'S009',
    elId: 'EL009',
    projectName: 'Tax Compliance - PT Global Mandiri',
    serviceName: 'Tax Compliance',
    clientName: 'Hendra Gunawan - PT Global Mandiri',
    assignedPM: 'Farhan Rahman',
    assignedConsultant: 'Joko Santoso',
    status: 'in-progress',
    dueDate: '2025-12-05',
    startDate: '2025-10-10',
    pmNotified: true,
    progressPercentage: 40,
  },
  {
    id: 'P010',
    dealId: 'D010',
    serviceId: 'S010',
    elId: 'EL010',
    projectName: 'Tax Compliance - CV Berkah Sentosa',
    serviceName: 'Tax Compliance',
    clientName: 'Siti Rahayu - CV Berkah Sentosa',
    status: 'waiting-assignment',
    dueDate: '2026-01-30',
    pmNotified: false,
    progressPercentage: 0,
  },
  {
    id: 'P011',
    dealId: 'D011',
    serviceId: 'S011',
    elId: 'EL011',
    projectName: 'Tax Compliance - PT Teknologi Nusantara',
    serviceName: 'Tax Compliance',
    clientName: 'Ahmad Fauzi - PT Teknologi Nusantara',
    assignedPM: 'Gita Sari',
    status: 'waiting-first-payment',
    dueDate: '2026-02-28',
    pmNotified: true,
    progressPercentage: 0,
  },
  
  // Tax Dispute Projects
  {
    id: 'P012',
    dealId: 'D012',
    serviceId: 'S012',
    elId: 'EL012',
    projectName: 'Tax Dispute - PT Cahaya Abadi',
    serviceName: 'Tax Dispute',
    clientName: 'Rudi Hartono - PT Cahaya Abadi',
    assignedPM: 'Diana Putri',
    assignedConsultant: 'Bambang Hermawan',
    status: 'in-progress',
    dueDate: '2026-01-10',
    startDate: '2025-10-15',
    pmNotified: true,
    progressPercentage: 35,
  },
  {
    id: 'P013',
    dealId: 'D013',
    serviceId: 'S013',
    elId: 'EL013',
    projectName: 'Tax Dispute - CV Surya Gemilang',
    serviceName: 'Tax Dispute',
    clientName: 'Linda Wijayanti - CV Surya Gemilang',
    assignedPM: 'Eko Prasetyo',
    status: 'waiting-first-payment',
    dueDate: '2026-02-15',
    pmNotified: true,
    progressPercentage: 0,
  },
  {
    id: 'P014',
    dealId: 'D014',
    serviceId: 'S014',
    elId: 'EL014',
    projectName: 'Tax Dispute - UD Makmur Sejahtera',
    serviceName: 'Tax Dispute',
    clientName: 'Dewi Lestari - UD Makmur Sejahtera',
    status: 'waiting-assignment',
    dueDate: '2026-03-20',
    pmNotified: false,
    progressPercentage: 0,
  },
  
  // Transfer Pricing Projects
  {
    id: 'P015',
    dealId: 'D015',
    serviceId: 'S015',
    elId: 'EL015',
    projectName: 'Transfer Pricing - PT Maju Jaya',
    serviceName: 'Transfer Pricing',
    clientName: 'Budi Santoso - PT Maju Jaya',
    assignedPM: 'Farhan Rahman',
    assignedConsultant: 'Citra Dewi',
    status: 'in-progress',
    dueDate: '2025-12-30',
    startDate: '2025-10-01',
    pmNotified: true,
    progressPercentage: 60,
  },
  {
    id: 'P016',
    dealId: 'D016',
    serviceId: 'S016',
    elId: 'EL016',
    projectName: 'Transfer Pricing - PT Global Mandiri',
    serviceName: 'Transfer Pricing',
    clientName: 'Hendra Gunawan - PT Global Mandiri',
    assignedPM: 'Gita Sari',
    assignedConsultant: 'Hadi Purnomo',
    status: 'in-progress',
    dueDate: '2026-01-15',
    startDate: '2025-09-25',
    pmNotified: true,
    progressPercentage: 85,
  },
  {
    id: 'P017',
    dealId: 'D017',
    serviceId: 'S017',
    elId: 'EL017',
    projectName: 'Transfer Pricing - CV Berkah Sentosa',
    serviceName: 'Transfer Pricing',
    clientName: 'Siti Rahayu - CV Berkah Sentosa',
    status: 'waiting-assignment',
    dueDate: '2026-02-25',
    pmNotified: false,
    progressPercentage: 0,
  },
  {
    id: 'P018',
    dealId: 'D018',
    serviceId: 'S018',
    elId: 'EL018',
    projectName: 'Transfer Pricing - PT Teknologi Nusantara',
    serviceName: 'Transfer Pricing',
    clientName: 'Ahmad Fauzi - PT Teknologi Nusantara',
    assignedPM: 'Diana Putri',
    status: 'waiting-first-payment',
    dueDate: '2026-03-10',
    pmNotified: true,
    progressPercentage: 0,
  },
  
  // Web Dev Projects
  {
    id: 'P019',
    dealId: 'D019',
    serviceId: 'S019',
    elId: 'EL019',
    projectName: 'Web Dev - PT Cahaya Abadi',
    serviceName: 'Web Dev',
    clientName: 'Rudi Hartono - PT Cahaya Abadi',
    assignedPM: 'Eko Prasetyo',
    assignedConsultant: 'Indah Permata',
    status: 'in-progress',
    dueDate: '2025-11-20',
    startDate: '2025-09-30',
    pmNotified: true,
    progressPercentage: 55,
  },
  {
    id: 'P020',
    dealId: 'D020',
    serviceId: 'S020',
    elId: 'EL020',
    projectName: 'Web Dev - CV Surya Gemilang',
    serviceName: 'Web Dev',
    clientName: 'Linda Wijayanti - CV Surya Gemilang',
    assignedPM: 'Farhan Rahman',
    assignedConsultant: 'Joko Santoso',
    status: 'completed',
    dueDate: '2025-10-15',
    startDate: '2025-08-01',
    completionDate: '2025-10-12',
    pmNotified: true,
    progressPercentage: 100,
  },
  
  // CEO: Web Dev - Belum Assign PM
  {
    id: 'P021',
    dealId: 'D021',
    serviceId: 'S021',
    elId: 'EL021',
    projectName: 'Web Dev - PT Sejahtera Makmur',
    serviceName: 'Web Dev',
    clientName: 'Bambang Suryadi - PT Sejahtera Makmur',
    status: 'waiting-assignment',
    dueDate: '2026-02-28',
    pmNotified: false,
    progressPercentage: 0,
  },
  
  // COO-Tax-Audit (Suparna Wijaya): 5 Projects Belum Assign PM
  {
    id: 'P022',
    dealId: 'D022',
    serviceId: 'S022',
    elId: 'EL022',
    projectName: 'Audit and Assurance - PT Indah Permai',
    serviceName: 'Audit and Assurance',
    clientName: 'Sari Indrawati - PT Indah Permai',
    status: 'waiting-assignment',
    dueDate: '2026-03-15',
    pmNotified: false,
    progressPercentage: 0,
  },
  {
    id: 'P023',
    dealId: 'D023',
    serviceId: 'S023',
    elId: 'EL023',
    projectName: 'Tax Compliance - PT Bumi Nusantara',
    serviceName: 'Tax Compliance',
    clientName: 'Agus Setiawan - PT Bumi Nusantara',
    status: 'waiting-assignment',
    dueDate: '2026-03-25',
    pmNotified: false,
    progressPercentage: 0,
  },
  {
    id: 'P026',
    dealId: 'D026',
    serviceId: 'S026',
    elId: 'EL026',
    projectName: 'Audit and Assurance - PT Sentosa Abadi',
    serviceName: 'Audit and Assurance',
    clientName: 'Bambang Wijaya - PT Sentosa Abadi',
    status: 'waiting-assignment',
    dueDate: '2026-04-05',
    pmNotified: false,
    progressPercentage: 0,
  },
  {
    id: 'P027',
    dealId: 'D027',
    serviceId: 'S027',
    elId: 'EL027',
    projectName: 'Tax Dispute - PT Karya Mandiri',
    serviceName: 'Tax Dispute',
    clientName: 'Siti Nurhaliza - PT Karya Mandiri',
    status: 'waiting-assignment',
    dueDate: '2026-04-15',
    pmNotified: false,
    progressPercentage: 0,
  },
  {
    id: 'P028',
    dealId: 'D028',
    serviceId: 'S028',
    elId: 'EL028',
    projectName: 'Tax Compliance - PT Sejahtera Bersama',
    serviceName: 'Tax Compliance',
    clientName: 'Dedi Kurniawan - PT Sejahtera Bersama',
    status: 'waiting-assignment',
    dueDate: '2026-04-25',
    pmNotified: false,
    progressPercentage: 0,
  },
  
  // COO-Legal-TP-SR (Ferry Irawan): 3 Projects Belum Assign PM (1 Legal, 1 Transfer Pricing, 1 Sustainability Report)
  {
    id: 'P024',
    dealId: 'D024',
    serviceId: 'S024',
    elId: 'EL024',
    projectName: 'Transfer Pricing - PT Harmoni Jaya',
    serviceName: 'Transfer Pricing',
    clientName: 'Ratna Dewi - PT Harmoni Jaya',
    status: 'waiting-assignment',
    dueDate: '2026-04-10',
    pmNotified: false,
    progressPercentage: 0,
  },
  {
    id: 'P025',
    dealId: 'D025',
    serviceId: 'S025',
    elId: 'EL025',
    projectName: 'Legal - PT Alam Lestari',
    serviceName: 'Legal',
    clientName: 'Ahmad Kurniawan - PT Alam Lestari',
    status: 'waiting-assignment',
    dueDate: '2026-04-20',
    pmNotified: false,
    progressPercentage: 0,
  },
  {
    id: 'P029',
    dealId: 'D029',
    serviceId: 'S029',
    elId: 'EL029',
    projectName: 'Sustainability Report - PT Cipta Karya',
    serviceName: 'Sustainability Report',
    clientName: 'Dewi Sartika - PT Cipta Karya',
    status: 'waiting-assignment',
    dueDate: '2026-05-05',
    pmNotified: false,
    progressPercentage: 0,
  },
];

export const mockInvoices: Invoice[] = [
  {
    id: 'INV001',
    projectId: 'P001',
    clientName: 'Siti Rahayu - CV Berkah Sentosa',
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
        dueDate: '2025-12-05',
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
        dueDate: '2025-10-10',
        paidDate: '2025-10-09',
      },
      {
        id: 'PT004',
        termNumber: 2,
        percentage: 35,
        amount: 15750000,
        description: 'Progress 70%',
        status: 'pending',
        dueDate: '2025-11-25',
      },
      {
        id: 'PT005',
        termNumber: 3,
        percentage: 15,
        amount: 6750000,
        description: 'Saat selesai & handover',
        status: 'pending',
        dueDate: '2025-12-25',
      },
    ],
    createdDate: '2025-10-05',
  },
  {
    id: 'INV003',
    projectId: 'P003',
    clientName: 'Rudi Hartono - PT Cahaya Abadi',
    totalAmount: 120000000,
    paymentTerms: [
      {
        id: 'PT006',
        termNumber: 1,
        percentage: 50,
        amount: 60000000,
        description: 'Saat EL disetujui',
        status: 'pending',
        dueDate: '2025-10-25',
      },
      {
        id: 'PT007',
        termNumber: 2,
        percentage: 50,
        amount: 60000000,
        description: 'Saat project selesai',
        status: 'pending',
        dueDate: '2026-02-20',
      },
    ],
    createdDate: '2025-10-12',
  },
  {
    id: 'INV004',
    projectId: 'P004',
    clientName: 'Linda Wijayanti - CV Surya Gemilang',
    totalAmount: 36000000,
    paymentTerms: [
      {
        id: 'PT008',
        termNumber: 1,
        percentage: 50,
        amount: 18000000,
        description: 'Saat EL disetujui',
        status: 'paid',
        dueDate: '2025-10-15',
        paidDate: '2025-10-14',
      },
      {
        id: 'PT009',
        termNumber: 2,
        percentage: 50,
        amount: 18000000,
        description: 'Akhir kontrak (bulan ke-6)',
        status: 'pending',
        dueDate: '2026-04-15',
      },
    ],
    createdDate: '2025-10-08',
  },
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

