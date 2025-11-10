// src/controllers/leads.controller.js
const { pool } = require('../config/db');

// Helpers
async function getLookupId(table, code) {
  const [rows] = await pool.execute(`SELECT id FROM ${table} WHERE code = ? LIMIT 1`, [code]);
  return rows[0]?.id || null;
}

async function ensureCompany(conn, companyName) {
  const [exists] = await conn.execute(
    'SELECT id FROM companies WHERE name = ? LIMIT 1',
    [companyName]
  );
  if (exists.length) return exists[0].id;
  const [res] = await conn.execute(
    'INSERT INTO companies (name) VALUES (?)',
    [companyName]
  );
  return res.insertId;
}

async function ensureContact(conn, companyId, fullName, email, phone) {
  // Prefer unique by email if provided, else by name+company
  if (email) {
    const [byEmail] = await conn.execute(
      'SELECT id FROM contacts WHERE email = ? AND company_id = ? LIMIT 1',
      [email, companyId]
    );
    if (byEmail.length) return byEmail[0].id;
  }
  const [byName] = await conn.execute(
    'SELECT id FROM contacts WHERE company_id = ? AND full_name = ? LIMIT 1',
    [companyId, fullName]
  );
  if (byName.length) return byName[0].id;
  const [res] = await conn.execute(
    'INSERT INTO contacts (company_id, full_name, email, phone) VALUES (?, ?, ?, ?)',
    [companyId, fullName, email || null, phone || null]
  );
  return res.insertId;
}

