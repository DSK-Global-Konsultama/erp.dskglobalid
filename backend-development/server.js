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

app.use('/auth', authRoutes);
app.use('/users', userRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});