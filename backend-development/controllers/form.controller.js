// controllers/form.controller.js
const pool = require('../config/db');
const { slugify, buildPublicFormUrl, buildPublicQrUrl } = require('../lib/publicLink');

// GET /forms
exports.getAllForms = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, title, description, header_image_path, success_message, status, public_link, public_slug, public_qr_url, published_at, created_by, created_at, updated_at, primary_campaign_id 
       FROM forms 
       ORDER BY created_at DESC`
    );
    return res.json({ data: rows });
  } catch (err) {
    console.error('[getAllForms] Error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// GET /forms/:id
exports.getFormById = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT id, title, description, header_image_path, success_message, status, public_link, public_slug, public_qr_url, published_at, created_by, created_at, updated_at, primary_campaign_id 
       FROM forms 
       WHERE id = ? LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Form tidak ditemukan' });
    }

    // Get channel links if any
    const [channelLinks] = await pool.query(
      `SELECT id, form_id, channel, public_link, public_slug, public_qr_url, created_at, updated_at 
       FROM form_channel_links 
       WHERE form_id = ? 
       ORDER BY channel ASC`,
      [id]
    );

    const formData = rows[0];
    if (channelLinks.length > 0) {
      formData.channel_links = channelLinks;
    }

    return res.json({ data: formData });
  } catch (err) {
    console.error('[getFormById] Error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// POST /forms
exports.createForm = async (req, res) => {
  const { title, description, status, public_link, public_slug, public_qr_url, published_at, primary_campaign_id, success_message } = req.body;
  const created_by = req.user?.username || req.user?.email || 'system';

  if (!title || !status) {
    return res.status(400).json({
      message: 'title dan status wajib diisi'
    });
  }

  // Validate enum values
  const validStatuses = ['DRAFT', 'PUBLISHED', 'PAUSED', 'ENDED'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: `status harus salah satu dari: ${validStatuses.join(', ')}` });
  }

  // If provided, validate campaign exists (because we will link it)
  let campaignChannel = null;
  if (primary_campaign_id) {
    try {
      const [campaignCheck] = await pool.query('SELECT id, channel FROM campaigns WHERE id = ? LIMIT 1', [
        primary_campaign_id
      ]);
      if (campaignCheck.length === 0) {
        return res.status(404).json({ message: 'Campaign tidak ditemukan' });
      }
      campaignChannel = campaignCheck[0].channel;

      // Enforce: unique title per campaign
      const [dupRows] = await pool.query(
        'SELECT id FROM forms WHERE primary_campaign_id = ? AND title = ? LIMIT 1',
        [primary_campaign_id, title]
      );
      if (dupRows.length > 0) {
        return res.status(409).json({
          message: 'Judul form sudah digunakan pada campaign ini. Silakan gunakan judul lain.'
        });
      }
    } catch (err) {
      console.error('[createForm] Campaign check error:', err);
      return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Generate numeric ID (auto-increment style)
    const [maxRows] = await connection.query(
      'SELECT COALESCE(MAX(CAST(id AS UNSIGNED)), 0) as max_id FROM forms'
    );
    const nextId = (parseInt(maxRows[0].max_id) + 1).toString();

    const effectiveSlug = public_slug ? slugify(public_slug) : slugify(title);
    const computedPublicLink = status === 'PUBLISHED' ? buildPublicFormUrl({ publicSlug: effectiveSlug }) : null;
    const computedPublicQr = status === 'PUBLISHED' ? buildPublicQrUrl(computedPublicLink) : null;

    const finalPublicLink = status === 'PUBLISHED' ? (public_link || computedPublicLink) : (public_link || null);
    const finalPublicQr = status === 'PUBLISHED' ? (public_qr_url || computedPublicQr) : (public_qr_url || null);

    await connection.query(
      `INSERT INTO forms (id, title, description, status, public_link, public_slug, public_qr_url, published_at, created_by, primary_campaign_id, success_message) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nextId,
        title,
        description || null,
        status,
        finalPublicLink,
        public_slug ? slugify(public_slug) : null,
        finalPublicQr,
        published_at || null,
        created_by,
        primary_campaign_id || null,
        success_message || null
      ]
    );

    // IMPORTANT: link form to campaign via campaign_forms if campaign is provided
    if (primary_campaign_id) {
      try {
        await connection.query(
          'INSERT INTO campaign_forms (campaign_id, form_id) VALUES (?, ?)',
          [primary_campaign_id, nextId]
        );
      } catch (err) {
        // Ignore duplicates to keep endpoint idempotent
        if (err?.code !== 'ER_DUP_ENTRY') {
          throw err;
        }
      }
    }

    // Auto-generate Instagram & LinkedIn links for Event campaigns
    // (Webinar/Seminar/Brevet/dll) -> berlaku untuk seluruh event
    if (campaignChannel && status === 'PUBLISHED') {
      console.log(`[createForm] Auto-generating channel links for campaign. Form ID: ${nextId}, Channel: ${campaignChannel}, Status: ${status}`);
      try {
        const baseSlug = effectiveSlug || slugify(title);
        const channels = ['INSTAGRAM', 'LINKEDIN'];

        for (const channel of channels) {
          const channelSlug = `${baseSlug}-${channel.toLowerCase()}`;
          const channelLink = buildPublicFormUrl({ publicSlug: channelSlug });
          const channelQr = buildPublicQrUrl(channelLink);

          console.log(`[createForm] Creating channel link: ${channel} -> ${channelLink}`);

          await connection.query(
            `INSERT INTO form_channel_links (form_id, channel, public_link, public_slug, public_qr_url) 
             VALUES (?, ?, ?, ?, ?)`,
            [nextId, channel, channelLink, channelSlug, channelQr]
          );

          console.log(`[createForm] Successfully created channel link for ${channel}`);
        }
      } catch (err) {
        // Log error but don't fail the form creation
        console.error('[createForm] Auto-generate channel links error:', err);
        console.error('[createForm] Error details:', err.message, err.code, err.sqlMessage);
        if (err.code === 'ER_NO_SUCH_TABLE') {
          console.error('[createForm] ERROR: Table form_channel_links does not exist! Please run migration: 20260213_add_form_channel_links.sql');
        }
      }
    } else {
      console.log(`[createForm] Skipping channel links generation. Campaign Channel: ${campaignChannel}, Status: ${status}`);
    }

    const [rows] = await connection.query(
      `SELECT id, title, description, header_image_path, success_message, status, public_link, public_slug, public_qr_url, published_at, created_by, created_at, updated_at, primary_campaign_id 
       FROM forms 
       WHERE id = ? LIMIT 1`,
      [nextId]
    );

    // Get channel links if any
    const [channelLinks] = await connection.query(
      `SELECT id, form_id, channel, public_link, public_slug, public_qr_url, created_at, updated_at 
       FROM form_channel_links 
       WHERE form_id = ? 
       ORDER BY channel ASC`,
      [nextId]
    );

    await connection.commit();
    connection.release();

    const formData = rows[0];
    if (channelLinks.length > 0) {
      formData.channel_links = channelLinks;
    }

    return res.status(201).json({
      message: 'Form berhasil dibuat',
      data: formData
    });
  } catch (err) {
    try {
      await connection.rollback();
    } catch {
      // ignore
    }
    connection.release();

    console.error('[createForm] Error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// PUT /forms/:id
exports.updateForm = async (req, res) => {
  const { id } = req.params;
  const { title, description, status, public_link, public_slug, public_qr_url, published_at, primary_campaign_id, success_message } = req.body;

  const fields = [];
  const values = [];

  if (title !== undefined) {
    // Enforce: unique title per (existing/new) campaign_id
    try {
      const [existingRows] = await pool.query(
        'SELECT primary_campaign_id FROM forms WHERE id = ? LIMIT 1',
        [id]
      );
      if (existingRows.length === 0) {
        return res.status(404).json({ message: 'Form tidak ditemukan' });
      }

      const effectiveCampaignId = primary_campaign_id !== undefined
        ? primary_campaign_id
        : existingRows[0].primary_campaign_id;

      if (effectiveCampaignId) {
        const [dupRows] = await pool.query(
          'SELECT id FROM forms WHERE primary_campaign_id = ? AND title = ? AND id <> ? LIMIT 1',
          [effectiveCampaignId, title, id]
        );
        if (dupRows.length > 0) {
          return res.status(409).json({
            message: 'Judul form sudah digunakan pada campaign ini. Silakan gunakan judul lain.'
          });
        }
      }
    } catch (err) {
      console.error('[updateForm] Duplicate title check error:', err);
      return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }

    fields.push('title = ?');
    values.push(title);
  }

  if (description !== undefined) {
    fields.push('description = ?');
    values.push(description);
  }
  if (status !== undefined) {
    const validStatuses = ['DRAFT', 'PUBLISHED', 'PAUSED', 'ENDED'];
    if (!validStatuses.includes(status)) {
      return res
        .status(400)
        .json({ message: `status harus salah satu dari: ${validStatuses.join(', ')}` });
    }
    fields.push('status = ?');
    values.push(status);
  }
  if (public_link !== undefined) {
    fields.push('public_link = ?');
    values.push(public_link);
  }
  if (public_slug !== undefined) {
    fields.push('public_slug = ?');
    values.push(public_slug);
  }
  if (public_qr_url !== undefined) {
    fields.push('public_qr_url = ?');
    values.push(public_qr_url);
  }
  if (published_at !== undefined) {
    fields.push('published_at = ?');
    values.push(published_at);
  }
  if (primary_campaign_id !== undefined) {
    fields.push('primary_campaign_id = ?');
    values.push(primary_campaign_id);
  }
  if (success_message !== undefined) {
    fields.push('success_message = ?');
    values.push(success_message);
  }

  // If publishing, ensure public_link and public_qr_url are present
  let shouldGenerateChannelLinks = false;
  if (status === 'PUBLISHED') {
    try {
      const [existingRows] = await pool.query(
        'SELECT title, public_slug, public_link, public_qr_url, primary_campaign_id FROM forms WHERE id = ? LIMIT 1',
        [id]
      );
      const existing = existingRows?.[0] || {};

      const effectiveTitle = title !== undefined ? title : existing.title;
      const effectiveSlug = public_slug !== undefined
        ? (public_slug ? slugify(public_slug) : '')
        : (existing.public_slug ? String(existing.public_slug) : '');

      const slugForUrl = effectiveSlug || slugify(effectiveTitle);
      const computedLink = buildPublicFormUrl({ publicSlug: slugForUrl });
      const computedQr = buildPublicQrUrl(computedLink);

      if (public_link === undefined && !existing.public_link) {
        fields.push('public_link = ?');
        values.push(computedLink);
      }
      if (public_qr_url === undefined && !existing.public_qr_url) {
        fields.push('public_qr_url = ?');
        values.push(computedQr);
      }

      // Check if we need to generate channel links for campaign forms
      const campaignId = primary_campaign_id !== undefined ? primary_campaign_id : existing.primary_campaign_id;
      if (campaignId) {
        // Any campaign channel counts as Event for now; requirement: berlaku untuk seluruh Event
        // Only generate if links don't exist yet.
        const [existingChannelLinks] = await pool.query(
          'SELECT id FROM form_channel_links WHERE form_id = ? LIMIT 1',
          [id]
        );
        if (existingChannelLinks.length === 0) {
          shouldGenerateChannelLinks = true;
        }
      }
    } catch (err) {
      console.error('[updateForm] publish compute link/qr error:', err);
      return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  }

  if (fields.length === 0) {
    return res.status(400).json({ message: 'Tidak ada field yang diupdate' });
  }

  values.push(id);

  try {
    const [result] = await pool.query(
      `UPDATE forms SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Form tidak ditemukan' });
    }

    // Auto-generate channel links if needed (when publishing campaign form)
    if (shouldGenerateChannelLinks) {
      try {
        const [formRows] = await pool.query(
          'SELECT title, public_slug FROM forms WHERE id = ? LIMIT 1',
          [id]
        );
        if (formRows.length > 0) {
          const form = formRows[0];
          const baseSlug = form.public_slug ? slugify(form.public_slug) : slugify(form.title);
          const channels = ['INSTAGRAM', 'LINKEDIN'];
          
          for (const channel of channels) {
            const channelSlug = `${baseSlug}-${channel.toLowerCase()}`;
            const channelLink = buildPublicFormUrl({ publicSlug: channelSlug });
            const channelQr = buildPublicQrUrl(channelLink);
            
            await pool.query(
              `INSERT INTO form_channel_links (form_id, channel, public_link, public_slug, public_qr_url) 
               VALUES (?, ?, ?, ?, ?)`,
              [id, channel, channelLink, channelSlug, channelQr]
            );
          }
        }
      } catch (err) {
        // Log error but don't fail the update
        console.error('[updateForm] Auto-generate channel links error:', err);
      }
    }

    const [rows] = await pool.query(
      `SELECT id, title, description, header_image_path, success_message, status, public_link, public_slug, public_qr_url, published_at, created_by, created_at, updated_at, primary_campaign_id 
       FROM forms 
       WHERE id = ? LIMIT 1`,
      [id]
    );

    // Include channel links in response
    const [channelLinks] = await pool.query(
      `SELECT id, form_id, channel, public_link, public_slug, public_qr_url, created_at, updated_at 
       FROM form_channel_links 
       WHERE form_id = ? 
       ORDER BY channel ASC`,
      [id]
    );

    const formData = rows[0];
    if (channelLinks.length > 0) {
      formData.channel_links = channelLinks;
    }

    return res.json({
      message: 'Form berhasil diupdate',
      data: formData
    });
  } catch (err) {
    console.error('[updateForm] Error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// DELETE /forms/:id
exports.deleteForm = async (req, res) => {
  const { id } = req.params;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // If there are submissions, do not allow deletion (preserve data integrity)
    const [bdeRows] = await conn.query('SELECT 1 FROM bank_data_entries WHERE form_id = ? LIMIT 1', [id]);
    if (bdeRows.length > 0) {
      await conn.rollback();
      return res.status(409).json({ message: 'Form masih digunakan oleh bank data entry' });
    }

    // Remove pivot links first (campaign_forms has FK with ON DELETE RESTRICT)
    await conn.query('DELETE FROM campaign_forms WHERE form_id = ?', [id]);

    // Remove form fields & options (if applicable)
    await conn.query(
      `DELETE o FROM form_field_options o
       JOIN form_fields f ON f.id = o.form_field_id
       WHERE f.form_id = ?`,
      [id]
    );
    await conn.query('DELETE FROM form_fields WHERE form_id = ?', [id]);

    // Finally remove the form
    const [result] = await conn.query('DELETE FROM forms WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({ message: 'Form tidak ditemukan' });
    }

    await conn.commit();
    return res.json({ message: 'Form berhasil dihapus' });
  } catch (err) {
    try {
      await conn.rollback();
    } catch {
      // ignore
    }

    console.error('[deleteForm] Error:', err);

    if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_ROW_IS_REFERENCED') {
      return res.status(409).json({ message: 'Form masih digunakan oleh campaign atau bank data entry' });
    }

    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  } finally {
    conn.release();
  }
};

