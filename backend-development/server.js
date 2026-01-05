// server.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();

const { authenticate } = require('./middleware/auth.middleware');

// CORS: izinkan akses dari FE (Vite dev server)
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
  })
);

// middleware untuk baca JSON body
app.use(express.json());

// serve folder uploads sebagai static
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const roleRoutes = require('./routes/role.routes');
const departmentRoutes = require('./routes/department.routes');
const campaignRoutes = require('./routes/campaign.routes');
const formRoutes = require('./routes/form.routes');
const formFieldRoutes = require('./routes/form_field.routes');
const campaignFormRoutes = require('./routes/campaign_form.routes');
const bankDataEntryRoutes = require('./routes/bank_data_entry.routes');

// Auth (tanpa JWT)
app.use('/auth', authRoutes);

// Protected routes (butuh Authorization: Bearer <token>)
app.use('/users', authenticate, userRoutes);
app.use('/roles', authenticate, roleRoutes);
app.use('/departments', authenticate, departmentRoutes);
app.use('/campaigns', authenticate, campaignRoutes);
app.use('/forms', authenticate, formRoutes);
app.use('/form-fields', authenticate, formFieldRoutes);
app.use('/campaign-forms', authenticate, campaignFormRoutes);
app.use('/bank-data-entries', authenticate, bankDataEntryRoutes);

app.get('/testing', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
 