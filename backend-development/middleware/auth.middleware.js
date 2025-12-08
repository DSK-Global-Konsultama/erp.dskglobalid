// middleware/auth.middleware.js
const jwt = require('jsonwebtoken');

exports.authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Format Authorization salah' });
  }

  const token = parts[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    // simpan user info di req.user
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token tidak valid atau kadaluarsa' });
  }
};
