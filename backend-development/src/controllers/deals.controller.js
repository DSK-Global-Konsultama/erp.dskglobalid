// src/controllers/deals.controller.js
const { pool } = require('../config/db');

async function getIdByCode(table, code) {
  if (!code) return null;
  const [rows] = await pool.execute(`SELECT id FROM ${table} WHERE code = ? LIMIT 1`, [code]);
  return rows[0]?.id || null;
}

async function listDeals(req, res, next) {
  try {
    const [rows] = await pool.execute(
      `SELECT d.id, d.title, c.name AS company_name, ct.full_name AS contact_name,
              ps.code AS proposal_status, d.approved_at, d.el_strategy, d.created_at, d.updated_at
         FROM deals d
         JOIN companies c ON c.id = d.company_id
         JOIN contacts ct ON ct.id = d.contact_id
         JOIN proposal_statuses ps ON ps.id = d.proposal_status_id
        ORDER BY d.created_at DESC
        LIMIT 500`
    );
    res.json(rows);
  } catch (e) {
    next(e);
  }
}

async function getDeal(req, res, next) {
  const id = Number(req.params.id);
  try {
    const [[deal]] = await Promise.all([
      pool.execute(
        `SELECT d.*, c.name AS company_name, ct.full_name AS contact_name, ps.code AS proposal_status
           FROM deals d
           JOIN companies c ON c.id = d.company_id
           JOIN contacts ct ON ct.id = d.contact_id
           JOIN proposal_statuses ps ON ps.id = d.proposal_status_id
          WHERE d.id = ?`,
        [id]
      ),
    ]);
    if (!deal.length) return res.status(404).json({ message: 'Deal tidak ditemukan' });
    const [items] = await pool.execute(
      `SELECT dsi.id, dsi.service_id, s.code AS service_code, s.name AS service_name,
              dsi.description, dsi.quantity, dsi.estimated_price, dsi.currency, dsi.payment_terms_txt
         FROM deal_service_items dsi
         JOIN services s ON s.id = dsi.service_id
        WHERE dsi.deal_id = ?
        ORDER BY dsi.id`,
      [id]
    );
    res.json({ ...deal[0], items });
  } catch (e) {
    next(e);
  }
}

// Helper to insert or fetch company/contact if necessary is already handled in leads; here we expect ids
async function createDeal(req, res, next) {
  const {
    leadId,
    companyId,
    contactId,
    title,
    proposalStatusCode = 'NOT_SUBMITTED',
    elStrategy = 'SINGLE_EL',
    notes,
    items = [] // [{serviceId|serviceCode, description, quantity, estimated_price, currency, payment_terms_txt}]
  } = req.body || {};
  if (!companyId || !contactId || !title) {
    return res.status(400).json({ message: 'companyId, contactId, title wajib diisi' });
  }
  try {
    const statusId = await getIdByCode('proposal_statuses', proposalStatusCode);
    if (!statusId) return res.status(400).json({ message: 'proposalStatusCode tidak valid' });
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [ins] = await conn.execute(
        `INSERT INTO deals (lead_id, company_id, contact_id, title, proposal_status_id, approved_by_user_id, el_strategy, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [leadId || null, companyId, contactId, title, statusId, null, elStrategy, notes || null]
      );
      const dealId = ins.insertId;
      // Insert items if any
      for (const it of Array.isArray(items) ? items : []) {
        let serviceId = it.serviceId;
        if (!serviceId && it.serviceCode) {
          serviceId = await getIdByCode('services', it.serviceCode);
        }
        if (!serviceId) continue;
        await conn.execute(
          `INSERT INTO deal_service_items
             (deal_id, service_id, description, quantity, estimated_price, currency, payment_terms_txt)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            dealId,
            serviceId,
            it.description || null,
            Number(it.quantity ?? 1),
            Number(it.estimated_price ?? 0),
            it.currency || 'IDR',
            it.payment_terms_txt || null
          ]
        );
      }
      await conn.commit();
      res.status(201).json({ id: dealId });
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

