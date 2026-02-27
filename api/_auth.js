const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'hometop-secret-alterar-em-producao';

function base64url(str) {
  return Buffer.from(str).toString('base64url');
}

function base64urlDecode(str) {
  return Buffer.from(str, 'base64url').toString('utf8');
}

function signJwt(payload, expiresIn) {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);
  const body = base64url(JSON.stringify({ ...payload, iat: now, exp: now + expiresIn }));
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(header + '.' + body).digest('base64url');
  return header + '.' + body + '.' + signature;
}

function verifyJwt(token) {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, body, signature] = parts;
  const expected = crypto.createHmac('sha256', JWT_SECRET).update(header + '.' + body).digest('base64url');
  if (signature !== expected) return null;
  try {
    const payload = JSON.parse(base64urlDecode(body));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

function verifyAuth(req) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return null;
  return verifyJwt(token);
}

module.exports = { verifyAuth, signJwt, JWT_SECRET };
