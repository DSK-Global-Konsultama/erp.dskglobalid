// src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const { getAuthCodeUrl, acquireTokenByCode } = require('../auth/azure');
const { pool } = require('../config/db');

// 1) Mulai login: redirect ke Microsoft
router.get('/login', async (req, res, next) => {
  try {
    const url = await getAuthCodeUrl();
    // Optional: log untuk debugging
    // const u = new URL(url); console.log('[AUTH] redirect_uri=', u.searchParams.get('redirect_uri'));
    res.redirect(url);
  } catch (e) {
    next(e);
  }
});

// ---- Helper untuk finalize login: upsert user + ambil roles dari MySQL ----
async function finalizeLogin(req, res, next, claims) {
  try {
    const email =
      claims.preferred_username ||
      (Array.isArray(claims.emails) ? claims.emails[0] : null);

    // 1) Upsert user berdasarkan aad_oid/email (TANPA kolom users.role)
    const [found] = await pool.execute(
      'SELECT id FROM users WHERE aad_oid = ? OR email = ? LIMIT 1',
      [claims.oid, email]
    );

    let userId;
    if (found.length === 0) {
      const [ins] = await pool.execute(
        `INSERT INTO users (name, email, aad_oid, aad_tid, upn, last_login)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [claims.name, email, claims.oid, claims.tid, email]
      );
      userId = ins.insertId;

      // (opsional) Pastikan default 'Staff' bila trigger belum ada
      await pool.execute(
        `INSERT IGNORE INTO user_roles (user_id, role_id)
         SELECT ?, id FROM roles WHERE code = 'Staff' LIMIT 1`,
        [userId]
      );
    } else {
      userId = found[0].id;
      await pool.execute(
        'UPDATE users SET name = ?, email = ?, last_login = NOW() WHERE id = ?',
        [claims.name, email, userId]
      );
    }

    // 2) Ambil roles DARI MySQL (join roles↔user_roles)
    const [rrows] = await pool.execute(
      `SELECT r.code
         FROM roles r
         JOIN user_roles ur ON ur.role_id = r.id
        WHERE ur.user_id = ?
        ORDER BY r.code`,
      [userId]
    );
    let roleCodes = rrows.map(r => r.code);

    // Safety net: jika masih kosong, assign 'Staff' lalu ambil ulang
    if (roleCodes.length === 0) {
      await pool.execute(
        `INSERT IGNORE INTO user_roles (user_id, role_id)
         SELECT ?, id FROM roles WHERE code = 'Staff' LIMIT 1`,
        [userId]
      );
      const [r2] = await pool.execute(
        `SELECT r.code
           FROM roles r
           JOIN user_roles ur ON ur.role_id = r.id
          WHERE ur.user_id = ?
          ORDER BY r.code`,
        [userId]
      );
      roleCodes = r2.map(r => r.code);
    }

    // 3) Isi session MENGGUNAKAN roles dari DB (override roles token)
    req.session.user = {
      oid: claims.oid,
      tid: claims.tid,
      name: claims.name,
      email,
      userId,
      roles: roleCodes
    };

    // Simpan session sebelum redirect
    req.session.save(err => {
      if (err) return next(err);
      // Redirect ke frontend agar SPA bisa fetch /me dan lanjutkan flow
      // Prefer FRONTEND_REDIRECT_URL, fallback ke CORS_ORIGIN + '/auth', lalu default dev URL
      const fallbackFront = process.env.CORS_ORIGIN
        ? `${process.env.CORS_ORIGIN.replace(/\/+$/, '')}/auth`
        : 'http://localhost:5173/auth';
      const base = process.env.FRONTEND_REDIRECT_URL || fallbackFront;
      const redirectUrl = base.includes('?') ? `${base}&auth=success` : `${base}?auth=success`;
      return res.redirect(redirectUrl);
    });
  } catch (e) {
    next(e);
  }
}

// 3) Callback: responseMode 'form_post'
router.post('/redirect', async (req, res, next) => {
  try {
    const code = req.body.code;
    if (!code) return res.status(400).json({ message: 'Missing code' });
    const token = await acquireTokenByCode(code);
    await finalizeLogin(req, res, next, token.idTokenClaims || {});
  } catch (e) {
    next(e);
  }
});

// 4) Callback: responseMode 'query'
router.get('/redirect', async (req, res, next) => {
  try {
    const code = req.query.code;
    if (!code) return res.status(400).json({ message: 'Missing code' });
    const token = await acquireTokenByCode(code);
    await finalizeLogin(req, res, next, token.idTokenClaims || {});
  } catch (e) {
    next(e);
  }
});

module.exports = router;
