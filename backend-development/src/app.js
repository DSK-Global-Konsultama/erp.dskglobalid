// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const usersRouter = require('./routes/users.routes');
const authRouter = require('./routes/auth.routes');
const leadsRouter = require('./routes/leads.routes');
const dealsRouter = require('./routes/deals.routes');
const invoicesRouter = require('./routes/invoices.routes');
const paymentsRouter = require('./routes/payments.routes');
const { notFound, errorHandler } = require('./middlewares/error');
const { checkConnection } = require('./config/db');

const app = express();

const session = require('express-session');
const MySQLStoreFactory = require('express-mysql-session');
const MySQLStore = MySQLStoreFactory(session);
const { pool } = require('./config/db');

const { requireAuth, requireRole } = require('./middlewares/auth');
const accountsRouter = require('./routes/accounts.routes');

const sessionStore = new MySQLStore(
  {
    // reuse koneksi dari env (host/port/user/password/db sama seperti pool)
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    // otomatis buat table sessions
    createDatabaseTable: true
  }
);

app.use(session({
  name: 'erp.sid',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 8 // 8 jam
  }
}));


// Keamanan & utilitas
app.use(helmet());
app.use(cors());
app.use(express.json());
// WAJIB kalau responseMode: 'form_post'
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));

// Health check + cek DB
app.get('/health', async (req, res, next) => {
  try {
    await checkConnection();
    res.json({ ok: true, db: 'connected' });
  } catch (e) {
    next(e);
  }
});

// Routes
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/leads', leadsRouter);
app.use('/api/v1/deals', dealsRouter);
app.use('/api/v1/invoices', invoicesRouter);
app.use('/api/v1/payments', paymentsRouter);

app.use('/auth', authRouter);

app.use('/api/v1/accounts', requireAuth, requireRole('ITSpecialist'), accountsRouter);

// helper untuk lihat siapa yang login
app.get('/me', async (req, res, next) => {
    try {
      if (!req.session.user) return res.json({ user: null });
  
      const userId = req.session.user.userId;
      const [rows] = await pool.execute(
        `SELECT r.code
           FROM roles r
           JOIN user_roles ur ON ur.role_id = r.id
          WHERE ur.user_id = ?
          ORDER BY r.code`,
        [userId]
      );
  
      const roleCodes = rows.map(r => r.code);
      return res.json({
        user: { ...req.session.user, roles: roleCodes }
      });
    } catch (e) {
      next(e);
    }
  });

// 404 & error handler
app.use(notFound);
app.use(errorHandler);

module.exports = app;
