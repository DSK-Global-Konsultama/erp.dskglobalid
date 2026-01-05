// controllers/campaign_form.controller.js
const pool = require('../config/db');

// GET /campaign-forms?campaign_id=xxx or ?form_id=xxx
exports.getAllCampaignForms = async (req, res) => {
  const { campaign_id, form_id } = req.query;

  try {
    let query = 'SELECT campaign_id, form_id FROM campaign_forms WHERE 1=1';
    const params = [];

    if (campaign_id) {
      query += ' AND campaign_id = ?';
      params.push(campaign_id);
    }
    if (form_id) {
      query += ' AND form_id = ?';
      params.push(form_id);
    }

    query += ' ORDER BY campaign_id, form_id';

    const [rows] = await pool.query(query, params);
    return res.json({ data: rows });
  } catch (err) {
    console.error('[getAllCampaignForms] Error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// POST /campaign-forms
exports.createCampaignForm = async (req, res) => {
  const { campaign_id, form_id } = req.body;

  if (!campaign_id || !form_id) {
    return res.status(400).json({
      message: 'campaign_id dan form_id wajib diisi'
    });
  }

  try {
    // Verify campaign exists
    const [campaignCheck] = await pool.query('SELECT id FROM campaigns WHERE id = ?', [campaign_id]);
    if (campaignCheck.length === 0) {
      return res.status(404).json({ message: 'Campaign tidak ditemukan' });
    }

    // Verify form exists
    const [formCheck] = await pool.query('SELECT id FROM forms WHERE id = ?', [form_id]);
    if (formCheck.length === 0) {
      return res.status(404).json({ message: 'Form tidak ditemukan' });
    }

    await pool.query(
      'INSERT INTO campaign_forms (campaign_id, form_id) VALUES (?, ?)',
      [campaign_id, form_id]
    );

    return res.status(201).json({
      message: 'Campaign form berhasil dibuat',
      data: { campaign_id, form_id }
    });
  } catch (err) {
    console.error('[createCampaignForm] Error:', err);

    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Campaign form sudah ada' });
    }

    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// DELETE /campaign-forms/:campaign_id/:form_id
exports.deleteCampaignForm = async (req, res) => {
  const { campaign_id, form_id } = req.params;

  try {
    const [result] = await pool.query(
      'DELETE FROM campaign_forms WHERE campaign_id = ? AND form_id = ?',
      [campaign_id, form_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Campaign form tidak ditemukan' });
    }

    return res.json({ message: 'Campaign form berhasil dihapus' });
  } catch (err) {
    console.error('[deleteCampaignForm] Error:', err);

    if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_ROW_IS_REFERENCED') {
      return res.status(409).json({ message: 'Campaign form masih digunakan oleh bank data entry' });
    }

    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

