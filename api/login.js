const { readDb } = require('./_db');
const { signJwt } = require('./_auth');

module.exports = function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const data = readDb();
    const { email, password } = req.body || {};
    const user = (data.users || []).find(u => u.email === email && u.password === password);
    if (!user) return res.status(401).json({ error: 'E-mail ou senha incorretos' });
    const token = signJwt({ id: user.id }, 7 * 24 * 60 * 60); // 7 days
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (e) {
    res.status(500).json({ error: 'Erro interno' });
  }
};
