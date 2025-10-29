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
  assignedPM?: string; // BOD yang assign PM
  assignedConsultant?: string; // PM yang assign Consultant
  status: 'waiting-assignment' | 'waiting-pm' | 'waiting-el' | 'waiting-first-payment' | 'in-progress' | 'waiting-final-payment' | 'completed';
  dueDate: string;
  startDate?: string;
  completionDate?: string;
  pmNotified: boolean;
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
  {
    id: 'P001',
    dealId: 'D001',
    serviceId: 'S001',
    elId: 'EL001',
    projectName: 'Website Development - CV Berkah Sentosa',
    serviceName: 'Website Development',
    clientName: 'Siti Rahayu - CV Berkah Sentosa',
    assignedPM: 'Diana Putri',
    assignedConsultant: 'Bambang Hermawan',
    status: 'in-progress',
    dueDate: '2025-11-30',
    startDate: '2025-10-11',
    pmNotified: true,
  },
  {
    id: 'P002',
    dealId: 'D001',
    serviceId: 'S002',
    elId: 'EL002',
    projectName: 'Mobile App Development - CV Berkah Sentosa',
    serviceName: 'Mobile App Development',
    clientName: 'Siti Rahayu - CV Berkah Sentosa',
    assignedPM: 'Eko Prasetyo',
    assignedConsultant: 'Citra Dewi',
    status: 'in-progress',
    dueDate: '2025-12-20',
    startDate: '2025-10-11',
    pmNotified: true,
  },
  {
    id: 'P003',
    dealId: 'D002',
    serviceId: 'S003',
    elId: 'EL003',
    projectName: 'ERP System - PT Cahaya Abadi',
    serviceName: 'ERP System',
    clientName: 'Rudi Hartono - PT Cahaya Abadi',
    assignedPM: 'Farhan Rahman',
    status: 'waiting-first-payment',
    dueDate: '2026-02-15',
    pmNotified: true,
  },
  {
    id: 'P004',
    dealId: 'D003',
    serviceId: 'S004',
    elId: 'EL004',
    projectName: 'Digital Marketing - CV Surya Gemilang',
    serviceName: 'Digital Marketing',
    clientName: 'Linda Wijayanti - CV Surya Gemilang',
    assignedPM: 'Diana Putri',
    assignedConsultant: 'Hadi Purnomo',
    status: 'in-progress',
    dueDate: '2026-04-08',
    startDate: '2025-10-16',
    pmNotified: true,
  },
  {
    id: 'P005',
    dealId: 'D003',
    serviceId: 'S005',
    elId: 'EL005',
    projectName: 'SEO Optimization - CV Surya Gemilang',
    serviceName: 'SEO Optimization',
    clientName: 'Linda Wijayanti - CV Surya Gemilang',
    status: 'waiting-pm',
    dueDate: '2026-03-15',
    pmNotified: false,
  },
  {
    id: 'P006',
    dealId: 'D003',
    serviceId: 'S006',
    elId: 'EL006',
    projectName: 'E-Commerce Platform - CV Surya Gemilang',
    serviceName: 'E-Commerce Platform',
    clientName: 'Linda Wijayanti - CV Surya Gemilang',
    status: 'waiting-pm',
    dueDate: '2026-05-20',
    pmNotified: false,
  },
  {
    id: 'P007',
    dealId: 'D002',
    serviceId: 'S007',
    elId: 'EL007',
    projectName: 'Mobile App - PT Cahaya Abadi',
    serviceName: 'Mobile App Development',
    clientName: 'Rudi Hartono - PT Cahaya Abadi',
    status: 'waiting-pm',
    dueDate: '2026-06-10',
    pmNotified: false,
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

