// controllers/lead.controller.js
const pool = require('../config/db');

// Helper: ambil identifier user dari JWT payload
function getCurrentUsername(req) {
  if (req.user && req.user.username) return req.user.username;
  if (req.user && req.user.email) return req.user.email;
  if (req.user && req.user.sub) return String(req.user.sub);
  return 'system';
}

const updateLeadPipelineStatusIfNeeded = async (leadId, pipelineStatus) => {
  if (!leadId || !pipelineStatus) return;
  try {
    await pool.query(
      `UPDATE leads SET pipeline_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [pipelineStatus, leadId]
    );
  } catch {
    // ignore best-effort
  }
};

const mapProposalStatusToPipelineStatus = (status) => {
  switch (status) {
    case 'PROPOSAL_EXPIRED':
      return 'PROPOSAL_EXPIRED';
    case 'ACCEPTED':
      return 'NEED_ENGAGEMENT_LETTER';
    case 'SENT':
    case 'APPROVED':
    case 'WAITING_CEO_APPROVAL':
    case 'REVISION':
    case 'DRAFT':
    default:
      return 'IN_PROPOSAL';
  }
};

const mapELStatusToPipelineStatus = (status) => {
  switch (status) {
    case 'SIGNED':
      return 'EL_SIGNED';
    case 'SENT':
    case 'APPROVED':
    case 'WAITING_CEO_APPROVAL':
    case 'REVISION':
    case 'DRAFT':
    default:
      return 'IN_EL';
  }
};

const mapHandoverStatusToPipelineStatus = (status) => {
  switch (status) {
    case 'CONVERTED':
      return 'CONVERTED';
    case 'SENT_TO_PM':
    case 'APPROVED':
    case 'WAITING_CEO_APPROVAL':
    case 'REVISION':
    case 'DRAFT':
    default:
      return 'IN_HANDOVER';
  }
};

// POST /leads/promote-from-bank/:bankDataId
// Promote satu row bank_data_entries menjadi lead + update status PROMOTED_TO_LEAD
exports.promoteFromBankData = async (req, res) => {
  const { bankDataId } = req.params;
  const actor = getCurrentUsername(req);

  if (!bankDataId) {
    return res.status(400).json({ message: 'bankDataId wajib diisi' });
  }

  try {
    // 1) Ambil data bank_data_entries
    const [rows] = await pool.query(
      `SELECT id, campaign_id, form_id, client_name, pic_name, email, phone, source_channel,
              campaign_name, topic_tag, triage_status, extra_answers, notes
       FROM bank_data_entries
       WHERE id = ? LIMIT 1`,
      [bankDataId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Bank data entry tidak ditemukan' });
    }

    const bd = rows[0];

    if (bd.triage_status === 'PROMOTED_TO_LEAD') {
      return res.status(400).json({ message: 'Bank data ini sudah dipromosikan menjadi lead' });
    }

    if (bd.triage_status === 'REJECTED') {
      return res.status(400).json({ message: 'Bank data dengan status REJECTED tidak bisa dipromosikan' });
    }

    // Parse extra_answers (JSON -> object) sebelum dipindah ke leads
    let extraAnswersValue = bd.extra_answers;
    if (typeof extraAnswersValue === 'string') {
      try {
        extraAnswersValue = JSON.parse(extraAnswersValue);
      } catch {
        extraAnswersValue = {};
      }
    } else if (!extraAnswersValue) {
      extraAnswersValue = {};
    }

    const now = new Date();

    // 2) Insert ke tabel leads
    const [insertResult] = await pool.query(
      `INSERT INTO leads
        (bank_data_id, source_type, campaign_id, campaign_name, topic_tag,
         client_name, pic_name, email, phone,
         source_channel, extra_answers,
         ceo_followup_status, pipeline_status,
         promoted_by, promoted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        bd.id,
        'CAMPAIGN_FORM',
        bd.campaign_id,
        bd.campaign_name,
        bd.topic_tag || null,
        bd.client_name,
        bd.pic_name,
        bd.email,
        bd.phone,
        bd.source_channel || null,
        JSON.stringify(extraAnswersValue || {}),
        'FOLLOWUP_PENDING', // masuk ke inbox CEO
        'NEED_PREPITCHING', // default awal pipeline untuk BD Executive
        actor,
        now
      ]
    );

    const leadId = insertResult.insertId;

    // 3) Update bank_data_entries: tandai sudah PROMOTED_TO_LEAD + simpan lead id
    await pool.query(
      `UPDATE bank_data_entries
       SET triage_status = 'PROMOTED_TO_LEAD',
           promoted_to_lead_id = ?,
           promoted_by = ?,
           promoted_at = ?
       WHERE id = ?`,
      [leadId, actor, now, bd.id]
    );

    // 4) Ambil kembali lead yang baru dibuat untuk dikembalikan ke FE
    const [leadRows] = await pool.query(
      `SELECT *
       FROM leads
       WHERE id = ? LIMIT 1`,
      [leadId]
    );

    return res.status(201).json({
      message: 'Berhasil mempromosikan bank data menjadi lead',
      data: leadRows[0]
    });
  } catch (err) {
    console.error('[promoteFromBankData] Error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// GET /leads/ceo-inbox?status=ALL|FOLLOWUP_PENDING|FOLLOWED_UP|DROP
// Data untuk Lead Inbox CEO
exports.getCEOInboxLeads = async (req, res) => {
  const { status } = req.query;

  try {
    let query = `
      SELECT *
      FROM leads
      WHERE 1 = 1
    `;
    const params = [];

    if (status && status !== 'ALL') {
      query += ' AND ceo_followup_status = ?';
      params.push(status);
    }

    query += ' ORDER BY promoted_at DESC, created_at DESC';

    const [rows] = await pool.query(query, params);
    return res.json({ data: rows });
  } catch (err) {
    console.error('[getCEOInboxLeads] Error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// GET /leads/ceo-approvals
// Query: ?types=notulensi,proposal,el,handover (optional)
// Return: minimal lead list used by CEO Approval page
exports.getCEOApprovals = async (req, res) => {
  const { types } = req.query;

  const requested = String(types || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const wantAll = requested.length === 0;
  const wantNotulensi = wantAll || requested.includes('notulensi');
  const wantProposal = wantAll || requested.includes('proposal');
  const wantEL = wantAll || requested.includes('el');
  const wantHandover = wantAll || requested.includes('handover');

  try {
    const clauses = [];

    if (wantNotulensi) {
      clauses.push(`EXISTS (SELECT 1 FROM lead_notulensi n WHERE n.lead_id = l.id AND n.status = 'WAITING_CEO_APPROVAL')`);
    }

    if (wantProposal) {
      clauses.push(`EXISTS (SELECT 1 FROM lead_proposals p WHERE p.lead_id = l.id AND p.status = 'WAITING_CEO_APPROVAL')`);
    }

    if (wantEL) {
      clauses.push(
        `EXISTS (SELECT 1 FROM lead_engagement_letters e WHERE e.lead_id = l.id AND e.status = 'WAITING_CEO_APPROVAL')`
      );
    }

    if (wantHandover) {
      clauses.push(`EXISTS (SELECT 1 FROM lead_handovers h WHERE h.lead_id = l.id AND h.status = 'WAITING_CEO_APPROVAL')`);
    }

    if (clauses.length === 0) {
      return res.json({ data: [] });
    }

    const [rows] = await pool.query(
      `SELECT l.id, l.bank_data_id, l.source_type, l.campaign_id, l.campaign_name, l.topic_tag,
              l.client_name, l.pic_name, l.email, l.phone,
              l.source_channel,
              l.extra_answers,
              l.ceo_followup_status, l.ceo_followup_notes, l.ceo_followup_date,
              l.pipeline_status,
              l.promoted_by, l.promoted_at,
              l.created_at, l.updated_at
       FROM leads l
       WHERE (${clauses.join(' OR ')})
       ORDER BY l.promoted_at DESC, l.created_at DESC`
    );

    return res.json({ data: rows || [] });
  } catch (err) {
    console.error('[getCEOApprovals] Error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// PUT /leads/ceo-inbox/:id/followup
// Body: { status: 'FOLLOWED_UP' | 'DROP', notes?: string }
exports.updateCEOFollowUp = async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  const actor = getCurrentUsername(req);

  if (!id) {
    return res.status(400).json({ message: 'Lead id wajib diisi' });
  }

  const allowed = ['FOLLOWED_UP', 'DROP'];
  if (!status || !allowed.includes(status)) {
    return res
      .status(400)
      .json({ message: `status wajib diisi dan harus salah satu dari: ${allowed.join(', ')}` });
  }

  const now = new Date();

  try {
    const [result] = await pool.query(
      `UPDATE leads
       SET ceo_followup_status = ?,
           ceo_followup_notes = ?,
           ceo_followup_date = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [status, notes || null, now, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Lead tidak ditemukan' });
    }

    const [rows] = await pool.query(
      `SELECT *
       FROM leads
       WHERE id = ? LIMIT 1`,
      [id]
    );

    return res.json({
      message: 'Status follow-up CEO berhasil diupdate',
      data: rows[0]
    });
  } catch (err) {
    console.error('[updateCEOFollowUp] Error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// GET /leads/tracker
// Data untuk Lead Tracker (BD Executive)
// Default: hanya leads yang sudah di-approve CEO (FOLLOWED_UP) dan tidak DROP.
exports.getLeadTrackerLeads = async (req, res) => {
  const { limit, offset } = req.query;

  try {
    let query = `
      SELECT id, bank_data_id, source_type, campaign_id, campaign_name, topic_tag,
             client_name, pic_name, email, phone,
             source_channel,
             extra_answers,
             ceo_followup_status, ceo_followup_notes, ceo_followup_date,
             pipeline_status,
             promoted_by, promoted_at,
             created_at, updated_at
      FROM leads
      WHERE ceo_followup_status = 'FOLLOWED_UP'
        AND (pipeline_status IS NULL OR pipeline_status <> 'DROP')
      ORDER BY promoted_at DESC, created_at DESC
    `;

    const params = [];

    if (limit) {
      query += ' LIMIT ?';
      params.push(parseInt(limit));
      if (offset) {
        query += ' OFFSET ?';
        params.push(parseInt(offset));
      }
    }

    const [rows] = await pool.query(query, params);

    const leadIds = (rows || []).map((r) => r.id);
    if (leadIds.length === 0) {
      return res.json({ data: [] });
    }

    // Fetch related docs in bulk
    const [meetingRows] = await pool.query(
      `SELECT id, lead_id, status, date_time, location, created_at
       FROM lead_meetings
       WHERE lead_id IN (?)
       ORDER BY date_time ASC, created_at ASC`,
      [leadIds]
    );

    const [notulensiRows] = await pool.query(
      `SELECT id, lead_id, status, created_at
       FROM lead_notulensi
       WHERE lead_id IN (?)
       ORDER BY created_at ASC`,
      [leadIds]
    );

    const [proposalRows] = await pool.query(
      `SELECT id, lead_id, status, created_at
       FROM lead_proposals
       WHERE lead_id IN (?)
       ORDER BY created_at ASC`,
      [leadIds]
    );

    const [elRows] = await pool.query(
      `SELECT id, lead_id, status, created_at
       FROM lead_engagement_letters
       WHERE lead_id IN (?)
       ORDER BY created_at ASC`,
      [leadIds]
    );

    const [handoverRows] = await pool.query(
      `SELECT id, lead_id, status, created_at
       FROM lead_handovers
       WHERE lead_id IN (?)
       ORDER BY created_at ASC`,
      [leadIds]
    );

    // Group helper
    const groupByLeadId = (arr) => {
      const map = new Map();
      (arr || []).forEach((it) => {
        const key = String(it.lead_id);
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(it);
      });
      return map;
    };

    const meetingsByLead = groupByLeadId(meetingRows);
    const notulensiByLead = groupByLeadId(notulensiRows);
    const proposalsByLead = groupByLeadId(proposalRows);
    const elsByLead = groupByLeadId(elRows);
    const handoversByLead = groupByLeadId(handoverRows);

    // --- Label mappers (updated to new pipeline nomenclature) ---
    const getHandoverSubstatusLabel = (status) => {
      switch (status) {
        case 'DRAFT':
          return 'Draft';
        case 'WAITING_CEO_APPROVAL':
          return 'Waiting CEO Approval';
        case 'APPROVED':
        case 'SENT_TO_PM':
        case 'CONVERTED':
          return 'Approved';
        case 'REVISION':
          return 'Revision';
        default:
          return 'Not Started';
      }
    };

    const getELSubstatusLabel = (status) => {
      switch (status) {
        case 'DRAFT':
          return 'Not Uploaded';
        case 'WAITING_CEO_APPROVAL':
          return 'Waiting CEO Approval';
        case 'APPROVED':
          return 'Approved';
        case 'SENT':
          return 'Sent to Client';
        case 'SIGNED':
          return 'Signed';
        case 'REVISION':
          return 'Revision';
        default:
          return 'Not Uploaded';
      }
    };

    const getProposalSubstatusLabel = (status) => {
      switch (status) {
        case 'DRAFT':
          return 'Draft';
        case 'WAITING_CEO_APPROVAL':
          return 'Waiting CEO Approval';
        case 'APPROVED':
          return 'Approved';
        case 'SENT':
          return 'Sent to Client';
        case 'ACCEPTED':
          return 'Accepted';
        case 'REVISION':
          return 'Revision';
        case 'PROPOSAL_EXPIRED':
          return 'Expired';
        default:
          return 'Not Started';
      }
    };

    const getNotulenSubstatusLabel = (status) => {
      switch (status) {
        case 'DRAFT':
          return 'Draft';
        case 'WAITING_CEO_APPROVAL':
          return 'Waiting CEO Approval';
        case 'APPROVED':
          return 'Approved';
        case 'REVISION':
          return 'Revision';
        default:
          return 'Not Started';
      }
    };

    const deriveTrackerMeta = (leadId) => {
      const leadMeetings = meetingsByLead.get(String(leadId)) || [];
      const leadNotulensi = notulensiByLead.get(String(leadId)) || [];
      const leadProposals = proposalsByLead.get(String(leadId)) || [];
      const leadELs = elsByLead.get(String(leadId)) || [];
      const leadHandovers = handoversByLead.get(String(leadId)) || [];

      // Handover stage is reachable only after EL accepted (SIGNED)
      const acceptedEL = leadELs.find((el) => el.status === 'SIGNED');
      if (acceptedEL) {
        if (leadHandovers.length === 0) {
          return {
            commercial_stage: 'HANDOVER_NOT_STARTED',
            active_document_label: 'Handover • Not Started',
          };
        }

        const latestHandover = leadHandovers[leadHandovers.length - 1];
        const substatus = getHandoverSubstatusLabel(latestHandover.status);

        const commercial_stage = (() => {
          switch (latestHandover.status) {
            case 'DRAFT':
              return 'HANDOVER_DRAFT';
            case 'WAITING_CEO_APPROVAL':
              return 'HANDOVER_WAITING_CEO_APPROVAL';
            case 'APPROVED':
            case 'SENT_TO_PM':
            case 'CONVERTED':
              return 'HANDOVER_APPROVED';
            case 'REVISION':
              return 'HANDOVER_REVISION';
            default:
              return 'HANDOVER_NOT_STARTED';
          }
        })();

        return {
          commercial_stage,
          active_document_label: `Handover • ${substatus}`,
        };
      }

      // EL stage
      const latestEL = leadELs.length > 0 ? leadELs[leadELs.length - 1] : null;
      if (latestEL) {
        const substatus = getELSubstatusLabel(latestEL.status);
        const commercial_stage = (() => {
          switch (latestEL.status) {
            case 'WAITING_CEO_APPROVAL':
              return 'EL_WAITING_CEO_APPROVAL';
            case 'APPROVED':
              return 'EL_APPROVED';
            case 'SENT':
              return 'EL_SENT_TO_CLIENT';
            case 'SIGNED':
              return 'EL_SIGNED';
            case 'REVISION':
              return 'EL_REVISION';
            case 'DRAFT':
            default:
              return 'EL_NOT_UPLOADED';
          }
        })();

        return {
          commercial_stage,
          active_document_label: `EL • ${substatus}`,
        };
      }

      // Proposal stage
      const latestProposal = leadProposals.length > 0 ? leadProposals[leadProposals.length - 1] : null;
      if (latestProposal) {
        const substatus = getProposalSubstatusLabel(latestProposal.status);
        const commercial_stage = (() => {
          switch (latestProposal.status) {
            case 'WAITING_CEO_APPROVAL':
              return 'PROPOSAL_WAITING_CEO_APPROVAL';
            case 'APPROVED':
              return 'PROPOSAL_APPROVED';
            case 'SENT':
              return 'PROPOSAL_SENT_TO_CLIENT';
            case 'ACCEPTED':
              return 'PROPOSAL_ACCEPTED';
            case 'REVISION':
              return 'PROPOSAL_REVISION';
            case 'DRAFT':
              return 'PROPOSAL_DRAFT';
            default:
              return 'PROPOSAL_NOT_STARTED';
          }
        })();

        return {
          commercial_stage,
          active_document_label: `Proposal • ${substatus}`,
        };
      }

      // Notulen stage
      const latestNotulen = leadNotulensi.length > 0 ? leadNotulensi[leadNotulensi.length - 1] : null;
      if (latestNotulen) {
        const substatus = getNotulenSubstatusLabel(latestNotulen.status);
        const commercial_stage = (() => {
          switch (latestNotulen.status) {
            case 'WAITING_CEO_APPROVAL':
              return 'NOTULEN_WAITING_CEO_APPROVAL';
            case 'APPROVED':
              return 'NOTULEN_APPROVED';
            case 'REVISION':
              return 'NOTULEN_REVISION';
            case 'DRAFT':
              return 'NOTULEN_DRAFT';
            default:
              return 'NOTULEN_NOT_STARTED';
          }
        })();

        return {
          commercial_stage,
          active_document_label: `Notulen • ${substatus}`,
        };
      }

      // Meeting stage
      const latestMeeting = leadMeetings.length > 0 ? leadMeetings[leadMeetings.length - 1] : null;
      if (latestMeeting) {
        if (latestMeeting.status === 'SCHEDULED') {
          return {
            commercial_stage: 'MEETING_SCHEDULED',
            active_document_label: 'Meeting • Scheduled',
          };
        }
        return {
          commercial_stage: 'MEETING_NOT_STARTED',
          active_document_label: 'Meeting • Not Started',
        };
      }

      return {
        commercial_stage: 'MEETING_NOT_STARTED',
        active_document_label: 'Meeting • Not Started',
      };
    };

    // Last activity: best-effort from latest known doc (non-business-critical but useful)
    const deriveLastActivity = (leadId) => {
      const leadMeetings = meetingsByLead.get(String(leadId)) || [];
      const leadNotulensi = notulensiByLead.get(String(leadId)) || [];
      const leadProposals = proposalsByLead.get(String(leadId)) || [];
      const leadELs = elsByLead.get(String(leadId)) || [];
      const leadHandovers = handoversByLead.get(String(leadId)) || [];

      const candidates = [];
      leadMeetings.forEach((m) => candidates.push({ at: m.date_time || m.created_at, label: `Meeting • ${m.status || '-'}` }));
      leadNotulensi.forEach((n) => candidates.push({ at: n.created_at, label: `Notulen • ${n.status || '-'}` }));
      leadProposals.forEach((p) => candidates.push({ at: p.created_at, label: `Proposal • ${p.status || '-'}` }));
      leadELs.forEach((e) => candidates.push({ at: e.created_at, label: `EL • ${e.status || '-'}` }));
      leadHandovers.forEach((h) => candidates.push({ at: h.created_at, label: `Handover • ${h.status || '-'}` }));

      candidates.sort((a, b) => {
        const ta = a.at ? new Date(a.at).getTime() : 0;
        const tb = b.at ? new Date(b.at).getTime() : 0;
        return ta - tb;
      });

      const last = candidates.length > 0 ? candidates[candidates.length - 1] : null;
      return last ? last.label : null;
    };

    const data = rows.map((r) => {
      const meta = deriveTrackerMeta(r.id);
      return {
        ...r,
        commercial_stage: meta.commercial_stage,
        active_document_label: meta.active_document_label,
        last_activity: deriveLastActivity(r.id),
      };
    });

    return res.json({ data });
  } catch (err) {
    console.error('[getLeadTrackerLeads] Error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// GET /leads/tracker/:id
// Detail untuk Lead Tracker: lead + seluruh dokumen terkait (meetings, notulensi, proposals, EL, handovers)
exports.getLeadTrackerDetail = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: 'Lead id wajib diisi' });
  }

  try {
    const [leadRows] = await pool.query(
      `SELECT id, bank_data_id, source_type, campaign_id, campaign_name, topic_tag,
              client_name, pic_name, email, phone,
              source_channel,
              extra_answers,
              ceo_followup_status, ceo_followup_notes, ceo_followup_date,
              pipeline_status,
              promoted_by, promoted_at,
              created_at, updated_at
       FROM leads
       WHERE id = ?
       LIMIT 1`,
      [id]
    );

    if (!leadRows || leadRows.length === 0) {
      return res.status(404).json({ message: 'Lead tidak ditemukan' });
    }

    const lead = leadRows[0];

    // Docs by lead_id
    const [meetingRows] = await pool.query(
      `SELECT id, lead_id, name, date_time, location, status, notes, created_at, updated_at
       FROM lead_meetings
       WHERE lead_id = ?
       ORDER BY date_time ASC, created_at ASC`,
      [id]
    );

    const [notulensiRows] = await pool.query(
      `SELECT id, lead_id, meeting_id, title, client_name, status, objectives, next_steps, notes,
              payload, created_by, approved_by, approved_at, created_at, updated_at
       FROM lead_notulensi
       WHERE lead_id = ?
       ORDER BY created_at ASC`,
      [id]
    );

    const [proposalRows] = await pool.query(
      `SELECT id, lead_id, client_name, service, proposal_fee, agree_fee, payment_type, payment_type_final, deal_date,
              has_subcon, status, sent_at, file_url, payload, created_by, created_at, updated_at
       FROM lead_proposals
       WHERE lead_id = ?
       ORDER BY created_at ASC`,
      [id]
    );

    const [elRows] = await pool.query(
      `SELECT id, lead_id, client_name, service, agree_fee, has_subcon, payment_type, payment_type_final,
              status, submitted_date, approved_date, sent_at, signed_date, file_url, payload, created_by, created_at, updated_at
       FROM lead_engagement_letters
       WHERE lead_id = ?
       ORDER BY created_at ASC`,
      [id]
    );

    const [handoverRows] = await pool.query(
      `SELECT id, lead_id, project_id, client_name, project_title, pm, status, summary, deliverables, notes,
              file_url, sent_at, converted_at, payload, created_by, created_at, updated_at
       FROM lead_handovers
       WHERE lead_id = ?
       ORDER BY created_at ASC`,
      [id]
    );

    return res.json({
      data: {
        lead,
        meetings: meetingRows || [],
        notulensi: notulensiRows || [],
        proposals: proposalRows || [],
        engagementLetters: elRows || [],
        handovers: handoverRows || [],
      },
    });
  } catch (err) {
    console.error('[getLeadTrackerDetail] Error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// POST /leads/:id/meetings
exports.createLeadMeeting = async (req, res) => {
  const { id } = req.params;
  const actor = getCurrentUsername(req);
  const { name, dateTime, location, notes, status } = req.body || {};

  if (!id) return res.status(400).json({ message: 'Lead id wajib diisi' });
  if (!dateTime || !location) return res.status(400).json({ message: 'dateTime dan location wajib diisi' });

  try {
    const [result] = await pool.query(
      `INSERT INTO lead_meetings (lead_id, name, date_time, location, status, notes, created_by, updated_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name || null, dateTime ? new Date(dateTime) : null, location, status || 'SCHEDULED', notes || null, actor, actor]
    );

    // Best-effort update pipeline status to MEETING_SCHEDULED
    await pool.query(
      `UPDATE leads SET pipeline_status = 'MEETING_SCHEDULED', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [id]
    );

    const [rows] = await pool.query(
      `SELECT id, lead_id, name, date_time, location, status, notes, created_at, updated_at
       FROM lead_meetings WHERE id = ? LIMIT 1`,
      [result.insertId]
    );

    return res.status(201).json({ message: 'Meeting created', data: rows[0] });
  } catch (err) {
    console.error('[createLeadMeeting] Error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// PUT /leads/:id/meetings/:meetingId
exports.updateLeadMeeting = async (req, res) => {
  const { id, meetingId } = req.params;
  const actor = getCurrentUsername(req);
  const { name, dateTime, location, notes, status } = req.body || {};

  if (!id || !meetingId) return res.status(400).json({ message: 'Lead id dan meetingId wajib diisi' });

  try {
    const [result] = await pool.query(
      `UPDATE lead_meetings
       SET name = COALESCE(?, name),
           date_time = COALESCE(?, date_time),
           location = COALESCE(?, location),
           notes = COALESCE(?, notes),
           status = COALESCE(?, status),
           updated_by = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND lead_id = ?`,
      [
        name ?? null,
        dateTime ? new Date(dateTime) : null,
        location ?? null,
        notes ?? null,
        status ?? null,
        actor,
        meetingId,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Meeting tidak ditemukan' });
    }

    const [rows] = await pool.query(
      `SELECT id, lead_id, name, date_time, location, status, notes, created_at, updated_at
       FROM lead_meetings WHERE id = ? LIMIT 1`,
      [meetingId]
    );

    return res.json({ message: 'Meeting updated', data: rows[0] });
  } catch (err) {
    console.error('[updateLeadMeeting] Error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// DELETE /leads/:id/meetings/:meetingId
exports.deleteLeadMeeting = async (req, res) => {
  const { id, meetingId } = req.params;
  if (!id || !meetingId) return res.status(400).json({ message: 'Lead id dan meetingId wajib diisi' });

  try {
    const [result] = await pool.query(`DELETE FROM lead_meetings WHERE id = ? AND lead_id = ?`, [meetingId, id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Meeting tidak ditemukan' });
    return res.json({ message: 'Meeting deleted' });
  } catch (err) {
    console.error('[deleteLeadMeeting] Error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// POST /leads/:id/notulensi
exports.createLeadNotulensi = async (req, res) => {
  const { id } = req.params;
  const actor = getCurrentUsername(req);
  const { meetingId, status, payload, objectives, nextSteps, notes, clientName, title } = req.body || {};

  if (!id) return res.status(400).json({ message: 'Lead id wajib diisi' });

  try {
    const [result] = await pool.query(
      `INSERT INTO lead_notulensi (lead_id, meeting_id, title, client_name, status, objectives, next_steps, notes, payload, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        meetingId || null,
        title || null,
        clientName || null,
        status || 'DRAFT',
        objectives || null,
        nextSteps || null,
        notes || null,
        payload ? JSON.stringify(payload) : null,
        actor,
      ]
    );

    // Best-effort update pipeline status to IN_NOTULEN
    await pool.query(`UPDATE leads SET pipeline_status = 'IN_NOTULEN', updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [id]);

    const [rows] = await pool.query(
      `SELECT id, lead_id, meeting_id, title, client_name, status, objectives, next_steps, notes, payload, created_by, created_at, updated_at
       FROM lead_notulensi WHERE id = ? LIMIT 1`,
      [result.insertId]
    );

    return res.status(201).json({ message: 'Notulensi created', data: rows[0] });
  } catch (err) {
    console.error('[createLeadNotulensi] Error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// PUT /leads/:id/notulensi/:notulensiId
exports.updateLeadNotulensi = async (req, res) => {
  const { id, notulensiId } = req.params;
  const actor = getCurrentUsername(req);
  const { status, payload, objectives, nextSteps, notes, clientName, title } = req.body || {};

  if (!id || !notulensiId) {
    return res.status(400).json({ message: 'Lead id dan notulensiId wajib diisi' });
  }

  try {
    const approvedAt = status === 'APPROVED' ? new Date() : null;
    const approvedBy = status === 'APPROVED' ? actor : null;

    // If CEO requests revision, persist the revision notes (if any) into `notes` so BD Executive can see it.
    const normalizedNotes =
      status === 'REVISION' && payload && typeof payload === 'object' && payload.revisionNotes
        ? JSON.stringify({
          revisionNotes: payload.revisionNotes,
          originalNotes: notes ?? null,
        })
        : notes;

    const [result] = await pool.query(
      `UPDATE lead_notulensi
       SET status = COALESCE(?, status),
           title = COALESCE(?, title),
           client_name = COALESCE(?, client_name),
           objectives = COALESCE(?, objectives),
           next_steps = COALESCE(?, next_steps),
           notes = COALESCE(?, notes),
           payload = COALESCE(?, payload),
           approved_at = COALESCE(?, approved_at),
           approved_by = COALESCE(?, approved_by),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND lead_id = ?`,
      [
        status ?? null,
        title ?? null,
        clientName ?? null,
        objectives ?? null,
        nextSteps ?? null,
        normalizedNotes ?? null,
        payload ? JSON.stringify(payload) : null,
        approvedAt,
        approvedBy,
        notulensiId,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Notulensi tidak ditemukan' });
    }

    // Pipeline progression: once approved, next is NEED_PROPOSAL
    if (status === 'APPROVED') {
      await updateLeadPipelineStatusIfNeeded(id, 'NEED_PROPOSAL');
    } else {
      await updateLeadPipelineStatusIfNeeded(id, 'IN_NOTULEN');
    }

    const [rows] = await pool.query(
      `SELECT id, lead_id, meeting_id, title, client_name, status, objectives, next_steps, notes,
              payload, created_by, approved_by, approved_at, created_at, updated_at
       FROM lead_notulensi WHERE id = ? LIMIT 1`,
      [notulensiId]
    );

    return res.json({ message: 'Notulensi updated', data: rows[0] });
  } catch (err) {
    console.error('[updateLeadNotulensi] Error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// POST /leads/:id/proposals
exports.createLeadProposal = async (req, res) => {
  const { id } = req.params;
  const actor = getCurrentUsername(req);
  const {
    clientName,
    service,
    proposalFee,
    agreeFee,
    paymentType,
    paymentTypeFinal,
    dealDate,
    hasSubcon,
    status,
    sentAt,
    fileUrl: bodyFileUrl,
    payload,
  } = req.body || {};

  // if file is uploaded, construct fileUrl
  const fileUrl = req.file ? `/uploads/proposal/${req.file.filename}` : bodyFileUrl;

  if (!id) return res.status(400).json({ message: 'Lead id wajib diisi' });

  try {
    const [result] = await pool.query(
      `INSERT INTO lead_proposals
        (lead_id, client_name, service, proposal_fee, agree_fee, payment_type, payment_type_final, deal_date,
         has_subcon, status, sent_at, file_url, payload, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        clientName || null,
        service || null,
        proposalFee != null ? proposalFee : null,
        agreeFee != null ? agreeFee : null,
        paymentType || null,
        paymentTypeFinal || null,
        dealDate || null,
        hasSubcon ? 1 : 0,
        status || 'DRAFT',
        sentAt ? new Date(sentAt) : null,
        fileUrl || null,
        payload ? JSON.stringify(payload) : null,
        actor,
      ]
    );

    // Update pipeline status based on proposal status (best-effort)
    try {
      await updateLeadPipelineStatusIfNeeded(id, mapProposalStatusToPipelineStatus(status || 'DRAFT'));
    } catch {
      // ignore best-effort
    }

    const [rows] = await pool.query(
      `SELECT id, lead_id, client_name, service, proposal_fee, agree_fee, payment_type, payment_type_final, deal_date,
              has_subcon, status, sent_at, file_url, payload, created_by, created_at, updated_at
       FROM lead_proposals WHERE id = ? LIMIT 1`,
      [result.insertId]
    );

    return res.status(201).json({ message: 'Proposal created', data: rows[0] });
  } catch (err) {
    console.error('[createLeadProposal] Error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// PUT /leads/:id/proposals/:proposalId
exports.updateLeadProposal = async (req, res) => {
  const { id, proposalId } = req.params;
  const actor = getCurrentUsername(req);
  const {
    clientName,
    service,
    proposalFee,
    agreeFee,
    paymentType,
    paymentTypeFinal,
    dealDate,
    hasSubcon,
    status,
    sentAt,
    fileUrl: bodyFileUrl,
    revisionNotes,
    payload,
  } = req.body || {};

  // NOTE: when multipart/form-data is used, req.body values may be strings.
  const fileUrl = req.file ? `/uploads/proposal/${req.file.filename}` : bodyFileUrl;

  if (!id || !proposalId) {
    return res.status(400).json({ message: 'Lead id dan proposalId wajib diisi' });
  }

  // Helper: do not overwrite existing column when field is not provided.
  // We must pass NULL to COALESCE when we want to keep existing value, and pass
  // actual NULL only when caller explicitly sends null.
  const keepIfUndefined = (v) => (v === undefined ? null : v);

  // Helper: allow explicit null to clear. If not provided, keep existing.
  const dateOrKeep = (v) => {
    if (v === undefined) return null;
    if (v === null || v === '') return null; // explicit clear
    return new Date(v);
  };

  // numeric parsing best-effort (form-data may send numbers as strings)
  const numOrKeep = (v) => {
    if (v === undefined) return null;
    if (v === null || v === '') return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const boolOrKeep = (v) => {
    if (v === undefined) return null;
    if (v === null) return null;
    if (typeof v === 'boolean') return v ? 1 : 0;
    // accept 'true'/'false'/'1'/'0'
    const s = String(v).toLowerCase();
    if (s === 'true' || s === '1') return 1;
    if (s === 'false' || s === '0') return 0;
    return null;
  };

  try {
    const [result] = await pool.query(
      `UPDATE lead_proposals
       SET client_name = COALESCE(?, client_name),
           service = COALESCE(?, service),
           proposal_fee = COALESCE(?, proposal_fee),
           agree_fee = COALESCE(?, agree_fee),
           payment_type = COALESCE(?, payment_type),
           payment_type_final = COALESCE(?, payment_type_final),
           deal_date = COALESCE(?, deal_date),
           has_subcon = COALESCE(?, has_subcon),
           status = COALESCE(?, status),
           sent_at = COALESCE(?, sent_at),
           file_url = COALESCE(?, file_url),
           revision_notes = COALESCE(?, revision_notes),
           payload = COALESCE(?, payload),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND lead_id = ?`,
      [
        keepIfUndefined(clientName),
        keepIfUndefined(service),
        proposalFee === undefined ? null : numOrKeep(proposalFee),
        agreeFee === undefined ? null : numOrKeep(agreeFee),
        keepIfUndefined(paymentType),
        keepIfUndefined(paymentTypeFinal),
        keepIfUndefined(dealDate),
        hasSubcon === undefined ? null : boolOrKeep(hasSubcon),
        keepIfUndefined(status),
        dateOrKeep(sentAt),
        keepIfUndefined(fileUrl),
        revisionNotes === undefined ? null : revisionNotes, // allow explicit null to clear
        payload === undefined ? null : (payload ? JSON.stringify(payload) : null),
        proposalId,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Proposal tidak ditemukan' });
    }

    if (status) {
      await updateLeadPipelineStatusIfNeeded(id, mapProposalStatusToPipelineStatus(status));
    }

    const [rows] = await pool.query(
      `SELECT id, lead_id, client_name, service, proposal_fee, agree_fee, payment_type, payment_type_final, deal_date,
              has_subcon, status, sent_at, file_url, revision_notes, payload, created_by, created_at, updated_at
       FROM lead_proposals WHERE id = ? LIMIT 1`,
      [proposalId]
    );

    return res.json({ message: 'Proposal updated', data: rows[0] });
  } catch (err) {
    console.error('[updateLeadProposal] Error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// POST /leads/:id/engagement-letters
exports.createLeadEngagementLetter = async (req, res) => {
  const { id } = req.params;
  const actor = getCurrentUsername(req);
  const {
    clientName,
    service,
    agreeFee,
    hasSubcon,
    paymentType,
    paymentTypeFinal,
    status,
    submittedDate,
    approvedDate,
    sentAt,
    signedDate,
    fileUrl,
    payload,
  } = req.body || {};

  if (!id) return res.status(400).json({ message: 'Lead id wajib diisi' });

  try {
    const [result] = await pool.query(
      `INSERT INTO lead_engagement_letters
        (lead_id, client_name, service, agree_fee, has_subcon, payment_type, payment_type_final,
         status, submitted_date, approved_date, sent_at, signed_date, file_url, payload, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        clientName || null,
        service || null,
        agreeFee != null ? agreeFee : null,
        hasSubcon ? 1 : 0,
        paymentType || null,
        paymentTypeFinal || null,
        status || 'DRAFT',
        submittedDate ? new Date(submittedDate) : null,
        approvedDate ? new Date(approvedDate) : null,
        sentAt ? new Date(sentAt) : null,
        signedDate ? new Date(signedDate) : null,
        fileUrl || null,
        payload ? JSON.stringify(payload) : null,
        actor,
      ]
    );

    // Best-effort update pipeline status to IN_EL
    await pool.query(`UPDATE leads SET pipeline_status = 'IN_EL', updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [id]);

    const [rows] = await pool.query(
      `SELECT id, lead_id, client_name, service, agree_fee, has_subcon, payment_type, payment_type_final,
              status, submitted_date, approved_date, sent_at, signed_date, file_url, payload, created_by, created_at, updated_at
       FROM lead_engagement_letters WHERE id = ? LIMIT 1`,
      [result.insertId]
    );

    return res.status(201).json({ message: 'Engagement Letter created', data: rows[0] });
  } catch (err) {
    console.error('[createLeadEngagementLetter] Error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// PUT /leads/:id/engagement-letters/:elId
exports.updateLeadEngagementLetter = async (req, res) => {
  const { id, elId } = req.params;
  const actor = getCurrentUsername(req);
  const {
    clientName,
    service,
    agreeFee,
    hasSubcon,
    paymentType,
    paymentTypeFinal,
    status,
    submittedDate,
    approvedDate,
    sentAt,
    signedDate,
    fileUrl,
    payload,
  } = req.body || {};

  if (!id || !elId) {
    return res.status(400).json({ message: 'Lead id dan elId wajib diisi' });
  }

  try {
    const [result] = await pool.query(
      `UPDATE lead_engagement_letters
       SET client_name = COALESCE(?, client_name),
           service = COALESCE(?, service),
           agree_fee = COALESCE(?, agree_fee),
           has_subcon = COALESCE(?, has_subcon),
           payment_type = COALESCE(?, payment_type),
           payment_type_final = COALESCE(?, payment_type_final),
           status = COALESCE(?, status),
           submitted_date = COALESCE(?, submitted_date),
           approved_date = COALESCE(?, approved_date),
           sent_at = COALESCE(?, sent_at),
           signed_date = COALESCE(?, signed_date),
           file_url = COALESCE(?, file_url),
           payload = COALESCE(?, payload),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND lead_id = ?`,
      [
        clientName ?? null,
        service ?? null,
        agreeFee != null ? agreeFee : null,
        hasSubcon != null ? (hasSubcon ? 1 : 0) : null,
        paymentType ?? null,
        paymentTypeFinal ?? null,
        status ?? null,
        submittedDate ? new Date(submittedDate) : null,
        approvedDate ? new Date(approvedDate) : null,
        sentAt ? new Date(sentAt) : null,
        signedDate ? new Date(signedDate) : null,
        fileUrl ?? null,
        payload ? JSON.stringify(payload) : null,
        elId,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Engagement Letter tidak ditemukan' });
    }

    if (status) {
      await updateLeadPipelineStatusIfNeeded(id, mapELStatusToPipelineStatus(status));
      // When signed, next step is NEED_HANDOVER
      if (status === 'SIGNED') {
        await updateLeadPipelineStatusIfNeeded(id, 'NEED_HANDOVER');
      }
    }

    const [rows] = await pool.query(
      `SELECT id, lead_id, client_name, service, agree_fee, has_subcon, payment_type, payment_type_final,
              status, submitted_date, approved_date, sent_at, signed_date, file_url, payload, created_by, created_at, updated_at
       FROM lead_engagement_letters WHERE id = ? LIMIT 1`,
      [elId]
    );

    return res.json({ message: 'Engagement Letter updated', data: rows[0] });
  } catch (err) {
    console.error('[updateLeadEngagementLetter] Error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// POST /leads/:id/handovers
exports.createLeadHandover = async (req, res) => {
  const { id } = req.params;
  const actor = getCurrentUsername(req);
  const {
    projectId,
    clientName,
    projectTitle,
    pm,
    status,
    summary,
    deliverables,
    notes,
    sentAt,
    convertedAt,
    fileUrl,
    payload,
  } = req.body || {};

  if (!id) return res.status(400).json({ message: 'Lead id wajib diisi' });

  try {
    const [result] = await pool.query(
      `INSERT INTO lead_handovers
        (lead_id, project_id, client_name, project_title, pm, status, summary, deliverables, notes, sent_at, converted_at, file_url, payload, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        projectId || null,
        clientName || null,
        projectTitle || null,
        pm || null,
        status || 'DRAFT',
        summary || null,
        deliverables ? JSON.stringify(deliverables) : null,
        notes || null,
        sentAt ? new Date(sentAt) : null,
        convertedAt ? new Date(convertedAt) : null,
        fileUrl || null,
        payload ? JSON.stringify(payload) : null,
        actor,
      ]
    );

    // Best-effort update pipeline status to IN_HANDOVER
    await pool.query(`UPDATE leads SET pipeline_status = 'IN_HANDOVER', updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [id]);

    const [rows] = await pool.query(
      `SELECT id, lead_id, project_id, client_name, project_title, pm, status, summary, deliverables, notes,
              sent_at, converted_at, file_url, payload, created_by, created_at, updated_at
       FROM lead_handovers WHERE id = ? LIMIT 1`,
      [result.insertId]
    );

    return res.status(201).json({ message: 'Handover created', data: rows[0] });
  } catch (err) {
    console.error('[createLeadHandover] Error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// PUT /leads/:id/handovers/:handoverId
exports.updateLeadHandover = async (req, res) => {
  const { id, handoverId } = req.params;
  const actor = getCurrentUsername(req);
  const {
    projectId,
    clientName,
    projectTitle,
    pm,
    status,
    summary,
    deliverables,
    notes,
    sentAt,
    convertedAt,
    fileUrl,
    payload,
  } = req.body || {};

  if (!id || !handoverId) {
    return res.status(400).json({ message: 'Lead id dan handoverId wajib diisi' });
  }

  try {
    const [result] = await pool.query(
      `UPDATE lead_handovers
       SET project_id = COALESCE(?, project_id),
           client_name = COALESCE(?, client_name),
           project_title = COALESCE(?, project_title),
           pm = COALESCE(?, pm),
           status = COALESCE(?, status),
           summary = COALESCE(?, summary),
           deliverables = COALESCE(?, deliverables),
           notes = COALESCE(?, notes),
           sent_at = COALESCE(?, sent_at),
           converted_at = COALESCE(?, converted_at),
           file_url = COALESCE(?, file_url),
           payload = COALESCE(?, payload),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND lead_id = ?`,
      [
        projectId || null,
        clientName ?? null,
        projectTitle ?? null,
        pm ?? null,
        status ?? null,
        summary ?? null,
        deliverables ? JSON.stringify(deliverables) : null,
        notes ?? null,
        sentAt ? new Date(sentAt) : null,
        convertedAt ? new Date(convertedAt) : null,
        fileUrl ?? null,
        payload ? JSON.stringify(payload) : null,
        handoverId,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Handover tidak ditemukan' });
    }

    if (status) {
      await updateLeadPipelineStatusIfNeeded(id, mapHandoverStatusToPipelineStatus(status));
    }

    const [rows] = await pool.query(
      `SELECT id, lead_id, project_id, client_name, project_title, pm, status, summary, deliverables, notes,
              sent_at, converted_at, file_url, payload, created_by, created_at, updated_at
       FROM lead_handovers WHERE id = ? LIMIT 1`,
      [handoverId]
    );

    return res.json({ message: 'Handover updated', data: rows[0] });
  } catch (err) {
    console.error('[updateLeadHandover] Error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

