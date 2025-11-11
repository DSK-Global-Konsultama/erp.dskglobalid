// src/controllers/payments.controller.js
const { pool } = require('../config/db');

async function listPayments(req, res, next) {
  try {
    const [rows] = await pool.execute(
      `SELECT p.id, p.invoice_id, p.installment_id, p.amount, p.paid_date, p.method, p.reference, p.created_at
         FROM payments p
        WHERE p.invoice_id = ?
        ORDER BY p.created_at DESC`,
      [Number(req.query.invoiceId)]
    );
    res.json(rows);
  } catch (e) {
    next(e);
  }
}

async function createPayment(req, res, next) {
  const { invoice_id, installment_id = null, amount, paid_date, method, reference } = req.body || {};
  if (!invoice_id || typeof amount === 'undefined' || !paid_date) {
    return res.status(400).json({ message: 'invoice_id, amount, paid_date wajib' });
  }
  try {
    const [ins] = await pool.execute(
      `INSERT INTO payments (invoice_id, installment_id, amount, paid_date, method, reference)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [invoice_id, installment_id || null, Number(amount), paid_date, method || null, reference || null]
    );
    // Trigger will update installment and invoice statuses
    res.status(201).json({ id: ins.insertId });
  } catch (e) {
    next(e);
  }
}

module.exports = { listPayments, createPayment };


