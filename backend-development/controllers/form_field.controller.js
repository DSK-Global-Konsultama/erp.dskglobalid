// controllers/form_field.controller.js
const pool = require('../config/db');

// GET /form-fields?form_id=xxx
exports.getAllFormFields = async (req, res) => {
  const { form_id } = req.query;

  try {
    let query = `
      SELECT ff.id, ff.form_id, ff.field_key, ff.type, ff.label, ff.note, ff.required, ff.is_core, ff.placeholder, ff.file_settings, ff.sort_order, ff.created_at, ff.updated_at
      FROM form_fields ff
    `;
    const params = [];

    if (form_id) {
      query += ' WHERE ff.form_id = ?';
      params.push(form_id);
    }

    query += ' ORDER BY ff.sort_order ASC, ff.created_at ASC';

    const [rows] = await pool.query(query, params);

    // Get options for each field
    if (rows.length > 0) {
      const fieldIds = rows.map(r => r.id);
      const [options] = await pool.query(
        `SELECT id, form_field_id, opt_order, opt_value 
         FROM form_field_options 
         WHERE form_field_id IN (?) 
         ORDER BY form_field_id, opt_order ASC`,
        [fieldIds]
      );

      // Group options by form_field_id
      const optionsMap = {};
      options.forEach(opt => {
        if (!optionsMap[opt.form_field_id]) {
          optionsMap[opt.form_field_id] = [];
        }
        optionsMap[opt.form_field_id].push({
          id: opt.id,
          opt_order: opt.opt_order,
          opt_value: opt.opt_value
        });
      });

      // Attach options to fields
      rows.forEach(field => {
        field.options = optionsMap[field.id] || [];
      });
    }

    return res.json({ data: rows });
  } catch (err) {
    console.error('[getAllFormFields] Error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// GET /form-fields/:id
exports.getFormFieldById = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT id, form_id, field_key, type, label, note, required, is_core, placeholder, file_settings, sort_order, created_at, updated_at 
       FROM form_fields 
       WHERE id = ? LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Form field tidak ditemukan' });
    }

    const field = rows[0];

    // Get options for this field
    const [options] = await pool.query(
      `SELECT id, form_field_id, opt_order, opt_value 
       FROM form_field_options 
       WHERE form_field_id = ? 
       ORDER BY opt_order ASC`,
      [id]
    );

    field.options = options;

    return res.json({ data: field });
  } catch (err) {
    console.error('[getFormFieldById] Error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// POST /form-fields
exports.createFormField = async (req, res) => {
  const { form_id, field_key, type, label, note, required, is_core, placeholder, file_settings, sort_order, options } = req.body;

  if (!form_id || !field_key || !type || !label || sort_order === undefined) {
    return res.status(400).json({
      message: 'form_id, field_key, type, label, dan sort_order wajib diisi'
    });
  }

  // Validate enum values
  const validTypes = ['SHORT_TEXT', 'LONG_TEXT', 'DROPDOWN', 'RADIO', 'CHECKBOX', 'DATE', 'FILE_UPLOAD'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ message: `type harus salah satu dari: ${validTypes.join(', ')}` });
  }

  // Validate form exists
  const [formCheck] = await pool.query('SELECT id FROM forms WHERE id = ?', [form_id]);
  if (formCheck.length === 0) {
    return res.status(404).json({ message: 'Form tidak ditemukan' });
  }

  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    // Insert form field
    const [result] = await connection.query(
      `INSERT INTO form_fields (form_id, field_key, type, label, note, required, is_core, placeholder, file_settings, sort_order) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        form_id,
        field_key,
        type,
        label,
        note || null,
        required ? 1 : 0,
        is_core ? 1 : 0,
        placeholder || null,
        file_settings ? JSON.stringify(file_settings) : null,
        sort_order
      ]
    );

    const fieldId = result.insertId;

    // Insert options if provided
    if (options && Array.isArray(options) && options.length > 0) {
      const optionValues = options.map((opt, index) => [fieldId, index, opt.opt_value || opt]);
      const placeholders = optionValues.map(() => '(?, ?, ?)').join(', ');
      const flatValues = optionValues.flat();
      await connection.query(
        `INSERT INTO form_field_options (form_field_id, opt_order, opt_value) VALUES ${placeholders}`,
        flatValues
      );
    }

    await connection.commit();

    // Fetch the complete field with options
    const [rows] = await pool.query(
      `SELECT id, form_id, field_key, type, label, note, required, is_core, placeholder, file_settings, sort_order, created_at, updated_at 
       FROM form_fields 
       WHERE id = ? LIMIT 1`,
      [fieldId]
    );

    const [optionRows] = await pool.query(
      `SELECT id, form_field_id, opt_order, opt_value 
       FROM form_field_options 
       WHERE form_field_id = ? 
       ORDER BY opt_order ASC`,
      [fieldId]
    );

    rows[0].options = optionRows;

    connection.release();

    return res.status(201).json({
      message: 'Form field berhasil dibuat',
      data: rows[0]
    });
  } catch (err) {
    await connection.rollback();
    connection.release();

    console.error('[createFormField] Error:', err);

    if (err.code === 'ER_DUP_ENTRY') {
      if (err.message.includes('uq_form_fields_form_fieldkey')) {
        return res.status(409).json({ message: 'field_key sudah digunakan untuk form ini' });
      }
      if (err.message.includes('uq_form_fields_form_sort')) {
        return res.status(409).json({ message: 'sort_order sudah digunakan untuk form ini' });
      }
    }

    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// PUT /form-fields/:id
exports.updateFormField = async (req, res) => {
  const { id } = req.params;
  const { field_key, type, label, note, required, is_core, placeholder, file_settings, sort_order, options } = req.body;

  const fields = [];
  const values = [];

  if (field_key !== undefined) {
    fields.push('field_key = ?');
    values.push(field_key);
  }
  if (type !== undefined) {
    const validTypes = ['SHORT_TEXT', 'LONG_TEXT', 'DROPDOWN', 'RADIO', 'CHECKBOX', 'DATE', 'FILE_UPLOAD'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: `type harus salah satu dari: ${validTypes.join(', ')}` });
    }
    fields.push('type = ?');
    values.push(type);
  }
  if (label !== undefined) {
    fields.push('label = ?');
    values.push(label);
  }
  if (note !== undefined) {
    fields.push('note = ?');
    values.push(note || null);
  }
  if (required !== undefined) {
    fields.push('required = ?');
    values.push(required ? 1 : 0);
  }
  if (is_core !== undefined) {
    fields.push('is_core = ?');
    values.push(is_core ? 1 : 0);
  }
  if (placeholder !== undefined) {
    fields.push('placeholder = ?');
    values.push(placeholder);
  }
  if (sort_order !== undefined) {
    fields.push('sort_order = ?');
    values.push(sort_order);
  }

  if (file_settings !== undefined) {
    fields.push('file_settings = ?');
    values.push(file_settings ? JSON.stringify(file_settings) : null);
  }

  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    // Update form field if there are fields to update
    if (fields.length > 0) {
      values.push(id);
      const [result] = await connection.query(
        `UPDATE form_fields SET ${fields.join(', ')} WHERE id = ?`,
        values
      );

      if (result.affectedRows === 0) {
        await connection.rollback();
        connection.release();
        return res.status(404).json({ message: 'Form field tidak ditemukan' });
      }
    }

    // Update options if provided
    if (options !== undefined) {
      // Delete existing options
      await connection.query('DELETE FROM form_field_options WHERE form_field_id = ?', [id]);

      // Insert new options
      if (Array.isArray(options) && options.length > 0) {
        const optionValues = options.map((opt, index) => [id, index, opt.opt_value || opt]);
        const placeholders = optionValues.map(() => '(?, ?, ?)').join(', ');
        const flatValues = optionValues.flat();
        await connection.query(
          `INSERT INTO form_field_options (form_field_id, opt_order, opt_value) VALUES ${placeholders}`,
          flatValues
        );
      }
    }

    await connection.commit();

    // Fetch the updated field with options
    const [rows] = await pool.query(
      `SELECT id, form_id, field_key, type, label, note, required, is_core, placeholder, file_settings, sort_order, created_at, updated_at 
       FROM form_fields 
       WHERE id = ? LIMIT 1`,
      [id]
    );

    const [optionRows] = await pool.query(
      `SELECT id, form_field_id, opt_order, opt_value 
       FROM form_field_options 
       WHERE form_field_id = ? 
       ORDER BY opt_order ASC`,
      [id]
    );

    rows[0].options = optionRows;

    connection.release();

    return res.json({
      message: 'Form field berhasil diupdate',
      data: rows[0]
    });
  } catch (err) {
    await connection.rollback();
    connection.release();

    console.error('[updateFormField] Error:', err);

    if (err.code === 'ER_DUP_ENTRY') {
      if (err.message.includes('uq_form_fields_form_fieldkey')) {
        return res.status(409).json({ message: 'field_key sudah digunakan untuk form ini' });
      }
      if (err.message.includes('uq_form_fields_form_sort')) {
        return res.status(409).json({ message: 'sort_order sudah digunakan untuk form ini' });
      }
    }

    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// DELETE /form-fields/:id
exports.deleteFormField = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query('DELETE FROM form_fields WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Form field tidak ditemukan' });
    }

    // Note: form_field_options will be deleted automatically due to CASCADE

    return res.json({ message: 'Form field berhasil dihapus' });
  } catch (err) {
    console.error('[deleteFormField] Error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

