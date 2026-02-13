// controllers/campaign.controller.js
const pool = require('../config/db');

// GET /campaigns
exports.getAllCampaigns = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, type, channel, topic_tag, date_start, date_end, notes, status, created_by, created_at, updated_at 
       FROM campaigns 
       ORDER BY created_at DESC`
    );
    return res.json({ data: rows });
  } catch (err) {
    console.error('[getAllCampaigns] Error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// GET /campaigns/:id
exports.getCampaignById = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT id, name, type, channel, topic_tag, date_start, date_end, notes, status, created_by, created_at, updated_at 
       FROM campaigns 
       WHERE id = ? LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Campaign tidak ditemukan' });
    }

    return res.json({ data: rows[0] });
  } catch (err) {
    console.error('[getCampaignById] Error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// POST /campaigns
exports.createCampaign = async (req, res) => {
  const { name, type, channel, topic_tag, date_start, date_end, notes, status } = req.body;
  const created_by = req.user?.full_name || req.user?.username || req.user?.email || 'system';

  if (!name || !type || !channel || !status) {
    return res.status(400).json({
      message: 'name, type, channel, dan status wajib diisi'
    });
  }

  // Validate enum values
  const validTypes = ['SOCIAL_MEDIA', 'FREEBIE', 'EVENT'];
  const validChannels = ['INSTAGRAM', 'LINKEDIN', 'WEBSITE', 'SEMINAR', 'WEBINAR', 'BREVET'];
  const validStatuses = ['ACTIVE', 'PAUSED', 'ENDED'];

  if (!validTypes.includes(type)) {
    return res.status(400).json({ message: `type harus salah satu dari: ${validTypes.join(', ')}` });
  }
  if (!validChannels.includes(channel)) {
    return res.status(400).json({ message: `channel harus salah satu dari: ${validChannels.join(', ')}` });
  }
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: `status harus salah satu dari: ${validStatuses.join(', ')}` });
  }

  try {
    // Generate numeric ID (auto-increment style)
    const [maxRows] = await pool.query('SELECT COALESCE(MAX(CAST(id AS UNSIGNED)), 0) as max_id FROM campaigns');
    const nextId = (parseInt(maxRows[0].max_id) + 1).toString();

    await pool.query(
      `INSERT INTO campaigns (id, name, type, channel, topic_tag, date_start, date_end, notes, status, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nextId, name, type, channel, topic_tag || null, date_start || null, date_end || null, notes || null, status, created_by]
    );

    const [rows] = await pool.query(
      `SELECT id, name, type, channel, topic_tag, date_start, date_end, notes, status, created_by, created_at, updated_at 
       FROM campaigns 
       WHERE id = ? LIMIT 1`,
      [nextId]
    );

    return res.status(201).json({
      message: 'Campaign berhasil dibuat',
      data: rows[0]
    });
  } catch (err) {
    console.error('[createCampaign] Error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// PUT /campaigns/:id
exports.updateCampaign = async (req, res) => {
  const { id } = req.params;
  const { name, type, channel, topic_tag, date_start, date_end, notes, status } = req.body;

  const fields = [];
  const values = [];

  if (name !== undefined) {
    fields.push('name = ?');
    values.push(name);
  }
  if (type !== undefined) {
    const validTypes = ['SOCIAL_MEDIA', 'FREEBIE', 'EVENT'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: `type harus salah satu dari: ${validTypes.join(', ')}` });
    }
    fields.push('type = ?');
    values.push(type);
  }
  if (channel !== undefined) {
    const validChannels = ['INSTAGRAM', 'LINKEDIN', 'WEBSITE', 'SEMINAR', 'WEBINAR', 'BREVET'];
    if (!validChannels.includes(channel)) {
      return res.status(400).json({ message: `channel harus salah satu dari: ${validChannels.join(', ')}` });
    }
    fields.push('channel = ?');
    values.push(channel);
  }
  if (topic_tag !== undefined) {
    fields.push('topic_tag = ?');
    values.push(topic_tag);
  }
  if (date_start !== undefined) {
    fields.push('date_start = ?');
    values.push(date_start);
  }
  if (date_end !== undefined) {
    fields.push('date_end = ?');
    values.push(date_end);
  }
  if (notes !== undefined) {
    fields.push('notes = ?');
    values.push(notes);
  }
  if (status !== undefined) {
    const validStatuses = ['ACTIVE', 'PAUSED', 'ENDED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `status harus salah satu dari: ${validStatuses.join(', ')}` });
    }
    fields.push('status = ?');
    values.push(status);
  }

  if (fields.length === 0) {
    return res.status(400).json({ message: 'Tidak ada field yang diupdate' });
  }

  values.push(id);

  try {
    const [result] = await pool.query(
      `UPDATE campaigns SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Campaign tidak ditemukan' });
    }

    const [rows] = await pool.query(
      `SELECT id, name, type, channel, topic_tag, date_start, date_end, notes, status, created_by, created_at, updated_at 
       FROM campaigns 
       WHERE id = ? LIMIT 1`,
      [id]
    );

    return res.json({
      message: 'Campaign berhasil diupdate',
      data: rows[0]
    });
  } catch (err) {
    console.error('[updateCampaign] Error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// DELETE /campaigns/:id
exports.deleteCampaign = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query('DELETE FROM campaigns WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Campaign tidak ditemukan' });
    }

    return res.json({ message: 'Campaign berhasil dihapus' });
  } catch (err) {
    console.error('[deleteCampaign] Error:', err);

    if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_ROW_IS_REFERENCED') {
      return res.status(409).json({ message: 'Campaign masih digunakan oleh form atau bank data entry' });
    }

    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

