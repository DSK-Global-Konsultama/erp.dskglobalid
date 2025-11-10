// src/controllers/invoices.controller.js
const { pool } = require('../config/db');

async function getIdByCode(table, code) {
  if (!code) return null;
  const [rows] = await pool.execute(`SELECT id FROM ${table} WHERE code = ? LIMIT 1`, [code]);
  return rows[0]?.id || null;
}

async function listInvoices(req, res, next) {
  try {
    const [rows] = await pool.execute(
      `SELECT i.id, c.name AS company_name, i.issue_date, i.total_amount, i.currency,
              ist.code AS status_code, i.created_at, i.updated_at
         FROM invoices i
         JOIN companies c ON c.id = i.company_id
         JOIN invoice_statuses ist ON ist.id = i.status_id
        ORDER BY i.created_at DESC
        LIMIT 500`
    );
    res.json(rows);
  } catch (e) {
    next(e);
  }
}

async function getInvoice(req, res, next) {
  const id = Number(req.params.id);
  try {
    const [rows] = await pool.execute(
      `SELECT i.*, c.name AS company_name, ist.code AS status_code
         FROM invoices i
         JOIN companies c ON c.id = i.company_id
         JOIN invoice_statuses ist ON ist.id = i.status_id
        WHERE i.id = ?`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Invoice tidak ditemukan' });
    const [inst] = await pool.execute(
      `SELECT id, seq_no, due_date, amount, paid_amount, status, paid_at
         FROM invoice_installments
        WHERE invoice_id = ?
        ORDER BY seq_no ASC`,
      [id]
    );
    res.json({ ...rows[0], installments: inst });
  } catch (e) {
    next(e);
  }
}

async function createInvoice(req, res, next) {
  const { companyId, elId = null, elItemId = null, issue_date, total_amount = 0, currency = 'IDR', statusCode = 'UNPAID', notes, installments = [] } = req.body || {};
  if (!companyId) return res.status(400).json({ message: 'companyId wajib diisi' });
  try {
    const statusId = await getIdByCode('invoice_statuses', statusCode);
    if (!statusId) return res.status(400).json({ message: 'statusCode tidak valid' });
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [ins] = await conn.execute(
        `INSERT INTO invoices (company_id, el_id, el_item_id, issue_date, total_amount, currency, status_id, notes)
         VALUES (?, ?, ?, COALESCE(?, CURDATE()), ?, ?, ?, ?)`,
        [companyId, elId, elItemId, issue_date || null, Number(total_amount), currency, statusId, notes || null]
      );
      const invoiceId = ins.insertId;
      let seq = 1;
      for (const it of Array.isArray(installments) ? installments : []) {
        await conn.execute(
          `INSERT INTO invoice_installments (invoice_id, seq_no, due_date, amount)
           VALUES (?, ?, ?, ?)`,
          [invoiceId, Number(it.seq_no ?? seq++), it.due_date, Number(it.amount || 0)]
        );
      }
      await conn.commit();
      res.status(201).json({ id: invoiceId });
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

async function updateInvoice(req, res, next) {
  const id = Number(req.params.id);
  const { companyId, elId, elItemId, issue_date, total_amount, currency, statusCode, notes } = req.body || {};
  try {
    const fields = [];
    const params = [];
    if (typeof companyId !== 'undefined') { fields.push('company_id = ?'); params.push(companyId); }
    if (typeof elId !== 'undefined') { fields.push('el_id = ?'); params.push(elId); }
    if (typeof elItemId !== 'undefined') { fields.push('el_item_id = ?'); params.push(elItemId); }
    if (typeof issue_date !== 'undefined') { fields.push('issue_date = ?'); params.push(issue_date || null); }
    if (typeof total_amount !== 'undefined') { fields.push('total_amount = ?'); params.push(Number(total_amount)); }
    if (typeof currency !== 'undefined') { fields.push('currency = ?'); params.push(currency); }
    if (typeof notes !== 'undefined') { fields.push('notes = ?'); params.push(notes); }
    if (typeof statusCode !== 'undefined') {
      const sid = await getIdByCode('invoice_statuses', statusCode);
      if (!sid) return res.status(400).json({ message: 'statusCode tidak valid' });
      fields.push('status_id = ?'); params.push(sid);
    }
    if (!fields.length) return res.json({ updated: 0 });
    params.push(id);
    const [upd] = await pool.execute(`UPDATE invoices SET ${fields.join(', ')} WHERE id = ?`, params);
    res.json({ updated: upd.affectedRows });
  } catch (e) {
    next(e);
  }
}

async function deleteInvoice(req, res, next) {
  const id = Number(req.params.id);
  try {
    const [del] = await pool.execute('DELETE FROM invoices WHERE id = ?', [id]);
    res.json({ deleted: del.affectedRows });
  } catch (e) {
    next(e);
  }
}

// Installments
async function listInstallments(req, res, next) {
  const invoiceId = Number(req.params.id);
  try {
    const [rows] = await pool.execute(
      `SELECT id, seq_no, due_date, amount, paid_amount, status, paid_at
         FROM invoice_installments
        WHERE invoice_id = ?
        ORDER BY seq_no`,
      [invoiceId]
    );
    res.json(rows);
  } catch (e) {
    next(e);
  }
}

async function addInstallment(req, res, next) {
  const invoiceId = Number(req.params.id);
  const { seq_no, due_date, amount } = req.body || {};
  if (!due_date || typeof amount === 'undefined') return res.status(400).json({ message: 'due_date dan amount wajib' });
  try {
    const [ins] = await pool.execute(
      `INSERT INTO invoice_installments (invoice_id, seq_no, due_date, amount)
       VALUES (?, ?, ?, ?)`,
      [invoiceId, Number(seq_no || 1), due_date, Number(amount)]
    );
    res.status(201).json({ id: ins.insertId });
  } catch (e) {
    next(e);
  }
}

async function updateInstallment(req, res, next) {
  const invoiceId = Number(req.params.id);
  const instId = Number(req.params.instId);
  const { seq_no, due_date, amount } = req.body || {};
  try {
    const fields = [];
    const params = [];
    if (typeof seq_no !== 'undefined') { fields.push('seq_no = ?'); params.push(Number(seq_no)); }
    if (typeof due_date !== 'undefined') { fields.push('due_date = ?'); params.push(due_date); }
    if (typeof amount !== 'undefined') { fields.push('amount = ?'); params.push(Number(amount)); }
    if (!fields.length) return res.json({ updated: 0 });
    params.push(invoiceId, instId);
    const [upd] = await pool.execute(
      `UPDATE invoice_installments SET ${fields.join(', ')} WHERE invoice_id = ? AND id = ?`,
      params
    );
    res.json({ updated: upd.affectedRows });
  } catch (e) {
    next(e);
  }
}

async function deleteInstallment(req, res, next) {
  const invoiceId = Number(req.params.id);
  const instId = Number(req.params.instId);
  try {
    const [del] = await pool.execute(
      `DELETE FROM invoice_installments WHERE invoice_id = ? AND id = ?`,
      [invoiceId, instId]
    );
    res.json({ deleted: del.affectedRows });
  } catch (e) {
    next(e);
  }
}

module.exports = {
  listInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  listInstallments,
  addInstallment,
  updateInstallment,
  deleteInstallment,
};


