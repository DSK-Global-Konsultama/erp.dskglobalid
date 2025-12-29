/**
 * CEO Approval Management
 * Review and approve Notulensi, Proposal, Engagement Letter, and Handover Memo
 */

import { useState } from 'react';
import { FileText, FileCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { mockNotulensi, mockProposals, mockLeads, type Notulensi, type Proposal } from '../../../../lib/mock-data';
// Handover type akan ditambahkan nanti setelah konsepnya siap
// import type { Handover } from '../../../../lib/mock-data';
import { authService } from '../../../../services/authService';
import { NotulensiTab } from '../tabs/NotulensiTab';
import { ProposalTab } from '../tabs/ProposalTab';
// ELTab dan HandoverTab akan ditambahkan nanti setelah konsepnya siap
// import { ELTab } from '../tabs/ELTab';
// import { HandoverTab } from '../tabs/HandoverTab';

// Mock Handover data akan ditambahkan nanti setelah konsepnya siap
// const mockHandovers: Handover[] = [
//   {
//     id: 'H001',
//     leadId: 'L001',
//     projectId: 'P001',
//     clientName: 'Budi Santoso',
//     projectTitle: 'Web Development Project',
//     pm: 'Diana Putri',
//     status: 'WAITING_CEO_APPROVAL',
//     createdBy: 'Rina Kusuma',
//     createdAt: '2025-10-15',
//     summary: 'Project ready for handover to PM',
//     deliverables: ['Website Design', 'Backend Development', 'Testing'],
//     notes: 'All deliverables completed and ready for handover',
//   },
// ];

export function ApprovalManagement() {
  // Check if user is CEO
  const currentUser = authService.getCurrentUser();
  if (!currentUser || currentUser.role !== 'CEO') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900">Access Denied</p>
          <p className="text-sm text-gray-600 mt-1">Only CEO can access this page</p>
        </div>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState<'notulensi' | 'proposal'>('notulensi');
  const [notulensi, setNotulensi] = useState<Notulensi[]>(mockNotulensi);
  const [proposals, setProposals] = useState<Proposal[]>(mockProposals);
  // handovers state akan ditambahkan nanti setelah konsepnya siap
  // const [handovers, setHandovers] = useState<Handover[]>(mockHandovers);

  const waitingNotulensi = notulensi.filter(n => n.status === 'WAITING_CEO_APPROVAL');
  const waitingProposals = proposals.filter(p => p.status === 'WAITING_CEO_APPROVAL');
  // EL dan Handover akan ditambahkan nanti setelah konsepnya siap
  // const waitingELs = proposals.filter(p => p.elStatus === 'WAITING_CEO_APPROVAL');
  // const waitingHandovers = handovers.filter(h => h.status === 'WAITING_CEO_APPROVAL');

  const handleUpdateNotulensi = (id: string, updates: Partial<Notulensi>) => {
    setNotulensi(notulensi.map(n => n.id === id ? { ...n, ...updates } : n));
  };

  const handleUpdateProposal = (id: string, updates: Partial<Proposal>) => {
    setProposals(proposals.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  // handleUpdateHandover akan ditambahkan nanti setelah konsepnya siap
  // const handleUpdateHandover = (id: string, updates: Partial<Handover>) => {
  //   setHandovers(handovers.map(h => h.id === id ? { ...h, ...updates } : h));
  // };

  const tabs = [
    { id: 'notulensi', label: 'Notulensi Meeting' },
    { id: 'proposal', label: 'Proposal' },
    // ELTab dan HandoverTab akan ditambahkan nanti setelah konsepnya siap
    // { id: 'el', label: 'Engagement Letter' },
    // { id: 'handover', label: 'Handover Memo' },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="hover:border-blue-300 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Notulensi</CardTitle>
              <FileText className="w-4 h-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-gray-900">{waitingNotulensi.length}</div>
            <div className="text-xs text-gray-500 mt-1">menunggu review</div>
          </CardContent>
        </Card>

        <Card className="hover:border-blue-300 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Proposal</CardTitle>
              <FileCheck className="w-4 h-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-gray-900">{waitingProposals.length}</div>
            <div className="text-xs text-gray-500 mt-1">menunggu review</div>
          </CardContent>
        </Card>

        {/* EL dan Handover summary cards akan ditambahkan nanti setelah konsepnya siap */}
        {/* <Card className="hover:border-blue-300 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Engagement Letter</CardTitle>
              <Award className="w-4 h-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-gray-900">{waitingELs.length}</div>
            <div className="text-xs text-gray-500 mt-1">menunggu review</div>
          </CardContent>
        </Card>

        <Card className="hover:border-blue-300 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Handover</CardTitle>
              <Share2 className="w-4 h-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-gray-900">{waitingHandovers.length}</div>
            <div className="text-xs text-gray-500 mt-1">menunggu review</div>
          </CardContent>
        </Card> */}
      </div>

      {/* Tabs */}
      <Card>
        <div className="border-b border-gray-200">
          <nav className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-4 border-b-2 transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-600 hover:text-red-600 hover:border-red-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <CardContent className="px-6">
          {activeTab === 'notulensi' && (
            <NotulensiTab
              notulensi={waitingNotulensi}
              onUpdateNotulensi={handleUpdateNotulensi}
            />
          )}

          {activeTab === 'proposal' && (
            <ProposalTab
              proposals={waitingProposals}
              leads={mockLeads}
              onUpdateProposal={handleUpdateProposal}
            />
          )}

          {/* ELTab dan HandoverTab akan ditambahkan nanti setelah konsepnya siap */}
          {/* {activeTab === 'el' && (
            <ELTab
              proposals={waitingELs}
              leads={mockLeads}
              onUpdateProposal={handleUpdateProposal}
            />
          )}

          {activeTab === 'handover' && (
            <HandoverTab
              handovers={waitingHandovers}
              onUpdateHandover={handleUpdateHandover}
            />
          )} */}
        </CardContent>
      </Card>
    </div>
  );
}