// Public: calon client/BD Content form (no auth)
async function createPublicLead(req, res, next) {
  const { companyName, clientName, email, phone, sourceCode = 'WEBSITE', notes } = req.body || {};
  if (!companyName || !clientName) {
    return res.status(400).json({ message: 'companyName dan clientName wajib diisi' });
  }
  try {
    const sourceId = await getLookupId('lead_sources', sourceCode);
    if (!sourceId) return res.status(400).json({ message: 'sourceCode tidak valid' });
    const statusNotClaimedId = await getLookupId('lead_statuses', 'NOT_CLAIMED');
    if (!statusNotClaimedId) return res.status(500).json({ message: 'Lead status seed tidak ditemukan' });

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const companyId = await ensureCompany(conn, companyName);
      const contactId = await ensureContact(conn, companyId, clientName, email, phone);
      const [insert] = await conn.execute(
        `INSERT INTO leads (company_id, contact_id, source_id, status_id, email, phone, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [companyId, contactId, sourceId, statusNotClaimedId, email || null, phone || null, notes || null]
      );
      await conn.commit();
      res.status(201).json({ id: insert.insertId });
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  } catch (e) {
    next(e);
  }
}

// Authenticated CRUD (BDContentCreator/BDExecutive/Admin/ITSpecialist)
async function listLeads(req, res, next) {
  try {
    const [rows] = await pool.execute(
      `SELECT l.id, c.name AS company_name, ct.full_name AS contact_name, l.email, l.phone,
              ls.code AS source_code, st.code AS status_code, l.claimed_by_user_id, l.claimed_at,
              l.created_at, l.updated_at
         FROM leads l
         JOIN companies c ON c.id = l.company_id
         JOIN contacts ct ON ct.id = l.contact_id
         JOIN lead_sources ls ON ls.id = l.source_id
         JOIN lead_statuses st ON st.id = l.status_id
        ORDER BY l.created_at DESC
        LIMIT 500`
    );
    res.json(rows);
  } catch (e) {
    next(e);
  }
}

async function getLead(req, res, next) {
  try {
    const id = Number(req.params.id);
    const [rows] = await pool.execute(
      `SELECT l.*, c.name AS company_name, ct.full_name AS contact_name
         FROM leads l
         JOIN companies c ON c.id = l.company_id
         JOIN contacts ct ON ct.id = l.contact_id
        WHERE l.id = ?`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Lead tidak ditemukan' });
    res.json(rows[0]);
  } catch (e) {
    next(e);
  }
}

async function createLead(req, res, next) {
  const { companyName, clientName, email, phone, sourceCode, statusCode = 'NOT_CLAIMED', notes } = req.body || {};
  if (!companyName || !clientName || !sourceCode) {
    return res.status(400).json({ message: 'companyName, clientName, sourceCode wajib diisi' });
  }
  try {
    const sourceId = await getLookupId('lead_sources', sourceCode);
    const statusId = await getLookupId('lead_statuses', statusCode);
    if (!sourceId) return res.status(400).json({ message: 'sourceCode tidak valid' });
    if (!statusId) return res.status(400).json({ message: 'statusCode tidak valid' });
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const companyId = await ensureCompany(conn, companyName);
      const contactId = await ensureContact(conn, companyId, clientName, email, phone);
      const [insert] = await conn.execute(
        `INSERT INTO leads (company_id, contact_id, source_id, status_id, email, phone, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [companyId, contactId, sourceId, statusId, email || null, phone || null, notes || null]
      );
      await conn.commit();
      res.status(201).json({ id: insert.insertId });
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  } catch (e) {
    next(e);
  }
}

async function updateLead(req, res, next) {
  const id = Number(req.params.id);
  const { companyName, clientName, email, phone, sourceCode, statusCode, notes } = req.body || {};
  try {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      let companyId, contactId;
      if (companyName || clientName || email || phone) {
        const current = await conn.execute('SELECT company_id, contact_id FROM leads WHERE id = ? FOR UPDATE', [id]);
        if (!current[0].length) {
          await conn.rollback();
          return res.status(404).json({ message: 'Lead tidak ditemukan' });
        }
        companyId = current[0][0].company_id;
        contactId = current[0][0].contact_id;
        if (companyName) {
          companyId = await ensureCompany(conn, companyName);
        }
        if (clientName || email || phone) {
          contactId = await ensureContact(conn, companyId, clientName || 'Contact', email, phone);
        }
      }
      const sourceId = sourceCode ? await getLookupId('lead_sources', sourceCode) : undefined;
      const statusId = statusCode ? await getLookupId('lead_statuses', statusCode) : undefined;
      if (sourceCode && !sourceId) return res.status(400).json({ message: 'sourceCode tidak valid' });
      if (statusCode && !statusId) return res.status(400).json({ message: 'statusCode tidak valid' });

      const fields = [];
      const params = [];
      if (companyId) { fields.push('company_id = ?'); params.push(companyId); }
      if (contactId) { fields.push('contact_id = ?'); params.push(contactId); }
      if (typeof notes !== 'undefined') { fields.push('notes = ?'); params.push(notes); }
      if (typeof email !== 'undefined') { fields.push('email = ?'); params.push(email || null); }
      if (typeof phone !== 'undefined') { fields.push('phone = ?'); params.push(phone || null); }
      if (sourceId) { fields.push('source_id = ?'); params.push(sourceId); }
      if (statusId) { fields.push('status_id = ?'); params.push(statusId); }
      if (!fields.length) {
        await conn.rollback();
        return res.json({ updated: 0 });
      }
      params.push(id);
      const [upd] = await conn.execute(
        `UPDATE leads SET ${fields.join(', ')} WHERE id = ?`,
        params
      );
      await conn.commit();
      res.json({ updated: upd.affectedRows });
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  } catch (e) {
    next(e);
  }
}

async function deleteLead(req, res, next) {
  const id = Number(req.params.id);
  try {
    const [del] = await pool.execute('DELETE FROM leads WHERE id = ?', [id]);
    res.json({ deleted: del.affectedRows });
  } catch (e) {
    next(e);
  }
}

// Claim lead: set claimed_by_user_id = current user and let trigger set claimed_at
async function claimLead(req, res, next) {
  const id = Number(req.params.id);
  const userId = req.session?.user?.userId;
  if (!userId) return res.status(401).json({ message: 'Unauthenticated' });
  try {
    const [upd] = await pool.execute(
      `UPDATE leads SET claimed_by_user_id = ? WHERE id = ?`,
      [userId, id]
    );
    res.json({ claimed: upd.affectedRows });
  } catch (e) {
    // Trigger will block if already claimed by someone else
    next(e);
  }
}

module.exports = {
  createPublicLead,
  listLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  claimLead,
};


