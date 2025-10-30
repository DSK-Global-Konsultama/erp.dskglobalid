// src/controllers/accounts.controller.js
const { pool } = require('../config/db');

function toInt(v, def) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : def;
}

async function getUserWithRoles(connOrPool, userId) {
  const exec = connOrPool.execute.bind(connOrPool);
  const [[user]] = await exec(
    `SELECT id, name, email, aad_oid, aad_tid, upn, created_at, updated_at, last_login
       FROM users WHERE id = ?`,
    [userId]
  );
  if (!user) return null;
  const [rrows] = await exec(
    `SELECT r.code FROM roles r
      JOIN user_roles ur ON ur.role_id = r.id
     WHERE ur.user_id = ?
     ORDER BY r.code`,
    [userId]
  );
  user.roles = rrows.map(r => r.code);
  return user;
}

exports.list = async (req, res, next) => {
  try {
    const page = toInt(req.query.page, 1);
    const pageSize = toInt(req.query.pageSize, 20);
    const q = (req.query.q || '').trim();

    const offset = (page - 1) * pageSize;
    const params = [];
    let where = '';

    if (q) {
      where = `WHERE u.name LIKE ? OR u.email LIKE ?`;
      params.push(`%${q}%`, `%${q}%`);
    }

    const [rows] = await pool.execute(
      `SELECT u.id, u.name, u.email, u.last_login,
              GROUP_CONCAT(r.code ORDER BY r.code) AS roles
         FROM users u
         LEFT JOIN user_roles ur ON ur.user_id = u.id
         LEFT JOIN roles r       ON r.id = ur.role_id
         ${where}
         GROUP BY u.id, u.name, u.email, u.last_login
         ORDER BY u.id DESC
         LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    const [[{ total }]] = await pool.execute(
      `SELECT COUNT(*) AS total FROM users u ${where}`,
      params
    );

    res.json({
      page, pageSize, total,
      data: rows.map(r => ({
        id: r.id,
        name: r.name,
        email: r.email,
        last_login: r.last_login,
        roles: r.roles ? r.roles.split(',') : []
      }))
    });
  } catch (e) { next(e); }
};

exports.detail = async (req, res, next) => {
  try {
    const id = toInt(req.params.id, 0);
    const user = await getUserWithRoles(pool, id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (e) { next(e); }
};

exports.create = async (req, res, next) => {
  const { name, email, roles } = req.body; // roles: optional array of codes
  if (!name || !email) {
    return res.status(400).json({ message: 'name & email wajib' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Insert user (tanpa password)
    const [ins] = await conn.execute(
      `INSERT INTO users (name, email, last_login) VALUES (?, ?, NULL)`,
      [name, email]
    );
    const userId = ins.insertId;

    // Tentukan roles: jika tidak ada input -> Staff
    let roleCodes = Array.isArray(roles) && roles.length ? roles : ['Staff'];

    // Validasi semua role ada
    const [valid] = await conn.execute(
      `SELECT code, id FROM roles WHERE code IN (${roleCodes.map(() => '?').join(',')})`,
      roleCodes
    );
    const codeToId = new Map(valid.map(v => [v.code, v.id]));
    const missing = roleCodes.filter(c => !codeToId.has(c));
    if (missing.length) {
      throw Object.assign(new Error(`Role tidak dikenal: ${missing.join(', ')}`), { status: 400 });
    }

    // Insert user_roles
    const values = roleCodes.map(c => [userId, codeToId.get(c)]);
    if (values.length) {
      await conn.query(
        `INSERT INTO user_roles (user_id, role_id) VALUES ${values.map(() => '(?, ?)').join(',')}`,
        values.flat()
      );
    } else {
      // safety net: Staff
      await conn.execute(
        `INSERT INTO user_roles (user_id, role_id)
         SELECT ?, id FROM roles WHERE code='Staff' LIMIT 1`,
        [userId]
      );
    }

    await conn.commit();

    const user = await getUserWithRoles(conn, userId);
    res.status(201).json(user);
  } catch (e) {
    await conn.rollback();
    if (e.code === 'ER_DUP_ENTRY') {
      e.status = 409; e.message = 'Email already exists';
    }
    next(e);
  } finally {
    conn.release();
  }
};

exports.update = async (req, res, next) => {
  const id = toInt(req.params.id, 0);
  const { name, email } = req.body;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [upd] = await conn.execute(
      `UPDATE users
         SET name = COALESCE(?, name),
             email = COALESCE(?, email)
       WHERE id = ?`,
      [name ?? null, email ?? null, id]
    );

    if (upd.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({ message: 'User not found' });
    }

    await conn.commit();
    const user = await getUserWithRoles(conn, id);
    res.json(user);
  } catch (e) {
    await conn.rollback();
    if (e.code === 'ER_DUP_ENTRY') {
      e.status = 409; e.message = 'Email already exists';
    }
    next(e);
  } finally {
    conn.release();
  }
};

exports.setRoles = async (req, res, next) => {
  const id = toInt(req.params.id, 0);
  const { roles } = req.body; // roles: array of codes
  if (!Array.isArray(roles) || roles.length === 0) {
    return res.status(400).json({ message: 'roles (array) wajib' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Pastikan user ada
    const [[user]] = await conn.execute(`SELECT id, email FROM users WHERE id = ?`, [id]);
    if (!user) {
      await conn.rollback();
      return res.status(404).json({ message: 'User not found' });
    }

    // Validasi roles
    const [valid] = await conn.execute(
      `SELECT code, id FROM roles WHERE code IN (${roles.map(() => '?').join(',')})`,
      roles
    );
    const codeToId = new Map(valid.map(v => [v.code, v.id]));
    const missing = roles.filter(c => !codeToId.has(c));
    if (missing.length) {
      await conn.rollback();
      return res.status(400).json({ message: `Role tidak dikenal: ${missing.join(', ')}` });
    }

    // Cegah menghapus ITSpecialist terakhir
    const targetIncludesIT = roles.includes('ITSpecialist'); // apakah hasil akhir masih punya ITSpecialist?
    if (!targetIncludesIT) {
      // Hitung jumlah user yang punya ITSpecialist saat ini
      const [[{ cnt: totalIT }]] = await conn.execute(
        `SELECT COUNT(*) AS cnt
           FROM user_roles ur
           JOIN roles r ON r.id = ur.role_id
          WHERE r.code = 'ITSpecialist'`
      );
      // Apakah user target saat ini adalah ITSpecialist?
      const [[{ cnt: targetITNow }]] = await conn.execute(
        `SELECT COUNT(*) AS cnt
           FROM user_roles ur
           JOIN roles r ON r.id = ur.role_id
          WHERE ur.user_id = ? AND r.code = 'ITSpecialist'`,
        [id]
      );
      if (targetITNow > 0 && totalIT <= 1) {
        await conn.rollback();
        return res.status(409).json({ message: 'Tidak boleh menghapus ITSpecialist terakhir' });
      }
    }

    // Replace roles
    await conn.execute(`DELETE FROM user_roles WHERE user_id = ?`, [id]);

    const values = roles.map(c => [id, codeToId.get(c)]);
    if (values.length) {
      await conn.query(
        `INSERT INTO user_roles (user_id, role_id) VALUES ${values.map(() => '(?, ?)').join(',')}`,
        values.flat()
      );
    }

    await conn.commit();
    const userOut = await getUserWithRoles(conn, id);
    res.json(userOut);
  } catch (e) {
    await conn.rollback();
    next(e);
  } finally {
    conn.release();
  }
};

exports.remove = async (req, res, next) => {
  const id = toInt(req.params.id, 0);
  const selfId = req.session.user?.userId;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Cegah self-delete
    if (selfId === id) {
      await conn.rollback();
      return res.status(409).json({ message: 'Tidak boleh menghapus akun sendiri' });
    }

    // Cegah menghapus ITSpecialist terakhir
    const [[{ cnt: totalIT }]] = await conn.execute(
      `SELECT COUNT(*) AS cnt
         FROM user_roles ur
         JOIN roles r ON r.id = ur.role_id
        WHERE r.code = 'ITSpecialist'`
    );
    const [[{ cnt: isIT }]] = await conn.execute(
      `SELECT COUNT(*) AS cnt
         FROM user_roles ur
         JOIN roles r ON r.id = ur.role_id
        WHERE ur.user_id = ? AND r.code = 'ITSpecialist'`,
      [id]
    );
    if (isIT > 0 && totalIT <= 1) {
      await conn.rollback();
      return res.status(409).json({ message: 'Tidak boleh menghapus ITSpecialist terakhir' });
    }

    const [del] = await conn.execute(`DELETE FROM users WHERE id = ?`, [id]);
    if (del.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({ message: 'User not found' });
    }

    await conn.commit();
    res.status(204).end();
  } catch (e) {
    await conn.rollback();
    next(e);
  } finally {
    conn.release();
  }
};
