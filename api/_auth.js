const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'hometop-secret-alterar-em-producao';

function verifyAuth(req) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

module.exports = { verifyAuth, JWT_SECRET };
