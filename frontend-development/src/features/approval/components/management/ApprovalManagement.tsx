/**
 * CEO Approval Management
 * Review and approve Notulensi, Proposal, Engagement Letter, and Handover Memo
 */

import { useState, useEffect } from 'react';
import { FileText, FileCheck, Award, Share2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { type Notulensi, type Proposal, type Handover, type EngagementLetter } from '../../../../lib/mock-data';
import { authService } from '../../../../services/authService';
import { NotulensiTab } from '../tabs/NotulensiTab';
import { ProposalTab } from '../tabs/ProposalTab';
import { ELTab } from '../tabs/ELTab';
import { HandoverTab } from '../tabs/HandoverTab';
import { leadsService } from '../../../leads/services/leadsService';
import type { Lead } from '../../../../lib/mock-data';

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

  const [activeTab, setActiveTab] = useState<'notulensi' | 'proposal' | 'el' | 'handover'>('notulensi');
  const [notulensi, setNotulensi] = useState<Notulensi[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [engagementLetters, setEngagementLetters] = useState<EngagementLetter[]>([]);
  const [handovers, setHandovers] = useState<Handover[]>([]);
  const [fetchedLeads, setFetchedLeads] = useState<Lead[]>([]);

  // Load pending approvals from backend (based on CEO approvals inbox)
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        // Use CEO approvals inbox so docs awaiting CEO approval are visible even if the lead
        // is not yet part of /leads/tracker (align with mock-data business flow).
        const leads = await leadsService.getCEOApprovalLeads();

        const details = await Promise.all(
          (leads || []).map(async (l) => {
            try {
              return await leadsService.getTrackerLeadDetail(l.id);
            } catch {
              return null;
            }
          })
        );

        if (cancelled) return;

        const allNotulensi: Notulensi[] = [];
        const allProposals: Proposal[] = [];
        const allEls: EngagementLetter[] = [];
        const allHandovers: Handover[] = [];

        details.filter(Boolean).forEach((d: any) => {
          allNotulensi.push(...((d?.notulensi as Notulensi[]) || []));
          allProposals.push(...((d?.proposals as Proposal[]) || []));
          allEls.push(...((d?.engagementLetters as EngagementLetter[]) || []));
          allHandovers.push(...((d?.handovers as Handover[]) || []));
        });

        setNotulensi(allNotulensi);
        setProposals(allProposals);
        setEngagementLetters(allEls);
        setHandovers(allHandovers);
        setFetchedLeads(leads as unknown as Lead[]);
      } catch {
        if (!cancelled) {
          setNotulensi([]);
          setProposals([]);
          setEngagementLetters([]);
          setHandovers([]);
          setFetchedLeads([]);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const waitingNotulensi = notulensi.filter(n => n.status === 'WAITING_CEO_APPROVAL');
  const waitingProposals = proposals.filter(p => p.status === 'WAITING_CEO_APPROVAL');
  const waitingELs = engagementLetters.filter(el => el.status === 'WAITING_APPROVAL');
  const waitingHandovers = handovers.filter(h => h.status === 'WAITING_CEO_APPROVAL');

  const handleUpdateNotulensi = async (id: string, updates: Partial<Notulensi>) => {
    const current = notulensi.find((n) => n.id === id);
    if (!current) return;

    // optimistic UI
    setNotulensi(notulensi.map(n => n.id === id ? { ...n, ...updates } : n));

    try {
      const updated = await leadsService.updateNotulensi(current.leadId, id, {
        status: (updates as any).status,
        objectives: updates.objectives,
        nextSteps: updates.nextSteps,
        notes: updates.notes,
        clientName: updates.clientName,
        payload: {
          meetingInfo: (updates as any).meetingInfo,
          participants: (updates as any).participants,
          discussionSummary: (updates as any).discussionSummary,
          agreements: (updates as any).agreements,
          actionItems: (updates as any).actionItems,
          revisionNotes: (updates as any).revisionNotes,
        },
      });

      setNotulensi((prev) => prev.map((n) => (n.id === id ? updated : n)));
    } catch {
      // rollback best-effort
      setNotulensi((prev) => prev.map((n) => (n.id === id ? current : n)));
    }
  };

  const handleUpdateProposal = async (id: string, updates: Partial<Proposal>) => {
    const current = proposals.find((p) => p.id === id);
    if (!current) return;

    setProposals(proposals.map(p => p.id === id ? { ...p, ...updates } : p));

    try {
      const updated = await leadsService.updateProposal(current.leadId, id, {
        status: (updates as any).status,
        sentAt: (updates as any).sentAt,
        service: updates.service,
        proposalFee: (updates as any).proposalFee,
        agreeFee: (updates as any).agreeFee,
        paymentType: (updates as any).paymentType,
        paymentTypeFinal: (updates as any).paymentTypeFinal,
        dealDate: (updates as any).dealDate,
        hasSubcon: (updates as any).hasSubcon,
      });
      setProposals((prev) => prev.map((p) => (p.id === id ? updated : p)));
    } catch {
      setProposals((prev) => prev.map((p) => (p.id === id ? current : p)));
    }
  };

  const handleUpdateEngagementLetter = async (id: string, updates: Partial<EngagementLetter>) => {
    const current = engagementLetters.find((el) => el.id === id);
    if (!current) return;

    setEngagementLetters(engagementLetters.map(el => el.id === id ? { ...el, ...updates } : el));

    try {
      const updated = await leadsService.updateEngagementLetter(current.leadId, id, {
        status: (updates as any).status,
        submittedDate: (updates as any).submittedDate,
        approvedDate: (updates as any).approvedDate,
        sentAt: (updates as any).sentAt,
        signedDate: (updates as any).signedDate,
        fileUrl: (updates as any).fileUrl,
        service: updates.service,
        agreeFee: (updates as any).agreeFee,
        hasSubcon: (updates as any).hasSubcon,
        paymentType: (updates as any).paymentType,
        paymentTypeFinal: (updates as any).paymentTypeFinal,
      });
      setEngagementLetters((prev) => prev.map((el) => (el.id === id ? updated : el)));
    } catch {
      setEngagementLetters((prev) => prev.map((el) => (el.id === id ? current : el)));
    }
  };

  const handleUpdateHandover = async (id: string, updates: Partial<Handover>) => {
    const current = handovers.find((h) => h.id === id);
    if (!current) return;

    setHandovers(handovers.map(h => h.id === id ? { ...h, ...updates } : h));

    try {
      const updated = await leadsService.updateHandover(current.leadId, id, {
        status: (updates as any).status,
        projectId: (updates as any).projectId,
        clientName: updates.clientName,
        projectTitle: updates.projectTitle,
        pm: updates.pm,
        summary: (updates as any).summary,
        deliverables: (updates as any).deliverables,
        notes: (updates as any).notes,
      });
      setHandovers((prev) => prev.map((h) => (h.id === id ? updated : h)));
    } catch {
      setHandovers((prev) => prev.map((h) => (h.id === id ? current : h)));
    }
  };

  const tabs = [
    { id: 'notulensi', label: 'Notulensi Meeting' },
    { id: 'proposal', label: 'Proposal' },
    { id: 'el', label: 'Engagement Letter' },
    { id: 'handover', label: 'Handover Memo' },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
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

        <Card className="hover:border-blue-300 transition-colors">
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
        </Card>
      </div>

      {/* Tabs */}
      <Card>
        <div className="border-b border-gray-200">
          <nav className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-4 border-b-2 transition-colors cursor-pointer ${activeTab === tab.id
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
              leads={fetchedLeads}
              onUpdateProposal={handleUpdateProposal}
            />
          )}

          {activeTab === 'el' && (
            <ELTab
              engagementLetters={waitingELs}
              leads={fetchedLeads}
              onUpdateEngagementLetter={handleUpdateEngagementLetter}
            />
          )}

          {activeTab === 'handover' && (
            <HandoverTab
              handovers={waitingHandovers}
              leads={fetchedLeads}
              proposals={proposals}
              engagementLetters={engagementLetters}
              onUpdateHandover={handleUpdateHandover}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

