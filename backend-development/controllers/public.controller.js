// controllers/public.controller.js
const pool = require('../config/db');

function slugify(input) {
  return String(input || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/\-+/g, '-')
    .replace(/^\-+|\-+$/g, '') || 'form';
}

const normalizePublicLinkToSlug = (value) => {
  const s = String(value || '').trim();
  if (!s) return '';

  // If it's a URL, extract last path segment (e.g. http://x/y/z -> z)
  try {
    // new URL requires absolute URL; if it fails we'll fallback
    const u = new URL(s);
    const parts = String(u.pathname || '')
      .split('/')
      .filter(Boolean);
    return parts.length ? parts[parts.length - 1] : '';
  } catch {
    // Not a URL; could already be a slug
    return s;
  }
};

async function getCampaignChannel(campaignId) {
  if (!campaignId) return null;
  const [rows] = await pool.query('SELECT channel FROM campaigns WHERE id = ? LIMIT 1', [campaignId]);
  return rows?.[0]?.channel || null;
}

// GET /public/forms/:slug
exports.getPublicFormBySlug = async (req, res) => {
  const rawSlug = req.params.slug;
  const slug = (() => {
    try {
      return decodeURIComponent(String(rawSlug || '')).trim();
    } catch {
      return String(rawSlug || '').trim();
    }
  })();

  try {
    // Prefer explicit public_slug if present; fallback to public_link; else fallback to slug(title)
    const [rows] = await pool.query(
      `SELECT id, title, description, header_image_path, success_message, status, public_link, public_slug, published_at, primary_campaign_id
       FROM forms`
    );

    const hit = rows.find((r) => {
      const explicitSlug = r.public_slug ? String(r.public_slug).trim() : '';
      if (explicitSlug) {
        return explicitSlug.toLowerCase() === slug.toLowerCase();
      }

      const publicLink = r.public_link ? String(r.public_link).trim() : '';
      if (publicLink) {
        const linkSlug = normalizePublicLinkToSlug(publicLink);
        return linkSlug.toLowerCase() === slug.toLowerCase() || publicLink.toLowerCase() === slug.toLowerCase();
      }

      return slugify(r.title) === slugify(slug);
    });

    if (!hit) return res.status(404).json({ message: 'Form tidak ditemukan' });

    // Public read rules
    if (hit.status === 'PAUSED') {
      return res.status(403).json({ message: 'Form sedang di-pause. Silakan coba lagi nanti.' });
    }
    if (hit.status === 'ENDED') {
      return res.status(403).json({ message: 'Form sudah berakhir (ended). Terima kasih.' });
    }
    if (hit.status !== 'PUBLISHED') {
      return res.status(403).json({ message: 'Form belum dipublish' });
    }

    // include campaign channel for convenience
    const channel = await getCampaignChannel(hit.primary_campaign_id);

    return res.json({
      data: {
        ...hit,
        source_channel: channel
      }
    });
  } catch (err) {
    console.error('[getPublicFormBySlug] Error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// GET /public/forms/:id/fields
exports.getPublicFormFields = async (req, res) => {
  const { id } = req.params;

  try {
    const [formRows] = await pool.query(
      'SELECT id, status FROM forms WHERE id = ? LIMIT 1',
      [id]
    );

    if (formRows.length === 0) return res.status(404).json({ message: 'Form tidak ditemukan' });

    if (formRows[0].status === 'PAUSED') {
      return res.status(403).json({ message: 'Form sedang di-pause. Silakan coba lagi nanti.' });
    }
    if (formRows[0].status === 'ENDED') {
      return res.status(403).json({ message: 'Form sudah berakhir (ended). Terima kasih.' });
    }
    if (formRows[0].status !== 'PUBLISHED') {
      return res.status(403).json({ message: 'Form belum dipublish' });
    }

    const [rows] = await pool.query(
      `SELECT ff.id, ff.form_id, ff.field_key, ff.type, ff.label, ff.note, ff.required, ff.is_core, ff.placeholder, ff.file_settings, ff.sort_order, ff.created_at, ff.updated_at
       FROM form_fields ff
       WHERE ff.form_id = ?
       ORDER BY ff.sort_order ASC, ff.created_at ASC`,
      [id]
    );

    if (rows.length > 0) {
      const fieldIds = rows.map(r => r.id);
      const [options] = await pool.query(
        `SELECT id, form_field_id, opt_order, opt_value
         FROM form_field_options
         WHERE form_field_id IN (?)
         ORDER BY form_field_id, opt_order ASC`,
        [fieldIds]
      );

      const optionsMap = {};
      options.forEach(opt => {
        if (!optionsMap[opt.form_field_id]) optionsMap[opt.form_field_id] = [];
        optionsMap[opt.form_field_id].push({
          id: opt.id,
          opt_order: opt.opt_order,
          opt_value: opt.opt_value
        });
      });

      rows.forEach(field => {
        field.options = optionsMap[field.id] || [];
      });
    }

    return res.json({ data: rows });
  } catch (err) {
    console.error('[getPublicFormFields] Error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// POST /public/forms/:id/submit
exports.submitPublicForm = async (req, res) => {
  const { id: formId } = req.params;
  const {
    client_name,
    pic_name,
    email,
    phone,
    extra_answers
  } = req.body;

  if (!client_name || !pic_name || !email || !phone) {
    return res.status(400).json({ message: 'client_name, pic_name, email, dan phone wajib diisi' });
  }

  try {
    const [formRows] = await pool.query(
      `SELECT id, title, status, primary_campaign_id
       FROM forms WHERE id = ? LIMIT 1`,
      [formId]
    );

    if (formRows.length === 0) return res.status(404).json({ message: 'Form tidak ditemukan' });

    const form = formRows[0];

    if (form.status === 'PAUSED' || form.status === 'ENDED') {
      return res.status(403).json({ message: `Form sedang ${form.status === 'PAUSED' ? 'di-pause' : 'berakhir'}` });
    }
    if (form.status !== 'PUBLISHED') {
      return res.status(403).json({ message: 'Form belum dipublish' });
    }

    const campaignId = form.primary_campaign_id;
    if (!campaignId) {
      return res.status(400).json({ message: 'Form ini tidak terhubung ke campaign' });
    }

    // Validate campaign_form exists
    const [campaignFormCheck] = await pool.query(
      'SELECT campaign_id, form_id FROM campaign_forms WHERE campaign_id = ? AND form_id = ?',
      [campaignId, formId]
    );
    if (campaignFormCheck.length === 0) {
      return res.status(404).json({ message: 'Campaign form tidak ditemukan' });
    }

    const source_channel = await getCampaignChannel(campaignId);
    if (!source_channel) {
      return res.status(500).json({ message: 'source_channel campaign tidak ditemukan' });
    }

    // Parse extra_answers if it's a string
    let extraAnswersValue = extra_answers;
    if (typeof extra_answers === 'string') {
      try {
        extraAnswersValue = JSON.parse(extra_answers);
      } catch {
        return res.status(400).json({ message: 'extra_answers harus berupa JSON yang valid' });
      }
    }

    // Generate numeric ID
    const [maxRows] = await pool.query(
      'SELECT COALESCE(MAX(CAST(id AS UNSIGNED)), 0) as max_id FROM bank_data_entries'
    );
    const nextId = (parseInt(maxRows[0].max_id) + 1).toString();

    await pool.query(
      `INSERT INTO bank_data_entries
       (id, campaign_id, form_id, client_name, pic_name, email, phone, source_channel, campaign_name,
        topic_tag, triage_status, extra_answers, notes, submitted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nextId,
        campaignId,
        formId,
        client_name,
        pic_name,
        email,
        phone,
        source_channel,
        form.title,
        null,
        'RAW_NEW',
        JSON.stringify(extraAnswersValue || {}),
        null,
        new Date()
      ]
    );

    const [createdRows] = await pool.query(
      `SELECT id, campaign_id, form_id, client_name, pic_name, email, phone, source_channel,
              campaign_name, topic_tag, triage_status, extra_answers, notes, submitted_at, created_at, updated_at
       FROM bank_data_entries WHERE id = ? LIMIT 1`,
      [nextId]
    );

    return res.status(201).json({ message: 'Berhasil submit', data: createdRows[0] });
  } catch (err) {
    console.error('[submitPublicForm] Error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};
