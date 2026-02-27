const jwt = require('jsonwebtoken');
const { readDb } = require('./_db');
const { JWT_SECRET } = require('./_auth');

module.exports = function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const data = readDb();
    const { email, password } = req.body || {};
    const user = (data.users || []).find(u => u.email === email && u.password === password);
    if (!user) return res.status(401).json({ error: 'E-mail ou senha incorretos' });
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (e) {
    res.status(500).json({ error: 'Erro interno' });
  }
};
