const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Akses ditolak. Token tidak ditemukan.' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'redgold_secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token tidak valid atau kedaluwarsa.' });
    }
    req.user = user;
    next();
  });
};

const checkRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Hak akses ditolak untuk peran ini.' });
    }
    next();
  };
};

module.exports = { verifyToken, checkRole };