async function updateDeal(req, res, next) {
  const id = Number(req.params.id);
  const {
    title,
    proposalStatusCode,
    elStrategy,
    notes,
    approvedBy = false // if true, set status to APPROVED and approved_by_user_id = current user
  } = req.body || {};
  try {
    const fields = [];
    const params = [];
    if (typeof title !== 'undefined') { fields.push('title = ?'); params.push(title); }
    if (typeof elStrategy !== 'undefined') { fields.push('el_strategy = ?'); params.push(elStrategy); }
    if (typeof notes !== 'undefined') { fields.push('notes = ?'); params.push(notes); }
    if (approvedBy === true) {
      const approvedId = await getIdByCode('proposal_statuses', 'APPROVED');
      fields.push('proposal_status_id = ?'); params.push(approvedId);
      const userId = req.session?.user?.userId || null;
      fields.push('approved_by_user_id = ?'); params.push(userId);
      // approved_at handled by trigger when status transitions to APPROVED
    } else if (proposalStatusCode) {
      const stId = await getIdByCode('proposal_statuses', proposalStatusCode);
      if (!stId) return res.status(400).json({ message: 'proposalStatusCode tidak valid' });
      fields.push('proposal_status_id = ?'); params.push(stId);
    }
    if (!fields.length) return res.json({ updated: 0 });
    params.push(id);
    const [upd] = await pool.execute(
      `UPDATE deals SET ${fields.join(', ')} WHERE id = ?`,
      params
    );
    res.json({ updated: upd.affectedRows });
  } catch (e) {
    next(e);
  }
}

async function deleteDeal(req, res, next) {
  const id = Number(req.params.id);
  try {
    const [del] = await pool.execute('DELETE FROM deals WHERE id = ?', [id]);
    res.json({ deleted: del.affectedRows });
  } catch (e) {
    next(e);
  }
}

// Nested DSI CRUD
async function listItems(req, res, next) {
  const dealId = Number(req.params.dealId);
  try {
    const [rows] = await pool.execute(
      `SELECT dsi.id, dsi.service_id, s.code AS service_code, s.name AS service_name,
              dsi.description, dsi.quantity, dsi.estimated_price, dsi.currency, dsi.payment_terms_txt
         FROM deal_service_items dsi
         JOIN services s ON s.id = dsi.service_id
        WHERE dsi.deal_id = ?
        ORDER BY dsi.id`,
      [dealId]
    );
    res.json(rows);
  } catch (e) {
    next(e);
  }
}

async function createItem(req, res, next) {
  const dealId = Number(req.params.dealId);
  const { serviceId, serviceCode, description, quantity = 1, estimated_price = 0, currency = 'IDR', payment_terms_txt } = req.body || {};
  try {
    let sid = serviceId;
    if (!sid && serviceCode) sid = await getIdByCode('services', serviceCode);
    if (!sid) return res.status(400).json({ message: 'serviceId/serviceCode wajib dan harus valid' });
    const [ins] = await pool.execute(
      `INSERT INTO deal_service_items
         (deal_id, service_id, description, quantity, estimated_price, currency, payment_terms_txt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [dealId, sid, description || null, Number(quantity), Number(estimated_price), currency, payment_terms_txt || null]
    );
    res.status(201).json({ id: ins.insertId });
  } catch (e) {
    next(e);
  }
}

async function updateItem(req, res, next) {
  const dealId = Number(req.params.dealId);
  const id = Number(req.params.itemId);
  const { serviceId, serviceCode, description, quantity, estimated_price, currency, payment_terms_txt } = req.body || {};
  try {
    let sid = serviceId;
    if (!sid && serviceCode) sid = await getIdByCode('services', serviceCode);
    const fields = [];
    const params = [];
    if (sid) { fields.push('service_id = ?'); params.push(sid); }
    if (typeof description !== 'undefined') { fields.push('description = ?'); params.push(description); }
    if (typeof quantity !== 'undefined') { fields.push('quantity = ?'); params.push(Number(quantity)); }
    if (typeof estimated_price !== 'undefined') { fields.push('estimated_price = ?'); params.push(Number(estimated_price)); }
    if (typeof currency !== 'undefined') { fields.push('currency = ?'); params.push(currency); }
    if (typeof payment_terms_txt !== 'undefined') { fields.push('payment_terms_txt = ?'); params.push(payment_terms_txt); }
    if (!fields.length) return res.json({ updated: 0 });
    params.push(dealId, id);
    const [upd] = await pool.execute(
      `UPDATE deal_service_items SET ${fields.join(', ')} WHERE deal_id = ? AND id = ?`,
      params
    );
    res.json({ updated: upd.affectedRows });
  } catch (e) {
    next(e);
  }
}

async function deleteItem(req, res, next) {
  const dealId = Number(req.params.dealId);
  const id = Number(req.params.itemId);
  try {
    const [del] = await pool.execute(
      `DELETE FROM deal_service_items WHERE deal_id = ? AND id = ?`,
      [dealId, id]
    );
    res.json({ deleted: del.affectedRows });
  } catch (e) {
    next(e);
  }
}

module.exports = {
  listDeals,
  getDeal,
  createDeal,
  updateDeal,
  deleteDeal,
  listItems,
  createItem,
  updateItem,
  deleteItem,
};


