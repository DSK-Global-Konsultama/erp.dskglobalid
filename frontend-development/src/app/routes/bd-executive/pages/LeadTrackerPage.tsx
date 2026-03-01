import { useState, useEffect } from 'react';
import { LeadsManagementPage, LeadTrackerDetailPage, leadApi, type LeadStatus } from '../../../../features/leads';
import { leadsService } from '../../../../features/leads/services/leadsService';
import type { Lead, Meeting, Notulensi, Proposal, EngagementLetter, Handover } from '../../../../lib/mock-data';
import type { CEOLead } from '../../../../lib/leadManagementMockData';

interface LeadTrackerPageProps {
  userName: string;
  onLeadDetailChange?: (leadDetail: {
    clientName: string;
    company?: string;
    status: string;
    service?: string;
    source?: string;
    picEmail?: string;
    picPhone?: string;
  } | null) => void;
  onBackFromDetail?: () => void;
  onResetDetail?: (resetFn: () => void) => void;
}

export function LeadTrackerPage({ userName, onLeadDetailChange, onBackFromDetail, onResetDetail }: LeadTrackerPageProps) {
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const [trackerLeads, setTrackerLeads] = useState<CEOLead[]>([]);

  // Backend detail state (replaces mock detail props when available)
  const [detailLead, setDetailLead] = useState<Lead | null>(null);
  const [detailMeetings, setDetailMeetings] = useState<Meeting[]>([]);
  const [detailNotulensi, setDetailNotulensi] = useState<Notulensi[]>([]);
  const [detailProposals, setDetailProposals] = useState<Proposal[]>([]);
  const [detailEngagementLetters, setDetailEngagementLetters] = useState<EngagementLetter[]>([]);
  const [detailHandovers, setDetailHandovers] = useState<Handover[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  // Expose reset function to parent
  useEffect(() => {
    if (onResetDetail) {
      const resetDetail = () => {
        setSelectedLeadId(null);
        if (onLeadDetailChange) {
          onLeadDetailChange(null);
        }
      };
      onResetDetail(resetDetail);
    }
  }, [onResetDetail, onLeadDetailChange]);

  // Load leads for tracker from backend
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await leadsService.getTrackerLeads();
        if (!cancelled) setTrackerLeads(data);
      } catch {
        // Fallback: keep empty (UI can still work with mock below)
        if (!cancelled) setTrackerLeads([]);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  type ExtendedLead = Lead & { service?: string; status: LeadStatus | Lead['status'] };
  const relevantStatuses: LeadStatus[] = ['TO_BE_MEET', 'MEETING_SCHEDULED', 'NEED_NOTULEN', 'NEED_PROPOSAL', 'IN_PROPOSAL', 'PROPOSAL_EXPIRED', 'NEED_ENGAGEMENT_LETTER', 'NEED_HANDOVER', 'IN_HANDOVER'];

  const [leads] = useState<ExtendedLead[]>(() => {
    const { leads: defaultLeads } = leadApi.getTrackerData('Sarah Wijaya');
    return defaultLeads.filter(lead => relevantStatuses.includes(lead.status as LeadStatus)) as ExtendedLead[];
  });
  const [meetings, setMeetings] = useState<Meeting[]>(() => leadApi.getTrackerData('Sarah Wijaya').meetings);
  const [notulensi, setNotulensi] = useState<Notulensi[]>(() => leadApi.getTrackerData('Sarah Wijaya').notulensi);
  const [proposals, setProposals] = useState<Proposal[]>(() => leadApi.getTrackerData('Sarah Wijaya').proposals);
  const [engagementLetters, setEngagementLetters] = useState<EngagementLetter[]>(() => leadApi.getTrackerData('Sarah Wijaya').engagementLetters);
  const [handovers, setHandovers] = useState<Handover[]>(() => leadApi.getTrackerData('Sarah Wijaya').handovers);

  // Load detail from backend when selecting a tracker lead
  useEffect(() => {
    let cancelled = false;

    const loadDetail = async () => {
      if (!selectedLeadId) {
        setDetailLead(null);
        setDetailMeetings([]);
        setDetailNotulensi([]);
        setDetailProposals([]);
        setDetailEngagementLetters([]);
        setDetailHandovers([]);
        setDetailLoading(false);
        return;
      }

      setDetailLoading(true);
      try {
        const detail = await leadsService.getTrackerLeadDetail(selectedLeadId);
        if (cancelled) return;
        setDetailLead(detail.lead);
        setDetailMeetings(detail.meetings);
        setDetailNotulensi(detail.notulensi);
        setDetailProposals(detail.proposals);
        setDetailEngagementLetters(detail.engagementLetters);
        setDetailHandovers(detail.handovers);
      } catch {
        if (cancelled) return;
        // Keep old behavior as fallback if backend detail fails
        setDetailLead(null);
        setDetailMeetings([]);
        setDetailNotulensi([]);
        setDetailProposals([]);
        setDetailEngagementLetters([]);
        setDetailHandovers([]);
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    };

    loadDetail();
    return () => {
      cancelled = true;
    };
  }, [selectedLeadId]);

  // Update lead detail in header when selected lead changes
  useEffect(() => {
    if (selectedLeadId && onLeadDetailChange) {
      // Prefer backend tracker leads (real data); fallback to mock leads
      const backendLead = trackerLeads.find(l => l.id === selectedLeadId);
      if (backendLead) {
        onLeadDetailChange({
          clientName: backendLead.clientName,
          company: backendLead.sourceCampaignName,
          status: backendLead.pipelineStatus,
          service: undefined,
          source: backendLead.sourceChannel,
          picEmail: backendLead.email,
          picPhone: backendLead.phone,
        });
      } else {
        const lead = leads.find(l => l.id === selectedLeadId);
        if (lead) {
          // Get service from lead (if available) or from proposal
          const leadService = lead.service;
          const leadProposal = proposals.find(p => p.leadId === selectedLeadId);
          const service = leadService || leadProposal?.service;

          onLeadDetailChange({
            clientName: lead.clientName,
            company: lead.company,
            status: lead.status,
            service: service,
            source: lead.source,
            picEmail: lead.email,
            picPhone: lead.phone
          });
        }
      }
    } else if (onLeadDetailChange) {
      onLeadDetailChange(null);
    }
  }, [selectedLeadId, leads, proposals, onLeadDetailChange, trackerLeads]);

  const handleAddMeeting = async (meeting: Meeting) => {
    try {
      const created = await leadsService.createMeeting(meeting.leadId, {
        name: meeting.name,
        dateTime: meeting.dateTime,
        location: meeting.location,
        notes: meeting.notes,
        status: meeting.status,
      });
      setMeetings([...meetings, created]);
      if (selectedLeadId) setDetailMeetings((prev) => [...prev, created]);
    } catch {
      // fallback local only
      setMeetings([...meetings, meeting]);
      if (selectedLeadId) setDetailMeetings((prev) => [...prev, meeting]);
    }
  };

  const handleUpdateMeeting = async (id: string, updates: Partial<Meeting>) => {
    const leadId = selectedLeadId || updates.leadId || meetings.find((m) => m.id === id)?.leadId;

    if (leadId) {
      try {
        const updated = await leadsService.updateMeeting(leadId, id, {
          name: updates.name,
          dateTime: updates.dateTime,
          location: updates.location,
          notes: updates.notes,
          status: updates.status,
        });
        setMeetings(meetings.map((m) => (m.id === id ? { ...m, ...updated } : m)));
        setDetailMeetings((prev) => prev.map((m) => (m.id === id ? { ...m, ...updated } : m)));
        return;
      } catch {
        // ignore and fallback to local below
      }
    }

    setMeetings(meetings.map(m => m.id === id ? { ...m, ...updates } : m));
    setDetailMeetings((prev) => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const handleDeleteMeeting = async (id: string) => {
    const leadId = selectedLeadId || meetings.find((m) => m.id === id)?.leadId;

    if (leadId) {
      try {
        await leadsService.deleteMeeting(leadId, id);
      } catch {
        // ignore (still remove locally)
      }
    }

    setMeetings(meetings.filter(m => m.id !== id));
    setDetailMeetings((prev) => prev.filter(m => m.id !== id));
  };

  const handleAddNotulensi = async (newNotulensi: Notulensi) => {
    try {
      const created = await leadsService.createNotulensi(newNotulensi.leadId, {
        meetingId: newNotulensi.meetingId,
        clientName: newNotulensi.clientName,
        status: newNotulensi.status,
        objectives: newNotulensi.objectives,
        nextSteps: newNotulensi.nextSteps,
        notes: newNotulensi.notes,
        payload: {
          meetingInfo: newNotulensi.meetingInfo,
          participants: newNotulensi.participants,
          discussionSummary: newNotulensi.discussionSummary,
          agreements: newNotulensi.agreements,
          actionItems: newNotulensi.actionItems,
        },
      });
      setNotulensi([...notulensi, created]);
      if (selectedLeadId) setDetailNotulensi((prev) => [...prev, created]);
    } catch {
      setNotulensi([...notulensi, newNotulensi]);
      if (selectedLeadId) setDetailNotulensi((prev) => [...prev, newNotulensi]);
    }
  };

  const handleUpdateNotulensi = async (id: string, updates: Partial<Notulensi>) => {
    // optimistic local update
    setNotulensi(notulensi.map(n => n.id === id ? { ...n, ...updates } : n));
    setDetailNotulensi((prev) => prev.map(n => n.id === id ? { ...n, ...updates } : n));

    const current = detailNotulensi.find((n) => n.id === id) || notulensi.find((n) => n.id === id);
    const leadId = current?.leadId || selectedLeadId;
    if (!leadId) return;

    try {
      const updated = await leadsService.updateNotulensi(leadId, id, {
        status: (updates as any).status,
        objectives: updates.objectives,
        nextSteps: updates.nextSteps,
        notes: updates.notes,
        clientName: updates.clientName,
        title: (updates as any).title,
        payload: {
          meetingInfo: (updates as any).meetingInfo,
          participants: (updates as any).participants,
          discussionSummary: (updates as any).discussionSummary,
          agreements: (updates as any).agreements,
          actionItems: (updates as any).actionItems,
          revisionNotes: (updates as any).revisionNotes,
        },
      });

      setNotulensi((prev) => prev.map(n => n.id === id ? updated : n));
      setDetailNotulensi((prev) => prev.map(n => n.id === id ? updated : n));
    } catch {
      // keep optimistic state
    }
  };

  const handleAddProposal = async (proposal: Proposal & { file?: File }) => {
    try {
      const created = await leadsService.createProposal(proposal.leadId, {
        clientName: proposal.clientName,
        service: proposal.service,
        proposalFee: proposal.proposalFee,
        agreeFee: proposal.agreeFee,
        paymentType: proposal.paymentType,
        paymentTypeFinal: proposal.paymentTypeFinal,
        dealDate: proposal.dealDate,
        hasSubcon: proposal.hasSubcon,
        status: proposal.status,
        sentAt: proposal.sentAt,
        file: proposal.file,
      });
      setProposals([...proposals, created]);
      if (selectedLeadId) setDetailProposals((prev) => [...prev, created]);
    } catch {
      setProposals([...proposals, proposal]);
      if (selectedLeadId) setDetailProposals((prev) => [...prev, proposal]);
    }
  };

  const handleUpdateProposal = async (id: string, updates: Partial<Proposal> & { file?: File }) => {
    setProposals(proposals.map(p => p.id === id ? { ...p, ...updates } : p));
    setDetailProposals((prev) => prev.map(p => p.id === id ? { ...p, ...updates } : p));

    const leadId = selectedLeadId || proposals.find(p => p.id === id)?.leadId;
    if (!leadId) return;

    try {
      const updated = await leadsService.updateProposal(leadId, id, updates);
      setProposals(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
      setDetailProposals(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
    } catch {
      // Keep optimistic state
    }
  };

  const safeClientName = (v: any) => (v == null ? '' : String(v));

  const handleAddEngagementLetter = async (el: EngagementLetter) => {
    try {
      const created = await leadsService.createEngagementLetter(el.leadId, {
        clientName: safeClientName(el.clientName),
        service: el.service,
        agreeFee: el.agreeFee,
        hasSubcon: el.hasSubcon,
        paymentType: el.paymentType,
        paymentTypeFinal: el.paymentTypeFinal,
        status: el.status,
        submittedDate: el.submittedDate,
        approvedDate: el.approvedDate,
        sentAt: el.sentAt,
        signedDate: el.signedDate,
        fileUrl: el.fileUrl,
      });
      setEngagementLetters([...engagementLetters, created]);
      if (selectedLeadId) setDetailEngagementLetters((prev) => [...prev, created]);
    } catch {
      setEngagementLetters([...engagementLetters, el]);
      if (selectedLeadId) setDetailEngagementLetters((prev) => [...prev, el]);
    }
  };

  const handleUpdateEngagementLetter = (id: string, updates: Partial<EngagementLetter>) => {
    setEngagementLetters(engagementLetters.map(el => el.id === id ? { ...el, ...updates } : el));
    setDetailEngagementLetters((prev) => prev.map(el => el.id === id ? { ...el, ...updates } : el));
  };

  const handleAddHandover = async (handover: Handover) => {
    try {
      const created = await leadsService.createHandover(handover.leadId, {
        projectId: handover.projectId,
        clientName: handover.clientName,
        projectTitle: handover.projectTitle,
        pm: handover.pm,
        status: handover.status,
        summary: handover.summary,
        deliverables: handover.deliverables,
        notes: handover.notes,
      });
      setHandovers([...handovers, created]);
      if (selectedLeadId) setDetailHandovers((prev) => [...prev, created]);
    } catch {
      setHandovers([...handovers, handover]);
      if (selectedLeadId) setDetailHandovers((prev) => [...prev, handover]);
    }
  };

  const handleUpdateHandover = (id: string, updates: Partial<Handover>) => {
    setHandovers(handovers.map(h => h.id === id ? { ...h, ...updates } : h));
    setDetailHandovers((prev) => prev.map(h => h.id === id ? { ...h, ...updates } : h));
  };

  const handleUpdateLeadStatus = (leadId: string, status: LeadStatus) => {
    // Update lead status in leads array
    // Note: In a real app, this would update state properly
    // For now, this is handled by the parent component or API
    // Update header if this is the selected lead
    if (selectedLeadId === leadId && onLeadDetailChange) {
      const lead = leads.find(l => l.id === leadId);
      if (lead) {
        // Get service from lead (if available) or from proposal
        const leadService = lead.service;
        const leadProposal = proposals.find(p => p.leadId === leadId);
        const service = leadService || leadProposal?.service;

        onLeadDetailChange({
          clientName: lead.clientName,
          company: lead.company,
          status: status,
          service: service,
          source: lead.source,
          picEmail: lead.email,
          picPhone: lead.phone
        });
      }
    }
  };

  const handleBack = () => {
    setSelectedLeadId(null);
    setDetailLead(null);
    setDetailMeetings([]);
    setDetailNotulensi([]);
    setDetailProposals([]);
    setDetailEngagementLetters([]);
    setDetailHandovers([]);

    if (onBackFromDetail) {
      onBackFromDetail();
    }
    if (onLeadDetailChange) {
      onLeadDetailChange(null);
    }
  };

  if (selectedLeadId) {
    if (detailLoading && !detailLead) {
      return <div className="p-6">Loading...</div>;
    }

    const effectiveLeads = detailLead ? [detailLead] : (leads as any);

    return (
      <LeadTrackerDetailPage
        leadId={selectedLeadId}
        onBack={handleBack}
        leads={effectiveLeads as any}
        meetings={(detailLead ? detailMeetings : meetings) as any}
        notulensi={(detailLead ? detailNotulensi : notulensi) as any}
        proposals={(detailLead ? detailProposals : proposals) as any}
        engagementLetters={(detailLead ? detailEngagementLetters : engagementLetters) as any}
        handovers={(detailLead ? detailHandovers : handovers) as any}
        onAddMeeting={handleAddMeeting}
        onUpdateMeeting={handleUpdateMeeting}
        onDeleteMeeting={handleDeleteMeeting}
        onAddNotulensi={handleAddNotulensi}
        onUpdateNotulensi={handleUpdateNotulensi}
        onAddProposal={handleAddProposal}
        onUpdateProposal={handleUpdateProposal}
        onAddEngagementLetter={handleAddEngagementLetter}
        onUpdateEngagementLetter={handleUpdateEngagementLetter}
        onAddHandover={handleAddHandover}
        onUpdateHandover={handleUpdateHandover}
        onUpdateLeadStatus={handleUpdateLeadStatus}
      />
    );
  }

  return (
    <LeadsManagementPage
      userName={userName}
      mode="tracker"
      onLeadClick={setSelectedLeadId}
      leadsOverride={trackerLeads}
    />
  );
}

