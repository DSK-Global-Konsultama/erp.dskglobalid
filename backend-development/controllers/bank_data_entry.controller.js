// controllers/bank_data_entry.controller.js
const pool = require('../config/db');
const crypto = require('crypto');

// GET /bank-data-entries
exports.getAllBankDataEntries = async (req, res) => {
  const { campaign_id, form_id, triage_status, limit, offset } = req.query;

  try {
    let query = `
      SELECT id, campaign_id, form_id, client_name, pic_name, email, phone, source_channel, 
             campaign_name, topic_tag, triage_status, extra_answers, notes, cleaned_by, cleaned_at, 
             rejected_by, rejected_at, rejected_reason, promoted_to_lead_id, promoted_by, promoted_at, 
             submitted_at, created_at, updated_at 
      FROM bank_data_entries 
      WHERE 1=1
    `;
    const params = [];

    if (campaign_id) {
      query += ' AND campaign_id = ?';
      params.push(campaign_id);
    }
    if (form_id) {
      query += ' AND form_id = ?';
      params.push(form_id);
    }
    if (triage_status) {
      query += ' AND triage_status = ?';
      params.push(triage_status);
    }

    query += ' ORDER BY submitted_at DESC, created_at DESC';

    if (limit) {
      query += ' LIMIT ?';
      params.push(parseInt(limit));
      if (offset) {
        query += ' OFFSET ?';
        params.push(parseInt(offset));
      }
    }

    const [rows] = await pool.query(query, params);
    return res.json({ data: rows });
  } catch (err) {
    console.error('[getAllBankDataEntries] Error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// GET /bank-data-entries/:id
exports.getBankDataEntryById = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT id, campaign_id, form_id, client_name, pic_name, email, phone, source_channel, 
              campaign_name, topic_tag, triage_status, extra_answers, notes, cleaned_by, cleaned_at, 
              rejected_by, rejected_at, rejected_reason, promoted_to_lead_id, promoted_by, promoted_at, 
              submitted_at, created_at, updated_at 
       FROM bank_data_entries 
       WHERE id = ? LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Bank data entry tidak ditemukan' });
    }

    return res.json({ data: rows[0] });
  } catch (err) {
    console.error('[getBankDataEntryById] Error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// POST /bank-data-entries
exports.createBankDataEntry = async (req, res) => {
  const {
    campaign_id,
    form_id,
    client_name,
    pic_name,
    email,
    phone,
    source_channel,
    campaign_name,
    topic_tag,
    triage_status,
    extra_answers,
    notes,
    submitted_at
  } = req.body;

  if (!campaign_id || !form_id || !client_name || !pic_name || !email || !phone || !source_channel || !campaign_name || !triage_status) {
    return res.status(400).json({
      message: 'campaign_id, form_id, client_name, pic_name, email, phone, source_channel, campaign_name, dan triage_status wajib diisi'
    });
  }

  // Validate enum values
  const validChannels = ['INSTAGRAM', 'LINKEDIN', 'WEBSITE', 'SEMINAR', 'WEBINAR', 'BREVET'];
  const validStatuses = ['RAW_NEW', 'REJECTED', 'PROMOTED_TO_LEAD'];

  if (!validChannels.includes(source_channel)) {
    return res.status(400).json({ message: `source_channel harus salah satu dari: ${validChannels.join(', ')}` });
  }
  if (!validStatuses.includes(triage_status)) {
    return res.status(400).json({ message: `triage_status harus salah satu dari: ${validStatuses.join(', ')}` });
  }

  // Validate campaign_form exists
  const [campaignFormCheck] = await pool.query(
    'SELECT campaign_id, form_id FROM campaign_forms WHERE campaign_id = ? AND form_id = ?',
    [campaign_id, form_id]
  );
  if (campaignFormCheck.length === 0) {
    return res.status(404).json({ message: 'Campaign form tidak ditemukan' });
  }

  const id = crypto.randomUUID();

  try {
    // Parse extra_answers if it's a string
    let extraAnswersValue = extra_answers;
    if (typeof extra_answers === 'string') {
      try {
        extraAnswersValue = JSON.parse(extra_answers);
      } catch (e) {
        return res.status(400).json({ message: 'extra_answers harus berupa JSON yang valid' });
      }
    }

    await pool.query(
      `INSERT INTO bank_data_entries 
       (id, campaign_id, form_id, client_name, pic_name, email, phone, source_channel, campaign_name, 
        topic_tag, triage_status, extra_answers, notes, submitted_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        campaign_id,
        form_id,
        client_name,
        pic_name,
        email,
        phone,
        source_channel,
        campaign_name,
        topic_tag || null,
        triage_status,
        JSON.stringify(extraAnswersValue || {}),
        notes || null,
        submitted_at || new Date()
      ]
    );

    const [rows] = await pool.query(
      `SELECT id, campaign_id, form_id, client_name, pic_name, email, phone, source_channel, 
              campaign_name, topic_tag, triage_status, extra_answers, notes, cleaned_by, cleaned_at, 
              rejected_by, rejected_at, rejected_reason, promoted_to_lead_id, promoted_by, promoted_at, 
              submitted_at, created_at, updated_at 
       FROM bank_data_entries 
       WHERE id = ? LIMIT 1`,
      [id]
    );

    return res.status(201).json({
      message: 'Bank data entry berhasil dibuat',
      data: rows[0]
    });
  } catch (err) {
    console.error('[createBankDataEntry] Error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// PUT /bank-data-entries/:id
exports.updateBankDataEntry = async (req, res) => {
  const { id } = req.params;
  const {
    client_name,
    pic_name,
    email,
    phone,
    source_channel,
    campaign_name,
    topic_tag,
    triage_status,
    extra_answers,
    notes,
    cleaned_by,
    cleaned_at,
    rejected_by,
    rejected_at,
    rejected_reason,
    promoted_to_lead_id,
    promoted_by,
    promoted_at
  } = req.body;

  const fields = [];
  const values = [];

  if (client_name !== undefined) {
    fields.push('client_name = ?');
    values.push(client_name);
  }
  if (pic_name !== undefined) {
    fields.push('pic_name = ?');
    values.push(pic_name);
  }
  if (email !== undefined) {
    fields.push('email = ?');
    values.push(email);
  }
  if (phone !== undefined) {
    fields.push('phone = ?');
    values.push(phone);
  }
  if (source_channel !== undefined) {
    const validChannels = ['INSTAGRAM', 'LINKEDIN', 'WEBSITE', 'SEMINAR', 'WEBINAR', 'BREVET'];
    if (!validChannels.includes(source_channel)) {
      return res.status(400).json({ message: `source_channel harus salah satu dari: ${validChannels.join(', ')}` });
    }
    fields.push('source_channel = ?');
    values.push(source_channel);
  }
  if (campaign_name !== undefined) {
    fields.push('campaign_name = ?');
    values.push(campaign_name);
  }
  if (topic_tag !== undefined) {
    fields.push('topic_tag = ?');
    values.push(topic_tag);
  }
  if (triage_status !== undefined) {
    const validStatuses = ['RAW_NEW', 'REJECTED', 'PROMOTED_TO_LEAD'];
    if (!validStatuses.includes(triage_status)) {
      return res.status(400).json({ message: `triage_status harus salah satu dari: ${validStatuses.join(', ')}` });
    }
    fields.push('triage_status = ?');
    values.push(triage_status);
  }
  if (extra_answers !== undefined) {
    let extraAnswersValue = extra_answers;
    if (typeof extra_answers === 'string') {
      try {
        extraAnswersValue = JSON.parse(extra_answers);
      } catch (e) {
        return res.status(400).json({ message: 'extra_answers harus berupa JSON yang valid' });
      }
    }
    fields.push('extra_answers = ?');
    values.push(JSON.stringify(extraAnswersValue || {}));
  }
  if (notes !== undefined) {
    fields.push('notes = ?');
    values.push(notes);
  }
  if (cleaned_by !== undefined) {
    fields.push('cleaned_by = ?');
    values.push(cleaned_by);
  }
  if (cleaned_at !== undefined) {
    fields.push('cleaned_at = ?');
    values.push(cleaned_at);
  }
  if (rejected_by !== undefined) {
    fields.push('rejected_by = ?');
    values.push(rejected_by);
  }
  if (rejected_at !== undefined) {
    fields.push('rejected_at = ?');
    values.push(rejected_at);
  }
  if (rejected_reason !== undefined) {
    fields.push('rejected_reason = ?');
    values.push(rejected_reason);
  }
  if (promoted_to_lead_id !== undefined) {
    fields.push('promoted_to_lead_id = ?');
    values.push(promoted_to_lead_id);
  }
  if (promoted_by !== undefined) {
    fields.push('promoted_by = ?');
    values.push(promoted_by);
  }
  if (promoted_at !== undefined) {
    fields.push('promoted_at = ?');
    values.push(promoted_at);
  }

  if (fields.length === 0) {
    return res.status(400).json({ message: 'Tidak ada field yang diupdate' });
  }

  values.push(id);

  try {
    const [result] = await pool.query(
      `UPDATE bank_data_entries SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Bank data entry tidak ditemukan' });
    }

    const [rows] = await pool.query(
      `SELECT id, campaign_id, form_id, client_name, pic_name, email, phone, source_channel, 
              campaign_name, topic_tag, triage_status, extra_answers, notes, cleaned_by, cleaned_at, 
              rejected_by, rejected_at, rejected_reason, promoted_to_lead_id, promoted_by, promoted_at, 
              submitted_at, created_at, updated_at 
       FROM bank_data_entries 
       WHERE id = ? LIMIT 1`,
      [id]
    );

    return res.json({
      message: 'Bank data entry berhasil diupdate',
      data: rows[0]
    });
  } catch (err) {
    console.error('[updateBankDataEntry] Error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// DELETE /bank-data-entries/:id
exports.deleteBankDataEntry = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query('DELETE FROM bank_data_entries WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Bank data entry tidak ditemukan' });
    }

    return res.json({ message: 'Bank data entry berhasil dihapus' });
  } catch (err) {
    console.error('[deleteBankDataEntry] Error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

