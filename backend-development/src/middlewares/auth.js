// src/middlewares/auth.js
function requireAuth(req, res, next) {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: 'Unauthenticated' });
    }
    next();
  }
  
  function requireRole(...allowed) {
    // allowed bisa berupa ["ITSpecialist"] atau ["ITSpecialist","Admin"]
    const allowedSet = new Set((allowed || []).map(String));
    return (req, res, next) => {
      const roles = Array.isArray(req.session?.user?.roles) ? req.session.user.roles : [];
      const has = roles.some(r => allowedSet.has(String(r)));
      if (!has) return res.status(403).json({ message: 'Forbidden' });
      next();
    };
  }
  
  module.exports = { requireAuth, requireRole };
  