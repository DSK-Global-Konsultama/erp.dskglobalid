// server.js
require('dotenv').config();
const express = require('express');

const app = express();

const { authenticate } = require('./middleware/auth.middleware');

app.get('/api/me', authenticate, (req, res) => {
  res.json({
    message: 'Profil dari token',
    user: req.user
  });
});

// middleware untuk baca JSON body
app.use(express.json());

// routes
const authRoutes = require('./routes/auth.routes');
app.use('/auth', authRoutes);

// basic health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
